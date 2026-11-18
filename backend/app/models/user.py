from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (Boolean, Date, DateTime, Enum, ForeignKey, Integer,
                        Numeric, String, UniqueConstraint, Index)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from .base import TimestampMixin
from .enums import Gender, FitnessGoal


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan")
    reset_tokens: Mapped[list["PasswordResetToken"]] = relationship(
        back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    height_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    fitness_goal: Mapped[FitnessGoal] = mapped_column(
        Enum(FitnessGoal), default=FitnessGoal.muscle_gain, nullable=False)
    target_weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    daily_calorie_target: Mapped[int] = mapped_column(Integer, default=2500, nullable=False)
    daily_protein_target: Mapped[int] = mapped_column(Integer, default=150, nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="UTC", nullable=False)
    theme: Mapped[str] = mapped_column(String(10), default="dark", nullable=False)

    user: Mapped[User] = relationship(back_populates="profile")


class PasswordResetToken(Base, TimestampMixin):
    """Backs POST /auth/forgot-password and /auth/reset-password.
    Only a SHA-256 hash of the token is stored, never the raw token."""
    __tablename__ = "password_reset_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship(back_populates="reset_tokens")
