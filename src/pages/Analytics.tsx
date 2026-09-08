import { BarChart3, TrendingUp } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { analyticsData } from "../data/mockData";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 14px" }}>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <BarChart3 size={16} color="var(--orange)" />
          <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Analytics</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Network Analytics</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Entity Growth */}
        <div className="card analytical-surface" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>Entity Growth</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analyticsData.entityGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,36,56,0.6)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#A6A3B5" }} />
              <Line type="monotone" dataKey="persons" stroke="#7C5CFF" strokeWidth={2} dot={false} name="Persons" />
              <Line type="monotone" dataKey="phones" stroke="#9B7CFF" strokeWidth={2} dot={false} name="Phones" />
              <Line type="monotone" dataKey="locations" stroke="#5B7CFF" strokeWidth={2} dot={false} name="Locations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Trends */}
        <div className="card analytical-surface" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>Alert Trends</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analyticsData.alertTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(37,36,56,0.6)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#686576" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#A6A3B5" }} />
              <Bar dataKey="critical" fill="#FF5C6C" radius={[2,2,0,0]} name="Critical" />
              <Bar dataKey="high" fill="#7C5CFF" radius={[2,2,0,0]} name="High" />
              <Bar dataKey="medium" fill="#FBBF24" radius={[2,2,0,0]} name="Medium" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Central Nodes */}
      <div className="card" style={{ padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <TrendingUp size={14} color="var(--orange)" />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Key Person Analysis — Network Centrality</div>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
            Investigative priority only · Not a declaration of guilt
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {analyticsData.topCentralNodes.map((node, i) => (
            <div key={node.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-muted)", width: 20, textAlign: "right" }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{node.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 10 }}>{node.connections} connections</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: node.score > 0.8 ? "var(--orange)" : "var(--text-secondary)" }}>
                    {Math.round(node.score * 100)}%
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--bg-secondary)", borderRadius: 3 }}>
                  <div style={{
                    height: "100%",
                    width: `${node.score * 100}%`,
                    background: node.score > 0.8 ? "linear-gradient(90deg, var(--orange), var(--orange-bright))" : "var(--text-muted)",
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
              {node.score > 0.8 && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(255,106,0,0.12)", color: "var(--orange)", whiteSpace: "nowrap" }}>
                  High Centrality
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
