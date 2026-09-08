import { Settings as SettingsIcon, User, Shield, Database, Bell, Cpu } from "lucide-react";

export default function Settings() {
  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <SettingsIcon size={16} color="var(--orange)" />
          <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Configuration</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Settings</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24, maxWidth: 900 }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: "14px 12px", alignSelf: "flex-start" }}>
          {[
            { icon: User, label: "Profile" },
            { icon: Shield, label: "Security" },
            { icon: Database, label: "Supabase Integration" },
            { icon: Bell, label: "Notifications" },
            { icon: Cpu, label: "AI / ML Integration" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 8, cursor: "pointer",
              color: label === "AI / ML Integration" ? "var(--orange)" : "var(--text-muted)",
              background: label === "AI / ML Integration" ? "rgba(255,106,0,0.08)" : "transparent",
              fontSize: 13, fontWeight: 500,
              transition: "background 0.15s",
              marginBottom: 2,
            }}>
              <Icon size={14} color={label === "AI / ML Integration" ? "var(--orange)" : "currentColor"} />
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* AI Integration */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>AI / ML Integration</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>
              Configure AI models and integration endpoints. All models run locally or on your own infrastructure.
            </div>

            {[
              { label: "NLP / NER Model", value: "Hugging Face bert-base-NER", status: "Integration Pending" },
              { label: "Sentence Embeddings", value: "sentence-transformers/all-MiniLM-L6-v2", status: "Integration Pending" },
              { label: "Entity Resolution", value: "Custom similarity pipeline", status: "Integration Pending" },
              { label: "Anomaly Detection", value: "scikit-learn IsolationForest", status: "Integration Pending" },
              { label: "Graph Neural Network", value: "PyTorch Geometric (Optional)", status: "Not Configured" },
            ].map(({ label, value, status }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{label}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{value}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
                  background: "rgba(143,168,255,0.1)", color: "#8FA8FF",
                }}>
                  {status}
                </span>
              </div>
            ))}

            <div style={{ marginTop: 20, background: "rgba(255,106,0,0.06)", border: "1px solid rgba(255,106,0,0.15)", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "var(--orange-soft)", lineHeight: 1.6 }}>
              <strong>Privacy Note:</strong> Configure models to run locally. Do not send sensitive investigation data to external AI services.
            </div>
          </div>

          {/* Supabase */}
          <div className="card" style={{ padding: "22px 24px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>Supabase Configuration</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Supabase URL", env: "VITE_SUPABASE_URL", placeholder: "https://xxx.supabase.co" },
                { label: "Anon Key", env: "VITE_SUPABASE_ANON_KEY", placeholder: "eyJ..." },
              ].map(({ label, env, placeholder }) => (
                <div key={env}>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6 }}>{env}</div>
                  <input placeholder={placeholder} type="password" style={{ width: "100%", fontSize: 12 }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--text-muted)" }}>
              Never commit secrets to version control. Use environment variables.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
