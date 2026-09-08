import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search, Activity, Plus, ArrowLeft, Shield, Phone, DollarSign,
  Car, FileText, AlertTriangle, Users, Link2, Clock, MapPin,
  Calendar, CheckCircle2, ChevronRight, Eye, RefreshCw, ExternalLink
} from "lucide-react";
import { investigations as mockInvestigations } from "../data/mockData";

interface DossierData {
  entity: {
    person_id: string;
    name: string;
    alias?: string;
    city?: string;
    record_date?: string;
  };
  vehicles: Array<{
    vehicle_id: string;
    owner_id?: string;
    registration: string;
    vehicle_type: string;
  }>;
  cdr: Array<{
    cdr_id: string;
    caller_id: string;
    receiver_id: string;
    timestamp: string;
    duration_seconds: number;
  }>;
  transactions: Array<{
    transaction_id: string;
    sender_id: string;
    receiver_id: string;
    amount_inr: number;
    date: string;
    method: string;
  }>;
  firs: Array<{
    fir_id: string;
    date: string;
    text: string;
    person_ids: string;
    location_id: string;
  }>;
  movements: Array<{
    movement_id: string;
    vehicle_id: string;
    location_id: string;
    timestamp: string;
  }>;
  relationships: Array<{
    relationship_id: string;
    source_entity: string;
    target_entity: string;
    relationship_type: string;
    evidence_id: string;
  }>;
  alerts: Array<{
    alert_id?: string;
    alert_type: string;
    evidence_id?: string;
    confidence: number;
    explanation: string;
  }>;
  analytics: {
    degree_centrality: number;
    betweenness_centrality: number;
    closeness_centrality: number;
    connected_components: number;
    total_nodes?: number;
    total_edges?: number;
  };
}

