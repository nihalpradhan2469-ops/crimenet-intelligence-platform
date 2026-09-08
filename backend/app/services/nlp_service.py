"""Natural Language Processing & Named Entity Recognition Service.

Extracts structured relational triples and identified entities from raw police reports,
FIR narrative texts, and intelligence transcripts.
"""

import re
from typing import Any, Dict, List, Tuple


def extract_entities_and_relationships(text: str) -> Dict[str, Any]:
    """Parse unstructured police/FIR text into categorized entities and extracted relationships."""
    if not text:
        return {"entities": [], "relationships": [], "stats": {"entities_count": 0, "relationships_count": 0}}

    entities: List[Dict[str, Any]] = []
    seen_entities = set()

    # 1. Regex & rule-based NER extraction
    # Phone Numbers: Indian mobile patterns (+91, 10 digits starting with 6-9)
    phone_pattern = r"(?:\+91[\s-]?)?[6-9]\d{9}"
    for match in re.finditer(phone_pattern, text):
        val = match.group(0).strip()
        key = ("PHONE", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "PHONE", "value": val, "span": [match.start(), match.end()], "confidence": 0.95})

    # Vehicle Registration: Indian RTO format (e.g. MP09AB1234, DL01C4521)
    veh_pattern = r"\b[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}\b"
    for match in re.finditer(veh_pattern, text):
        val = match.group(0).strip()
        key = ("VEHICLE", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "VEHICLE", "value": val, "span": [match.start(), match.end()], "confidence": 0.92})

    # Transactions & Monetary sums (₹, Rs, INR, Lakh, Crore)
    money_pattern = r"(?:₹|Rs\.?|INR)\s*[\d,]+(?:\s*(?:lakh|crore|thousand))?|\b\d+\s*(?:lakh|crore)\s*(?:rupees|inr)?\b"
    for match in re.finditer(money_pattern, text, re.IGNORECASE):
        val = match.group(0).strip()
        key = ("TRANSACTION", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "TRANSACTION", "value": val, "span": [match.start(), match.end()], "confidence": 0.88})

    # Case / FIR Numbers (FIR-..., Case No...)
    case_pattern = r"\b(?:FIR[-\s]?\d{4,6}|Case\s+No\.?\s*\d+(?:/\d+)?)\b"
    for match in re.finditer(case_pattern, text, re.IGNORECASE):
        val = match.group(0).strip()
        key = ("CASE", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "CASE", "value": val, "span": [match.start(), match.end()], "confidence": 0.94})

    # Common Known Locations (Indian cities & transit hubs)
    known_locations = [
        "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Delhi", "Mumbai", "Pune",
        "Bangalore", "Nagpur", "Raipur", "Jaipur", "Lucknow", "Patna", "Kolkata", "Ahmedabad",
        "Kolar Road", "MP Nagar", "Vijay Nagar", "Railway Station", "Airport Road"
    ]
    for loc in known_locations:
        for match in re.finditer(r"\b" + re.escape(loc) + r"\b", text, re.IGNORECASE):
            val = match.group(0).strip()
            key = ("LOCATION", val.title())
            if key not in seen_entities:
                seen_entities.add(key)
                entities.append({"type": "LOCATION", "value": val.title(), "span": [match.start(), match.end()], "confidence": 0.90})

    # Known Persons / Names Pattern (Capitalized two-word names or suspect references)
    name_matches = re.finditer(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+))\b", text)
    for match in name_matches:
        val = match.group(1).strip()
        # Ignore false positives like "Case No", "First Information", common month names
        if val in ("First Information", "Crime Branch", "Police Station", "State Bank", "Union Bank") or any(val.startswith(m) for m in ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]):
            continue
        if any(val == loc for loc in known_locations):
            continue
        key = ("PERSON", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "PERSON", "value": val, "span": [match.start(), match.end()], "confidence": 0.82})

    # Organizations / Banks / Front Companies
    org_pattern = r"\b(?:Syndicate|Gang|Enterprises|Pvt Ltd|Bank|Logistics|Jewellers|Financiers)\b"
    for match in re.finditer(r"\b([A-Z][A-Za-z\s]+(?:" + org_pattern + r"))\b", text):
        val = match.group(1).strip()
        key = ("ORGANIZATION", val)
        if key not in seen_entities:
            seen_entities.add(key)
            entities.append({"type": "ORGANIZATION", "value": val, "span": [match.start(), match.end()], "confidence": 0.85})

    # 2. Extract Relationships
    relationships: List[Dict[str, Any]] = []
    person_entities = [e["value"] for e in entities if e["type"] == "PERSON"]
    loc_entities = [e["value"] for e in entities if e["type"] == "LOCATION"]
    veh_entities = [e["value"] for e in entities if e["type"] == "VEHICLE"]
    money_entities = [e["value"] for e in entities if e["type"] == "TRANSACTION"]

    # Person-to-Person interactions
    if len(person_entities) >= 2:
        for i in range(len(person_entities) - 1):
            src = person_entities[i]
            tgt = person_entities[i + 1]
            rel_type = "COMMUNICATED_WITH"
            if re.search(rf"{re.escape(src)}.*?(?:transferred|paid|sent money to).*?{re.escape(tgt)}", text, re.IGNORECASE):
                rel_type = "SENT_MONEY"
            elif re.search(rf"{re.escape(src)}.*?(?:met|conspired with|associated with).*?{re.escape(tgt)}", text, re.IGNORECASE):
                rel_type = "ASSOCIATED_WITH"
            elif re.search(rf"{re.escape(src)}.*?(?:called|phoned).*?{re.escape(tgt)}", text, re.IGNORECASE):
                rel_type = "CALLED"

            relationships.append({
                "source": src,
                "target": tgt,
                "type": rel_type,
                "confidence": 0.85,
                "context": f"Extracted from sentence mentioning both {src} and {tgt}."
            })

    # Person-to-Location interactions
    if person_entities and loc_entities:
        for p in person_entities:
            for l in loc_entities:
                if re.search(rf"{re.escape(p)}.*?(?:in|at|visited|spotted at).*?{re.escape(l)}", text, re.IGNORECASE):
                    relationships.append({
                        "source": p,
                        "target": l,
                        "type": "SPOTTED_AT",
                        "confidence": 0.80,
                        "context": f"{p} observed or reported at {l}."
                    })

    # Vehicle-to-Location interactions
    if veh_entities and loc_entities:
        for v in veh_entities:
            for l in loc_entities:
                relationships.append({
                    "source": v,
                    "target": l,
                    "type": "MOVED_TO",
                    "confidence": 0.88,
                    "context": f"Vehicle {v} logged at {l}."
                })

    return {
        "text_length": len(text),
        "entities": entities,
        "relationships": relationships,
        "stats": {
            "entities_count": len(entities),
            "relationships_count": len(relationships),
            "person_count": len(person_entities),
            "location_count": len(loc_entities),
            "vehicle_count": len(veh_entities),
        }
    }
