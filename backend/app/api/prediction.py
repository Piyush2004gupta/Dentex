from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional

from fastapi.responses import FileResponse
from app.database.models import User, Prediction
from app.auth.jwt import get_current_user, get_current_user_optional
from app.config import settings
from app.utils.image_processing import check_image_blur, check_image_brightness, crop_detected_tooth
from app.services.ai_inference import ai_inference_service

# Unpack helper – handles 5-value return from run_classification
def _unpack_classification(result):
    if len(result) == 5:
        disease_type, confidence, probs, tooth_number, quadrant = result
    else:
        disease_type, confidence, probs = result
        tooth_number, quadrant = None, None
    return disease_type, confidence, probs, tooth_number, quadrant

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.get("/prediction/{id}/image")
def get_prediction_image(id: int, current_user: Optional[User] = Depends(get_current_user_optional)):
    from app.database.models import predictions_store
    prediction = next((p for p in predictions_store if p.id == id), None)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    if prediction.user_id is not None:
        if not current_user or prediction.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this prediction record.")
    
    # Check if the path is a GCS path
    if prediction.filepath.startswith("predicattion/"):
        from app.services.gcs import gcs_service
        img_bytes = gcs_service.download_file_to_bytes(prediction.filepath)
        if img_bytes is None:
            raise HTTPException(status_code=404, detail="Image not found in GCS bucket.")
        from fastapi.responses import StreamingResponse
        from io import BytesIO
        return StreamingResponse(BytesIO(img_bytes), media_type="image/jpeg")
    else:
        # Fallback to local files
        if not os.path.exists(prediction.filepath):
            raise HTTPException(status_code=404, detail="Image file not found on disk.")
        return FileResponse(prediction.filepath)

@router.post("/predict")
async def predict_dental_disease(
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image format."
        )

    # Save uploaded file
    file_extension  = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    upload_filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(upload_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Image quality checks
    blur_score       = check_image_blur(upload_filepath)
    brightness_score = check_image_brightness(upload_filepath)
    is_valid = not (blur_score < 30.0 or brightness_score < 30.0 or brightness_score > 230.0)

    # Run YOLO detection
    detections   = ai_inference_service.run_detection(upload_filepath)
    tooth_number = None
    quadrant     = None

    if not detections:
        disease             = "Healthy Tooth"
        confidence          = 99.0
        bounding_box        = [0, 0, 0, 0]
        class_probabilities = {"Caries": 0.01, "Deep Caries": 0.0, "Periapical Lesion": 0.0, "Impacted Tooth": 0.0}
    else:
        def sort_key(d):
            return (1 if d["label"] != "Healthy Tooth" else 0, d["confidence"])

        selected_detection = max(detections, key=sort_key)
        disease      = selected_detection["label"]
        bounding_box = selected_detection["box"]

        crop_filename = f"crop_{uuid.uuid4()}{file_extension}"
        crop_filepath = os.path.join(settings.PREDICTION_DIR, crop_filename)
        crop_success  = crop_detected_tooth(upload_filepath, bounding_box, crop_filepath)

        target_path = crop_filepath if crop_success else upload_filepath
        disease_type, confidence, class_probabilities, tooth_number, quadrant = \
            _unpack_classification(ai_inference_service.run_classification(target_path, disease))

        # Override YOLO label with Keras classifier's precise DENTEX disease type
        if disease_type is not None:
            disease = disease_type

        # Clean up local cropped file after classification
        if crop_success:
            try:
                os.remove(crop_filepath)
            except Exception:
                pass

    # Save to in-memory store
    from app.database.models import predictions_store
    next_id = max([p.id for p in predictions_store]) + 1 if predictions_store else 1

    # Upload to Google Cloud Storage (GCS)
    from app.services.gcs import gcs_service
    gcs_path = f"predicattion/{unique_filename}"
    gcs_uploaded = gcs_service.upload_file(upload_filepath, gcs_path)
    
    final_filepath = gcs_path if gcs_uploaded else upload_filepath
    if gcs_uploaded:
        try:
            os.remove(upload_filepath)
        except Exception:
            pass

    db_prediction = Prediction(
        id=next_id,
        user_id=current_user.id if current_user else None,
        filename=file.filename,
        filepath=final_filepath,
        disease=disease,
        confidence=confidence,
        bounding_box=bounding_box,
        class_probabilities=class_probabilities,
        blur_score=blur_score,
        brightness_score=brightness_score,
        is_valid=is_valid,
        tooth_number=tooth_number,
        quadrant=quadrant
    )
    predictions_store.append(db_prediction)

    return {
        "id":                  db_prediction.id,
        "filename":            db_prediction.filename,
        "is_valid":            db_prediction.is_valid,
        "blur_score":          round(db_prediction.blur_score, 2),
        "brightness_score":    round(db_prediction.brightness_score, 2),
        "created_at":          db_prediction.created_at,
        "detections":          detections,
        "disease":             db_prediction.disease,
        "confidence":          db_prediction.confidence,
        "bounding_box":        db_prediction.bounding_box,
        "class_probabilities": db_prediction.class_probabilities,
        "tooth_number":        db_prediction.tooth_number,
        "quadrant":            db_prediction.quadrant,
    }

@router.get("/history")
def get_prediction_history(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    disease: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    from app.database.models import predictions_store

    filtered = list(predictions_store)
    filtered = [p for p in filtered if p.user_id == current_user.id]

    if search:
        search_lower = search.lower()
        filtered = [p for p in filtered if search_lower in p.filename.lower()]

    if disease:
        filtered = [p for p in filtered if p.disease == disease]

    total  = len(filtered)
    pages  = (total + size - 1) // size
    offset = (page - 1) * size

    sorted_filtered = sorted(filtered, key=lambda p: p.created_at, reverse=True)
    predictions     = sorted_filtered[offset:offset + size]

    return {
        "total":       total,
        "page":        page,
        "pages":       pages,
        "size":        size,
        "predictions": predictions
    }

@router.get("/prediction/{id}")
def get_prediction_detail(id: int, current_user: Optional[User] = Depends(get_current_user_optional)):
    from app.database.models import predictions_store
    prediction = next((p for p in predictions_store if p.id == id), None)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    if prediction.user_id is not None:
        if not current_user or prediction.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to view this prediction record.")
    return prediction

@router.delete("/prediction/{id}", status_code=status.HTTP_200_OK)
def delete_prediction(id: int, current_user: User = Depends(get_current_user)):
    from app.database.models import predictions_store
    prediction = next((p for p in predictions_store if p.id == id), None)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
    if prediction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prediction record.")

    if os.path.exists(prediction.filepath):
        try:
            os.remove(prediction.filepath)
        except Exception:
            pass

    predictions_store.remove(prediction)
    return {"message": "Prediction record deleted successfully."}
