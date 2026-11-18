from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import (Boolean, Date, DateTime, Enum, ForeignKey, Index, Integer,
                        Numeric, String, Text, UniqueConstraint)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from .base import TimestampMixin
from .enums import MuscleGroup, WorkoutStatus, RecordType


class Exercise(Base, TimestampMixin):
    """user_id NULL = global seed exercise; otherwise a user's custom exercise."""
    __tablename__ = "exercises"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_exercise_user_name"),
        Index("ix_exercises_muscle", "muscle_group"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    muscle_group: Mapped[MuscleGroup] = mapped_column(Enum(MuscleGroup), nullable=False)
    equipment: Mapped[str] = mapped_column(String(80), default="Bodyweight", nullable=False)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Workout(Base, TimestampMixin):
    __tablename__ = "workouts"
    __table_args__ = (Index("ix_workouts_user_date", "user_id", "workout_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[MuscleGroup] = mapped_column(Enum(MuscleGroup), nullable=False)
    workout_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[WorkoutStatus] = mapped_column(
        Enum(WorkoutStatus), default=WorkoutStatus.planned, nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)

    exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="workout", cascade="all, delete-orphan", order_by="WorkoutExercise.order_index")


class WorkoutExercise(Base, TimestampMixin):
    """An exercise placed inside a workout."""
    __tablename__ = "workout_exercises"
    __table_args__ = (
        UniqueConstraint("workout_id", "order_index", name="uq_wex_order"),
        Index("ix_wex_exercise", "exercise_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workout_id: Mapped[int] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    workout: Mapped[Workout] = relationship(back_populates="exercises")
    exercise: Mapped[Exercise] = relationship()
    sets: Mapped[list["WorkoutSet"]] = relationship(
        back_populates="workout_exercise", cascade="all, delete-orphan", order_by="WorkoutSet.set_number")


class WorkoutSet(Base, TimestampMixin):
    __tablename__ = "workout_sets"
    __table_args__ = (UniqueConstraint("workout_exercise_id", "set_number", name="uq_set_number"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    workout_exercise_id: Mapped[int] = mapped_column(
        ForeignKey("workout_exercises.id", ondelete="CASCADE"), nullable=False)
    set_number: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(6, 2), default=0, nullable=False)
    rest_seconds: Mapped[int | None] = mapped_column(Integer)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    workout_exercise: Mapped[WorkoutExercise] = relationship(back_populates="sets")


class WorkoutLog(Base, TimestampMixin):
    """Per-exercise performance summary for one session. This is the
    data source for progressive overload comparisons and charts."""
    __tablename__ = "workout_logs"
    __table_args__ = (Index("ix_wlog_user_ex_date", "user_id", "exercise_id", "log_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="RESTRICT"), nullable=False)
    workout_id: Mapped[int | None] = mapped_column(ForeignKey("workouts.id", ondelete="SET NULL"))
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    total_sets: Mapped[int] = mapped_column(Integer, nullable=False)
    total_reps: Mapped[int] = mapped_column(Integer, nullable=False)
    max_weight_kg: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    total_volume: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # sum(sets x reps x weight)
    notes: Mapped[str | None] = mapped_column(Text)

    exercise: Mapped[Exercise] = relationship()


class PersonalRecord(Base, TimestampMixin):
    __tablename__ = "personal_records"
    __table_args__ = (
        UniqueConstraint("user_id", "exercise_id", "record_type", name="uq_pr_user_ex_type"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id", ondelete="CASCADE"), nullable=False)
    record_type: Mapped[RecordType] = mapped_column(Enum(RecordType), nullable=False)
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    achieved_date: Mapped[date] = mapped_column(Date, nullable=False)
    workout_log_id: Mapped[int | None] = mapped_column(ForeignKey("workout_logs.id", ondelete="SET NULL"))

    exercise: Mapped[Exercise] = relationship()
