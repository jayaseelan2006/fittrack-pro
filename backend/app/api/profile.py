
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, UserProfile

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    height_cm: Decimal | None = Field(default=None, gt=0, le=300)
    target_weight_kg: Decimal | None = Field(default=None, gt=0, le=500)
    daily_calorie_target: int = Field(default=2500, gt=0)
    daily_protein_target: int = Field(default=150, gt=0)


@router.get("")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile
