from datetime import date
from decimal import Decimal
from sqlalchemy import (Boolean, Date, Enum, ForeignKey, Index, Integer, Numeric,
                        String, Text)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base
from .base import TimestampMixin
from .enums import GoalType, GoalStatus


class Goal(Base, TimestampMixin):
    """progress % = (current - start) / (target - start) x 100, clamped 0..100
    (computed in the service layer, so it works for gain and loss goals)."""
    __tablename__ = "goals"
    __table_args__ = (Index("ix_goals_user_status", "user_id", "status"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_type: Mapped[GoalType] = mapped_column(Enum(GoalType), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    start_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    current_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0, nullable=False)
    target_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    is_weekly_challenge: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[GoalStatus] = mapped_column(Enum(GoalStatus), default=GoalStatus.active, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)


class ProgressPhoto(Base, TimestampMixin):
    __tablename__ = "progress_photos"
    __table_args__ = (Index("ix_photos_user_date", "user_id", "photo_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    photo_date: Mapped[date] = mapped_column(Date, nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)  # random uuid name
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)
