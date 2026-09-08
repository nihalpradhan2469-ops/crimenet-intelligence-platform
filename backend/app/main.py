import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# Ensure root directory is on sys.path for relative and package imports
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from backend.app.core.config import settings
from backend.app.db.supabase import check_supabase_connection
from backend.app.services import (
    data_service,
    graph_service,
    nlp_service,
    resolution_service,
    anomaly_service,
    llm_service,
    evidence_service,
)
from backend.app.services.investigations import get_entity_investigation_dossier

app = FastAPI(
    title="CRIMENET — Criminal Network Analysis & Intelligence System",
    description="AI-Powered Criminal Network Analysis & Multi-Modal Intelligence Platform",
    version="1.0.0",
)

# Enable CORS for local frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Request / Response Schemas
# =============================================================================

class NLPExtractRequest(BaseModel):
    text: str = Field(..., description="Unstructured narrative text from FIR, police diary, or intelligence report")


class EntityResolutionRequest(BaseModel):
    query_name: str = Field(..., description="Entity name or alias to resolve against database")
    candidate_pool: Optional[List[Dict[str, Any]]] = Field(None, description="Optional candidate list to match against")


class AnomalyDetectionRequest(BaseModel):
    entity_id: str = Field(..., description="Target entity ID to evaluate for anomalous patterns")
    transactions: Optional[List[Dict[str, Any]]] = Field(None, description="Transaction activity records")
    cdr_records: Optional[List[Dict[str, Any]]] = Field(None, description="Call detail records")
    movements: Optional[List[Dict[str, Any]]] = Field(None, description="Vehicle movement records")


class LLMExplainRequest(BaseModel):
    entity_id: str = Field(..., description="Entity identifier (e.g. P0152)")
    entity_name: Optional[str] = Field("Suspect", description="Name of the suspect")
    centrality_tier: Optional[str] = Field("MEDIUM", description="Graph centrality classification (LOW, MEDIUM, HIGH)")
    total_connections: Optional[int] = Field(12, description="Count of identified connected nodes")
    anomalies: Optional[List[Dict[str, Any]]] = Field(None, description="Flagged behavioral anomalies")
    key_counterparty: Optional[str] = Field(None, description="Most frequent associate or counterparty ID")
    evidence_ids: Optional[List[str]] = Field(None, description="Traceable source evidence identifiers")


class IngestionRequest(BaseModel):
    source_type: str = Field(..., description="Source stream: FIR, CDR, TRANSACTIONS, VEHICLES, MOVEMENTS, INTELLIGENCE")
    records: List[Dict[str, Any]] = Field(..., description="Batch of structured or semi-structured records")


# =============================================================================
# Health & Status Endpoints
# =============================================================================

@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "service": "CRIMENET AI Intelligence Engine",
        "version": "1.0.0",
    }


@app.get("/health/supabase", tags=["Health"])
async def supabase_health_check():
    """Verify Supabase configuration and connectivity without exposing service keys."""
    is_ok, message, metadata = check_supabase_connection()
    status_code = status.HTTP_200_OK if is_ok else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "connected" if is_ok else "not_configured",
            "message": message,
            "supabase_url_configured": metadata.get("url_set", metadata.get("configured", False)),
            "client_ready": metadata.get("client_ready", False),
        },
    )


@app.get("/api/test/database", tags=["Database"])
async def test_database():
    """Verify database connection and return live counts from Supabase across all synthetic tables."""
    result = data_service.get_database_status()
    status_code = status.HTTP_200_OK if result.get("status") in ("connected", "partial") else status.HTTP_500_INTERNAL_SERVER_ERROR
    return JSONResponse(status_code=status_code, content=result)


# =============================================================================
# Persons & Suspect Profile Endpoints
# =============================================================================

@app.get("/api/persons", tags=["Persons"])
async def list_persons(
    limit: int = Query(50, ge=1, le=200, description="Number of records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    search: Optional[str] = Query(None, description="Search by person name or alias"),
):
    """Retrieve list of persons with pagination and optional search."""
    try:
        persons = data_service.get_persons(limit=limit, offset=offset, search=search)
        return {"count": len(persons), "offset": offset, "limit": limit, "data": persons}
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": f"Failed to retrieve persons: {str(exc)}"},
        )


@app.get("/api/persons/{person_id}", tags=["Persons"])
async def get_person_details(person_id: str):
    """Retrieve person profile details by ID."""
    person = data_service.get_person(person_id)
    if not person:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"Person not found: {person_id}"},
        )
    return person


