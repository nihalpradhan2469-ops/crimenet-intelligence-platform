"""Application configuration module for Criminal Network Intelligence Backend."""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Search for .env in backend directory first, then in project root
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent

backend_env = BACKEND_DIR / ".env"
root_env = ROOT_DIR / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    # Standard fallback
    load_dotenv()


class ConfigurationError(RuntimeError):
    """Raised when required environment configuration is missing or invalid."""
    pass


class Settings:
    """Application settings loaded from environment variables."""

    PROJECT_NAME: str = "Criminal Network Intelligence Platform"
    SERVICE_NAME: str = "criminal-network-intelligence-backend"
    API_V1_STR: str = "/api/v1"
    
    @property
    def supabase_url(self) -> Optional[str]:
        val = os.getenv("SUPABASE_URL", "").strip()
        return val if val else None

    @property
    def supabase_service_role_key(self) -> Optional[str]:
        val = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        return val if val else None

    def is_supabase_configured(self) -> bool:
        """Check if Supabase configuration values are provided."""
        return bool(self.supabase_url and self.supabase_service_role_key)

    def validate_supabase_config(self) -> None:
        """Verify that Supabase configuration is present.
        
        Raises:
            ConfigurationError: If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.
        """
        missing = []
        if not self.supabase_url:
            missing.append("SUPABASE_URL")
        if not self.supabase_service_role_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")

        if missing:
            raise ConfigurationError(
                f"Missing required Supabase environment configuration: {', '.join(missing)}. "
                "Please configure backend/.env or your environment variables before initializing the Supabase client."
            )


settings = Settings()
