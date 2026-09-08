"""NetworkX Graph Analytics Service for CRIMENET.

Performs mathematical graph analytics over Supabase network relationships:
1. Degree Centrality: Direct connection volume
2. Betweenness Centrality: Structural bridge / broker identification
3. Closeness Centrality: Information flow efficiency across the network
4. Connected Components: Separate syndicate partition detection
5. Global & Ego-subgraph extraction with node/edge typing and evidentiary provenance.
"""

from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx

from backend.app.db.supabase import get_supabase_client


def build_network_graph(limit_edges: int = 500) -> Tuple[nx.Graph, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """Construct a NetworkX Graph from Supabase relationship records."""
    client = get_supabase_client()
    G = nx.Graph()
    raw_edges: List[Dict[str, Any]] = []

    if client:
        try:
            res = client.table("relationships").select("*").limit(limit_edges).execute()
            raw_edges = res.data or []
        except Exception:
            pass

    nodes_map: Dict[str, Dict[str, Any]] = {}
    edges_list: List[Dict[str, Any]] = []

    for rel in raw_edges:
        src = str(rel.get("source_entity") or rel.get("source_id") or "").strip()
        tgt = str(rel.get("target_entity") or rel.get("target_id") or "").strip()
        rel_type = rel.get("relationship_type") or rel.get("type") or "ASSOCIATED_WITH"
        ev_id = rel.get("evidence_id") or rel.get("id") or "EV-REL"
        conf = float(rel.get("confidence") or 0.85)

        if not src or not tgt or src == tgt:
            continue

        G.add_edge(src, tgt, relationship=rel_type, evidence_id=ev_id, confidence=conf)

        edges_list.append({
            "id": f"{src}-{tgt}-{rel_type}",
            "source": src,
            "target": tgt,
            "relationship_type": rel_type,
            "evidence_id": ev_id,
            "confidence": conf,
        })

        # Register nodes if not present
        if src not in nodes_map:
            nodes_map[src] = {"id": src, "label": src, "type": _infer_node_type(src)}
        if tgt not in nodes_map:
            nodes_map[tgt] = {"id": tgt, "label": tgt, "type": _infer_node_type(tgt)}

    # Compute Centrality metrics via NetworkX
    degree_cent = nx.degree_centrality(G) if G.number_of_nodes() > 0 else {}
    betweenness_cent = nx.betweenness_centrality(G, k=min(50, G.number_of_nodes())) if G.number_of_nodes() > 0 else {}
    closeness_cent = nx.closeness_centrality(G) if G.number_of_nodes() > 0 else {}

    nodes_list: List[Dict[str, Any]] = []
    for nid, ndata in nodes_map.items():
        deg = degree_cent.get(nid, 0.0)
        bet = betweenness_cent.get(nid, 0.0)
        clo = closeness_cent.get(nid, 0.0)
        nodes_list.append({
            **ndata,
            "degree_centrality": round(deg, 4),
            "betweenness_centrality": round(bet, 4),
            "closeness_centrality": round(clo, 4),
            "degree": G.degree(nid) if nid in G else 0,
        })

    return G, nodes_list, edges_list


def _infer_node_type(identifier: str) -> str:
    """Infer entity archetype based on ID naming convention."""
    u = identifier.upper()
    if u.startswith("P") or u.startswith("PRS"):
        return "Person"
    elif u.startswith("V") or u.startswith("VEH"):
        return "Vehicle"
    elif u.startswith("L") or u.startswith("LOC"):
        return "Location"
    elif u.startswith("F") or u.startswith("FIR") or u.startswith("CAS"):
        return "FIR/Case"
    elif u.startswith("T") or u.startswith("TXN"):
        return "Transaction"
    elif u.startswith("C") or u.startswith("CDR"):
        return "Phone/CDR"
    return "Entity"


def get_global_graph(limit_edges: int = 300) -> Dict[str, Any]:
    """Retrieve global network graph topology with NetworkX analytics."""
    G, nodes, edges = build_network_graph(limit_edges=limit_edges)

    num_components = nx.number_connected_components(G) if G.number_of_nodes() > 0 else 0

    return {
        "summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "connected_components": num_components,
            "average_degree": round(sum(d["degree"] for d in nodes) / max(1, len(nodes)), 2),
        },
        "nodes": nodes,
        "edges": edges,
    }


def get_ego_graph(entity_id: str, radius: int = 1) -> Dict[str, Any]:
    """Extract ego-network subgraph centered on a specific entity."""
    G, nodes, edges = build_network_graph(limit_edges=1000)

    target_id = entity_id.strip()
    if target_id not in G:
        # Fallback: check if node is in graph under case-insensitive match
        for n in G.nodes():
            if n.lower() == target_id.lower():
                target_id = n
                break

    if target_id not in G:
        return {
            "center_entity": entity_id,
            "found": False,
            "nodes": [],
            "edges": [],
            "metrics": {},
        }

    sub_g = nx.ego_graph(G, target_id, radius=radius)
    sub_nodes = set(sub_g.nodes())

    filtered_nodes = [n for n in nodes if n["id"] in sub_nodes]
    filtered_edges = [e for e in edges if e["source"] in sub_nodes and e["target"] in sub_nodes]

    # Calculate local metrics
    deg = G.degree(target_id)
    deg_cent = nx.degree_centrality(G).get(target_id, 0.0)

    return {
        "center_entity": target_id,
        "found": True,
        "radius": radius,
        "metrics": {
            "degree": deg,
            "degree_centrality": round(deg_cent, 4),
            "neighborhood_size": len(sub_nodes) - 1,
        },
        "nodes": filtered_nodes,
        "edges": filtered_edges,
    }
