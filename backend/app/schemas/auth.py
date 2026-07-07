from pydantic import BaseModel, EmailStr, Field, model_validator
from datetime import datetime
from typing import Optional

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1)
    email: EmailStr
    age: int = Field(..., ge=0)
    phone_no: str = Field(..., min_length=1)
    gender: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    consent_terms: bool
    consent_not_professional_ai: bool
    consent_store_images: bool
    role: Optional[str] = Field("patient", description="patient or admin")

    @model_validator(mode='after')
    def validate_passwords_and_consent(self) -> 'UserRegister':
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        if not self.consent_terms:
            raise ValueError("You must agree to the policy terms and conditions")
        if not self.consent_not_professional_ai:
            raise ValueError("You must acknowledge that this is a screening tool, not professional medical advice")
        if not self.consent_store_images:
            raise ValueError("You must consent to image storage for AI efficiency improvements")
        return self

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    name: str
    age: int
    phone_no: str
    gender: str
    consent_terms: bool
    consent_not_professional_ai: bool
    consent_store_images: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

