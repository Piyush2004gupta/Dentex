from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from collections import Counter

from app.database.models import User
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_dashboard_analytics(
    current_user: User = Depends(get_current_user)
):
    from app.database.models import predictions_store

    filtered = list(predictions_store)

    if current_user.role != "admin":
        filtered = [p for p in filtered if p.user_id == current_user.id]

    total_predictions = len(filtered)

    if total_predictions == 0:
        return {
            "total_predictions": 0,
            "avg_confidence": 0.0,
            "recent_uploads": [],
            "disease_distribution": {},
            "weekly_trends": []
        }

    avg_confidence   = sum(p.confidence for p in filtered) / total_predictions
    disease_counts   = Counter([p.disease for p in filtered])

    sorted_filtered  = sorted(filtered, key=lambda p: p.created_at, reverse=True)
    recent           = sorted_filtered[:5]

    today        = datetime.utcnow().date()
    weekly_trends = []

    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_preds   = [p for p in filtered if p.created_at.date() == target_date]
        weekly_trends.append({
            "date":  target_date.strftime("%b %d"),
            "total": len(day_preds),
        })

    return {
        "total_predictions":  total_predictions,
        "avg_confidence":     round(float(avg_confidence), 1),
        "recent_uploads":     recent,
        "disease_distribution": dict(disease_counts),
        "weekly_trends":      weekly_trends
    }
