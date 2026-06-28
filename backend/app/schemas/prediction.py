from pydantic import BaseModel
from datetime import datetime
from typing import List, Dict, Optional, Any

class PredictionOut(BaseModel):
    id: int
    user_id: int
    filename: str
    filepath: str
    disease: str
    severity: str
    confidence: float
    bounding_box: Optional[List[int]] = None
    recommendation: Optional[str] = None
    class_probabilities: Optional[Dict[str, float]] = None
    blur_score: float
    brightness_score: float
    is_valid: bool
    created_at: datetime

    class Config:
        from_attributes = True

class HistoryResponse(BaseModel):
    total: int
    page: int
    pages: int
    size: int
    predictions: List[PredictionOut]

class AnalyticsResponse(BaseModel):
    total_predictions: int
    healthy_cases: int
    diseased_cases: int
    detection_accuracy: float
    classification_accuracy: float
    recent_uploads: List[PredictionOut]
    disease_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    weekly_trends: List[Dict[str, Any]]
