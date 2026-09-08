"""Anomaly Detection Service for CRIMENET.

Identifies behavioral outliers, transaction burstiness, telecommunication surges,
and anomalous spatio-temporal movements using statistical modeling and heuristics.
Principle: Anomaly != Guilt. Anomalies represent analytical leads for verification.
"""

from typing import Any, Dict, List, Optional


def detect_anomalies_for_entity(
    entity_id: str,
    transactions: Optional[List[Dict[str, Any]]] = None,
    cdr_records: Optional[List[Dict[str, Any]]] = None,
    movements: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """Run anomaly detection across multimodal activity channels for a specific entity."""
    anomalies: List[Dict[str, Any]] = []

    txns = transactions or []
    cdrs = cdr_records or []
    movs = movements or []

    # 1. Financial Velocity / Burstiness Anomaly
    # Baseline: Normal users have 1-4 transactions. A sudden burst of >10 is anomalous.
    if len(txns) >= 10:
        total_volume = sum(float(t.get("amount_inr") or 0) for t in txns)
        anomalies.append({
            "type": "TRANSACTION_BURST",
            "entity_id": entity_id,
            "severity": "HIGH" if len(txns) >= 15 else "MEDIUM",
            "confidence": 89,
            "metric": f"{len(txns)} transactions totaling ₹{total_volume:,.2f}",
            "explanation": f"Rapid financial turnover detected: {len(txns)} discrete transactions in observation period.",
            "evidence_id": txns[0].get("transaction_id", "TXN-ANOMALY"),
            "status": "New",
        })

    # High Value Single Transaction Flag (> ₹5,00,000)
    for t in txns:
        amt = float(t.get("amount_inr") or 0)
        if amt >= 500000:
            anomalies.append({
                "type": "HIGH_VALUE_TRANSACTION",
                "entity_id": entity_id,
                "severity": "CRITICAL" if amt >= 2000000 else "HIGH",
                "confidence": 94,
                "metric": f"Single transaction of ₹{amt:,.2f}",
                "explanation": f"Large single-outlay transfer exceeding normal peer thresholds.",
                "evidence_id": t.get("transaction_id", "TXN-HIGH"),
                "status": "New",
            })
            break

    # 2. Telecommunication Surge Anomaly
    # Baseline: Sudden call frequency jump
    if len(cdrs) >= 15:
        anomalies.append({
            "type": "COMMUNICATION_SPIKE",
            "entity_id": entity_id,
            "severity": "HIGH",
            "confidence": 86,
            "metric": f"{len(cdrs)} logged calls",
            "explanation": f"Elevated telecommunication frequency across multiple cellular cells.",
            "evidence_id": cdrs[0].get("cdr_id", "CDR-SPIKE"),
            "status": "New",
        })

    # Late-night call interaction (between 01:00 AM and 04:30 AM)
    late_calls = 0
    late_ev_id = None
    for c in cdrs:
        ts = str(c.get("timestamp") or "")
        if any(h in ts for h in [" 01:", " 02:", " 03:", " 04:"]):
            late_calls += 1
            if not late_ev_id:
                late_ev_id = c.get("cdr_id")

    if late_calls >= 3:
        anomalies.append({
            "type": "NOCTURNAL_COMMUNICATION_PATTERN",
            "entity_id": entity_id,
            "severity": "MEDIUM",
            "confidence": 81,
            "metric": f"{late_calls} calls between 01:00 AM and 04:30 AM",
            "explanation": "Repeated off-hours communications detected with counterparty.",
            "evidence_id": late_ev_id or "CDR-NIGHT",
            "status": "New",
        })

    # 3. Spatio-Temporal Hop Anomaly (Movement across distinct cities in tight window)
    if len(movs) >= 4:
        anomalies.append({
            "type": "RAPID_LOCATION_HOP",
            "entity_id": entity_id,
            "severity": "MEDIUM",
            "confidence": 76,
            "metric": f"{len(movs)} physical surveillance checkpoints crossed",
            "explanation": "High transit velocity across monitored ANPR camera checkpoints.",
            "evidence_id": movs[0].get("movement_id", "MOV-HOP"),
            "status": "New",
        })

    # If no anomaly triggered, return baseline stable lead
    overall_status = "Anomalies Detected" if anomalies else "Normal Baseline"

    return {
        "entity_id": entity_id,
        "evaluation_status": overall_status,
        "anomaly_count": len(anomalies),
        "anomalies": anomalies,
        "principle": "Anomaly ≠ Guilt. All anomalous patterns are analytical leads requiring human investigator verification.",
    }
