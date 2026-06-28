from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from collections import Counter

from app.database.session import get_db
from app.database.models import User, Prediction
from app.auth.jwt import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("")
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Prediction)
    
    # Enforce role scoping (patient gets their own stats, admin gets global stats)
    if current_user.role != "admin":
        query = query.filter(Prediction.user_id == current_user.id)
        
    total_predictions = query.count()
    
    if total_predictions == 0:
        return {
            "total_predictions": 0,
            "healthy_cases": 0,
            "diseased_cases": 0,
            "detection_accuracy": 0.0,
            "classification_accuracy": 0.0,
            "recent_uploads": [],
            "disease_distribution": {},
            "severity_distribution": {},
            "weekly_trends": []
        }
        
    # Count Cases
    healthy_cases = query.filter(Prediction.severity == "Healthy").count()
    diseased_cases = total_predictions - healthy_cases
    
    # Average Accuracies
    avg_det_acc = db.query(func.avg(Prediction.confidence)).filter(
        Prediction.id.in_(query.with_entities(Prediction.id))
    ).scalar() or 0.0
    
    # Let's say classification accuracy is average confidence when severity != Healthy
    avg_cls_acc = db.query(func.avg(Prediction.confidence)).filter(
        Prediction.id.in_(query.with_entities(Prediction.id)),
        Prediction.severity != "Healthy"
    ).scalar() or avg_det_acc # Fallback to detection if no diseases
    
    # Disease distribution
    all_predictions = query.all()
    disease_counts = Counter([p.disease for p in all_predictions])
    severity_counts = Counter([p.severity for p in all_predictions])
    
    # Recent Uploads (limit 5)
    recent = query.order_by(Prediction.created_at.desc()).limit(5).all()
    
    # Weekly Trends (Last 7 Days)
    today = datetime.utcnow().date()
    weekly_trends = []
    
    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        start_dt = datetime.combine(target_date, datetime.min.time())
        end_dt = datetime.combine(target_date, datetime.max.time())
        
        # Count for this day
        day_query = query.filter(Prediction.created_at >= start_dt, Prediction.created_at <= end_dt)
        day_total = day_query.count()
        day_healthy = day_query.filter(Prediction.severity == "Healthy").count()
        day_diseased = day_total - day_healthy
        
        weekly_trends.append({
            "date": target_date.strftime("%b %d"),
            "total": day_total,
            "healthy": day_healthy,
            "diseased": day_diseased
        })
        
    return {
        "total_predictions": total_predictions,
        "healthy_cases": healthy_cases,
        "diseased_cases": diseased_cases,
        "detection_accuracy": round(float(avg_det_acc), 1),
        "classification_accuracy": round(float(avg_cls_acc), 1),
        "recent_uploads": recent,
        "disease_distribution": dict(disease_counts),
        "severity_distribution": dict(severity_counts),
        "weekly_trends": weekly_trends
    }
