from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core import get_current_user, get_user_supabase
from app.models import (
    CurrentUser,
    UserGoalCreate,
    UserGoalUpdate,
    UserProfileUpdate,
    UserSettingsUpdate,
)
from app.services import UserService


router = APIRouter(prefix="/users", tags=["users"])


# ==========================================
# CURRENT USER (ME) ENDPOINTS
# ==========================================


@router.get("/me", response_model=CurrentUser)
async def get_current_user_data(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get complete current user data including profile, settings, and goals."""
    service = UserService(supabase, current_user["id"])

    profile = service.get_profile()
    settings = service.get_settings()
    goals = service.list_goals(active_only=True)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found",
        )

    return {
        "profile": profile,
        "settings": settings,
        "goals": goals,
    }


# ==========================================
# PROFILE ENDPOINTS
# ==========================================


@router.get("/me/profile")
async def get_profile(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get current user's profile."""
    service = UserService(supabase, current_user["id"])
    profile = service.get_profile()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return profile


@router.patch("/me/profile")
async def update_profile(
    data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Update current user's profile."""
    service = UserService(supabase, current_user["id"])
    profile = service.update_profile(data)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return profile


# ==========================================
# SETTINGS ENDPOINTS
# ==========================================


@router.get("/me/settings")
async def get_settings(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get current user's settings."""
    service = UserService(supabase, current_user["id"])
    settings = service.get_settings()

    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found",
        )

    return settings


@router.patch("/me/settings")
async def update_settings(
    data: UserSettingsUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Update current user's settings."""
    service = UserService(supabase, current_user["id"])
    settings = service.update_settings(data)

    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Settings not found",
        )

    return settings


# ==========================================
# GOALS ENDPOINTS
# ==========================================


@router.get("/me/goals")
async def list_goals(
    active_only: bool = False,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """List all goals for current user."""
    service = UserService(supabase, current_user["id"])
    return service.list_goals(active_only)


@router.post("/me/goals", status_code=status.HTTP_201_CREATED)
async def create_goal(
    data: UserGoalCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Create a new goal."""
    service = UserService(supabase, current_user["id"])
    return service.create_goal(data)


@router.get("/me/goals/{goal_id}")
async def get_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get a specific goal by ID."""
    service = UserService(supabase, current_user["id"])
    goal = service.get_goal(goal_id)

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return goal


@router.patch("/me/goals/{goal_id}")
async def update_goal(
    goal_id: str,
    data: UserGoalUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Update a goal."""
    service = UserService(supabase, current_user["id"])
    goal = service.update_goal(goal_id, data)

    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )

    return goal


@router.delete("/me/goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Delete a goal."""
    service = UserService(supabase, current_user["id"])
    deleted = service.delete_goal(goal_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found",
        )
