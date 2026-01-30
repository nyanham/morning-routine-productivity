from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase
    supabase_url: str
    supabase_key: str

    # App settings
    app_name: str = "Morning Routine Productivity API"
    debug: bool = False

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "https://*.vercel.app"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(128)
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
