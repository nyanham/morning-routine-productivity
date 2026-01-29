from typing import Optional
from datetime import date
from supabase import Client
from app.models import (
    Productivity,
    ProductivityCreate,
    ProductivityUpdate,
    PaginatedResponse,
)


class ProductivityService:
    """Service for managing productivity data."""
    
    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id
        self.table = "productivity_entries"
    
    def list(
        self,
        page: int = 1,
        page_size: int = 10,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> PaginatedResponse[Productivity]:
        """List productivity entries with pagination."""
        query = (
            self.supabase.table(self.table)
            .select("*", count="exact")
            .eq("user_id", self.user_id)
            .order("date", desc=True)
        )
        
        if start_date:
            query = query.gte("date", start_date.isoformat())
        if end_date:
            query = query.lte("date", end_date.isoformat())
        
        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)
        
        response = query.execute()
        total = response.count or 0
        
        return PaginatedResponse(
            data=response.data,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=(total + page_size - 1) // page_size,
        )
    
    def get(self, entry_id: str) -> Optional[dict]:
        """Get a single productivity entry by ID."""
        response = (
            self.supabase.table(self.table)
            .select("*")
            .eq("id", entry_id)
            .eq("user_id", self.user_id)
            .single()
            .execute()
        )
        return response.data
    
    def create(self, data: ProductivityCreate) -> dict:
        """Create a new productivity entry."""
        payload = data.model_dump()
        payload["user_id"] = self.user_id
        payload["date"] = payload["date"].isoformat()
        
        response = self.supabase.table(self.table).insert(payload).execute()
        return response.data[0]
    
    def update(self, entry_id: str, data: ProductivityUpdate) -> Optional[dict]:
        """Update an existing productivity entry."""
        payload = data.model_dump(exclude_unset=True)
        
        response = (
            self.supabase.table(self.table)
            .update(payload)
            .eq("id", entry_id)
            .eq("user_id", self.user_id)
            .execute()
        )
        
        return response.data[0] if response.data else None
    
    def delete(self, entry_id: str) -> bool:
        """Delete a productivity entry."""
        response = (
            self.supabase.table(self.table)
            .delete()
            .eq("id", entry_id)
            .eq("user_id", self.user_id)
            .execute()
        )
        return len(response.data) > 0
