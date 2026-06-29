import os
import random
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
    print(f"Warning: PyTorch/Torchvision could not be loaded: {str(e)}. Running with fallback simulation.")

try:
    from ultralytics import YOLO
    HAS_ULTRALYTICS = True
except (ImportError, OSError) as e:
    print(f"Warning: Ultralytics YOLO could not be loaded: {str(e)}. Running with fallback simulation.")

try:
    import keras
    HAS_KERAS = True
except (ImportError, OSError) as e:
    print(f"Warning: Keras 3 could not be loaded: {str(e)}. Running with fallback simulation.")


# ─────────────────────────────────────────────────────────────────────────────
# Label Maps for the 3-head ResNet50 Multitask Model
# ─────────────────────────────────────────────────────────────────────────────

# Head 0 – Enumeration: tooth position within its quadrant (1-indexed FDI style)
ENUMERATION_LABELS = {
    0: "Tooth 1", 1: "Tooth 2", 2: "Tooth 3", 3: "Tooth 4",
    4: "Tooth 5", 5: "Tooth 6", 6: "Tooth 7", 7: "Tooth 8"
}

# Head 1 – Quadrant: which of the 4 mouth quadrants
QUADRANT_LABELS = {
    0: "Q1 (Upper Right)",
    1: "Q2 (Upper Left)",
    2: "Q3 (Lower Left)",
    3: "Q4 (Lower Right)"
}

# Head 2 – Disease type (4 classes from DENTEX dataset)
DISEASE_LABELS = {
    0: "Impacted Tooth",
    1: "Caries",
    2: "Periapical Lesion",
    3: "Deep Caries"
}



