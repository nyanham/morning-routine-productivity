"""
Pytest configuration and fixtures for backend tests.

Provides mock Supabase client, test data factories, and API test client.
"""

from collections.abc import Generator
from datetime import date, datetime
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.core import get_current_user, get_user_supabase
from app.main import app


# ==========================================
# TEST USER DATA
# ==========================================

TEST_USER_ID = "test-user-123"
TEST_USER = {
    "id": TEST_USER_ID,
    "email": "test@example.com",
    "created_at": "2024-01-01T00:00:00Z",
}


# ==========================================
# MOCK SUPABASE RESPONSE
# ==========================================


class MockSupabaseResponse:
    """Mock Supabase query response."""

    def __init__(
        self,
        data: list[dict[str, Any]] | dict[str, Any] | None = None,
        count: int | None = None,
    ):
        self.data = data
        self.count = count


class MockSupabaseQuery:
    """Mock Supabase query builder."""

    def __init__(self, data: list[dict[str, Any]] | None = None, count: int | None = None):
        self._data = data or []
        self._count = count
        self._single = False

    def select(self, *_args: Any, **_kwargs: Any) -> "MockSupabaseQuery":
        return self

    def insert(self, data: dict[str, Any]) -> "MockSupabaseQuery":
        # Add id and timestamps to inserted data
        inserted = {
            **data,
            "id": "new-id-123",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self._data = [inserted]
        return self

    def update(self, data: dict[str, Any]) -> "MockSupabaseQuery":
        if self._data:
            self._data = [{**self._data[0], **data}]
        return self

    def delete(self) -> "MockSupabaseQuery":
        return self

    def eq(self, _column: str, _value: Any) -> "MockSupabaseQuery":
        return self

    def neq(self, _column: str, _value: Any) -> "MockSupabaseQuery":
        return self

    def gte(self, _column: str, _value: Any) -> "MockSupabaseQuery":
        return self

    def lte(self, _column: str, _value: Any) -> "MockSupabaseQuery":
        return self

    def order(self, _column: str, **_kwargs: Any) -> "MockSupabaseQuery":
        return self

    def range(self, _start: int, _end: int) -> "MockSupabaseQuery":
        return self

    def single(self) -> "MockSupabaseQuery":
        self._single = True
        if self._data:
            self._data = self._data[0] if isinstance(self._data, list) else self._data
        else:
            # When no data exists, set to None instead of empty list
            # This matches the expected behavior for missing records
            self._data = None
        return self

    def execute(self) -> MockSupabaseResponse:
        if self._single:
            return MockSupabaseResponse(data=self._data, count=self._count)
        data = self._data if isinstance(self._data, list) else [self._data] if self._data else []
        return MockSupabaseResponse(data=data, count=self._count)


class MockSupabaseTable:
    """Mock Supabase table."""

    def __init__(self, data: list[dict[str, Any]] | None = None, count: int | None = None):
        self._data = data
        self._count = count

    def __call__(self, _table_name: str) -> MockSupabaseQuery:
        return MockSupabaseQuery(self._data, self._count)


class MockSupabaseClient:
    """Mock Supabase client for testing."""

    def __init__(self, data: list[dict[str, Any]] | None = None, count: int | None = None):
        self._data = data
        self._count = count

    def table(self, _name: str) -> MockSupabaseQuery:
        return MockSupabaseQuery(self._data, self._count)


# ==========================================
# FIXTURES
# ==========================================


@pytest.fixture
def mock_supabase() -> MockSupabaseClient:
    """Create a mock Supabase client."""
    return MockSupabaseClient()


@pytest.fixture
def mock_supabase_with_data(sample_routine: dict[str, Any]) -> MockSupabaseClient:
    """Create a mock Supabase client with sample data."""
    return MockSupabaseClient(data=[sample_routine], count=1)


@pytest.fixture
def sample_routine() -> dict[str, Any]:
    """Sample morning routine data."""
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
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@pytest.fixture
def sample_productivity() -> dict[str, Any]:
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
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
    }


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Mock authorization headers."""
    return {"Authorization": "Bearer test-token-123"}


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Create a test client with mocked dependencies."""

    def override_get_current_user() -> dict[str, Any]:
        return TEST_USER

    def override_get_user_supabase() -> MockSupabaseClient:
        return MockSupabaseClient()

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_user_supabase] = override_get_user_supabase

    yield TestClient(app)

    app.dependency_overrides.clear()


@pytest.fixture
def client_with_data(sample_routine: dict[str, Any]) -> Generator[TestClient, None, None]:
    """Create a test client with mocked dependencies and sample data."""

    def override_get_current_user() -> dict[str, Any]:
        return TEST_USER

    def override_get_user_supabase() -> MockSupabaseClient:
        return MockSupabaseClient(data=[sample_routine], count=1)

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_user_supabase] = override_get_user_supabase

    yield TestClient(app)

    app.dependency_overrides.clear()
