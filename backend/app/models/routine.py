from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class MorningRoutineBase(BaseModel):
    """Base model for morning routine data."""
    date: date
    wake_time: str = Field(..., description="Wake time in HH:MM format")
    sleep_duration_hours: float = Field(..., ge=0, le=24)
    exercise_minutes: int = Field(default=0, ge=0)
    meditation_minutes: int = Field(default=0, ge=0)
    breakfast_quality: Literal["poor", "fair", "good", "excellent"] = "good"
    morning_mood: int = Field(..., ge=1, le=10)
    screen_time_before_bed: int = Field(default=0, ge=0, description="Minutes")
    caffeine_intake: int = Field(default=0, ge=0, description="mg or cups")
    water_intake_ml: int = Field(default=0, ge=0)


class MorningRoutineCreate(MorningRoutineBase):
    """Model for creating a new morning routine entry."""
    pass


class MorningRoutineUpdate(BaseModel):
    """Model for updating a morning routine entry."""
    wake_time: Optional[str] = None
    sleep_duration_hours: Optional[float] = Field(default=None, ge=0, le=24)
    exercise_minutes: Optional[int] = Field(default=None, ge=0)
    meditation_minutes: Optional[int] = Field(default=None, ge=0)
    breakfast_quality: Optional[Literal["poor", "fair", "good", "excellent"]] = None
    morning_mood: Optional[int] = Field(default=None, ge=1, le=10)
    screen_time_before_bed: Optional[int] = Field(default=None, ge=0)
    caffeine_intake: Optional[int] = Field(default=None, ge=0)
    water_intake_ml: Optional[int] = Field(default=None, ge=0)


class MorningRoutine(MorningRoutineBase):
    """Full morning routine model with database fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