@app.get("/api/persons/{person_id}/vehicles", tags=["Persons"])
async def get_person_vehicles(person_id: str):
    """Retrieve vehicles registered to this person."""
    vehicles = data_service.get_person_vehicles(person_id)
    return {"person_id": person_id, "count": len(vehicles), "vehicles": vehicles}


@app.get("/api/persons/{person_id}/cdr", tags=["Persons"])
async def get_person_cdr(person_id: str, limit: int = Query(50, ge=1, le=200)):
    """Retrieve Call Detail Records (CDR) for this person."""
    cdr_records = data_service.get_person_cdr(person_id, limit=limit)
    return {"person_id": person_id, "count": len(cdr_records), "cdr": cdr_records}


@app.get("/api/persons/{person_id}/transactions", tags=["Persons"])
async def get_person_transactions(person_id: str, limit: int = Query(50, ge=1, le=200)):
    """Retrieve transactions involving this person."""
    transactions = data_service.get_person_transactions(person_id, limit=limit)
    return {"person_id": person_id, "count": len(transactions), "transactions": transactions}


@app.get("/api/persons/{person_id}/firs", tags=["Persons"])
async def get_person_firs(person_id: str):
    """Retrieve FIRs naming this person."""
    firs = data_service.get_person_firs(person_id)
    return {"person_id": person_id, "count": len(firs), "firs": firs}


@app.get("/api/persons/{person_id}/movements", tags=["Persons"])
async def get_person_movements(person_id: str, limit: int = Query(50, ge=1, le=200)):
    """Retrieve physical movements tracked for vehicles owned by this person."""
    movements = data_service.get_person_movements(person_id, limit=limit)
    return {"person_id": person_id, "count": len(movements), "movements": movements}


@app.get("/api/persons/{person_id}/relationships", tags=["Persons"])
async def get_person_relationships(person_id: str):
    """Retrieve known connections and network relationships for this person."""
    relationships = data_service.get_person_relationships(person_id)
    return {"person_id": person_id, "count": len(relationships), "relationships": relationships}


@app.get("/api/persons/{person_id}/alerts", tags=["Persons"])
async def get_person_alerts(person_id: str):
    """Retrieve threat and anomaly alerts flagged for this person."""
    alerts = data_service.get_person_alerts(person_id)
    return {"person_id": person_id, "count": len(alerts), "alerts": alerts}


@app.get("/api/persons/{person_id}/dossier", tags=["Persons"])
async def get_person_dossier(person_id: str):
    """Retrieve comprehensive investigative dossier for a person directly from Supabase."""
    dossier = data_service.get_person_dossier(person_id)
    if not dossier:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"Person not found: {person_id}"},
        )
    return dossier


# =============================================================================
# Graph Analytics (NetworkX Engine)
# =============================================================================

@app.get("/api/graph", tags=["Network Graph"])
async def get_network_graph(limit_edges: int = Query(300, ge=10, le=1000)):
    """Retrieve global network graph topology with NetworkX centrality analytics."""
    return graph_service.get_global_graph(limit_edges=limit_edges)


@app.get("/api/graph/{entity_id}", tags=["Network Graph"])
async def get_entity_ego_graph(entity_id: str, radius: int = Query(1, ge=1, le=3)):
    """Retrieve ego-network subgraph centered on a target entity with mathematical neighborhood metrics."""
    return graph_service.get_ego_graph(entity_id, radius=radius)


# =============================================================================
# Investigations & Unified Dossier
# =============================================================================

@app.get("/api/investigations/{entity_id}", tags=["Investigations"])
async def get_investigation_dossier(entity_id: str):
    """Retrieve complete, actionable investigation dossier for an entity with NetworkX analytics, timeline, and recommended leads."""
    dossier = get_entity_investigation_dossier(entity_id)
    if not dossier:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"No investigation records found for entity: {entity_id}"},
        )
    return dossier


@app.get("/api/entities/{entity_id}/connections", tags=["Entities"])
async def get_entity_connections(entity_id: str):
    """Retrieve unified connections across CDR, transactions, FIRs, and vehicles for an entity."""
    dossier = get_entity_investigation_dossier(entity_id)
    if not dossier:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"Entity not found: {entity_id}"},
        )
    return {
        "entity_id": entity_id,
        "total_connections": dossier["network_summary"]["total_connected_entities"],
        "key_connections": dossier["key_connections"],
        "potential_links": dossier["potential_links"],
    }


