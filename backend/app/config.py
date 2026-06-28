import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dentex"
    API_V1_STR: str = "/api"
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dentex_super_secret_session_token_key_change_me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./dentex.db")
    
    # Directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    PREDICTION_DIR: str = os.path.join(BASE_DIR, "predictions")
    TRAINED_MODELS_DIR: str = os.path.join(BASE_DIR, "trained_models")
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
for path in [settings.UPLOAD_DIR, settings.PREDICTION_DIR, settings.TRAINED_MODELS_DIR]:
    os.makedirs(path, exist_ok=True)
