import { ScrollText } from "lucide-react";
import { auditLogs } from "../data/mockData";

const actionColor: Record<string, string> = {
  Login: "#60A5FA", Upload: "#9B7CFF", "AI Finding": "#B8A7FF",
  Review: "#A6A3B5", Verify: "#4ADE80", Dismiss: "#686576",
  "Entity Creation": "#7C5CFF", "Data Processing": "#FBBF24",
};

export default function AuditLogs() {
  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <ScrollText size={16} color="var(--orange)" />
          <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Audit Logs</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Audit Trail</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Complete record of all investigator actions and system events.</p>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>Log ID</th>
              <th>User</th>
              <th>Action</th>
              <th>Record</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id}>
                <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{log.id}</span></td>
                <td style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{log.user}</td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20,
                    background: "rgba(255,255,255,0.04)",
                    color: actionColor[log.action] || "var(--text-muted)",
                  }}>
                    {log.action}
                  </span>
                </td>
                <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{log.record}</span></td>
                <td style={{ fontSize: 11, color: "var(--text-muted)" }}>{log.timestamp}</td>
                <td>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                    background: log.status === "Success" ? "rgba(111,208,140,0.1)" : "rgba(255,179,71,0.1)",
                    color: log.status === "Success" ? "#6FD08C" : "#FFB347",
                  }}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
