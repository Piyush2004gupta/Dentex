import os
import numpy as np

# Configure Keras backend to use PyTorch
os.environ["KERAS_BACKEND"] = "torch"

from app.config import settings

HAS_TORCH = False
HAS_ULTRALYTICS = False
HAS_KERAS = False

try:
    import torch
    import torchvision.transforms as transforms
    HAS_TORCH = True
except (ImportError, OSError) as e:
    print(f"Warning: PyTorch/Torchvision could not be loaded: {str(e)}.")

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except (ImportError, OSError) as e:
    print(f"Warning: Ultralytics YOLO could not be loaded: {str(e)}.")

try:
    import keras
    HAS_KERAS = True
except (ImportError, OSError) as e:
    print(f"Warning: Keras 3 could not be loaded: {str(e)}.")

try:
    import tensorflow as tf
    print(f"TensorFlow loaded: v{tf.__version__}")
except (ImportError, OSError) as e:
    print(f"Warning: TensorFlow could not be loaded: {str(e)}.")


# ─────────────────────────────────────────────────────────────────────────────
# Label Maps for the 3-head ResNet50 Multitask Model
# ─────────────────────────────────────────────────────────────────────────────

# Head 1 – Enumeration: tooth position within its quadrant (1-indexed FDI style)
ENUMERATION_LABELS = {
    0: "Tooth 1", 1: "Tooth 2", 2: "Tooth 3", 3: "Tooth 4",
    4: "Tooth 5", 5: "Tooth 6", 6: "Tooth 7", 7: "Tooth 8"
}

# Head 0 – Quadrant: which of the 4 mouth quadrants
QUADRANT_LABELS = {
    0: "Q1 (Upper Right)",
    1: "Q2 (Upper Left)",
    2: "Q3 (Lower Left)",
    3: "Q4 (Lower Right)"
}

# Head 2 – Disease type (4 classes from SMILEGUARD dataset)
DISEASE_LABELS = {
    0: "Impacted Tooth",
    1: "Caries",
    2: "Periapical Lesion",
    3: "Deep Caries"
}


def _to_numpy(tensor) -> np.ndarray:
    """Safely convert a Keras/torch tensor to a numpy array."""
    if hasattr(tensor, "numpy"):
        if hasattr(tensor, "detach"):
            return tensor.detach().numpy()
        return tensor.numpy()
    return np.array(tensor)


def _softmax(logits: np.ndarray) -> np.ndarray:
    """Apply numerically-stable softmax."""
    e = np.exp(logits - np.max(logits))
    return e / e.sum()


def _probabilities(raw: np.ndarray) -> np.ndarray:
    """Return probabilities – apply softmax only if logits (not already normalised)."""
    if abs(raw.sum() - 1.0) > 0.05:
        return _softmax(raw)
    return raw.astype(np.float64)


