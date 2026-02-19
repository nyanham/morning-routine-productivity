from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductivityBase(BaseModel):
    """Base model for productivity data."""

    date: date
    routine_id: str | None = None
    productivity_score: int = Field(..., ge=1, le=10)
    tasks_completed: int = Field(default=0, ge=0)
    tasks_planned: int = Field(default=0, ge=0)
    focus_hours: float = Field(default=0, ge=0)
    distractions_count: int = Field(default=0, ge=0)
    energy_level: int = Field(..., ge=1, le=10)
    stress_level: int = Field(..., ge=1, le=10)
    notes: str | None = None


class ProductivityCreate(ProductivityBase):
    """Model for creating a new productivity entry."""

    pass


class ProductivityUpdate(BaseModel):
    """Model for updating a productivity entry."""

    productivity_score: int | None = Field(default=None, ge=1, le=10)
    tasks_completed: int | None = Field(default=None, ge=0)
    tasks_planned: int | None = Field(default=None, ge=0)
    focus_hours: float | None = Field(default=None, ge=0)
    distractions_count: int | None = Field(default=None, ge=0)
    energy_level: int | None = Field(default=None, ge=1, le=10)
    stress_level: int | None = Field(default=None, ge=1, le=10)
    notes: str | None = None


class Productivity(ProductivityBase):
    """Full productivity model with database fields."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
