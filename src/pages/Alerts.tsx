import { useState } from "react";
import { Bell, CheckCircle, XCircle, Eye, Filter } from "lucide-react";
import { alerts } from "../data/mockData";

const severityConfig = {
  critical: { color: "#FF5C6C", bg: "rgba(255,92,108,0.12)", label: "CRITICAL" },
  high: { color: "#7C5CFF", bg: "rgba(124,92,255,0.12)", label: "HIGH" },
  medium: { color: "#FBBF24", bg: "rgba(251,191,36,0.12)", label: "MEDIUM" },
  low: { color: "#686576", bg: "rgba(104,101,118,0.12)", label: "LOW" },
} as const;

type AlertState = typeof alerts[0] & { currentStatus?: string };

export default function Alerts() {
  const [filter, setFilter] = useState("All");
  const [alertStates, setAlertStates] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<typeof alerts[0] | null>(null);

  const getStatus = (a: typeof alerts[0]) => alertStates[a.id] || a.status;

  const filtered = alerts.filter(a => {
    if (filter === "All") return true;
    if (filter === "Open") return getStatus(a) === "Open";
    if (filter === "Critical") return a.severity === "critical";
    if (filter === "High") return a.severity === "high";
    return true;
  });

  const act = (id: string, status: string) => {
    setAlertStates(prev => ({ ...prev, [id]: status }));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Bell size={16} color="var(--orange)" />
            <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Intelligence Alerts</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Alerts</h1>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["All", "Open", "Critical", "High"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: filter === f ? "rgba(255,106,0,0.15)" : "var(--bg-card)",
              border: `1px solid ${filter === f ? "var(--orange)" : "var(--border)"}`,
              color: filter === f ? "var(--orange)" : "var(--text-muted)",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(alert => {
            const cfg = severityConfig[alert.severity as keyof typeof severityConfig];
            const status = getStatus(alert);
            const isSelected = selected?.id === alert.id;

            return (
              <div key={alert.id} className="card" style={{
                padding: "16px 20px",
                borderLeft: `3px solid ${cfg.color}`,
                cursor: "pointer",
                opacity: status === "Dismissed" ? 0.5 : 1,
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-card)",
                transition: "background 0.15s",
              }} onClick={() => setSelected(isSelected ? null : alert)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color, letterSpacing: "0.8px" }}>
                        {cfg.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{alert.type}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: "var(--orange)" }}>{alert.entity}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>{alert.reason}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(255,106,0,0.12)", color: "var(--orange)", padding: "2px 10px", borderRadius: 20 }}>
                        {alert.confidence}% Confidence
                      </span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{alert.source}</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{alert.timestamp}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 16 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                      background: status === "Verified" ? "rgba(111,208,140,0.12)" : status === "Dismissed" ? "rgba(113,105,97,0.12)" : status === "Under Review" ? "rgba(143,168,255,0.12)" : "rgba(255,106,0,0.12)",
                      color: status === "Verified" ? "#6FD08C" : status === "Dismissed" ? "#716961" : status === "Under Review" ? "#8FA8FF" : "#FF8A1F",
                    }}>
                      {status}
                    </span>
                    {status === "Open" && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={e => { e.stopPropagation(); act(alert.id, "Verified"); }} style={{ background: "rgba(111,208,140,0.12)", border: "1px solid rgba(111,208,140,0.3)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                          <CheckCircle size={12} color="#6FD08C" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); act(alert.id, "Dismissed"); }} style={{ background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.2)", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                          <XCircle size={12} color="#FF5C5C" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Alert Detail</div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--orange)", marginBottom: 12 }}>{selected.type}</div>
            {[
              { label: "Entity", value: selected.entity },
              { label: "Severity", value: selected.severity.toUpperCase() },
              { label: "Confidence", value: `${selected.confidence}%` },
              { label: "Source", value: selected.source },
              { label: "Timestamp", value: selected.timestamp },
              { label: "Status", value: getStatus(selected) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selected.reason}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-primary" onClick={() => act(selected.id, "Verified")} style={{ flex: 1 }}>Verify</button>
              <button className="btn-secondary" onClick={() => act(selected.id, "Under Review")} style={{ flex: 1 }}>Review</button>
              <button className="btn-danger" onClick={() => act(selected.id, "Dismissed")} style={{ flex: 1 }}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
