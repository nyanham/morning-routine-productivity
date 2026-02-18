import json
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

    # CORS - exact origins and optional regex for wildcard subdomain matching.
    # Stored as a plain string to avoid pydantic-settings v2 attempting JSON
    # parsing on env var values for complex types (list[str] would crash when
    # the env var is a simple comma-separated string like from SAM/Lambda).
    cors_origins: str = "http://localhost:3000"
    cors_origin_regex: str = r"https://.*\.vercel\.app"

    def get_cors_origins_list(self) -> list[str]:
        """Parse CORS origins string into a list of origin URLs.

        Lambda/SAM injects env vars as plain strings, so we handle:
        - '["https://a.com","https://b.com"]'  (JSON array)
        - "https://a.com,https://b.com"          (comma-separated)
        """
        stripped = self.cors_origins.strip()
        if stripped.startswith("["):
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    return [str(o).strip() for o in parsed if str(o).strip()]
            except json.JSONDecodeError:
                # Not valid JSON — fall through to comma-separated parsing.
                pass
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # In Lambda, env vars are set directly; .env file won't exist and that's fine
        extra = "ignore"


@lru_cache(128)
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
