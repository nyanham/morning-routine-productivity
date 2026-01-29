from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    data: List[T]
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
    best_day: Optional[str]
    worst_day: Optional[str]
    productivity_trend: str  # "up", "down", "stable"


class ChartDataPoint(BaseModel):
    """Data point for charts."""
    date: str
    productivity_score: Optional[float] = None
    energy_level: Optional[float] = None
    morning_mood: Optional[float] = None
    sleep_duration_hours: Optional[float] = None
    exercise_minutes: Optional[int] = None
    meditation_minutes: Optional[int] = None


class CSVImportResult(BaseModel):
    """Result of CSV import operation."""
    success: bool
    imported_count: int
    failed_count: int
    errors: List[str]