class AIInferenceService:
    def __init__(self):
        self.yolo_model       = None
        self.classifier_model = None

        # Paths to trained models
        self.yolo_path       = os.path.join(settings.TRAINED_MODELS_DIR, "segmentation.pt")
        self.classifier_path = os.path.join(
            settings.TRAINED_MODELS_DIR, "Classification.keras"
        )

        self.initialize_models()

    # ─────────────────────────────────────────────────────────────────────────
    def initialize_models(self):
        """
        Loads YOLOv11 (.pt) and the 3-head ResNet50 (.keras) models.
        Raises RuntimeError if either model cannot be loaded.
        """
        if HAS_ULTRALYTICS and os.path.exists(self.yolo_path):
            self.yolo_model = YOLO(self.yolo_path)
            print(f"✅ Loaded YOLO detection model from: {self.yolo_path}")
        else:
            raise RuntimeError(
                f"YOLO model not found at '{self.yolo_path}' or Ultralytics not installed. "
                "Cannot start without real models."
            )

        if HAS_KERAS and os.path.exists(self.classifier_path):
            import keras
            
            # The model file was cleaned of unsupported legacy kwargs (like input_axes/renorm)
            self.classifier_model = keras.models.load_model(self.classifier_path)
            
            print(f"✅ Loaded ResNet50 multitask model from: {self.classifier_path}")
            if hasattr(self.classifier_model, "outputs"):
                print(f"   ↳ Output heads: {len(self.classifier_model.outputs)}")
                for i, out in enumerate(self.classifier_model.outputs):
                    print(f"      Head {i}: shape {out.shape}")
        else:
            raise RuntimeError(
                f"Keras classifier model not found at '{self.classifier_path}' or Keras not installed. "
                "Cannot start without real classifier model."
            )

    # ─────────────────────────────────────────────────────────────────────────
    def run_detection(self, image_path: str):
        """
        Runs YOLOv11 detection on a dental scan.
        Returns: [{"box": [x, y, w, h], "confidence": float, "label": str, "segmentation": [...]}, …]
        Raises RuntimeError if YOLO model is not loaded or inference fails.
        """
        if self.yolo_model is None:
            raise RuntimeError("YOLO model is not loaded.")

        results    = self.yolo_model(image_path)
        detections = []
        for result in results:
            masks = result.masks
            for i, box in enumerate(result.boxes):
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf  = float(box.conf[0])
                cls   = int(box.cls[0])
                label = result.names[cls]
                
                det = {
                    "box":        [int(x1), int(y1), int(x2 - x1), int(y2 - y1)],
                    "confidence": round(conf * 100, 2),
                    "label":      label
                }
                
                if masks is not None and masks.xy is not None and i < len(masks.xy):
                    segment = masks.xy[i]
                    if hasattr(segment, 'tolist'):
                        segment = segment.tolist()
                    det["segmentation"] = [[float(pt[0]), float(pt[1])] for pt in segment]
                    
                detections.append(det)
        return detections

    # ─────────────────────────────────────────────────────────────────────────
    def run_classification(self, cropped_image_path: str, disease_label: str):
        """
        Runs the 3-head ResNet50 multitask classifier on a cropped tooth image.

        Model output structure (verified from loaded model):
          Head 0 – Quadrant    : 4  classes  (quadrant 0-3)
          Head 1 – Enumeration : 8  classes  (tooth position 0-7 within quadrant)
          Head 2 – Disease     : 4  classes  (0=Impacted Tooth, 1=Caries,
                                              2=Periapical Lesion, 3=Deep Caries)

        Returns:
            disease_type    (str)   – predicted disease label
            confidence      (float) – disease head top-class probability × 100
            class_probabilities (dict) – {disease_label: probability, …}
            tooth_number    (str)   – e.g. "Tooth 3"
            quadrant        (str)   – e.g. "Q2 (Upper Left)"

        Raises RuntimeError if model is not loaded or inference fails.
        """
        if self.classifier_model is None:
            raise RuntimeError("Classifier model is not loaded.")

        import cv2

        img = cv2.imread(cropped_image_path)
        if img is None:
            raise ValueError(f"Cropped image could not be loaded: {cropped_image_path}")

        from keras.applications.resnet50 import preprocess_input
        # Resize to ResNet50 input (224×224)
        img_resized  = cv2.resize(img, (224, 224))
        img_rgb      = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
        
        # Apply standard ResNet50 preprocessing instead of / 255.0
        input_tensor = np.expand_dims(img_rgb.astype(np.float32), axis=0)
        input_tensor = preprocess_input(input_tensor)

        # ── Forward pass ──────────────────────────────────────────────────
        raw_preds = self.classifier_model(input_tensor)

        # Unpack into list of numpy arrays
        if isinstance(raw_preds, (list, tuple)):
            heads = [_to_numpy(p)[0] for p in raw_preds]
        else:
            heads = [_to_numpy(raw_preds)[0]]

        if len(heads) < 3:
            raise ValueError(
                f"Expected 3 output heads, got {len(heads)}. "
                "Check model architecture."
            )

        # ── Head 0: Quadrant (4 classes) ─────────────────────────────────
        quad_probs = _probabilities(heads[0])     # shape (4,)
        quad_idx   = int(np.argmax(quad_probs))
        quadrant   = QUADRANT_LABELS.get(quad_idx, f"Q{quad_idx + 1}")

        # ── Head 1: Enumeration (8 classes) ──────────────────────────────
        enum_probs   = _probabilities(heads[1])   # shape (8,)
        enum_idx     = int(np.argmax(enum_probs))
        tooth_number = ENUMERATION_LABELS.get(enum_idx, f"Tooth {enum_idx + 1}")

        # ── Head 2: Disease type (4 classes) ─────────────────────────────
        disease_probs = _probabilities(heads[2])  # shape (4,)
        disease_idx   = int(np.argmax(disease_probs))
        disease_type  = DISEASE_LABELS.get(disease_idx, "Caries")
        confidence    = round(float(disease_probs[disease_idx]) * 100, 2)
        prob_dict     = {
            DISEASE_LABELS[i]: round(float(disease_probs[i]), 4)
            for i in range(len(DISEASE_LABELS))
        }

        print(
            f"  Multitask result → {tooth_number} | {quadrant} | "
            f"{disease_type} ({confidence:.1f}%)"
        )

        return disease_type, confidence, prob_dict, tooth_number, quadrant


ai_inference_service = AIInferenceService()
