from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    In local development, values are loaded from a .env file.
    In AWS Lambda, values are injected as environment variables via SAM template.
    """

    # Supabase
    supabase_url: str
    supabase_key: str

    # App settings
    app_name: str = "Morning Routine Productivity API"
    debug: bool = False
    environment: str = "development"

    # CORS - exact origins and optional regex for wildcard subdomain matching
    cors_origins: list[str] = ["http://localhost:3000"]
    cors_origin_regex: str = r"https://.*\.vercel\.app"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # In Lambda, env vars are set directly; .env file won't exist and that's fine
        extra = "ignore"


@lru_cache(128)
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
