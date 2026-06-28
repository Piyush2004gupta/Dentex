from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional

from app.database.session import get_db
from app.database.models import User, Prediction
from app.auth.jwt import get_current_user
from app.config import settings
from app.utils.image_processing import check_image_blur, check_image_brightness, crop_detected_tooth
from app.services.ai_inference import ai_inference_service
from app.services.report_generator import generate_pdf_report

router = APIRouter(prefix="/predictions", tags=["Predictions"])

@router.post("/predict")
async def predict_dental_disease(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate MIME type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image format."
        )
        
    # Save Uploaded file
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    upload_filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(upload_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Image Quality Checks (Additional AI features)
    blur_score = check_image_blur(upload_filepath)
    brightness_score = check_image_brightness(upload_filepath)
    
    # Validation thresholding (is_valid = True if image is clear and exposed properly)
    is_valid = True
    if blur_score < 30.0 or brightness_score < 30.0 or brightness_score > 230.0:
        is_valid = False
        
    # Run YOLO detection
    detections = ai_inference_service.run_detection(upload_filepath)
    
    if not detections:
        # If no teeth/disease detected, mark as healthy tooth by default
        disease = "Healthy Tooth"
        severity = "Healthy"
        confidence = 99.0
        bounding_box = [0, 0, 0, 0]
        class_probabilities = {"Healthy": 0.99, "Mild": 0.01, "Moderate": 0.0, "Severe": 0.0}
    else:
        # Select the detection with highest confidence (prioritize disease classes)
        # Sort by (is_disease, confidence)
        def sort_key(d):
            is_disease = 1 if d["label"] != "Healthy Tooth" else 0
            return (is_disease, d["confidence"])
            
        selected_detection = max(detections, key=sort_key)
        
        disease = selected_detection["label"]
        bounding_box = selected_detection["box"]
        
        # Crop the detected tooth for classification
        crop_filename = f"crop_{uuid.uuid4()}{file_extension}"
        crop_filepath = os.path.join(settings.PREDICTION_DIR, crop_filename)
        
        crop_success = crop_detected_tooth(upload_filepath, bounding_box, crop_filepath)
        
        # Run classification on crop
        target_path_for_classifier = crop_filepath if crop_success else upload_filepath
        severity, confidence, class_probabilities = ai_inference_service.run_classification(
            target_path_for_classifier, disease
        )
        
        # Make sure healthy label matches healthy severity
        if disease == "Healthy Tooth":
            severity = "Healthy"
            
    recommendation = ai_inference_service.get_recommendation(disease, severity)
    
    # Save Prediction to Database
    db_prediction = Prediction(
        user_id=current_user.id,
        filename=file.filename,
        filepath=upload_filepath,
        disease=disease,
        severity=severity,
        confidence=confidence,
        bounding_box=bounding_box,
        recommendation=recommendation,
        class_probabilities=class_probabilities,
        blur_score=blur_score,
        brightness_score=brightness_score,
        is_valid=is_valid
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    # Return response exactly matching the requested format, while keeping metadata
    return {
        "id": db_prediction.id,
        "filename": db_prediction.filename,
        "is_valid": db_prediction.is_valid,
        "blur_score": round(db_prediction.blur_score, 2),
        "brightness_score": round(db_prediction.brightness_score, 2),
        "created_at": db_prediction.created_at,
        "detections": detections, # Include all detected bounding boxes
        
        # Requested response keys
        "disease": db_prediction.disease,
        "severity": db_prediction.severity,
        "confidence": db_prediction.confidence,
        "bounding_box": db_prediction.bounding_box,
        "recommendation": db_prediction.recommendation,
        "class_probabilities": db_prediction.class_probabilities
    }

@router.post("/upload")
async def upload_image_only(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Saves an image file and returns path info (useful for multi-step / custom flows).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format."
        )
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    upload_filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    with open(upload_filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {
        "filename": file.filename,
        "filepath": upload_filepath,
        "uploaded_at": datetime.utcnow()
    }

@router.get("/history")
def get_prediction_history(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    disease: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Prediction)
    
    # Filter by user if not admin
    if current_user.role != "admin":
        query = query.filter(Prediction.user_id == current_user.id)
        
    # Search filter (e.g. filename)
    if search:
        query = query.filter(Prediction.filename.ilike(f"%{search}%"))
        
    # Disease class filter
    if disease:
        query = query.filter(Prediction.disease == disease)
        
    # Severity filter
    if severity:
        query = query.filter(Prediction.severity == severity)
        
    # Paginate
    total = query.count()
    pages = (total + size - 1) // size
    offset = (page - 1) * size
    
    predictions = query.order_by(Prediction.created_at.desc()).offset(offset).limit(size).all()
    
    # Return formatted paginated response
    return {
        "total": total,
        "page": page,
        "pages": pages,
        "size": size,
        "predictions": predictions
    }

@router.get("/prediction/{id}")
def get_prediction_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
        
    # Enforce ownership rules (only record owner or admin can view)
    if current_user.role != "admin" and prediction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this prediction record.")
        
    # Return details
    return prediction

@router.delete("/prediction/{id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
        
    # Enforce ownership rules (only record owner or admin can delete)
    if current_user.role != "admin" and prediction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this prediction record.")
        
    # Delete visual files from local storage if they exist
    if os.path.exists(prediction.filepath):
        try:
            os.remove(prediction.filepath)
        except Exception:
            pass
            
    db.delete(prediction)
    db.commit()
    return {"message": "Prediction record deleted successfully."}

@router.get("/prediction/{id}/report")
def download_pdf_diagnostic_report(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction record not found.")
        
    # Enforce ownership rules
    if current_user.role != "admin" and prediction.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this prediction report.")
        
    # Construct output PDF path
    report_filename = f"report_{prediction.id}.pdf"
    report_filepath = os.path.join(settings.PREDICTION_DIR, report_filename)
    
    # Generate report
    success = generate_pdf_report(prediction, prediction.user.username, report_filepath)
    if not success or not os.path.exists(report_filepath):
        raise HTTPException(status_code=500, detail="Failed to compile PDF diagnostic report.")
        
    return FileResponse(
        path=report_filepath,
        filename=f"Dentex_Report_#{prediction.id}.pdf",
        media_type="application/pdf"
    )