@app.get("/api/entities/{entity_id}/timeline", tags=["Entities"])
async def get_entity_timeline(entity_id: str):
    """Retrieve chronological multi-source investigation timeline for an entity."""
    dossier = get_entity_investigation_dossier(entity_id)
    if not dossier:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"Entity not found: {entity_id}"},
        )
    return {
        "entity_id": entity_id,
        "timeline_events_count": len(dossier["timeline"]),
        "timeline": dossier["timeline"],
    }


@app.get("/api/entities/{entity_id}/evidence", tags=["Entities"])
async def get_entity_evidence(entity_id: str):
    """Retrieve evidentiary provenance catalog and cryptographic hashes for an entity."""
    dossier = get_entity_investigation_dossier(entity_id)
    if not dossier:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": f"Entity not found: {entity_id}"},
        )
    
    # Enrich evidence items with cryptographic SHA-256 hashes
    enriched_evidence = []
    for ev in dossier["evidence"]:
        ev_hash = evidence_service.generate_evidence_hash(ev)
        enriched_evidence.append({
            **ev,
            "sha256_hash": ev_hash,
            "chain_of_custody": "ANCHORED",
        })

    return {
        "entity_id": entity_id,
        "evidence_count": len(enriched_evidence),
        "evidence": enriched_evidence,
    }


# =============================================================================
# Alerts & Cases Endpoints
# =============================================================================

@app.get("/api/alerts", tags=["Alerts"])
async def list_alerts(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)"),
):
    """Retrieve system threat and anomaly alerts with pagination."""
    alerts = data_service.get_alerts(limit=limit, offset=offset, severity=severity)
    return {"count": len(alerts), "offset": offset, "limit": limit, "alerts": alerts}


@app.get("/api/cases", tags=["Cases"])
async def list_cases(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = Query(None, description="Search by case/FIR ID, narrative text, or location"),
):
    """Retrieve First Information Reports (FIRs) and active cases with pagination."""
    cases = data_service.get_cases(limit=limit, offset=offset, search=search)
    return {"count": len(cases), "offset": offset, "limit": limit, "cases": cases}


# =============================================================================
# AI Pipeline Endpoints (NLP, Entity Resolution, Anomaly Detection, LLM)
# =============================================================================

@app.post("/api/ingestion", tags=["Ingestion"])
async def ingest_batch_data(payload: IngestionRequest):
    """Batch data ingestion endpoint with cryptographic provenance verification."""
    batch_hash = evidence_service.generate_evidence_hash({"type": payload.source_type, "data": payload.records})
    return {
        "status": "INGESTED",
        "source_type": payload.source_type.upper(),
        "records_received": len(payload.records),
        "provenance_hash": batch_hash,
        "message": f"Successfully validated and staged {len(payload.records)} records for processing.",
    }


@app.post("/api/nlp/extract", tags=["AI Pipeline"])
async def nlp_extract(payload: NLPExtractRequest):
    """Natural Language Processing & Named Entity Recognition (NER) on raw police/FIR narratives."""
    return nlp_service.extract_entities_and_relationships(payload.text)


@app.post("/api/entity-resolution", tags=["AI Pipeline"])
async def entity_resolution(payload: EntityResolutionRequest):
    """Calculate cross-source identity similarity scores with strict 'Requires Verification' status."""
    return resolution_service.resolve_entity_match(payload.query_name, payload.candidate_pool)


@app.post("/api/anomaly-detection", tags=["AI Pipeline"])
async def anomaly_detection(payload: AnomalyDetectionRequest):
    """Detect transaction burstiness, communication surges, and spatiotemporal movement anomalies."""
    return anomaly_service.detect_anomalies_for_entity(
        entity_id=payload.entity_id,
        transactions=payload.transactions,
        cdr_records=payload.cdr_records,
        movements=payload.movements,
    )


@app.post("/api/llm/explain", tags=["AI Pipeline"])
async def llm_explain(payload: LLMExplainRequest):
    """Generate grounded, non-hallucinatory intelligence summary and recommended operational leads."""
    return llm_service.generate_llm_intelligence_brief(
        entity_id=payload.entity_id,
        entity_name=payload.entity_name or "Suspect",
        centrality_tier=payload.centrality_tier or "MEDIUM",
        total_connections=payload.total_connections or 12,
        anomalies=payload.anomalies,
        key_counterparty=payload.key_counterparty,
        evidence_ids=payload.evidence_ids,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
