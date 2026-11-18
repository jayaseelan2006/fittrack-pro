
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.auth import get_current_user
from app.models.user import User, UserProfile
from app.models.body import WeightLog

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    latest_weight = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.log_date.desc()).first()

    return {
        "current_weight": float(latest_weight.weight_kg) if latest_weight else 0,
        "target_weight": float(profile.target_weight_kg) if profile and profile.target_weight_kg else 0,
        "height_cm": float(profile.height_cm) if profile and profile.height_cm else 0
    }


@router.get("/weight-progress")
def weight_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.log_date.asc()).all()

    return [
        {"date": str(item.log_date), "weight": float(item.weight_kg)}
        for item in records
    ]


@router.get("/nutrition-summary")
def nutrition_summary():
    return {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}


@router.get("/workout-summary")
def workout_summary():
    return {"total_workouts": 0, "total_duration": 0}


@router.get("/strength-progress")
def strength_progress():
    return []
