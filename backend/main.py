from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database.session import engine, Base
from app.middleware.logging import LoggingMiddleware
from app.api.auth import router as auth_router
from app.api.prediction import router as prediction_router
from app.api.analytics import router as analytics_router
from app.api.user import router as user_router

# Auto-create SQLite database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Dentex - Dental Disease Detection & Severity Classification API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configurations
origins = [
    "http://localhost:5173", # Vite local server
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Logging Middleware
app.add_middleware(LoggingMiddleware)

# API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(prediction_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(user_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Dentex Dental Diagnostic API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    # Start service
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
