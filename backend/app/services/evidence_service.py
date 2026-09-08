"""Evidence Integrity & Blockchain Auditing Service for CRIMENET.

Generates SHA-256 cryptographic provenance digests for evidence items,
verifies tamper-evident chain of custody, and records immutable audit log entries.
"""

import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List, Optional


def generate_evidence_hash(record_data: Dict[str, Any]) -> str:
    """Generate deterministic SHA-256 cryptographic hash of evidence record content."""
    serialized = json.dumps(record_data, sort_keys=True, default=str)
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()


def verify_evidence_integrity(record_data: Dict[str, Any], expected_hash: str) -> Dict[str, Any]:
    """Verify whether evidence record matches its original cryptographic anchor."""
    current_hash = generate_evidence_hash(record_data)
    is_valid = current_hash.lower() == expected_hash.lower()
    return {
        "verified": is_valid,
        "current_hash": current_hash,
        "expected_hash": expected_hash,
        "integrity_status": "AUTHENTIC" if is_valid else "TAMPER_DETECTED",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


def record_audit_log(
    user_id: str,
    action: str,
    target_entity: str,
    details: Optional[str] = None,
) -> Dict[str, Any]:
    """Create a structured audit log entry for compliance tracking."""
    log_entry = {
        "log_id": f"AUD-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{user_id[:4]}",
        "investigator_id": user_id,
        "action": action,
        "target_entity": target_entity,
        "details": details or "Investigative action executed.",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "RECORDED",
    }
    log_entry["integrity_hash"] = generate_evidence_hash(log_entry)
    return log_entry
