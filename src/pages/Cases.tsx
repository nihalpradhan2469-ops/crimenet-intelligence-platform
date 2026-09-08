import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Network, FileText, Briefcase } from "lucide-react";
import { cases } from "../data/mockData";

const priorityColors = { Critical: { bg: "rgba(255,92,108,0.14)", text: "#FF5C6C" }, High: { bg: "rgba(124,92,255,0.14)", text: "#7C5CFF" }, Medium: { bg: "rgba(251,191,36,0.14)", text: "#FBBF24" }, Low: { bg: "rgba(104,101,118,0.14)", text: "#686576" } } as const;
const statusColors = { Active: { bg: "rgba(74,222,128,0.14)", text: "#4ADE80" }, "Under Review": { bg: "rgba(251,191,36,0.14)", text: "#FBBF24" }, Closed: { bg: "rgba(104,101,118,0.14)", text: "#686576" } } as const;

export default function Cases() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);

  const filtered = cases.filter(c => {
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Briefcase size={16} color="var(--orange)" />
            <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Case Management</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Cases</h1>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Plus size={14} /> New Case
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={13} color="var(--text-muted)" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..." style={{ paddingLeft: 32, width: "100%", height: 36 }} />
        </div>
        {["All", "Active", "Under Review", "Closed"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: statusFilter === s ? "rgba(255,106,0,0.15)" : "var(--bg-card)",
            border: `1px solid ${statusFilter === s ? "var(--orange)" : "var(--border)"}`,
            color: statusFilter === s ? "var(--orange)" : "var(--text-muted)",
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedCase ? "1fr 380px" : "1fr", gap: 16 }}>
        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <table>
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Entities</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const pc = priorityColors[c.priority as keyof typeof priorityColors] || priorityColors.Low;
                const sc = statusColors[c.status as keyof typeof statusColors] || statusColors.Closed;
                return (
                  <tr key={c.id} onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)} style={{ cursor: "pointer", background: selectedCase?.id === c.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.id}</span></td>
                    <td><span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{c.title}</span></td>
                    <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{c.type}</span></td>
                    <td><span style={{ color: "var(--text-muted)", fontSize: 12 }}>{c.location}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: pc.bg, color: pc.text }}>
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: sc.bg, color: sc.text }}>
                        {c.status}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 13 }}>{c.entities}</span></td>
                    <td><span style={{ color: "var(--text-muted)", fontSize: 11 }}>{c.updated}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={e => { e.stopPropagation(); setSelectedCase(c); }} title="View Details" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--text-muted)" }}>
                          <Eye size={11} /> View
                        </button>
                        <button onClick={e => { e.stopPropagation(); navigate(`/network?case=${encodeURIComponent(c.id)}`); }} title="View Case Network Graph" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--orange)" }}>
                          <Network size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Case Detail */}
        {selectedCase && (
          <div className="card" style={{ padding: "20px", animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: "var(--orange)", fontWeight: 700, letterSpacing: "0.8px", marginBottom: 4 }}>{selectedCase.id}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{selectedCase.title}</div>
              </div>
              <button onClick={() => setSelectedCase(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
            </div>

            {[
              { label: "Type", value: selectedCase.type },
              { label: "Location", value: selectedCase.location },
              { label: "Date Filed", value: selectedCase.date },
              { label: "Last Updated", value: selectedCase.updated },
              { label: "Entities", value: selectedCase.entities.toString() },
              { label: "Relationships", value: selectedCase.relationships.toString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn-primary" style={{ flex: 1, fontSize: 12, cursor: "pointer" }} onClick={() => navigate(`/investigations?caseId=${encodeURIComponent(selectedCase.id)}`)}>Open Investigation</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: 12, cursor: "pointer" }} onClick={() => navigate(`/network?case=${encodeURIComponent(selectedCase.id)}`)}>Network Graph</button>
            </div>
            <button className="btn-secondary" style={{ width: "100%", marginTop: 8, fontSize: 12, cursor: "pointer" }} onClick={() => navigate('/evidence')}>View Evidence</button>
          </div>
        )}
      </div>
    </div>
  );
}
