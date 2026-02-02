"""
Tests for the productivity API endpoints.
"""

from datetime import date
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core import get_current_user, get_user_supabase
from app.main import app
from tests.conftest import TEST_USER, TEST_USER_ID, MockSupabaseClient


class TestProductivityEndpoints:
    """Tests for /api/productivity endpoints."""

    @pytest.fixture
    def sample_productivity(self) -> dict[str, Any]:
        """Sample productivity data for testing."""
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
    def client_with_productivity(self, sample_productivity: dict[str, Any]) -> TestClient:
        """Create test client with mocked productivity data."""

        def override_get_current_user() -> dict[str, Any]:
            return TEST_USER

        def override_get_user_supabase() -> MockSupabaseClient:
            return MockSupabaseClient(data=[sample_productivity], count=1)

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

    def test_list_productivity_success(
        self,
        client_with_productivity: TestClient,
    ) -> None:
        """Test listing productivity entries returns paginated data."""
        response = client_with_productivity.get("/api/productivity")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "total" in data
        assert "page" in data

    def test_list_productivity_empty(self, client_empty: TestClient) -> None:
        """Test listing productivity when none exist."""
        response = client_empty.get("/api/productivity")

        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []
        assert data["total"] == 0

    def test_list_productivity_with_pagination(self, client_with_productivity: TestClient) -> None:
        """Test listing productivity with pagination params."""
        response = client_with_productivity.get("/api/productivity?page=2&page_size=20")

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 2
        assert data["page_size"] == 20

    def test_get_productivity_success(self, client_with_productivity: TestClient) -> None:
        """Test getting a specific productivity entry by ID."""
        response = client_with_productivity.get("/api/productivity/productivity-123")

        assert response.status_code == 200

    def test_get_productivity_not_found(self, client_empty: TestClient) -> None:
        """Test getting a productivity entry that doesn't exist."""
        response = client_empty.get("/api/productivity/nonexistent-id")

        assert response.status_code == 404
        assert response.json()["detail"] == "Productivity entry not found"

    def test_create_productivity_success(self, client_empty: TestClient) -> None:
        """Test creating a new productivity entry."""
        new_productivity = {
            "date": date.today().isoformat(),
            "productivity_score": 7,
            "tasks_completed": 4,
            "tasks_planned": 5,
            "focus_hours": 3.5,
            "distractions_count": 5,
            "energy_level": 6,
            "stress_level": 5,
            "notes": "Good day overall",
        }

        response = client_empty.post("/api/productivity", json=new_productivity)

        assert response.status_code == 201

    def test_create_productivity_with_routine_id(self, client_empty: TestClient) -> None:
        """Test creating productivity entry linked to routine."""
        new_productivity = {
            "date": date.today().isoformat(),
            "routine_id": "routine-123",
            "productivity_score": 8,
            "energy_level": 8,
            "stress_level": 3,
        }

        response = client_empty.post("/api/productivity", json=new_productivity)

        assert response.status_code == 201

    def test_create_productivity_invalid_score(self, client_empty: TestClient) -> None:
        """Test creating productivity with invalid score."""
        invalid_productivity = {
            "date": date.today().isoformat(),
            "productivity_score": 15,  # Invalid: must be 1-10
            "energy_level": 5,
            "stress_level": 5,
        }

        response = client_empty.post("/api/productivity", json=invalid_productivity)

        assert response.status_code == 422

    def test_create_productivity_negative_tasks(self, client_empty: TestClient) -> None:
        """Test creating productivity with negative task count."""
        invalid_productivity = {
            "date": date.today().isoformat(),
            "productivity_score": 7,
            "tasks_completed": -5,  # Invalid: must be >= 0
            "energy_level": 5,
            "stress_level": 5,
        }

        response = client_empty.post("/api/productivity", json=invalid_productivity)

        assert response.status_code == 422

    def test_create_productivity_missing_required(self, client_empty: TestClient) -> None:
        """Test creating productivity without required fields."""
        incomplete = {
            "date": date.today().isoformat(),
            # Missing productivity_score, energy_level, stress_level
        }

        response = client_empty.post("/api/productivity", json=incomplete)

        assert response.status_code == 422

    def test_update_productivity_success(self, client_with_productivity: TestClient) -> None:
        """Test updating an existing productivity entry."""
        update_data = {
            "productivity_score": 9,
            "notes": "Updated notes",
        }

        response = client_with_productivity.put(
            "/api/productivity/productivity-123", json=update_data
        )

        assert response.status_code == 200

    def test_update_productivity_not_found(self, client_empty: TestClient) -> None:
        """Test updating a productivity entry that doesn't exist."""
        update_data = {"productivity_score": 9}

        response = client_empty.put("/api/productivity/nonexistent-id", json=update_data)

        assert response.status_code == 404

    def test_delete_productivity_success(self, client_with_productivity: TestClient) -> None:
        """Test deleting a productivity entry."""
        response = client_with_productivity.delete("/api/productivity/productivity-123")

        assert response.status_code == 204

    def test_delete_productivity_not_found(self, client_empty: TestClient) -> None:
        """Test deleting a productivity entry that doesn't exist."""
        response = client_empty.delete("/api/productivity/nonexistent-id")

        assert response.status_code == 404
