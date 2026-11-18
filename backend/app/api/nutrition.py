from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload


from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.nutrition import Food, FoodLog
from app.models.enums import MealType

router = APIRouter(prefix="/api/nutrition", tags=["Nutrition"])


class FoodCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    category: str = Field(min_length=2, max_length=50)
    calories_per_100g: Decimal = Field(ge=0)
    protein_per_100g: Decimal = Field(ge=0)
    carbs_per_100g: Decimal = Field(ge=0)
    fat_per_100g: Decimal = Field(ge=0)

class FoodUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    category: str | None = Field(default=None, min_length=2, max_length=50)
    calories_per_100g: Decimal | None = Field(default=None, ge=0)
    protein_per_100g: Decimal | None = Field(default=None, ge=0)
    carbs_per_100g: Decimal | None = Field(default=None, ge=0)
    fat_per_100g: Decimal | None = Field(default=None, ge=0)    


class FoodLogCreate(BaseModel):
    food_id: int
    log_date: date
    meal_type: MealType
    quantity_grams: Decimal = Field(gt=0)
    notes: str | None = None

class FoodLogUpdate(BaseModel):
    log_date: date | None = None
    meal_type: MealType | None = None
    quantity_grams: Decimal | None = Field(default=None, gt=0)
    notes: str | None = None

@router.post("/foods", status_code=status.HTTP_201_CREATED)
def add_food(
    data: FoodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = Food(
        user_id=current_user.id,
        name=data.name,
        category=data.category,
        calories_per_100g=data.calories_per_100g,
        protein_per_100g=data.protein_per_100g,
        carbs_per_100g=data.carbs_per_100g,
        fat_per_100g=data.fat_per_100g,
        is_custom=True
    )

    db.add(food)
    db.commit()
    db.refresh(food)

    return food


@router.get("/foods")
def list_foods(
    q: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Food).filter(
        (Food.user_id.is_(None)) | (Food.user_id == current_user.id)
    )

    if q:
        query = query.filter(Food.name.ilike(f"%{q}%"))

    if category:
        query = query.filter(Food.category.ilike(category))

    return query.order_by(Food.name.asc()).all()

@router.get("/foods/{food_id}")
def get_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = db.query(Food).filter(
        Food.id == food_id,
        Food.user_id == current_user.id,
        Food.is_custom == True
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Custom food not found")

    return food


@router.put("/foods/{food_id}")
def update_food(
    food_id: int,
    data: FoodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = db.query(Food).filter(
        Food.id == food_id,
        Food.user_id == current_user.id,
        Food.is_custom == True
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Custom food not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(food, field, value)

    db.commit()
    db.refresh(food)

    return food
@router.delete("/foods/{food_id}")
def delete_food(
    food_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = db.query(Food).filter(
        Food.id == food_id,
        Food.user_id == current_user.id,
        Food.is_custom == True
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Custom food not found")

    existing_logs = db.query(FoodLog).filter(
        FoodLog.food_id == food_id,
        FoodLog.user_id == current_user.id
    ).first()

    if existing_logs:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete food because it is used in food logs"
        )

    db.delete(food)
    db.commit()

    return {"message": "Custom food deleted successfully"}

@router.post("/logs", status_code=status.HTTP_201_CREATED)
def log_food(
    data: FoodLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    food = db.query(Food).filter(
        Food.id == data.food_id,
        (Food.user_id == None) | (Food.user_id == current_user.id)
    ).first()

    if not food:
        raise HTTPException(status_code=404, detail="Food not found")

    factor = data.quantity_grams / Decimal("100")

    log = FoodLog(
        user_id=current_user.id,
        food_id=food.id,
        log_date=data.log_date,
        meal_type=data.meal_type,
        quantity_grams=data.quantity_grams,
        calories=food.calories_per_100g * factor,
        protein=food.protein_per_100g * factor,
        carbs=food.carbs_per_100g * factor,
        fat=food.fat_per_100g * factor,
        notes=data.notes
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return log


@router.get("/logs")
def list_food_logs(
    log_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FoodLog).options(
        joinedload(FoodLog.food)
    ).filter(
        FoodLog.user_id == current_user.id
    )

    if log_date:
        query = query.filter(FoodLog.log_date == log_date)

    logs = query.order_by(FoodLog.id.desc()).all()

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "food_id": log.food_id,
            "food_name": log.food.name,
            "log_date": log.log_date,
            "meal_type": log.meal_type,
            "quantity_grams": log.quantity_grams,
            "calories": log.calories,
            "protein": log.protein,
            "carbs": log.carbs,
            "fat": log.fat,
            "notes": log.notes
        }
        for log in logs
    ]

@router.put("/logs/{log_id}")
def update_food_log(
    log_id: int,
    data: FoodLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(FoodLog).filter(
        FoodLog.id == log_id,
        FoodLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Food log not found")

    food = db.query(Food).filter(Food.id == log.food_id).first()

    if data.log_date is not None:
        log.log_date = data.log_date

    if data.meal_type is not None:
        log.meal_type = data.meal_type

    if data.quantity_grams is not None:
        log.quantity_grams = data.quantity_grams

    if "notes" in data.model_fields_set:
        log.notes = data.notes

    factor = log.quantity_grams / Decimal("100")

    log.calories = food.calories_per_100g * factor
    log.protein = food.protein_per_100g * factor
    log.carbs = food.carbs_per_100g * factor
    log.fat = food.fat_per_100g * factor

    db.commit()
    db.refresh(log)

    return log

@router.delete("/logs/{log_id}")
def delete_food_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log = db.query(FoodLog).filter(
        FoodLog.id == log_id,
        FoodLog.user_id == current_user.id
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Food log not found")

    db.delete(log)
    db.commit()

    return {"message": "Food log deleted successfully"}
@router.get("/summary")
def daily_nutrition_summary(
    log_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.models.user import UserProfile

    selected_date = log_date or date.today()

    logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.log_date == selected_date
    ).all()

    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    calories = sum((x.calories for x in logs), Decimal("0"))
    protein = sum((x.protein for x in logs), Decimal("0"))
    carbs = sum((x.carbs for x in logs), Decimal("0"))
    fat = sum((x.fat for x in logs), Decimal("0"))

    calorie_target = profile.daily_calorie_target if profile else Decimal("0")
    protein_target = profile.daily_protein_target if profile else Decimal("0")

    return {
        "date": selected_date,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fat": fat,
        "calorie_target": calorie_target,
        "protein_target": protein_target,
        "remaining_calories": calorie_target - calories,
        "remaining_protein": protein_target - protein
    }
