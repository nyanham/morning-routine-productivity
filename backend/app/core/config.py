import json
from functools import lru_cache

from pydantic import field_validator
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
    # CORS_ORIGINS can be a JSON list or a comma-separated string (e.g. from Lambda env vars).
    cors_origins: list[str] = ["http://localhost:3000"]
    cors_origin_regex: str = r"https://.*\.vercel\.app"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> list[str]:
        """Accept JSON arrays, comma-separated strings, or native lists.

        Lambda/SAM injects env vars as plain strings, so we handle:
        - '["https://a.com","https://b.com"]'  (JSON array)
        - "https://a.com,https://b.com"          (comma-separated)
        - ["https://a.com"]                       (already a list)
        """
        if isinstance(v, str):
            stripped = v.strip()
            if stripped.startswith("["):
                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(o).strip() for o in parsed if str(o).strip()]
                except json.JSONDecodeError:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # In Lambda, env vars are set directly; .env file won't exist and that's fine
        extra = "ignore"


@lru_cache(128)
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
