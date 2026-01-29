from datetime import date, datetime, time
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# ============================================
# USER PROFILE MODELS
# ============================================


class UserProfileBase(BaseModel):
    """Base model for user profile data."""

    full_name: str | None = Field(None, max_length=100)
    display_name: str | None = Field(None, max_length=50)
    avatar_url: str | None = None
    date_of_birth: date | None = None
    gender: Literal["male", "female", "non_binary", "prefer_not_to_say"] | None = None
    timezone: str = Field(default="UTC", max_length=50)
    locale: str = Field(default="en-US", max_length=10)
    bio: str | None = None
    occupation: str | None = Field(None, max_length=100)


class UserProfileCreate(UserProfileBase):
    """Model for creating a user profile (auto-created on signup)."""

    email: EmailStr


class UserProfileUpdate(BaseModel):
    """Model for updating user profile."""

    full_name: str | None = Field(None, max_length=100)
    display_name: str | None = Field(None, max_length=50)
    avatar_url: str | None = None
    date_of_birth: date | None = None
    gender: Literal["male", "female", "non_binary", "prefer_not_to_say"] | None = None
    timezone: str | None = Field(None, max_length=50)
    locale: str | None = Field(None, max_length=10)
    bio: str | None = None
    occupation: str | None = Field(None, max_length=100)
    onboarding_completed: bool | None = None


class UserProfile(UserProfileBase):
    """Full user profile model with all fields."""

    id: str
    email: str
    is_active: bool = True
    email_verified: bool = False
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime
    last_login_at: datetime | None = None

    class Config:
        from_attributes = True


# ============================================
# USER SETTINGS MODELS
# ============================================


class UserSettingsBase(BaseModel):
    """Base model for user settings."""

    # Appearance
    theme: Literal["light", "dark", "system"] = "system"
    accent_color: str = Field(default="blue", max_length=20)
    compact_mode: bool = False

    # Notifications
    email_notifications: bool = True
    push_notifications: bool = True
    weekly_summary_email: bool = True
    reminder_time: time = Field(default=time(7, 0))

    # Privacy
    profile_visibility: Literal["public", "private", "friends"] = "private"
    show_streak_publicly: bool = False
    allow_data_analytics: bool = True

    # Dashboard Preferences
    default_date_range: int = Field(default=30, ge=7, le=365)
    default_chart_type: Literal["line", "bar", "area"] = "line"
    show_weekend_markers: bool = True
    start_week_on: Literal["monday", "sunday"] = "monday"

    # Units & Formats
    time_format: Literal["12h", "24h"] = "24h"
    date_format: str = Field(default="YYYY-MM-DD", max_length=20)
    measurement_system: Literal["metric", "imperial"] = "metric"


class UserSettingsUpdate(BaseModel):
    """Model for updating user settings (all fields optional)."""

    # Appearance
    theme: Literal["light", "dark", "system"] | None = None
    accent_color: str | None = Field(None, max_length=20)
    compact_mode: bool | None = None

    # Notifications
    email_notifications: bool | None = None
    push_notifications: bool | None = None
    weekly_summary_email: bool | None = None
    reminder_time: time | None = None

    # Privacy
    profile_visibility: Literal["public", "private", "friends"] | None = None
    show_streak_publicly: bool | None = None
    allow_data_analytics: bool | None = None

    # Dashboard Preferences
    default_date_range: int | None = Field(None, ge=7, le=365)
    default_chart_type: Literal["line", "bar", "area"] | None = None
    show_weekend_markers: bool | None = None
    start_week_on: Literal["monday", "sunday"] | None = None

    # Units & Formats
    time_format: Literal["12h", "24h"] | None = None
    date_format: str | None = Field(None, max_length=20)
    measurement_system: Literal["metric", "imperial"] | None = None


class UserSettings(UserSettingsBase):
    """Full user settings model with all fields."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# USER GOALS MODELS
# ============================================

GoalType = Literal[
    "sleep_duration",
    "wake_time",
    "exercise_minutes",
    "meditation_minutes",
    "water_intake",
    "caffeine_limit",
    "productivity_score",
    "focus_hours",
    "tasks_completed",
    "stress_level_max",
    "screen_time_limit",
]


class UserGoalBase(BaseModel):
    """Base model for user goals."""

    goal_type: GoalType
    target_value: float
    target_unit: str | None = Field(None, max_length=20)
    is_active: bool = True
    reminder_enabled: bool = False


class UserGoalCreate(UserGoalBase):
    """Model for creating a new goal."""

    pass


class UserGoalUpdate(BaseModel):
    """Model for updating a goal."""

    target_value: float | None = None
    target_unit: str | None = Field(None, max_length=20)
    is_active: bool | None = None
    reminder_enabled: bool | None = None


class UserGoal(UserGoalBase):
    """Full goal model with all fields."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# COMBINED USER DATA MODEL
# ============================================


class CurrentUser(BaseModel):
    """Combined model for current authenticated user."""

    profile: UserProfile
    settings: UserSettings
    goals: list[UserGoal] = []
