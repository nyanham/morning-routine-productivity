from supabase import Client, create_client

from app.core.config import get_settings


settings = get_settings()

# Service client (for admin operations that bypass RLS)
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)


def get_supabase() -> Client:
    """Get Supabase client instance (service key - bypasses RLS)."""
    return supabase


def get_authenticated_supabase(access_token: str) -> Client:
    """
    Get a Supabase client authenticated with the user's JWT token.
    This client respects RLS policies based on auth.uid().
    """
    client = create_client(settings.supabase_url, settings.supabase_key)
    client.postgrest.auth(access_token)
    return client
