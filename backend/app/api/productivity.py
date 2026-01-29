from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import date
from supabase import Client

from app.core import get_current_user, get_user_supabase
from app.models import (
    Productivity,
    ProductivityCreate,
    ProductivityUpdate,
    PaginatedResponse,
)
from app.services import ProductivityService

router = APIRouter(prefix="/productivity", tags=["productivity"])


@router.get("", response_model=PaginatedResponse[dict])
async def list_productivity(
    page: int = 1,
    page_size: int = 10,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """List all productivity entries for the current user."""
    service = ProductivityService(supabase, current_user["id"])
    return service.list(page, page_size, start_date, end_date)


@router.get("/{entry_id}")
async def get_productivity(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Get a specific productivity entry by ID."""
    service = ProductivityService(supabase, current_user["id"])
    entry = service.get(entry_id)
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity entry not found",
        )
    
    return entry


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_productivity(
    data: ProductivityCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Create a new productivity entry."""
    service = ProductivityService(supabase, current_user["id"])
    return service.create(data)


@router.put("/{entry_id}")
async def update_productivity(
    entry_id: str,
    data: ProductivityUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Update an existing productivity entry."""
    service = ProductivityService(supabase, current_user["id"])
    entry = service.update(entry_id, data)
    
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity entry not found",
        )
    
    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_productivity(
    entry_id: str,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_user_supabase),
):
    """Delete a productivity entry."""
    service = ProductivityService(supabase, current_user["id"])
    deleted = service.delete(entry_id)
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Productivity entry not found",
        )
