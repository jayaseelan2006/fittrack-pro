
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.models.nutrition import FoodLog

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/nutrition")
def nutrition_analytics(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    days = max(1, min(days, 365))
    end_date = date.today()
    start_date = end_date - timedelta(days=days - 1)

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    results = db.query(
        FoodLog.log_date,
        func.sum(FoodLog.calories).label("calories"),
        func.sum(FoodLog.protein).label("protein"),
        func.sum(FoodLog.carbs).label("carbs"),
        func.sum(FoodLog.fat).label("fat")
    ).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.log_date >= start_date,
        FoodLog.log_date <= end_date
    ).group_by(
        FoodLog.log_date
    ).order_by(
        FoodLog.log_date.asc()
    ).all()

    return {
        "days": [
            {
                "date": str(row.log_date),
                "calories": float(row.calories or 0),
                "protein": float(row.protein or 0),
                "carbs": float(row.carbs or 0),
                "fat": float(row.fat or 0)
            }
            for row in results
        ],
        "calorie_target": float(profile.daily_calorie_target or 0) if profile else 0,
        "protein_target": float(profile.daily_protein_target or 0) if profile else 0
    }
