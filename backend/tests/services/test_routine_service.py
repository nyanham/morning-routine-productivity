"""
Tests for RoutineService.
"""

from datetime import date
from typing import Any

import pytest

from app.models import MorningRoutineCreate, MorningRoutineUpdate
from app.services.routine_service import RoutineService
from tests.conftest import TEST_USER_ID, MockSupabaseClient


class TestRoutineService:
    """Unit tests for RoutineService."""

    @pytest.fixture
    def sample_routine_data(self) -> dict[str, Any]:
        """Sample routine data."""
        return {
            "id": "routine-123",
            "user_id": TEST_USER_ID,
            "date": date.today().isoformat(),
            "wake_time": "06:30",
            "sleep_duration_hours": 7.5,
            "exercise_minutes": 30,
            "meditation_minutes": 15,
            "breakfast_quality": "good",
            "morning_mood": 7,
            "screen_time_before_bed": 30,
            "caffeine_intake": 200,
            "water_intake_ml": 500,
            "created_at": "2024-01-01T08:00:00Z",
            "updated_at": "2024-01-01T08:00:00Z",
        }

    @pytest.fixture
    def service_with_data(self, sample_routine_data: dict[str, Any]) -> RoutineService:
        """Create service with mock data."""
        mock_client = MockSupabaseClient(data=[sample_routine_data], count=1)
        return RoutineService(mock_client, TEST_USER_ID)

    @pytest.fixture
    def service_empty(self) -> RoutineService:
        """Create service with empty data."""
        mock_client = MockSupabaseClient(data=[], count=0)
        return RoutineService(mock_client, TEST_USER_ID)

    def test_list_returns_paginated_response(self, service_with_data: RoutineService) -> None:
        """Test list method returns paginated response."""
        result = service_with_data.list()

        assert hasattr(result, "data")
        assert hasattr(result, "total")
        assert hasattr(result, "page")
        assert hasattr(result, "page_size")
        assert hasattr(result, "total_pages")

    def test_list_with_pagination_params(self, service_with_data: RoutineService) -> None:
        """Test list method respects pagination params."""
        result = service_with_data.list(page=2, page_size=20)

        assert result.page == 2
        assert result.page_size == 20

    def test_list_with_date_filters(self, service_with_data: RoutineService) -> None:
        """Test list method with date filters."""
        result = service_with_data.list(start_date=date(2024, 1, 1), end_date=date(2024, 12, 31))

        assert result is not None

    def test_list_calculates_total_pages(self, service_with_data: RoutineService) -> None:
        """Test that total_pages is calculated correctly."""
        result = service_with_data.list(page_size=10)

        # With count=1 and page_size=10, should be 1 page
        assert result.total_pages == (result.total + 9) // 10

    def test_get_returns_routine_data(self, service_with_data: RoutineService) -> None:
        """Test get method returns routine data."""
        result = service_with_data.get("routine-123")

        # Mock returns the sample data
        assert result is not None

    def test_get_returns_none_for_missing(self, service_empty: RoutineService) -> None:
        """Test get method returns empty for missing routine."""
        result = service_empty.get("nonexistent-id")

        # Empty mock returns empty list or None
        assert result is None or result == []

    def test_create_routine(self, service_empty: RoutineService) -> None:
        """Test creating a new routine."""
        create_data = MorningRoutineCreate(
            date=date.today(),
            wake_time="07:00",
            sleep_duration_hours=8.0,
            exercise_minutes=45,
            meditation_minutes=20,
            breakfast_quality="excellent",
            morning_mood=8,
            screen_time_before_bed=15,
            caffeine_intake=100,
            water_intake_ml=750,
        )

        result = service_empty.create(create_data)

        assert result is not None
        assert "id" in result

    def test_update_routine(self, service_with_data: RoutineService) -> None:
        """Test updating an existing routine."""
        update_data = MorningRoutineUpdate(
            morning_mood=9,
            exercise_minutes=60,
        )

        result = service_with_data.update("routine-123", update_data)

        assert result is not None

    def test_update_returns_none_for_missing(self, service_empty: RoutineService) -> None:
        """Test update returns None for missing routine."""
        update_data = MorningRoutineUpdate(morning_mood=9)

        result = service_empty.update("nonexistent-id", update_data)

        assert result is None

    def test_delete_routine(self, service_with_data: RoutineService) -> None:
        """Test deleting a routine."""
        result = service_with_data.delete("routine-123")

        assert isinstance(result, bool)

    def test_delete_returns_false_for_missing(self, service_empty: RoutineService) -> None:
        """Test delete returns False for missing routine."""
        result = service_empty.delete("nonexistent-id")

        assert result is False

    def test_service_uses_correct_table(self) -> None:
        """Test service uses correct table name."""
        mock_client = MockSupabaseClient()
        service = RoutineService(mock_client, TEST_USER_ID)

        assert service.table == "morning_routines"

    def test_service_stores_user_id(self) -> None:
        """Test service stores user ID correctly."""
        mock_client = MockSupabaseClient()
        service = RoutineService(mock_client, TEST_USER_ID)

        assert service.user_id == TEST_USER_ID
