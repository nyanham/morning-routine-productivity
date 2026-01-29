from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.core.supabase import get_authenticated_supabase, get_supabase


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase: Client = Depends(get_supabase),
) -> dict:
    """
    Validate JWT token and return current user.

    Args:
        credentials: Bearer token from Authorization header
        supabase: Supabase client instance

    Returns:
        User data dictionary with id, email, metadata, and access_token

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Verify the JWT token with Supabase
        user = supabase.auth.get_user(credentials.credentials)

        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        return {
            "id": user.user.id,
            "email": user.user.email,
            "user_metadata": user.user.user_metadata,
            "access_token": credentials.credentials,  # Pass token for RLS
        }
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from None


async def get_user_supabase(
    current_user: dict = Depends(get_current_user),
) -> Client:
    """
    Get a Supabase client authenticated with the current user's token.
    This client respects RLS policies.
    """
    return get_authenticated_supabase(current_user["access_token"])
