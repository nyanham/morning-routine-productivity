import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client

from app.core.supabase import get_authenticated_supabase, get_supabase


logger = logging.getLogger("morning_routine")

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
        token = credentials.credentials
        logger.info(
            "AUTH validating token: length=%d, prefix=%s...",
            len(token),
            token[:20] if len(token) > 20 else token,
        )
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            logger.warning("AUTH token valid but no user returned")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

        logger.info("AUTH success: user_id=%s, email=%s", user.user.id, user.user.email)
        return {
            "id": user.user.id,
            "email": user.user.email,
            "user_metadata": user.user.user_metadata,
            "access_token": token,  # Pass token for RLS
        }
    except HTTPException:
        raise
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        logger.error("AUTH failed: %s: %s", error_type, error_msg)

        # Provide a user-friendly detail that hints at the actual problem
        if "expired" in error_msg.lower():
            detail = "Token expired — please sign in again"
        elif "signature" in error_msg.lower() or "invalid jwt" in error_msg.lower():
            detail = "Invalid token — please sign in again"
        else:
            detail = "Authentication failed — please sign in again"

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        ) from e


async def get_user_supabase(
    current_user: dict = Depends(get_current_user),
) -> Client:
    """
    Get a Supabase client authenticated with the current user's token.
    This client respects RLS policies.
    """
    return get_authenticated_supabase(current_user["access_token"])
