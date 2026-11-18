from app.database.session import Base
from app.api.auth import router as auth_router
from app import models
from fastapi import FastAPI
from app.api.nutrition import router as nutrition_router
from app.api.body import router as body_router
from app.api.profile import router as profile_router
from app.api.dashboard import router as dashboard_router
from app.api.analytics import router as analytics_router
app = FastAPI(
    title="FitTrack Pro API",
    description="Gym and Fitness Tracking API",
    version="1.0.0"
)
app.include_router(auth_router)
app.include_router(nutrition_router)
app.include_router(body_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(analytics_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to FitTrack Pro API",
        "status": "SUCCESS"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "SUCCESS",
        "message": "Backend is running"
    }