from typing import Generic, TypeVar

from pydantic import BaseModel


T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""

    data: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class AnalyticsSummary(BaseModel):
    """Summary analytics model."""

    avg_productivity: float
    avg_sleep: float
    avg_exercise: float
    avg_mood: float
    avg_energy: float
    total_entries: int
    best_day: str | None
    worst_day: str | None
    productivity_trend: str  # "up", "down", "stable"


class ChartDataPoint(BaseModel):
    """Data point for charts."""

    date: str
    productivity_score: float | None = None
    energy_level: float | None = None
    morning_mood: float | None = None
    sleep_duration_hours: float | None = None
    exercise_minutes: int | None = None
    meditation_minutes: int | None = None


class CSVImportResult(BaseModel):
    """Result of CSV import operation."""

    success: bool
    imported_count: int
    failed_count: int
    errors: list[str]
