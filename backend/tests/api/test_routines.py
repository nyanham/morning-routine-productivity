"""
Tests for the routines API endpoints.
"""

from datetime import date
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core import get_current_user, get_user_supabase
from app.main import app
from tests.conftest import TEST_USER, TEST_USER_ID, MockSupabaseClient


class TestRoutinesEndpoints:
    """Tests for /api/routines endpoints."""

    @pytest.fixture
    def sample_routine(self) -> dict[str, Any]:
        """Sample routine data for testing."""
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
    def client_with_routines(self, sample_routine: dict[str, Any]) -> TestClient:
        """Create test client with mocked routine data."""

        def override_get_current_user() -> dict[str, Any]:
            return TEST_USER

        def override_get_user_supabase() -> MockSupabaseClient:
            return MockSupabaseClient(data=[sample_routine], count=1)

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

    def test_list_routines_success(
        self, client_with_routines: TestClient
    ) -> None:
        """Test listing routines returns paginated data."""
        response = client_with_routines.get("/api/routines")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data

    def test_list_routines_empty(self, client_empty: TestClient) -> None:
        """Test listing routines when none exist."""
        response = client_empty.get("/api/routines")

        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []
        assert data["total"] == 0

    def test_list_routines_with_pagination(self, client_with_routines: TestClient) -> None:
        """Test listing routines with pagination params."""
        response = client_with_routines.get("/api/routines?page=1&page_size=5")

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["page_size"] == 5

    def test_list_routines_with_date_filter(self, client_with_routines: TestClient) -> None:
        """Test listing routines with date filters."""
        response = client_with_routines.get(
            "/api/routines?start_date=2024-01-01&end_date=2024-12-31"
        )

        assert response.status_code == 200

    def test_get_routine_success(
        self, client_with_routines: TestClient
    ) -> None:
        """Test getting a specific routine by ID."""
        response = client_with_routines.get("/api/routines/routine-123")

        assert response.status_code == 200

    def test_get_routine_not_found(self, client_empty: TestClient) -> None:
        """Test getting a routine that doesn't exist."""
        response = client_empty.get("/api/routines/nonexistent-id")

        assert response.status_code == 404
        assert response.json()["detail"] == "Routine not found"

    def test_create_routine_success(self, client_empty: TestClient) -> None:
        """Test creating a new routine."""
        new_routine = {
            "date": date.today().isoformat(),
            "wake_time": "07:00",
            "sleep_duration_hours": 8.0,
            "exercise_minutes": 45,
            "meditation_minutes": 20,
            "breakfast_quality": "excellent",
            "morning_mood": 8,
            "screen_time_before_bed": 15,
            "caffeine_intake": 100,
            "water_intake_ml": 750,
        }

        response = client_empty.post("/api/routines", json=new_routine)

        assert response.status_code == 201

    def test_create_routine_invalid_mood(self, client_empty: TestClient) -> None:
        """Test creating a routine with invalid mood value."""
        invalid_routine = {
            "date": date.today().isoformat(),
            "wake_time": "07:00",
            "sleep_duration_hours": 8.0,
            "morning_mood": 15,  # Invalid: must be 1-10
        }

        response = client_empty.post("/api/routines", json=invalid_routine)

        assert response.status_code == 422  # Validation error

    def test_create_routine_invalid_sleep_duration(self, client_empty: TestClient) -> None:
        """Test creating a routine with invalid sleep duration."""
        invalid_routine = {
            "date": date.today().isoformat(),
            "wake_time": "07:00",
            "sleep_duration_hours": 25.0,  # Invalid: max is 24
            "morning_mood": 7,
        }

        response = client_empty.post("/api/routines", json=invalid_routine)

        assert response.status_code == 422

    def test_create_routine_missing_required_fields(self, client_empty: TestClient) -> None:
        """Test creating a routine without required fields."""
        incomplete_routine = {
            "date": date.today().isoformat(),
            # Missing wake_time, sleep_duration_hours, morning_mood
        }

        response = client_empty.post("/api/routines", json=incomplete_routine)

        assert response.status_code == 422

    def test_update_routine_success(self, client_with_routines: TestClient) -> None:
        """Test updating an existing routine."""
        update_data = {
            "morning_mood": 9,
            "exercise_minutes": 60,
        }

        response = client_with_routines.put("/api/routines/routine-123", json=update_data)

        assert response.status_code == 200

    def test_update_routine_not_found(self, client_empty: TestClient) -> None:
        """Test updating a routine that doesn't exist."""
        update_data = {"morning_mood": 9}

        response = client_empty.put("/api/routines/nonexistent-id", json=update_data)

        assert response.status_code == 404

    def test_delete_routine_success(self, client_with_routines: TestClient) -> None:
        """Test deleting a routine."""
        response = client_with_routines.delete("/api/routines/routine-123")

        assert response.status_code == 204

    def test_delete_routine_not_found(self, client_empty: TestClient) -> None:
        """Test deleting a routine that doesn't exist."""
        response = client_empty.delete("/api/routines/nonexistent-id")

        assert response.status_code == 404
