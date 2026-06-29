import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Dentex"
    API_V1_STR: str = "/api"

    # Allowed origins (comma-separated list in env, e.g. "https://yourdomain.com,https://www.yourdomain.com")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

    # Google Cloud Storage Settings
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "dentex-images")

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
