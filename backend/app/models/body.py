from datetime import date
from decimal import Decimal
from sqlalchemy import Date, ForeignKey, Index, Integer, Numeric, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base
from .base import TimestampMixin


class WeightLog(Base, TimestampMixin):
    __tablename__ = "weight_logs"
    __table_args__ = (
        UniqueConstraint("user_id", "log_date", name="uq_weight_user_date"),
        Index("ix_weight_user_date", "user_id", "log_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    weight_kg: Mapped[Decimal] = mapped_column(Numeric(5, 1), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)


class BodyMeasurement(Base, TimestampMixin):
    __tablename__ = "body_measurements"
    __table_args__ = (Index("ix_measure_user_date", "user_id", "measured_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    measured_date: Mapped[date] = mapped_column(Date, nullable=False)
    chest_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    waist_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    arms_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    shoulders_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    thighs_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    hips_cm: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))
    notes: Mapped[str | None] = mapped_column(Text)
