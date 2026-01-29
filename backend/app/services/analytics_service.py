from datetime import date, timedelta

from supabase import Client

from app.models import AnalyticsSummary, ChartDataPoint


class AnalyticsService:
    """Service for computing analytics and chart data."""

    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    def get_summary(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> AnalyticsSummary:
        """Get analytics summary for the user."""
        # Default to last 30 days
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)

        # Fetch routines
        routines_response = (
            self.supabase.table("morning_routines")
            .select("*")
            .eq("user_id", self.user_id)
            .gte("date", start_date.isoformat())
            .lte("date", end_date.isoformat())
            .execute()
        )

        # Fetch productivity
        productivity_response = (
            self.supabase.table("productivity_entries")
            .select("*")
            .eq("user_id", self.user_id)
            .gte("date", start_date.isoformat())
            .lte("date", end_date.isoformat())
            .order("date")
            .execute()
        )

        routines = routines_response.data or []
        productivity = productivity_response.data or []

        # Calculate averages
        avg_productivity = 0
        avg_sleep = 0
        avg_exercise = 0
        avg_mood = 0
        avg_energy = 0
        best_day = None
        worst_day = None

        if routines:
            avg_sleep = sum(r["sleep_duration_hours"] for r in routines) / len(routines)
            avg_exercise = sum(r["exercise_minutes"] for r in routines) / len(routines)
            avg_mood = sum(r["morning_mood"] for r in routines) / len(routines)

        if productivity:
            avg_productivity = sum(p["productivity_score"] for p in productivity) / len(
                productivity
            )
            avg_energy = sum(p["energy_level"] for p in productivity) / len(productivity)

            # Find best and worst days
            best = max(productivity, key=lambda p: p["productivity_score"])
            worst = min(productivity, key=lambda p: p["productivity_score"])
            best_day = best["date"]
            worst_day = worst["date"]

        # Calculate trend (compare first half to second half)
        trend = "stable"
        if len(productivity) >= 4:
            mid = len(productivity) // 2
            first_half_avg = sum(p["productivity_score"] for p in productivity[:mid]) / mid
            second_half_avg = sum(p["productivity_score"] for p in productivity[mid:]) / (
                len(productivity) - mid
            )

            if second_half_avg > first_half_avg * 1.1:
                trend = "up"
            elif second_half_avg < first_half_avg * 0.9:
                trend = "down"

        return AnalyticsSummary(
            avg_productivity=round(avg_productivity, 2),
            avg_sleep=round(avg_sleep, 2),
            avg_exercise=round(avg_exercise, 2),
            avg_mood=round(avg_mood, 2),
            avg_energy=round(avg_energy, 2),
            total_entries=len(productivity),
            best_day=best_day,
            worst_day=worst_day,
            productivity_trend=trend,
        )

    def get_chart_data(
        self,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[ChartDataPoint]:
        """Get data formatted for charts."""
        # Default to last 30 days
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)

        # Fetch routines
        routines_response = (
            self.supabase.table("morning_routines")
            .select(
                "date, sleep_duration_hours, exercise_minutes, meditation_minutes, morning_mood"
            )
            .eq("user_id", self.user_id)
            .gte("date", start_date.isoformat())
            .lte("date", end_date.isoformat())
            .order("date")
            .execute()
        )

        # Fetch productivity
        productivity_response = (
            self.supabase.table("productivity_entries")
            .select("date, productivity_score, energy_level")
            .eq("user_id", self.user_id)
            .gte("date", start_date.isoformat())
            .lte("date", end_date.isoformat())
            .order("date")
            .execute()
        )

        # Merge data by date
        routines_by_date = {r["date"]: r for r in (routines_response.data or [])}
        productivity_by_date = {p["date"]: p for p in (productivity_response.data or [])}

        all_dates = sorted(set(routines_by_date.keys()) | set(productivity_by_date.keys()))

        chart_data = []
        for d in all_dates:
            routine = routines_by_date.get(d, {})
            prod = productivity_by_date.get(d, {})

            chart_data.append(
                ChartDataPoint(
                    date=d,
                    productivity_score=prod.get("productivity_score"),
                    energy_level=prod.get("energy_level"),
                    morning_mood=routine.get("morning_mood"),
                    sleep_duration_hours=routine.get("sleep_duration_hours"),
                    exercise_minutes=routine.get("exercise_minutes"),
                    meditation_minutes=routine.get("meditation_minutes"),
                )
            )

        return chart_data
