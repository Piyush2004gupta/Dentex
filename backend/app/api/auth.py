from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta

from app.database.models import User, load_users, save_users
from app.schemas.auth import UserRegister, UserLogin, Token, UserOut
from app.auth.jwt import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register_user(user_data: UserRegister):
    users = load_users()
    
    # Check if user already exists
    if any(u.email.lower() == user_data.email.lower() for u in users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    if any(u.username.lower() == user_data.username.lower() for u in users):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )
        
    next_id = max([u.id for u in users]) + 1 if users else 1
    
    new_user = User(
        id=next_id,
        username=user_data.username,
        email=user_data.email,
        role=user_data.role or "patient",
        name=user_data.name,
        age=user_data.age,
        phone_no=user_data.phone_no,
        gender=user_data.gender,
        password_hash=user_data.password,
        consent_terms=user_data.consent_terms,
        consent_not_professional_ai=user_data.consent_not_professional_ai,
        consent_store_images=user_data.consent_store_images
    )
    
    users.append(new_user)
    save_users(users)
    return new_user

@router.post("/login", response_model=Token)
def login_user(login_data: UserLogin):
    users = load_users()
    user = next((u for u in users if u.email.lower() == login_data.email.lower()), None)
    
    if user is None or user.password_hash != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
        
    # Generate token
    token_data = {"email": user.email, "role": user.role}
    access_token = create_access_token(data=token_data, expires_delta=timedelta(days=1))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
