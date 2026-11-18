from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, UserProfile
from app.models.body import WeightLog, BodyMeasurement

router = APIRouter(prefix="/api/body", tags=["Body Tracking"])


class WeightCreate(BaseModel):
    weight_kg: Decimal = Field(gt=0, le=500)
    log_date: date
    notes: str | None = None

class MeasurementCreate(BaseModel):
    measured_date: date
    chest_cm: Decimal | None = Field(default=None, gt=0)
    waist_cm: Decimal | None = Field(default=None, gt=0)
    hips_cm: Decimal | None = Field(default=None, gt=0)
    arms_cm: Decimal | None = Field(default=None, gt=0)
    shoulders_cm: Decimal | None = Field(default=None, gt=0)
    thighs_cm: Decimal | None = Field(default=None, gt=0)
    notes: str | None = None

@router.post("/weight", status_code=status.HTTP_201_CREATED)
def add_weight(
    data: WeightCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id,
        WeightLog.log_date == data.log_date
    ).first()

    if entry:
        entry.weight_kg = data.weight_kg
        entry.notes = data.notes
    else:
        entry = WeightLog(
            user_id=current_user.id,
            weight_kg=data.weight_kg,
            log_date=data.log_date,
            notes=data.notes
        )
        db.add(entry)

    db.commit()
    db.refresh(entry)
    return entry

@router.get("/weight")
def list_weights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.log_date.desc()).all()


@router.post("/measurements", status_code=status.HTTP_201_CREATED)
def add_measurement(
    data: MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = BodyMeasurement(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


@router.get("/measurements")
def list_measurements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.measured_date.desc()).all()


@router.get("/bmi")
def calculate_bmi(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    latest_weight = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.log_date.desc()).first()

    if not profile or not profile.height_cm:
        raise HTTPException(
            status_code=400,
            detail="Please add your height in your profile first"
        )

    if not latest_weight:
        raise HTTPException(
            status_code=400,
            detail="Please add your weight first"
        )

    height_m = float(profile.height_cm) / 100
    weight = float(latest_weight.weight_kg)
    bmi = weight / (height_m ** 2)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25:
        category = "Normal"
    elif bmi < 30:
        category = "Overweight"
    else:
        category = "Obese"

    return {
        "height_cm": float(profile.height_cm),
        "weight_kg": weight,
        "bmi": round(bmi, 2),
        "category": category
    }