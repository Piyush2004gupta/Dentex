from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv

from app.database.session import get_db
from app.database.models import User, Prediction
from app.auth.jwt import get_current_user, get_admin_user
from app.schemas.auth import UserOut

router = APIRouter(tags=["User Management"])

@router.get("/profile", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Returns profile information of current logged-in user.
    """
    return current_user

@router.get("/admin/users", response_model=list[UserOut])
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """
    Allows Admin to view all users on the platform.
    """
    return db.query(User).all()

@router.delete("/admin/users/{id}", status_code=status.HTTP_200_OK)
def delete_user_by_admin(
    id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """
    Allows Admin to delete any user profile.
    """
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.username == admin_user.username:
        raise HTTPException(status_code=400, detail="Admins cannot delete their own profile via this route")
        
    db.delete(user)
    db.commit()
    return {"message": f"User {user.username} deleted successfully"}

@router.get("/admin/predictions/export")
def export_predictions_csv(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_admin_user)
):
    """
    Allows Admin to download all prediction history logs in CSV format.
    """
    predictions = db.query(Prediction).all()
    
    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "ID", "Patient Username", "Uploaded Filename", 
        "Disease", "Severity", "Confidence Score", 
        "Blur Score", "Brightness Score", "Clarity Valid", "Date Created"
    ])
    
    for p in predictions:
        writer.writerow([
            p.id, p.user.username, p.filename,
            p.disease, p.severity, p.confidence,
            round(p.blur_score, 2), round(p.brightness_score, 2), p.is_valid,
            p.created_at.strftime("%Y-%m-%d %H:%M:%S")
        ])
        
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=Dentex_Predictions_Export.csv"}
    )
