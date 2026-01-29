from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class ProductivityBase(BaseModel):
    """Base model for productivity data."""
    date: date
    routine_id: Optional[str] = None
    productivity_score: int = Field(..., ge=1, le=10)
    tasks_completed: int = Field(default=0, ge=0)
    tasks_planned: int = Field(default=0, ge=0)
    focus_hours: float = Field(default=0, ge=0)
    distractions_count: int = Field(default=0, ge=0)
    energy_level: int = Field(..., ge=1, le=10)
    stress_level: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None


class ProductivityCreate(ProductivityBase):
    """Model for creating a new productivity entry."""
    pass


class ProductivityUpdate(BaseModel):
    """Model for updating a productivity entry."""
    productivity_score: Optional[int] = Field(default=None, ge=1, le=10)
    tasks_completed: Optional[int] = Field(default=None, ge=0)
    tasks_planned: Optional[int] = Field(default=None, ge=0)
    focus_hours: Optional[float] = Field(default=None, ge=0)
    distractions_count: Optional[int] = Field(default=None, ge=0)
    energy_level: Optional[int] = Field(default=None, ge=1, le=10)
    stress_level: Optional[int] = Field(default=None, ge=1, le=10)
    notes: Optional[str] = None


class Productivity(ProductivityBase):
    """Full productivity model with database fields."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
