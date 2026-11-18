from datetime import date
from decimal import Decimal
from sqlalchemy import (Date, Enum, ForeignKey, Index, Integer, Numeric, String,
                        Text, UniqueConstraint, Boolean)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from .base import TimestampMixin
from .enums import MealType


class Food(Base, TimestampMixin):
    """user_id NULL = global seed food (read-only to users).
    user_id set    = custom food owned by that user.
    All nutrition values are per 100 g."""
    __tablename__ = "foods"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_food_user_name"),
        Index("ix_foods_name", "name"),
        Index("ix_foods_category", "category"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    calories_per_100g: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    protein_per_100g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    carbs_per_100g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    fat_per_100g: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class FoodLog(Base, TimestampMixin):
    """Macros are snapshotted at log time so later edits to a food
    never rewrite nutrition history."""
    __tablename__ = "food_logs"
    __table_args__ = (Index("ix_food_logs_user_date", "user_id", "log_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    food_id: Mapped[int] = mapped_column(ForeignKey("foods.id", ondelete="RESTRICT"), nullable=False)
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType), nullable=False)
    quantity_grams: Mapped[Decimal] = mapped_column(Numeric(7, 1), nullable=False)
    calories: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)
    protein: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    carbs: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    fat: Mapped[Decimal] = mapped_column(Numeric(7, 2), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    food: Mapped[Food] = relationship()
