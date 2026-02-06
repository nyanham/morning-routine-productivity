"""
Tests for MockSupabaseQuery to verify it correctly simulates Supabase behavior.
"""

from tests.conftest import MockSupabaseQuery


class TestMockSupabaseQuerySingleBehavior:
    """Verify that single() + execute() returns data as a dict, not a list."""

    def test_single_execute_returns_dict_not_list(self) -> None:
        """When single() is called, execute() should return data as a dict."""
        record = {"id": "1", "name": "test"}
        query = MockSupabaseQuery(data=[record])
        response = query.select("*").eq("id", "1").single().execute()

        assert isinstance(
            response.data, dict
        ), f"Expected response.data to be a dict after single(), got {type(response.data)}"
        assert response.data == record

    def test_single_execute_with_empty_data_returns_falsy(self) -> None:
        """When single() is called with no data, execute() should return falsy data."""
        query = MockSupabaseQuery(data=[])
        response = query.select("*").eq("id", "missing").single().execute()

        assert not response.data

    def test_execute_without_single_returns_list(self) -> None:
        """Without single(), execute() should return data as a list."""
        record = {"id": "1", "name": "test"}
        query = MockSupabaseQuery(data=[record])
        response = query.select("*").execute()

        assert isinstance(response.data, list)
        assert response.data == [record]

    def test_execute_without_single_empty_returns_list(self) -> None:
        """Without single(), empty data should still return an empty list."""
        query = MockSupabaseQuery(data=[])
        response = query.select("*").execute()

        assert isinstance(response.data, list)
        assert response.data == []
