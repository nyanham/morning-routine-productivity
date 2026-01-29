from supabase import Client

from app.models import (
    UserGoalCreate,
    UserGoalUpdate,
    UserProfileUpdate,
    UserSettingsUpdate,
)


class UserService:
    """Service for managing user profiles, settings, and goals."""

    def __init__(self, supabase: Client, user_id: str):
        self.supabase = supabase
        self.user_id = user_id

    # ==========================================
    # PROFILE METHODS
    # ==========================================

    def get_profile(self) -> dict | None:
        """Get the current user's profile."""
        response = (
            self.supabase.table("user_profiles")
            .select("*")
            .eq("id", self.user_id)
            .single()
            .execute()
        )
        return response.data

    def update_profile(self, data: UserProfileUpdate) -> dict | None:
        """Update the current user's profile."""
        payload = data.model_dump(exclude_unset=True)

        response = (
            self.supabase.table("user_profiles").update(payload).eq("id", self.user_id).execute()
        )

        return response.data[0] if response.data else None

    def update_last_login(self) -> None:
        """Update the last login timestamp."""
        self.supabase.table("user_profiles").update({"last_login_at": "now()"}).eq(
            "id", self.user_id
        ).execute()

    # ==========================================
    # SETTINGS METHODS
    # ==========================================

    def get_settings(self) -> dict | None:
        """Get the current user's settings."""
        response = (
            self.supabase.table("user_settings")
            .select("*")
            .eq("user_id", self.user_id)
            .single()
            .execute()
        )
        return response.data

    def update_settings(self, data: UserSettingsUpdate) -> dict | None:
        """Update the current user's settings."""
        payload = data.model_dump(exclude_unset=True)

        # Convert time objects to string for JSON serialization
        if payload.get("reminder_time"):
            payload["reminder_time"] = payload["reminder_time"].isoformat()

        response = (
            self.supabase.table("user_settings")
            .update(payload)
            .eq("user_id", self.user_id)
            .execute()
        )

        return response.data[0] if response.data else None

    # ==========================================
    # GOALS METHODS
    # ==========================================

    def list_goals(self, active_only: bool = False) -> list[dict]:
        """List all goals for the current user."""
        query = (
            self.supabase.table("user_goals")
            .select("*")
            .eq("user_id", self.user_id)
            .order("created_at", desc=True)
        )

        if active_only:
            query = query.eq("is_active", True)

        response = query.execute()
        return response.data or []

    def get_goal(self, goal_id: str) -> dict | None:
        """Get a specific goal by ID."""
        response = (
            self.supabase.table("user_goals")
            .select("*")
            .eq("id", goal_id)
            .eq("user_id", self.user_id)
            .single()
            .execute()
        )
        return response.data

    def create_goal(self, data: UserGoalCreate) -> dict:
        """Create a new goal."""
        # Deactivate existing goal of same type if creating active goal
        if data.is_active:
            self.supabase.table("user_goals").update({"is_active": False}).eq(
                "user_id", self.user_id
            ).eq("goal_type", data.goal_type).eq("is_active", True).execute()

        payload = data.model_dump()
        payload["user_id"] = self.user_id

        response = self.supabase.table("user_goals").insert(payload).execute()
        return response.data[0]

    def update_goal(self, goal_id: str, data: UserGoalUpdate) -> dict | None:
        """Update an existing goal."""
        payload = data.model_dump(exclude_unset=True)

        # If activating this goal, deactivate others of same type
        if payload.get("is_active"):
            existing = self.get_goal(goal_id)
            if existing:
                self.supabase.table("user_goals").update({"is_active": False}).eq(
                    "user_id", self.user_id
                ).eq("goal_type", existing["goal_type"]).eq("is_active", True).neq(
                    "id", goal_id
                ).execute()

        response = (
            self.supabase.table("user_goals")
            .update(payload)
            .eq("id", goal_id)
            .eq("user_id", self.user_id)
            .execute()
        )

        return response.data[0] if response.data else None

    def delete_goal(self, goal_id: str) -> bool:
        """Delete a goal."""
        response = (
            self.supabase.table("user_goals")
            .delete()
            .eq("id", goal_id)
            .eq("user_id", self.user_id)
            .execute()
        )
        return len(response.data) > 0
