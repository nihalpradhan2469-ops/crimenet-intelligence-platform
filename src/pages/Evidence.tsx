import { useState } from "react";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import { evidence } from "../data/mockData";

export default function Evidence() {
  const [states, setStates] = useState<Record<string, string>>({});

  const getStatus = (id: string, fallback: string) => states[id] || fallback;

  const act = (id: string, status: string) => setStates(prev => ({ ...prev, [id]: status }));

  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <FileText size={16} color="var(--orange)" />
          <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Evidence System</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Evidence & AI Findings</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          AI-generated investigative leads — pending investigator review. These are potential leads, not confirmed facts.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {evidence.map(ev => {
          const status = getStatus(ev.id, ev.status);
          const isVerified = status === "Verified";
          const isDismissed = status === "Dismissed";

          return (
            <div key={ev.id} className="card" style={{
              padding: "22px 24px",
              opacity: isDismissed ? 0.55 : 1,
              borderLeft: `3px solid ${isVerified ? "#6FD08C" : isDismissed ? "#716961" : "var(--orange)"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" }}>{ev.id}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: isVerified ? "rgba(111,208,140,0.12)" : isDismissed ? "rgba(113,105,97,0.12)" : status === "Under Review" ? "rgba(143,168,255,0.12)" : "rgba(255,106,0,0.12)",
                      color: isVerified ? "#6FD08C" : isDismissed ? "#716961" : status === "Under Review" ? "#8FA8FF" : "#FF8A1F",
                    }}>
                      {status}
                    </span>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>
                    Potential Investigation Lead
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {/* Finding */}
                    <div style={{ gridColumn: "1 / 3" }}>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.5px" }}>FINDING</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{ev.finding}</div>
                    </div>

                    {/* Confidence */}
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 6, letterSpacing: "0.5px" }}>CONFIDENCE</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--orange)", lineHeight: 1 }}>{ev.confidence}%</div>
                      <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2, marginTop: 8 }}>
                        <div style={{ height: "100%", width: `${ev.confidence}%`, background: "var(--orange)", borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                    {/* Evidence records */}
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>EVIDENCE</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ev.sources.map(s => (
                          <span key={s} style={{
                            fontSize: 11, fontWeight: 600,
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            padding: "4px 10px", borderRadius: 6,
                            fontFamily: "monospace",
                            cursor: "pointer",
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Signals */}
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, marginBottom: 8, letterSpacing: "0.5px" }}>SIGNALS</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {ev.signals.map(s => (
                          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }} />
                            {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 12 }}>
                    Generated: {ev.timestamp} · AI-assisted analysis · Not a confirmed finding
                  </div>
                </div>

                {/* Actions */}
                {!isDismissed && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                    <button className="btn-primary" onClick={() => act(ev.id, "Verified")} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <CheckCircle size={13} /> Verify
                    </button>
                    <button className="btn-secondary" onClick={() => act(ev.id, "Under Review")} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <Eye size={13} /> Review
                    </button>
                    <button className="btn-danger" onClick={() => act(ev.id, "Dismissed")} style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                      <XCircle size={13} /> Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