def _to_numpy(tensor) -> np.ndarray:
    """Safely convert a Keras/torch tensor to a numpy array."""
    if hasattr(tensor, "numpy"):
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
        self.use_mock         = True

        # Paths to trained models
        self.yolo_path       = os.path.join(settings.TRAINED_MODELS_DIR, "best.pt")
        self.classifier_path = os.path.join(
            settings.TRAINED_MODELS_DIR, "dentex_multitask_resnet50 (1).keras"
        )

        self.initialize_models()

    # ─────────────────────────────────────────────────────────────────────────
    def initialize_models(self):
        """
        Attempts to load YOLOv11 (.pt) and the 3-head ResNet50 (.keras) models.
        Falls back to simulation if weights or libraries are unavailable.
        """
        try:
            if HAS_ULTRALYTICS and os.path.exists(self.yolo_path):
                self.yolo_model = YOLO(self.yolo_path)
                self.use_mock   = False
                print(f"Loaded YOLO detection model from: {self.yolo_path}")
            else:
                print(f"YOLO weights not found at {self.yolo_path} or Ultralytics library missing. Using SIMULATED detection.")

            if HAS_KERAS and os.path.exists(self.classifier_path):
                self.classifier_model = keras.models.load_model(self.classifier_path)
                self.use_mock         = False
                print(f"Loaded ResNet50 multitask model from: {self.classifier_path}")
                # Log the number of outputs so we can validate structure
                if hasattr(self.classifier_model, "outputs"):
                    print(f"  ↳ Model outputs: {len(self.classifier_model.outputs)} heads detected.")
            else:
                print(f"Keras weights not found at {self.classifier_path} or Keras library missing. Using SIMULATED classification.")
        except Exception as e:
            print(f"Error loading ML models: {str(e)}. Falling back to simulation.")
            self.use_mock = True

    # ─────────────────────────────────────────────────────────────────────────
    def run_detection(self, image_path: str):
        """
        Runs YOLOv11 detection on a dental scan.
        Returns: [{"box": [x, y, w, h], "confidence": float, "label": str}, …]
        """
        if not self.use_mock and self.yolo_model is not None and HAS_ULTRALYTICS:
            try:
                results    = self.yolo_model(image_path)
                detections = []
                for result in results:
                    for box in result.boxes:
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        conf  = float(box.conf[0])
                        cls   = int(box.cls[0])
                        label = result.names[cls]
                        detections.append({
                            "box":        [int(x1), int(y1), int(x2 - x1), int(y2 - y1)],
                            "confidence": round(conf * 100, 2),
                            "label":      label
                        })
                return detections
            except Exception as e:
                print(f"YOLO inference failed: {str(e)}. Falling back to simulation.")

        # ── Simulation fallback ────────────────────────────────────────────
        try:
            import cv2
            img = cv2.imread(image_path)
            h, w = img.shape[:2] if img is not None else (400, 600)
        except Exception:
            h, w = 400, 600

        diseases  = ["Dental Caries", "Cavity", "Gingivitis",
                     "Periodontitis", "Plaque", "Tartar", "Healthy Tooth"]
        detections = []
        num_teeth  = random.randint(4, 7)
        spacing    = w // (num_teeth + 1)

        for i in range(1, num_teeth + 1):
            cx = spacing * i
            cy = h // 2
            tw = int(w * random.uniform(0.06, 0.08))
            th = int(h * random.uniform(0.18, 0.22))
            x  = max(0, cx - tw // 2)
            y  = max(0, cy - th // 2)
            label = (random.choice([d for d in diseases if d != "Healthy Tooth"])
                     if i == 1 else random.choice(diseases))
            detections.append({
                "box":        [x, y, tw, th],
                "confidence": round(random.uniform(75.0, 99.5), 1),
                "label":      label
            })
        return detections

    # ─────────────────────────────────────────────────────────────────────────
    def run_classification(self, cropped_image_path: str, disease_label: str):
        """
        Runs the 3-head ResNet50 multitask classifier on a cropped tooth image.

        Model output structure (must follow this exact order):
          Head 0 – Enumeration : 8  classes  (tooth position 0-7 within quadrant)
          Head 1 – Quadrant    : 4  classes  (quadrant 0-3)
          Head 2 – Disease     : 4  classes  (0=Impacted Tooth, 1=Caries,
                                              2=Periapical Lesion, 3=Deep Caries)

        Returns:
            disease_type    (str)   – predicted disease label
            confidence      (float) – disease head top-class probability × 100
            class_probabilities (dict) – {disease_label: probability, …}
            tooth_number    (str)   – e.g. "Tooth 3"
            quadrant        (str)   – e.g. "Q2 (Upper Left)"
        """
        if not self.use_mock and self.classifier_model is not None and HAS_KERAS:
            try:
                import cv2

                img = cv2.imread(cropped_image_path)
                if img is None:
                    raise ValueError("Cropped image could not be loaded by OpenCV.")

                # Resize to ResNet50 input (224×224) and normalise
                img_resized   = cv2.resize(img, (224, 224))
                img_rgb       = cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB)
                img_norm      = img_resized.astype(np.float32) / 255.0
                input_tensor  = np.expand_dims(img_norm, axis=0)   # (1, 224, 224, 3)

                # ── Forward pass ──────────────────────────────────────────
                raw_preds = self.classifier_model(input_tensor)

                # Unpack into list of numpy arrays
                if isinstance(raw_preds, (list, tuple)):
                    heads = [_to_numpy(p)[0] for p in raw_preds]
                else:
                    # Single tensor – treat as disease head only (legacy fallback)
                    single = _to_numpy(raw_preds)[0]
                    heads  = [np.zeros(8), np.zeros(4), single]

                if len(heads) < 3:
                    raise ValueError(
                        f"Expected 3 output heads, got {len(heads)}. "
                        "Check model architecture."
                    )

                # ── Head 0: Enumeration (8 classes) ──────────────────────
                enum_probs   = _probabilities(heads[0])   # shape (8,)
                enum_idx     = int(np.argmax(enum_probs))
                tooth_number = ENUMERATION_LABELS.get(enum_idx, f"Tooth {enum_idx + 1}")

                # ── Head 1: Quadrant (4 classes) ─────────────────────────
                quad_probs = _probabilities(heads[1])     # shape (4,)
                quad_idx   = int(np.argmax(quad_probs))
                quadrant   = QUADRANT_LABELS.get(quad_idx, f"Q{quad_idx + 1}")

                # ── Head 2: Disease type (4 classes) ─────────────────────
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

            except Exception as e:
                print(f"Keras multitask inference failed: {str(e)}. Falling back to simulation.")

        # ── Simulation fallback ────────────────────────────────────────────
        disease_classes = list(DISEASE_LABELS.values())

        if disease_label == "Healthy Tooth":
            disease_type = "Caries"
            confidence   = round(random.uniform(60.0, 80.0), 1)
        else:
            disease_type = random.choice(disease_classes)
            confidence   = round(random.uniform(72.0, 96.0), 1)

        p_main = confidence / 100.0
        rem    = 1.0 - p_main
        others = [c for c in disease_classes if c != disease_type]
        random.shuffle(others)
        prob_dict = {
            disease_type: round(p_main, 4),
            others[0]:    round(rem * 0.60, 4),
            others[1]:    round(rem * 0.30, 4),
            others[2]:    round(rem * 0.10, 4),
        }

        tooth_number = ENUMERATION_LABELS[random.randint(0, 7)]
        quadrant     = QUADRANT_LABELS[random.randint(0, 3)]

        return disease_type, confidence, prob_dict, tooth_number, quadrant


ai_inference_service = AIInferenceService()
