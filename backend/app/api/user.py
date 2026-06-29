from fastapi import APIRouter, Depends

from app.database.models import User
from app.auth.jwt import get_current_user
from app.schemas.auth import UserOut

router = APIRouter(tags=["User Management"])

@router.get("/profile", response_model=UserOut)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Returns profile information of the current user."""
    return current_user
