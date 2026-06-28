from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient", nullable=False)  # "patient" or "admin"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    disease = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    bounding_box = Column(JSON, nullable=True)  # [x, y, w, h] or list of boxes
    recommendation = Column(String, nullable=True)
    class_probabilities = Column(JSON, nullable=True)
    blur_score = Column(Float, nullable=False)
    brightness_score = Column(Float, nullable=False)
    is_valid = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="predictions")
