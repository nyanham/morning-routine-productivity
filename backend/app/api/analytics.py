from fastapi import APIRouter, Depends
from typing import Optional, List
from datetime import date
from supabase import Client

from app.core import get_current_user, get_user_supabase
from app.models import AnalyticsSummary, ChartDataPoint
from app.services import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get analytics summary for the current user."""
    service = AnalyticsService(supabase, current_user["id"])
    return service.get_summary(start_date, end_date)


@router.get("/charts", response_model=List[ChartDataPoint])
async def get_chart_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get chart data for the current user."""
    service = AnalyticsService(supabase, current_user["id"])
    return service.get_chart_data(start_date, end_date)
