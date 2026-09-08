"""Entity Resolution Service for CRIMENET.

Performs fuzzy entity matching, cross-record identity resolution,
and candidate merging with a strict human-in-the-loop verification protocol.
"""

import difflib
from typing import Any, Dict, List, Optional


def resolve_entity_match(query_name: str, candidate_pool: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """Calculate identity similarity between a candidate name and a pool of database entities.
    
    Returns match candidates, similarity scores, and strict 'Requires Verification' status.
    """
    if not query_name or not query_name.strip():
        return {"query": query_name, "matches": [], "best_match": None}

    cleaned_query = query_name.strip().lower()

    # Default synthetic pool if none supplied
    if not candidate_pool:
        candidate_pool = [
            {"id": "P0152", "name": "Sameer Sethi", "alias": "Sam", "city": "Indore", "threat": "HIGH"},
            {"id": "P0136", "name": "Ravi Mehta", "alias": "Chhotu", "city": "Jabalpur", "threat": "MEDIUM"},
            {"id": "P0383", "name": "Aditya Joshi", "alias": "Adi", "city": "Bhopal", "threat": "HIGH"},
            {"id": "P0042", "name": "Rahul Sharma", "alias": "Pandit", "city": "Bhopal", "threat": "LOW"},
            {"id": "P0088", "name": "Vikram Singh", "alias": "Vicky", "city": "Gwalior", "threat": "HIGH"},
            {"id": "P0219", "name": "Mohammad Rizwan", "alias": "Rizzy", "city": "Ujjain", "threat": "MEDIUM"},
        ]

    matches: List[Dict[str, Any]] = []

    for candidate in candidate_pool:
        c_name = (candidate.get("name") or "").strip().lower()
        c_alias = (candidate.get("alias") or "").strip().lower()

        # Compute SequenceMatcher similarity
        name_sim = difflib.SequenceMatcher(None, cleaned_query, c_name).ratio()
        alias_sim = difflib.SequenceMatcher(None, cleaned_query, c_alias).ratio() if c_alias else 0.0

        # Token overlap check (e.g. "Rahul S." vs "Rahul Sharma")
        q_tokens = set(cleaned_query.split())
        c_tokens = set(c_name.split())
        token_overlap = len(q_tokens.intersection(c_tokens)) / max(1, len(q_tokens.union(c_tokens)))

        # Composite score
        best_score = max(name_sim, alias_sim, token_overlap)

        if best_score >= 0.40:
            matches.append({
                "candidate_id": candidate.get("id") or candidate.get("person_id"),
                "candidate_name": candidate.get("name"),
                "candidate_alias": candidate.get("alias"),
                "similarity_score": round(best_score, 3),
                "confidence_percentage": round(best_score * 100, 1),
                "status": "Requires Verification",
                "disclaimer": "Identity similarity score is an analytical lead and does not constitute proof of identity.",
            })

    # Sort matches by similarity score descending
    matches.sort(key=lambda x: x["similarity_score"], reverse=True)

    best_match = matches[0] if matches else None

    return {
        "query": query_name,
        "total_candidates_analyzed": len(candidate_pool),
        "matches_found": len(matches),
        "best_match": best_match,
        "matches": matches,
        "human_in_the_loop": True,
    }
