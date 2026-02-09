"""
Tests for the main application endpoints (health, root).
"""

import importlib
from unittest.mock import patch

from fastapi.testclient import TestClient

import app.main as main_module
from app.core.config import Settings


client = TestClient(main_module.app)


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


class TestProductionDocsDisabled:
    """Tests that /docs and /redoc are disabled in production.

    In production, interactive docs are disabled to reduce attack surface.
    """

    def test_docs_disabled_in_production(self) -> None:
        """Test that /docs returns 404 when ENVIRONMENT=production."""
        prod_settings = Settings(
            supabase_url="https://test.supabase.co",
            supabase_key="test-key",
            environment="production",
        )
        with patch("app.core.config.get_settings", return_value=prod_settings):
            importlib.reload(main_module)
            prod_client = TestClient(main_module.app)

            response = prod_client.get("/docs")
            assert response.status_code == 404

            response = prod_client.get("/redoc")
            assert response.status_code == 404

            # Root endpoint should not advertise a docs link in production
            response = prod_client.get("/")
            assert response.json()["docs"] is None

        # Reload to restore default (development) state for other tests
        importlib.reload(main_module)

    def test_docs_enabled_in_development(self) -> None:
        """Test that /docs returns 200 when ENVIRONMENT=development (default)."""
        response = client.get("/docs")
        assert response.status_code == 200

        response = client.get("/redoc")
        assert response.status_code == 200


class TestExceptionHandler:
    """Tests for the global unhandled exception handler."""

    def test_unhandled_exception_returns_json_500(self) -> None:
        """Test that unhandled exceptions produce a JSON 500 (not HTML)."""

        @main_module.app.get("/test-error")
        async def _raise_error() -> None:
            msg = "deliberate test error"
            raise RuntimeError(msg)

        test_client = TestClient(main_module.app, raise_server_exceptions=False)
        response = test_client.get("/test-error")

        assert response.status_code == 500
        assert response.headers["content-type"] == "application/json"
        assert response.json() == {"detail": "Internal server error"}