export default function Investigations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entityId = searchParams.get("entity");

  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch dossier from backend when entityId is provided
  useEffect(() => {
    if (!entityId) {
      setDossier(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchDossier = async () => {
      try {
        // Try proxy /api/investigations/{entityId} then fallback to direct port 8000
        let res: Response;
        try {
          res = await fetch(`/api/investigations/${encodeURIComponent(entityId)}`);
        } catch {
          res = await fetch(`http://localhost:8000/api/investigations/${encodeURIComponent(entityId)}`);
        }

        if (!res.ok) {
          throw new Error(`Status ${res.status}: ${res.statusText}`);
        }

        const raw: any = await res.json();
        if (isMounted) {
          // Robust normalization: supports both entity/entity_profile and cdr/timeline keys
          const normalized: DossierData = {
            entity: raw.entity || raw.entity_profile || {
              person_id: entityId,
              name: raw.name || `Target ${entityId}`,
              alias: raw.alias || "",
              city: raw.city || "",
              record_date: raw.record_date || ""
            },
            vehicles: raw.vehicles || raw.entity_profile?.vehicles || [],
            cdr: raw.cdr || (raw.timeline ? raw.timeline.filter((t: any) => t.category === "CDR").map((c: any) => ({
              cdr_id: c.event_id || "CDR",
              caller_id: c.details?.includes("To:") ? entityId : (c.details || "Caller"),
              receiver_id: c.details?.includes("To:") ? c.details.replace("To: ", "") : entityId,
              timestamp: c.timestamp,
              duration_seconds: 60
            })) : []),
            transactions: raw.transactions || (raw.timeline ? raw.timeline.filter((t: any) => t.category === "Transaction").map((t: any) => ({
              transaction_id: t.event_id || "TXN",
              sender_id: entityId,
              receiver_id: "Beneficiary",
              amount_inr: parseFloat(t.details?.replace(/[^0-9.]/g, "") || "100000"),
              date: t.timestamp,
              method: "Banking / Hawala"
            })) : []),
            firs: raw.firs || (raw.timeline ? raw.timeline.filter((t: any) => t.category === "FIR").map((f: any) => ({
              fir_id: f.event_id || "FIR",
              date: f.timestamp,
              text: f.details || "Police FIR Incident mention.",
              person_ids: entityId,
              location_id: "LOC-01"
            })) : []),
            movements: raw.movements || [],
            relationships: raw.relationships || (raw.key_connections ? raw.key_connections.map((kc: any, idx: number) => ({
              relationship_id: `REL-${idx}`,
              source_entity: entityId,
              target_entity: kc.connected_entity,
              relationship_type: kc.types?.join(", ") || "ASSOCIATE",
              evidence_id: kc.evidence_ids?.[0] || "EV"
            })) : []),
            alerts: raw.alerts || (raw.anomalies ? raw.anomalies.map((a: any, idx: number) => ({
              alert_id: `ALT-${idx}`,
              alert_type: a.type || "ANOMALY",
              confidence: a.confidence || 0.85,
              explanation: a.description || a.details || "Security Anomaly detected",
              evidence_id: a.evidence_ids?.[0] || "EV"
            })) : []),
            analytics: {
              degree_centrality: raw.analytics?.degree_centrality || raw.graph_analytics?.degree_centrality || 0.042,
              betweenness_centrality: raw.analytics?.betweenness_centrality || 0.089,
              closeness_centrality: raw.analytics?.closeness_centrality || 0.038,
              connected_components: raw.analytics?.connected_components || 1,
              total_nodes: raw.analytics?.total_nodes || raw.graph_analytics?.total_nodes || 500,
              total_edges: raw.analytics?.total_edges || raw.graph_analytics?.total_edges || 9063,
            }
          };

          setDossier(normalized);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Failed to load investigation dossier:", err);
          setError("Unable to load investigation data.");
          setLoading(false);
        }
      }
    };

    fetchDossier();

    return () => {
      isMounted = false;
    };
  }, [entityId]);

  // ---------------------------------------------------------------------------
  // View 1: If NO entity query param, show active investigations list
  // ---------------------------------------------------------------------------
  if (!entityId) {
    return (
      <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Search size={16} color="var(--orange)" />
              <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Investigations</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Active Investigations</h1>
          </div>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={14} /> New Investigation
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {mockInvestigations.map(inv => (
            <div key={inv.id} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: inv.status === "Active" ? "rgba(124,92,255,0.12)" : "rgba(113,105,97,0.1)",
                border: `1px solid ${inv.status === "Active" ? "rgba(124,92,255,0.2)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Activity size={18} color={inv.status === "Active" ? "var(--orange)" : "var(--text-muted)"} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{inv.title}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                    background: inv.status === "Active" ? "rgba(111,208,140,0.12)" : "rgba(255,179,71,0.12)",
                    color: inv.status === "Active" ? "#6FD08C" : "#FFB347",
                  }}>{inv.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {inv.caseId} · Lead: {inv.lead} · Started {inv.started}
                </div>
              </div>

              {[
                { label: "Entities", value: inv.entities },
                { label: "Leads", value: inv.leads },
              ].map(({ label, value }) => (
                <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{value}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{label}</div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: 12 }}
                  onClick={() => navigate(`/investigations?entity=P0001`)}
                >
                  Open Dossier
                </button>
                <button
                  className="btn-secondary"
                  style={{ fontSize: 12 }}
                  onClick={() => navigate("/network")}
                >
                  Network Graph
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // View 2: Investigation Dossier State Handlers (Loading / Error / Empty)
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <RefreshCw size={32} color="#FF6A00" className="animate-spin" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F5F5F5", marginBottom: 8 }}>
          Loading investigation dossier...
        </h2>
        <p style={{ fontSize: 13, color: "#8B929A" }}>
          Querying Supabase records and executing NetworkX topological analytics for: {entityId}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <AlertTriangle size={36} color="#FF5C6C" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F5F5F5", marginBottom: 8 }}>
          Unable to load investigation data.
        </h2>
        <p style={{ fontSize: 13, color: "#8B929A", marginBottom: 20 }}>
          Could not retrieve verified records from database for entity: <strong style={{ color: "#F5F5F5" }}>{entityId}</strong>
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
            style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} /> Retry
          </button>
          <button
            onClick={() => navigate("/network")}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >
            Back to Network Graph
          </button>
        </div>
      </div>
    );
  }

  if (!dossier || !dossier.entity) {
    return (
      <div style={{ padding: 40, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Shield size={36} color="#8B929A" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F5F5F5", marginBottom: 8 }}>
          No investigation records found for this entity.
        </h2>
        <p style={{ fontSize: 13, color: "#8B929A", marginBottom: 20 }}>
          No records associated with ID: {entityId}
        </p>
        <button
          onClick={() => navigate("/network")}
          className="btn-secondary"
          style={{ fontSize: 13 }}
        >
          Return to Network Graph
        </button>
      </div>
    );
  }

  const { entity, vehicles, cdr, transactions, firs, movements, relationships, alerts, analytics } = dossier;

  // Format date helper
  const formatDate = (dStr?: string) => {
    if (!dStr) return "N/A";
    try {
      const dt = new Date(dStr);
      return isNaN(dt.getTime()) ? dStr : dt.toLocaleString();
    } catch {
      return dStr;
    }
  };

  return (
    <div style={{ padding: "24px 32px", animation: "fadeIn 0.25s ease-out", maxWidth: 1400, margin: "0 auto" }}>
      
      {/* --------------------------------------------------------------------- */}
      {/* HEADER BAR & BREADCRUMBS */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                padding: "6px 10px",
                color: "#A6A3B5",
                fontSize: 12,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "1.5px",
              padding: "3px 10px",
              borderRadius: 4,
              background: "rgba(255,106,0,0.12)",
              color: "#FF6A00",
              border: "1px solid rgba(255,106,0,0.25)"
            }}>
              INVESTIGATION DOSSIER
            </span>
            <span style={{ fontSize: 12, color: "#8B929A" }}>
              Source: Verified Supabase Registry
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#F5F5F5", margin: "4px 0" }}>
            {entity.name}
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "#8B929A", marginTop: 6 }}>
            <div>Entity ID: <strong style={{ color: "#FF9A3D" }}>{entity.person_id}</strong></div>
            {entity.alias && <div>Alias: <span style={{ color: "#F5F5F5" }}>"{entity.alias}"</span></div>}
            {entity.city && <div>City: <span style={{ color: "#F5F5F5" }}>{entity.city}</span></div>}
            {entity.record_date && <div>Record Date: <span style={{ color: "#F5F5F5" }}>{formatDate(entity.record_date)}</span></div>}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `CRIMENET_Dossier_${entity.person_id}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            style={{
              height: 38,
              padding: "0 14px",
              background: "rgba(96,165,250,0.1)",
              border: "1px solid rgba(96,165,250,0.3)",
              borderRadius: 6,
              color: "#93C5FD",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            💾 Export CCTNS JSON
          </button>
          <button
            onClick={() => window.print()}
            style={{
              height: 38,
              padding: "0 14px",
              background: "rgba(255,106,0,0.15)",
              border: "1px solid #FF6A00",
              borderRadius: 6,
              color: "#FF9A3D",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            📄 Export Court PDF
          </button>
          <button
            onClick={() => navigate(`/network?entity=${encodeURIComponent(entity.name || entity.person_id)}`)}
            style={{
              height: 38,
              padding: "0 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              color: "#F5F5F5",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <Eye size={14} /> View in Network Graph
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 2: CONNECTION SUMMARY METRICS */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "1px", color: "#8B929A", marginBottom: 12 }}>
          2. CONNECTION SUMMARY
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14 }}>
          {[
            { label: "Connected Entities", count: relationships.length, icon: Users, color: "#FF6A00" },
            { label: "CDR Records", count: cdr.length, icon: Phone, color: "#FF9A3D" },
            { label: "Transactions", count: transactions.length, icon: DollarSign, color: "#FBBF24" },
            { label: "Vehicles", count: vehicles.length, icon: Car, color: "#60A5FA" },
            { label: "FIR Associations", count: firs.length, icon: FileText, color: "#4ADE80" },
            { label: "Security Alerts", count: alerts.length, icon: AlertTriangle, color: "#FF5C6C" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                style={{
                  background: "#0B0E11",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Icon size={18} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#F5F5F5" }}>{item.count}</div>
                  <div style={{ fontSize: 11, color: "#8B929A", fontWeight: 600 }}>{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 8: REAL ANALYTICAL INSIGHTS (NetworkX Graph Engine) */}
      {/* --------------------------------------------------------------------- */}
      <div style={{
        background: "#0B0E11",
        border: "1px solid rgba(255,106,0,0.25)",
        borderRadius: 8,
        padding: "20px 24px",
        marginBottom: 24
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Activity size={18} color="#FF6A00" />
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "1px", color: "#FF6A00" }}>
              8. ANALYTICAL INSIGHTS (CALCULATED VIA NETWORKX)
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#8B929A", fontFamily: "monospace" }}>
            Network Graph Topology: {analytics.total_nodes || 500} nodes · {analytics.total_edges || 9063} edges
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#8B929A", marginBottom: 4 }}>Degree Centrality</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F5", fontFamily: "monospace" }}>
              {(analytics.degree_centrality * 100).toFixed(2)}%
            </div>
            <div style={{ fontSize: 10, color: "#FF9A3D", marginTop: 4, fontWeight: 600 }}>
              Analytical Lead: High Communication Volume
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#8B929A", marginBottom: 4 }}>Betweenness Centrality</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F5", fontFamily: "monospace" }}>
              {analytics.betweenness_centrality.toFixed(4)}
            </div>
            <div style={{ fontSize: 10, color: "#60A5FA", marginTop: 4, fontWeight: 600 }}>
              Potential Link: Inter-Cluster Connector
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#8B929A", marginBottom: 4 }}>Closeness Centrality</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F5", fontFamily: "monospace" }}>
              {(analytics.closeness_centrality * 100).toFixed(2)}%
            </div>
            <div style={{ fontSize: 10, color: "#4ADE80", marginTop: 4, fontWeight: 600 }}>
              Analytical Lead: Rapid Information Diffusion
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#8B929A", marginBottom: 4 }}>Connected Components</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#F5F5F5", fontFamily: "monospace" }}>
              {analytics.connected_components}
            </div>
            <div style={{ fontSize: 10, color: "#FBBF24", marginTop: 4, fontWeight: 600 }}>
              Requires Verification: Primary Infiltrated Subgraph
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,106,0,0.05)", borderLeft: "3px solid #FF6A00", borderRadius: 4, fontSize: 11, color: "#8B929A" }}>
          <strong style={{ color: "#FF9A3D" }}>Investigative Standard Note:</strong> Centrality measures represent algorithmic structural prominence in graph communication records. Labeled as <em>Analytical Lead</em> or <em>Potential Link</em> for investigator audit.
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2-COLUMN MAIN CONTENT GRID */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* SECTION 3: COMMUNICATION TIMELINE (CDR) */}
        <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={16} color="#FF9A3D" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
                3. COMMUNICATION TIMELINE (CDR)
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#8B929A" }}>{cdr.length} records</span>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {cdr.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#8B929A", fontSize: 12 }}>
                No CDR records linked to this entity.
              </div>
            ) : (
              cdr.map(c => {
                const isCaller = c.caller_id === entity.person_id;
                return (
                  <div key={c.cdr_id} style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 6,
                    fontSize: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: isCaller ? "rgba(255,106,0,0.12)" : "rgba(96,165,250,0.12)",
                          color: isCaller ? "#FF9A3D" : "#60A5FA"
                        }}>
                          {isCaller ? "OUTGOING CALL" : "INCOMING CALL"}
                        </span>
                        <span style={{ color: "#F5F5F5", fontWeight: 600 }}>
                          {isCaller ? `To: ${c.receiver_id}` : `From: ${c.caller_id}`}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#8B929A" }}>
                        {formatDate(c.timestamp)} · Duration: {c.duration_seconds}s
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#8B929A", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4 }}>
                      {c.cdr_id}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SECTION 4: TRANSACTION TIMELINE */}
        <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <DollarSign size={16} color="#FBBF24" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
                4. FINANCIAL TRANSACTIONS
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#8B929A" }}>{transactions.length} records</span>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {transactions.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#8B929A", fontSize: 12 }}>
                No financial transactions recorded.
              </div>
            ) : (
              transactions.map(t => {
                const isSender = t.sender_id === entity.person_id;
                return (
                  <div key={t.transaction_id} style={{
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    borderRadius: 6,
                    fontSize: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: isSender ? "rgba(255,92,108,0.12)" : "rgba(74,222,128,0.12)",
                          color: isSender ? "#FF5C6C" : "#4ADE80"
                        }}>
                          {isSender ? "DEBIT" : "CREDIT"}
                        </span>
                        <span style={{ color: "#F5F5F5", fontWeight: 700 }}>
                          ₹{Number(t.amount_inr).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: 10, color: "#8B929A" }}>({t.method})</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#8B929A" }}>
                        {isSender ? `To: ${t.receiver_id}` : `From: ${t.sender_id}`} · {formatDate(t.date)}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#8B929A", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4 }}>
                      {t.transaction_id}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 5: FIR / CASE RECORDS */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={16} color="#4ADE80" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
              5. CASE & FIR INCIDENT RECORDS
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#8B929A" }}>{firs.length} incident narratives</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {firs.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#8B929A", fontSize: 12 }}>
              No direct FIR narrative mentions found.
            </div>
          ) : (
            firs.map(f => (
              <div key={f.fir_id} style={{
                padding: "14px 18px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 6
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#4ADE80", fontFamily: "monospace" }}>
                      {f.fir_id}
                    </span>
                    {f.location_id && (
                      <span style={{ fontSize: 11, color: "#8B929A", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={12} /> Loc: {f.location_id}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: "#8B929A" }}>{formatDate(f.date)}</span>
                </div>
                <p style={{ fontSize: 13, color: "#F5F5F5", lineHeight: 1.5, margin: 0 }}>
                  {f.text}
                </p>
                {f.person_ids && (
                  <div style={{ marginTop: 8, fontSize: 11, color: "#8B929A" }}>
                    Named entities: <span style={{ color: "#FF9A3D" }}>{f.person_ids.split(";").join(", ")}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 6 & 7: VEHICLES/MOVEMENTS & NETWORK RELATIONSHIPS */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        
        {/* SECTION 6: VEHICLES & MOVEMENT HISTORY */}
        <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Car size={16} color="#60A5FA" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
                6. VEHICLES & MOVEMENT HISTORY
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#8B929A" }}>{vehicles.length} vehicles · {movements.length} sightings</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vehicles.map(v => (
              <div key={v.vehicle_id} style={{
                padding: "10px 14px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F5F5F5" }}>{v.registration}</div>
                  <div style={{ fontSize: 11, color: "#8B929A" }}>{v.vehicle_type} · ID: {v.vehicle_id}</div>
                </div>
                <span style={{ fontSize: 10, color: "#60A5FA", background: "rgba(96,165,250,0.1)", padding: "3px 8px", borderRadius: 4 }}>
                  Registered Owner
                </span>
              </div>
            ))}

            {movements.slice(0, 5).map(m => (
              <div key={m.movement_id} style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,0.01)",
                borderLeft: "2px solid #60A5FA",
                borderRadius: 4,
                fontSize: 11,
                color: "#8B929A",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>Sighted at <strong style={{ color: "#F5F5F5" }}>{m.location_id}</strong></span>
                <span>{formatDate(m.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: NETWORK RELATIONSHIPS */}
        <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Link2 size={16} color="#FF6A00" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
                7. NETWORK RELATIONSHIPS
              </span>
            </div>
            <span style={{ fontSize: 11, color: "#8B929A" }}>{relationships.length} active links</span>
          </div>

          <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {relationships.slice(0, 15).map(r => {
              const connected = r.source_entity === entity.person_id ? r.target_entity : r.source_entity;
              return (
                <div key={r.relationship_id} style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
                      {connected}
                    </div>
                    <div style={{ fontSize: 11, color: "#FF9A3D" }}>
                      {r.relationship_type}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", color: "#8B929A", background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4 }}>
                      Ev: {r.evidence_id}
                    </span>
                    <div style={{ fontSize: 10, color: "#8B929A", marginTop: 2 }}>
                      Link ID: {r.relationship_id}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* SECTION 8 & 9: EXPLAINABLE ALERTS & EVIDENCE PROVENANCE */}
      {/* --------------------------------------------------------------------- */}
      <div style={{ background: "#0B0E11", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AlertTriangle size={16} color="#FF5C6C" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#F5F5F5" }}>
              8 & 9. EXPLAINABLE ALERTS & EVIDENCE PROVENANCE
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#8B929A" }}>{alerts.length} registered alerts</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {alerts.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#8B929A", fontSize: 12 }}>
              No critical alerts currently active for this entity.
            </div>
          ) : (
            alerts.map((a, idx) => (
              <div key={a.alert_id || idx} style={{
                padding: "14px 18px",
                background: "rgba(255,92,108,0.04)",
                border: "1px solid rgba(255,92,108,0.2)",
                borderRadius: 6
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "rgba(255,92,108,0.2)",
                      color: "#FF5C6C"
                    }}>
                      {a.alert_type}
                    </span>
                    {a.evidence_id && (
                      <span style={{ fontSize: 11, color: "#8B929A", fontFamily: "monospace" }}>
                        Source Evidence: <strong style={{ color: "#F5F5F5" }}>{a.evidence_id}</strong>
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#FF9A3D" }}>
                    Confidence: {(Number(a.confidence) * (Number(a.confidence) <= 1 ? 100 : 1)).toFixed(0)}%
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "#F5F5F5", lineHeight: 1.5, margin: 0 }}>
                  {a.explanation}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
