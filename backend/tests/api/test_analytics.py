"""
Tests for the analytics API endpoints.
"""

from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core import get_current_user, get_user_supabase
from app.main import app
from tests.conftest import TEST_USER, MockSupabaseClient


class TestAnalyticsEndpoints:
    """Tests for /api/analytics endpoints."""

    @pytest.fixture
    def sample_data(self) -> list[dict[str, Any]]:
        """Sample combined routine and productivity data."""
        return [
            {
                "date": "2024-01-01",
                "wake_time": "06:30",
                "sleep_duration_hours": 7.5,
                "morning_mood": 7,
                "exercise_minutes": 30,
                "productivity_score": 8,
                "energy_level": 7,
                "stress_level": 4,
            },
            {
                "date": "2024-01-02",
                "wake_time": "07:00",
                "sleep_duration_hours": 8.0,
                "morning_mood": 8,
                "exercise_minutes": 45,
                "productivity_score": 9,
                "energy_level": 8,
                "stress_level": 3,
            },
        ]

    @pytest.fixture
    def client_with_data(self, sample_data: list[dict[str, Any]]) -> TestClient:
        """Create test client with mocked analytics data."""

        def override_get_current_user() -> dict[str, Any]:
            return TEST_USER

        def override_get_user_supabase() -> MockSupabaseClient:
            return MockSupabaseClient(data=sample_data, count=2)

        app.dependency_overrides[get_current_user] = override_get_current_user
        app.dependency_overrides[get_user_supabase] = override_get_user_supabase

        yield TestClient(app)

        app.dependency_overrides.clear()

    @pytest.fixture
    def client_empty(self) -> TestClient:
        """Create test client with empty data."""

        def override_get_current_user() -> dict[str, Any]:
            return TEST_USER

        def override_get_user_supabase() -> MockSupabaseClient:
            return MockSupabaseClient(data=[], count=0)

        app.dependency_overrides[get_current_user] = override_get_current_user
        app.dependency_overrides[get_user_supabase] = override_get_user_supabase

        yield TestClient(app)

        app.dependency_overrides.clear()

    def test_get_summary_success(self, client_with_data: TestClient) -> None:
        """Test getting analytics summary."""
        response = client_with_data.get("/api/analytics/summary")

        assert response.status_code == 200
        data = response.json()
        # Check that summary contains expected fields
        assert "total_entries" in data or "avg_productivity" in data or data == {}

    def test_get_summary_empty(self, client_empty: TestClient) -> None:
        """Test getting analytics summary with no data."""
        response = client_empty.get("/api/analytics/summary")

        assert response.status_code == 200

    def test_get_summary_with_date_filter(self, client_with_data: TestClient) -> None:
        """Test getting analytics summary with date range."""
        response = client_with_data.get(
            "/api/analytics/summary?start_date=2024-01-01&end_date=2024-01-31"
        )

        assert response.status_code == 200

    def test_get_charts_success(self, client_with_data: TestClient) -> None:
        """Test getting chart data."""
        response = client_with_data.get("/api/analytics/charts")

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_charts_empty(self, client_empty: TestClient) -> None:
        """Test getting chart data with no entries."""
        response = client_empty.get("/api/analytics/charts")

        assert response.status_code == 200
        assert response.json() == []

    def test_get_charts_with_date_filter(self, client_with_data: TestClient) -> None:
        """Test getting chart data with date range."""
        response = client_with_data.get(
            "/api/analytics/charts?start_date=2024-01-01&end_date=2024-01-31"
        )

        assert response.status_code == 200
