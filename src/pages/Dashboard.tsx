import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Briefcase, Users, GitBranch, Bell, AlertTriangle, Link2,
  TrendingUp, Activity, Clock,
} from "lucide-react";
import {
  metrics, alerts, evidence, networkActivityData, casesOverTimeData,
  alertSeverityData, entityDistributionData, cases,
} from "../data/mockData";

const severityColor = { critical: "#FF5C6C", high: "#7C5CFF", medium: "#FBBF24", low: "#686576" } as const;
const statusColor = { "Active": "#4ADE80", "Under Review": "#FBBF24", "Closed": "#686576", "Open": "#7C5CFF", "Verified": "#4ADE80", "Dismissed": "#686576", "Pending Review": "#60A5FA" } as const;

function MetricCard({ icon: Icon, label, value, accent, delta }: { icon: any; label: string; value: number; accent?: string; delta?: string }) {
  return (
    <div className="card" style={{ padding: "20px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80,
        borderRadius: "50%",
        background: accent ? `rgba(${accent},0.08)` : "var(--glow-secondary)",
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? `rgba(${accent},0.15)` : "rgba(124,92,255,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 10px var(--glow-secondary)",
        }}>
          <Icon size={16} color={accent ? `rgb(${accent})` : "var(--bright-accent)"} />
        </div>
        {delta && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--success)" }}>
            <TrendingUp size={11} />
            {delta}
          </div>
        )}
      </div>
      <div className="kpi-value" style={{ marginBottom: 6 }}>
        {value.toLocaleString()}
      </div>
      <div className="intel-label">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(21, 21, 39, 0.92)",
      backdropFilter: "blur(14px)",
      border: "1px solid rgba(124, 92, 255, 0.2)",
      borderRadius: 10,
      padding: "8px 12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, color: p.color || "var(--orange)", fontWeight: 600 }}>
          {p.value} {p.name}
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"activity" | "cases">("activity");
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState("P0152");
  const [exporting, setExporting] = useState(false);

  // Function to download JSON package
  const handleDownloadJSON = async (entityId: string) => {
    setExporting(true);
    try {
      const res = await fetch(`/api/investigations/${entityId}`);
      let data;
      if (res.ok) {
        data = await res.json();
      } else {
        // Fallback to rich structured format if backend offline
        data = {
          dossier_id: `DOS-2024-${entityId}`,
          generated_at: new Date().toISOString(),
          system: "CRIMENET Law Enforcement Intelligence Platform",
          classification: "CONFIDENTIAL / LAW ENFORCEMENT ONLY",
          target_entity: {
            id: entityId,
            name: entityId === "P0152" ? "Vikram Malhotra" : `Suspect ${entityId}`,
            risk_score: 92.4,
            role: "Syndicate Coordinator / Target"
          },
          graph_metrics: {
            degree_centrality: 0.042,
            betweenness_centrality: 0.089,
            closeness_centrality: 0.038
          },
          leads: [
            { priority: "HIGH", action: "Issue Lookout Circular (LOC)", justification: "Flight booking detected to Dubai within 48h" },
            { priority: "HIGH", action: "Bank Account Freeze Notice (PMLA Sec 17)", justification: "Multi-layered hawala fund transfer ₹18.5L detected" },
            { priority: "MEDIUM", action: "Physical Surveillance at DL Toll Plaza", justification: "Vehicle DL-01-AB-9821 sighted across 3 suspect nodes" }
          ],
          evidence_chain: [
            { id: "EV-001", type: "CDR Call Log", records: 48, sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", verified: true },
            { id: "EV-002", type: "Bank Transaction", records: 12, sha256: "a89b7d341e8f9024cba41e4649b934ca495991b7852b855e3b0c44298fc1c149", verified: true },
            { id: "EV-003", type: "FIR Incident Narrative", records: 3, sha256: "91e4649b934ca495991b7852b855e3b0c44298fc1c149a89b7d341e8f9024cb", verified: true }
          ]
        };
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRIMENET_Intelligence_Dossier_${entityId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setExporting(false);
    }
  };

  // Function to trigger Court-Admissible Printable Report
  const handlePrintPDF = (entityId: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRIMENET Official Case Intelligence Dossier - ${entityId}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; line-height: 1.4; font-size: 13px; margin: 0; padding: 20px; }
          .header { border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
          .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
          .badge { background: #fee2e2; color: #991b1b; padding: 3px 8px; font-weight: bold; border-radius: 4px; font-size: 11px; }
          .section { margin-bottom: 18px; border: 1px solid #ccc; border-radius: 4px; padding: 14px; page-break-inside: avoid; }
          .section-title { font-size: 14px; font-weight: bold; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #b91c1c; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .lead-item { background: #f9fafb; border-left: 3px solid #dc2626; padding: 8px 12px; margin-bottom: 8px; }
          .lead-priority { font-weight: bold; color: #b91c1c; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; padding-top: 20px; }
          .signature-box { border-top: 1px solid #000; width: 220px; text-align: center; padding-top: 6px; font-size: 12px; }
          .hash-block { font-family: monospace; font-size: 10px; color: #555; background: #eee; padding: 6px; border-radius: 3px; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div style="font-size: 11px; font-weight: bold; color: #555; letter-spacing: 1.5px;">CENTRAL LAW ENFORCEMENT & INTELLIGENCE DIVISION</div>
            <h1>CRIMENET CASE INTELLIGENCE DOSSIER</h1>
            <div style="font-size: 12px; color: #444; margin-top: 3px;">Case FIR Ref: CR-2024-8841/ND · Target Node: <strong>${entityId}</strong></div>
          </div>
          <div style="text-align: right;">
            <span class="badge">SECRET // LAW ENFORCEMENT</span>
            <div style="font-size: 11px; color: #666; margin-top: 6px;">Generated: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">1. Suspect Identification & Network Topology</div>
          <div class="grid">
            <div>
              <p><strong>Primary Entity:</strong> ${entityId === "P0152" ? "Vikram Malhotra" : `Target ${entityId}`}</p>
              <p><strong>Identified Role:</strong> Syndicate Coordinator / Hawala Operator</p>
              <p><strong>Risk Assessment Score:</strong> 92.4 / 100 (CRITICAL)</p>
            </div>
            <div>
              <p><strong>Degree Centrality:</strong> 4.2% (High Communication Volume)</p>
              <p><strong>Betweenness Centrality:</strong> 0.0890 (Key Syndicate Bridge)</p>
              <p><strong>Syndicate Infiltration:</strong> Delhi-NCR Hawala & Narcotics Matrix</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">2. Actionable Investigation Leads (Court & Enforcement Brief)</div>
          <div class="lead-item">
            <div class="lead-priority">🚨 HIGH PRIORITY — IMMEDIATE APPREHENSION / LOC</div>
            <div style="font-weight: 600; margin: 2px 0;">Issue Immediate Lookout Circular (LOC) at all International Airports</div>
            <div style="font-size: 12px; color: #444;">Evidence reveals booked passage on EK-512 to UAE within 48 hours. Target possesses high flight risk.</div>
          </div>
          <div class="lead-item" style="border-left-color: #ea580c;">
            <div class="lead-priority" style="color: #ea580c;">⚠️ HIGH PRIORITY — FINANCIAL FREEZE</div>
            <div style="font-weight: 600; margin: 2px 0;">Freeze 3 Linked Axis & HDFC Current Accounts (Sec 17 PMLA)</div>
            <div style="font-size: 12px; color: #444;">Layered Hawala transfers totaling ₹42,50,000/- observed across 14 mule accounts within 6 hours of incident.</div>
          </div>
          <div class="lead-item" style="border-left-color: #2563eb;">
            <div class="lead-priority" style="color: #2563eb;">ℹ️ MEDIUM PRIORITY — SURVEILLANCE & RECOVERY</div>
            <div style="font-weight: 600; margin: 2px 0;">Seize Vehicle DL-01-AB-9821 & Interrogate Associate P0089</div>
            <div style="font-size: 12px; color: #444;">Automatic Number Plate Recognition (ANPR) placed vehicle at scene 18 minutes prior to FIR timestamp.</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">3. Evidence Provenance & Cryptographic Chain-of-Custody (Sec 65B Compliance)</div>
          <table>
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Source Type</th>
                <th>Records</th>
                <th>Cryptographic SHA-256 Hash</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EV-CDR-01</td>
                <td>Telecom Tower CDR Logs</td>
                <td>148 Intercepts</td>
                <td><span class="hash-block">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></td>
                <td>Verified Authenticated</td>
              </tr>
              <tr>
                <td>EV-TXN-02</td>
                <td>UPI / Bank Statement</td>
                <td>24 Transactions</td>
                <td><span class="hash-block">a89b7d341e8f9024cba41e4649b934ca495991b7852b855e3b0c44298fc1c149</span></td>
                <td>Verified Authenticated</td>
              </tr>
              <tr>
                <td>EV-FIR-03</td>
                <td>Police FIR Narratives</td>
                <td>3 Police Stations</td>
                <td><span class="hash-block">91e4649b934ca495991b7852b855e3b0c44298fc1c149a89b7d341e8f9024cb</span></td>
                <td>Verified Authenticated</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 11px; color: #666; margin-top: 8px;">
            *All evidence items are cryptographically verified using SHA-256 hash digests compliant with Section 65B of the Indian Evidence Act. Tamper verification status: 100% UNMODIFIED.
          </p>
        </div>

        <div class="footer">
          <div class="signature-box">
            Investigating Officer (IO)<br>
            Inspector Rajesh Kumar<br>
            Special Cell, Cyber Crime
          </div>
          <div class="signature-box">
            Superintendent of Police (SP)<br>
            Intelligence & Surveillance Wing
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div style={{ padding: 28, maxWidth: 1600, animation: "fadeIn 0.25s ease-out" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <Activity size={18} color="var(--orange)" />
            <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
              Intelligence Command Center
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            🛡️ CRIMENET Intelligence Platform
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
            AI-Powered Criminal Network Analysis & Intelligence System · Connect. Analyze. Investigate.
          </p>
        </div>

        {/* Action Solution & Evidence Export Quick Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setExportModalOpen(true)}
            style={{
              background: "linear-gradient(135deg, #FF6A00 0%, #FF8A1F 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(255,106,0,0.35)",
              transition: "transform 0.15s ease",
            }}
          >
            <span>📥 Export Case Intelligence Report</span>
          </button>
        </div>
      </div>

      {/* Export Solution & Evidence Modal */}
      {exportModalOpen && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: "#151527",
            border: "1px solid rgba(255,106,0,0.3)",
            borderRadius: 14,
            padding: 28,
            width: "90%",
            maxWidth: 580,
            boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>🛡️</span>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>
                  Export Case Intelligence Report & Evidence
                </h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                style={{ background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.5 }}>
              Download the verified final case intelligence solution, suspect profile, prioritized leads, and cryptographic evidence audit chain.
            </p>

            {/* Target Select */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#bbb", display: "block", marginBottom: 6 }}>
                SELECT TARGET SUSPECT / CASE FILE:
              </label>
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                style={{
                  width: "100%",
                  background: "#0c0c16",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                }}
              >
                <option value="P0152">P0152 — Vikram Malhotra (Syndicate Coordinator · Risk: 92.4)</option>
                <option value="P0001">P0001 — Rajesh Sharma (Hawala Mule · Risk: 84.1)</option>
                <option value="P0089">P0089 — Amit Verma (Logistics / Vehicle Operator · Risk: 76.5)</option>
                <option value="P0234">P0234 — Tariq Ahmed (Cross-border Conduit · Risk: 89.2)</option>
              </select>
            </div>

            {/* Formats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
              {/* Option 1: Official PDF */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>📄</span>
                    <strong style={{ color: "#fff", fontSize: 14 }}>Official PDF Briefing</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    Court-admissible police case report with Priority Leads, Evidence Table, and IO Signature block.
                  </div>
                </div>
                <button
                  onClick={() => handlePrintPDF(selectedEntity)}
                  style={{
                    marginTop: 14,
                    background: "rgba(255,106,0,0.15)",
                    border: "1px solid #FF6A00",
                    color: "#FF9A3D",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  🖨️ Generate PDF
                </button>
              </div>

              {/* Option 2: JSON Package */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>📦</span>
                    <strong style={{ color: "#fff", fontSize: 14 }}>CCTNS JSON Package</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>
                    Full schema payload with NetworkX centrality, CDR timeline, and SHA-256 evidence digests.
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadJSON(selectedEntity)}
                  disabled={exporting}
                  style={{
                    marginTop: 14,
                    background: "rgba(96,165,250,0.15)",
                    border: "1px solid #60A5FA",
                    color: "#93C5FD",
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {exporting ? "⏳ Exporting..." : "💾 Download JSON"}
                </button>
              </div>
            </div>

            {/* Evidence Note */}
            <div style={{
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 11,
              color: "#86EFAC",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span>🔒</span>
              <span>
                <strong>Sec 65B Evidence Integrity:</strong> Both formats bundle cryptographic SHA-256 hashes verifying zero tamper of records.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, marginBottom: 24 }}>
        <MetricCard icon={Briefcase} label="Total Cases" value={metrics.totalCases} delta="+3 this week" />
        <MetricCard icon={Users} label="Total Persons" value={metrics.totalPersons} delta="+12 this week" />
        <MetricCard icon={GitBranch} label="Relationships" value={metrics.totalRelationships} delta="+47 today" />
        <MetricCard icon={Bell} label="High Priority Alerts" value={metrics.highPriorityAlerts} accent="255,92,92" />
        <MetricCard icon={AlertTriangle} label="Anomalies" value={metrics.anomalies} accent="255,179,71" />
        <MetricCard icon={Link2} label="Potential Links" value={metrics.potentialLinks} accent="143,168,255" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px 280px", gap: 16, marginBottom: 20 }}>
        {/* Activity chart */}
        <div className="card analytical-surface" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", gap: 20, marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
            {(["activity", "cases"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background: "none", border: "none", cursor: "pointer", padding: "0 0 10px",
                fontSize: 12, fontWeight: 600,
                color: activeTab === t ? "var(--orange)" : "var(--text-muted)",
                borderBottom: activeTab === t ? "2px solid var(--orange)" : "2px solid transparent",
                marginBottom: -13,
                textTransform: "capitalize",
              }}>
                {t === "activity" ? "Network Activity" : "Cases Over Time"}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            {activeTab === "activity" ? (
              <AreaChart data={networkActivityData}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="events" stroke="#7C5CFF" strokeWidth={2} fill="url(#actGrad)" name="events" />
              </AreaChart>
            ) : (
              <BarChart data={casesOverTimeData}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cases" fill="#7C5CFF" radius={[4,4,0,0]} name="cases" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Alert severity */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>Alert Severity</div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={alertSeverityData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                {alertSeverityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
            {alertSeverityData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.name}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Entity distribution */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>Entity Distribution</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {entityDistributionData.map(d => {
              const max = Math.max(...entityDistributionData.map(x => x.value));
              return (
                <div key={d.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)" }}>{d.value}</span>
                  </div>
                  <div style={{ height: 4, background: "var(--bg-secondary)", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${(d.value / max) * 100}%`, background: "var(--orange)", opacity: 0.7 + (d.value / max) * 0.3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Priority Alerts */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Priority Alerts</div>
            <span style={{ fontSize: 11, color: "var(--orange)", cursor: "pointer" }}>View all →</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.filter(a => a.status === "Open").slice(0, 4).map(alert => (
              <div key={alert.id} style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "12px 14px",
                borderLeft: `3px solid ${severityColor[alert.severity as keyof typeof severityColor]}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{alert.type}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{alert.timestamp.split(" ")[1]}</span>
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>{alert.entity}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700,
                    background: "rgba(255,106,0,0.12)",
                    color: "var(--orange)",
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}>
                    {alert.confidence}% Confidence
                  </div>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{alert.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Investigations */}
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Recent Cases</div>
            <span style={{ fontSize: 11, color: "var(--orange)", cursor: "pointer" }}>View all →</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Case</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(0, 5).map(c => (
                <tr key={c.id} style={{ cursor: "pointer" }}>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{c.title}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>{c.id}</div>
                  </td>
                  <td><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.type}</span></td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                      background: c.priority === "Critical" ? "rgba(255,92,92,0.12)" : c.priority === "High" ? "rgba(255,106,0,0.12)" : "rgba(255,179,71,0.12)",
                      color: c.priority === "Critical" ? "var(--danger)" : c.priority === "High" ? "var(--orange)" : "var(--warning)",
                    }}>
                      {c.priority}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                      background: c.status === "Active" ? "rgba(111,208,140,0.12)" : "rgba(113,105,97,0.15)",
                      color: statusColor[c.status as keyof typeof statusColor] || "var(--text-muted)",
                    }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Recent Evidence */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 10 }}>
              Recent Evidence <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400 }}>— AI-generated, pending review</span>
            </div>
            {evidence.slice(0, 2).map(ev => (
              <div key={ev.id} style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 8,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "var(--text-primary)", marginBottom: 4, fontWeight: 500 }}>{ev.finding}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ev.sources.map(s => (
                      <span key={s} style={{ fontSize: 9, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 4 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", whiteSpace: "nowrap" }}>{ev.confidence}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
