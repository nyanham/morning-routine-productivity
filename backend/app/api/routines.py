from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.core import get_current_user, get_user_supabase
from app.models import (
    MorningRoutineCreate,
    MorningRoutineUpdate,
    PaginatedResponse,
)
from app.services import RoutineService


router = APIRouter(prefix="/routines", tags=["routines"])


@router.get("", response_model=PaginatedResponse[dict])
async def list_routines(
    page: int = 1,
    page_size: int = 10,
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """List all morning routines for the current user."""
    service = RoutineService(supabase, current_user["id"])
    return service.list(page, page_size, start_date, end_date)


@router.get("/{routine_id}")
async def get_routine(
    routine_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get a specific morning routine by ID."""
    service = RoutineService(supabase, current_user["id"])
    routine = service.get(routine_id)

    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found",
        )

    return routine


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_routine(
    data: MorningRoutineCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Create a new morning routine entry."""
    service = RoutineService(supabase, current_user["id"])
    return service.create(data)


@router.put("/{routine_id}")
async def update_routine(
    routine_id: str,
    data: MorningRoutineUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Update an existing morning routine."""
    service = RoutineService(supabase, current_user["id"])
    routine = service.update(routine_id, data)

    if not routine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found",
        )

    return routine


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_routine(
    routine_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Delete a morning routine."""
    service = RoutineService(supabase, current_user["id"])
    deleted = service.delete(routine_id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Routine not found",
        )
