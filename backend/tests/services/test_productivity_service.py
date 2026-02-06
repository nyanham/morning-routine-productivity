"""
Tests for ProductivityService.
"""

from datetime import date
from typing import Any

import pytest

from app.models import ProductivityCreate, ProductivityUpdate
from app.services.productivity_service import ProductivityService
from tests.conftest import TEST_USER_ID, MockSupabaseClient


class TestProductivityService:
    """Unit tests for ProductivityService."""

    @pytest.fixture
    def sample_productivity_data(self) -> dict[str, Any]:
        """Sample productivity data."""
        return {
            "id": "productivity-123",
            "user_id": TEST_USER_ID,
            "date": date.today().isoformat(),
            "routine_id": "routine-123",
            "productivity_score": 8,
            "tasks_completed": 5,
            "tasks_planned": 6,
            "focus_hours": 4.5,
            "distractions_count": 3,
            "energy_level": 7,
            "stress_level": 4,
            "notes": "Productive day!",
            "created_at": "2024-01-01T18:00:00Z",
            "updated_at": "2024-01-01T18:00:00Z",
        }

    @pytest.fixture
    def service_with_data(self, sample_productivity_data: dict[str, Any]) -> ProductivityService:
        """Create service with mock data."""
        mock_client = MockSupabaseClient(data=[sample_productivity_data], count=1)
        return ProductivityService(mock_client, TEST_USER_ID)

    @pytest.fixture
    def service_empty(self) -> ProductivityService:
        """Create service with empty data."""
        mock_client = MockSupabaseClient(data=[], count=0)
        return ProductivityService(mock_client, TEST_USER_ID)

    def test_list_returns_paginated_response(self, service_with_data: ProductivityService) -> None:
        """Test list method returns paginated response."""
        result = service_with_data.list()

        assert hasattr(result, "data")
        assert hasattr(result, "total")
        assert hasattr(result, "page")
        assert hasattr(result, "page_size")

    def test_list_with_pagination(self, service_with_data: ProductivityService) -> None:
        """Test list with custom pagination."""
        result = service_with_data.list(page=3, page_size=25)

        assert result.page == 3
        assert result.page_size == 25

    def test_list_with_date_filters(self, service_with_data: ProductivityService) -> None:
        """Test list with date range filters."""
        result = service_with_data.list(start_date=date(2024, 1, 1), end_date=date(2024, 6, 30))

        assert result is not None

    def test_get_returns_productivity_data(self, service_with_data: ProductivityService) -> None:
        """Test get method returns data."""
        result = service_with_data.get("productivity-123")

        assert result is not None

    def test_get_returns_none_for_missing(self, service_empty: ProductivityService) -> None:
        """Test get returns None for missing entry."""
        result = service_empty.get("nonexistent-id")

        # When no data exists, should return None
        assert result is None

    def test_create_productivity(self, service_empty: ProductivityService) -> None:
        """Test creating productivity entry."""
        create_data = ProductivityCreate(
            date=date.today(),
            productivity_score=8,
            tasks_completed=4,
            tasks_planned=5,
            focus_hours=3.5,
            distractions_count=2,
            energy_level=7,
            stress_level=4,
            notes="Good day!",
        )

        result = service_empty.create(create_data)

        assert result is not None
        assert "id" in result

    def test_create_productivity_with_routine(self, service_empty: ProductivityService) -> None:
        """Test creating productivity entry linked to routine."""
        create_data = ProductivityCreate(
            date=date.today(),
            routine_id="routine-123",
            productivity_score=9,
            energy_level=8,
            stress_level=3,
        )

        result = service_empty.create(create_data)

        assert result is not None

    def test_update_productivity(self, service_with_data: ProductivityService) -> None:
        """Test updating productivity entry."""
        update_data = ProductivityUpdate(
            productivity_score=10,
            notes="Updated: Amazing day!",
        )

        result = service_with_data.update("productivity-123", update_data)

        assert result is not None

    def test_update_returns_none_for_missing(self, service_empty: ProductivityService) -> None:
        """Test update returns None for missing entry."""
        update_data = ProductivityUpdate(productivity_score=10)

        result = service_empty.update("nonexistent-id", update_data)

        assert result is None

    def test_delete_productivity(self, service_with_data: ProductivityService) -> None:
        """Test deleting productivity entry."""
        result = service_with_data.delete("productivity-123")

        assert isinstance(result, bool)

    def test_delete_returns_false_for_missing(self, service_empty: ProductivityService) -> None:
        """Test delete returns False for missing entry."""
        result = service_empty.delete("nonexistent-id")

        assert result is False

    def test_service_uses_correct_table(self) -> None:
        """Test service uses correct table name."""
        mock_client = MockSupabaseClient()
        service = ProductivityService(mock_client, TEST_USER_ID)

        assert service.table == "productivity_entries"

    def test_service_stores_user_id(self) -> None:
        """Test service stores user ID correctly."""
        mock_client = MockSupabaseClient()
        service = ProductivityService(mock_client, TEST_USER_ID)

        assert service.user_id == TEST_USER_ID
