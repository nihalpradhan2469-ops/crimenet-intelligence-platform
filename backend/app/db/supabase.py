"""Clean Supabase database service using the official Supabase Python client.

Provides:
- Singleton client instance
- Health & connectivity verification
- Direct table execution helpers
- Safe credential handling via environment variables
"""

from typing import Any, Dict, List, Optional, Tuple
from backend.app.core.config import settings, ConfigurationError

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None  # type: ignore
    Client = Any  # type: ignore

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Instantiate or return the existing Supabase client singleton.

    Raises:
        ConfigurationError: If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.
        RuntimeError: If supabase-py package is not installed.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    # Validate configuration from environment variables
    settings.validate_supabase_config()

    if create_client is None:
        raise RuntimeError(
            "The 'supabase' package is not installed. Please install dependencies from backend/requirements.txt."
        )

    # Instantiate official client with backend credentials
    _supabase_client = create_client(
        supabase_url=settings.supabase_url,  # type: ignore[arg-type]
        supabase_key=settings.supabase_service_role_key,  # type: ignore[arg-type]
    )
    return _supabase_client


def check_supabase_connection() -> Tuple[bool, str, Dict[str, Any]]:
    """Check whether Supabase configuration is available and valid.

    Returns:
        Tuple of (is_configured, status_message, metadata_dict)
    """
    if not settings.is_supabase_configured():
        return (
            False,
            "Supabase is not configured. Missing required Supabase environment credentials.",
            {
                "configured": False,
                "url_set": bool(settings.supabase_url),
                "key_set": bool(settings.supabase_service_role_key),
            },
        )

    try:
        client = get_supabase_client()
        return (
            True,
            "Supabase client initialized successfully.",
            {
                "configured": True,
                "url": settings.supabase_url,
                "client_ready": client is not None,
            },
        )
    except ConfigurationError as ce:
        return (
            False,
            f"Configuration error: {str(ce)}",
            {"configured": False, "error": str(ce)},
        )
    except Exception as exc:
        return (
            False,
            f"Failed to initialize Supabase client: {str(exc)}",
            {"configured": True, "error": str(exc)},
        )


def get_table_counts(tables: List[str]) -> Tuple[Dict[str, int], Dict[str, str]]:
    """Query live record counts from Supabase for a list of table names.

    Args:
        tables: List of database table names to count

    Returns:
        Tuple of (counts_dict, errors_dict)
    """
    client = get_supabase_client()
    counts: Dict[str, int] = {}
    errors: Dict[str, str] = {}

    for table_name in tables:
        try:
            # count='exact' computes exact row count in PostgreSQL via HTTP header
            res = client.table(table_name).select("*", count="exact").limit(1).execute()
            counts[table_name] = res.count if res.count is not None else 0
        except Exception as exc:
            errors[table_name] = str(exc)

    return counts, errors
