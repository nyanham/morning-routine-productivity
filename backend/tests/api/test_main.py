"""
Tests for the main application endpoints (health, root).
"""

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_root_endpoint(self) -> None:
        """Test the root endpoint returns correct info."""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Morning Routine Productivity API"
        assert data["version"] == "0.1.0"
        assert data["docs"] == "/docs"

    def test_health_endpoint(self) -> None:
        """Test the health check endpoint."""
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_docs_accessible(self) -> None:
        """Test that API docs are accessible."""
        response = client.get("/docs")

        assert response.status_code == 200

    def test_redoc_accessible(self) -> None:
        """Test that ReDoc is accessible."""
        response = client.get("/redoc")

        assert response.status_code == 200
