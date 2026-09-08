"""Supabase Data Access Service.

Provides clean, reusable database querying functions for the
Criminal Network Intelligence Platform directly against the Supabase database.
No hardcoded records, no mock data, and no fake records.
"""

from typing import Any, Dict, List, Optional, Tuple
from backend.app.db.supabase import get_supabase_client


def get_person(person_id: str) -> Optional[Dict[str, Any]]:
    """Fetch single person record by primary ID or person_id alias."""
    client = get_supabase_client()
    # Try exact match on 'id' first
    res = client.table("persons").select("*").eq("id", person_id).limit(1).execute()
    if res.data:
        return res.data[0]

    # Try match on 'person_id' column
    res_alt = client.table("persons").select("*").eq("person_id", person_id).limit(1).execute()
    if res_alt.data:
        return res_alt.data[0]

    return None


def get_persons(limit: int = 100, offset: int = 0, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve list of persons with pagination and optional search filter."""
    client = get_supabase_client()
    query = client.table("persons").select("*")

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.or_(f"name.ilike.{term},alias.ilike.{term}")

    res = query.range(offset, offset + limit - 1).execute()
    return res.data or []


def get_person_vehicles(person_id: str) -> List[Dict[str, Any]]:
    """Retrieve all registered vehicles owned by the person."""
    client = get_supabase_client()
    res = client.table("vehicles").select("*").eq("owner_id", person_id).execute()
    return res.data or []


def get_person_cdr(person_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve Call Detail Records (CDR) where person is caller or receiver."""
    client = get_supabase_client()
    res = (
        client.table("cdr")
        .select("*")
        .or_(f"caller_id.eq.{person_id},receiver_id.eq.{person_id}")
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


def get_person_transactions(person_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve financial transactions where person is sender or receiver."""
    client = get_supabase_client()
    res = (
        client.table("transactions")
        .select("*")
        .or_(f"sender_id.eq.{person_id},receiver_id.eq.{person_id}")
        .order("date", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


def get_person_firs(person_id: str) -> List[Dict[str, Any]]:
    """Retrieve First Information Reports (FIRs) naming or referencing the person."""
    client = get_supabase_client()
    res = (
        client.table("firs")
        .select("*")
        .ilike("person_ids", f"%{person_id}%")
        .order("date", desc=True)
        .execute()
    )
    return res.data or []


def get_person_movements(person_id: str, limit: int = 100) -> List[Dict[str, Any]]:
    """Retrieve vehicle movements associated with vehicles owned by this person."""
    client = get_supabase_client()
    vehicles = get_person_vehicles(person_id)
    if not vehicles:
        return []

    vehicle_ids = [v["vehicle_id"] for v in vehicles if "vehicle_id" in v]
    if not vehicle_ids:
        return []

    # Query movements matching any vehicle owned by the person
    res = (
        client.table("movements")
        .select("*, locations(location_name, city, area)")
        .in_("vehicle_id", vehicle_ids)
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )
    return res.data or []


def get_person_relationships(person_id: str) -> List[Dict[str, Any]]:
    """Retrieve graph relationships where person is source or target entity."""
    client = get_supabase_client()
    res = (
        client.table("relationships")
        .select("*")
        .or_(f"source_id.eq.{person_id},target_id.eq.{person_id},source_entity.eq.{person_id},target_entity.eq.{person_id}")
        .execute()
    )
    return res.data or []


def get_person_alerts(person_id: str) -> List[Dict[str, Any]]:
    """Retrieve automated intelligence alerts flagged for the person."""
    client = get_supabase_client()
    # Check both entity_id and entity name / text
    person = get_person(person_id)
    name_filter = f",entity.eq.{person['name']}" if person and person.get("name") else ""
    
    res = (
        client.table("alerts")
        .select("*")
        .or_(f"entity_id.eq.{person_id},entity.eq.{person_id}{name_filter}")
        .execute()
    )
    return res.data or []


def get_person_dossier(person_id: str) -> Optional[Dict[str, Any]]:
    """Assemble complete investigative dossier for a person directly from Supabase."""
    person = get_person(person_id)
    if not person:
        return None

    return {
        "person": person,
        "vehicles": get_person_vehicles(person_id),
        "cdr": get_person_cdr(person_id, limit=50),
        "transactions": get_person_transactions(person_id, limit=50),
        "firs": get_person_firs(person_id),
        "movements": get_person_movements(person_id, limit=50),
        "relationships": get_person_relationships(person_id),
        "alerts": get_person_alerts(person_id),
    }


def get_database_status() -> Dict[str, Any]:
    """Query live record counts from Supabase across all synthetic tables."""
    tables = [
        "persons",
        "vehicles",
        "locations",
        "cdr",
        "firs",
        "movements",
        "relationships",
        "transactions",
        "alerts",
    ]
    from backend.app.db.supabase import get_table_counts

    counts, errors = get_table_counts(tables)
    status_str = "connected" if not errors else ("partial" if counts else "error")

    payload: Dict[str, Any] = {
        "status": status_str,
        "tables": counts,
    }
    if errors:
        payload["errors"] = errors

    return payload


def get_alerts(limit: int = 50, offset: int = 0, severity: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve system threat and anomaly alerts with pagination."""
    client = get_supabase_client()
    query = client.table("alerts").select("*")
    if severity and severity.strip():
        query = query.ilike("severity", f"%{severity.strip()}%")
    res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
    return res.data or []


def get_cases(limit: int = 50, offset: int = 0, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieve FIRs and registered cases with pagination and optional search."""
    client = get_supabase_client()
    query = client.table("firs").select("*")
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.or_(f"fir_id.ilike.{term},text.ilike.{term},location_id.ilike.{term}")
    res = query.order("date", desc=True).range(offset, offset + limit - 1).execute()
    return res.data or []


def get_vehicles(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieve vehicles catalog."""
    client = get_supabase_client()
    res = client.table("vehicles").select("*").range(offset, offset + limit - 1).execute()
    return res.data or []


def get_locations(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieve locations catalog."""
    client = get_supabase_client()
    res = client.table("locations").select("*").range(offset, offset + limit - 1).execute()
    return res.data or []
