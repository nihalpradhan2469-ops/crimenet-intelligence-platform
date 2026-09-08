import { useState, useRef } from "react";
import { Database, Upload, CheckCircle, Loader, Clock, Plus } from "lucide-react";
import { dataSources } from "../data/mockData";

const statusConfig = {
  Processed: { color: "#6FD08C", bg: "rgba(111,208,140,0.1)", icon: CheckCircle },
  Processing: { color: "#FF8A1F", bg: "rgba(255,138,31,0.1)", icon: Loader },
  Queued: { color: "#8FA8FF", bg: "rgba(143,168,255,0.1)", icon: Clock },
};

export default function DataSources() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Database size={16} color="var(--orange)" />
            <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Data Sources</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Data Ingestion</h1>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--orange)" : "var(--border)"}`,
          borderRadius: 18,
          padding: "40px 24px",
          textAlign: "center",
          marginBottom: 24,
          cursor: "pointer",
          background: isDragging ? "rgba(255,106,0,0.05)" : "var(--bg-card)",
          transition: "border-color 0.15s, background 0.15s",
          boxShadow: isDragging ? "0 0 20px var(--glow-secondary)" : "none",
        }}
      >
        <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} accept=".pdf,.csv,.json,.txt" />
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(255,106,0,0.12)",
          border: "1px solid rgba(255,106,0,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <Upload size={22} color="var(--orange)" />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
          Drop files here or click to upload
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
          Supports: PDF, CSV, JSON, TXT · FIR, CDR, Transaction, Surveillance records
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {["FIR", "CDR", "Transactions", "Police Report", "Intelligence", "Surveillance"].map(t => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Processing pipeline */}
      <div className="card" style={{ padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14 }}>Processing Pipeline</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {["Upload", "Validation", "Parsing", "Cleaning", "NLP/NER", "Entity Extraction", "Relationship Extraction", "Graph Construction", "Evidence Layer"].map((step, i, arr) => (
            <>
              <div key={step} style={{
                fontSize: 10, fontWeight: 600, padding: "5px 12px", borderRadius: 20,
                background: i < 5 ? "rgba(255,106,0,0.1)" : "var(--bg-secondary)",
                border: `1px solid ${i < 5 ? "rgba(255,106,0,0.2)" : "var(--border)"}`,
                color: i < 5 ? "var(--orange)" : "var(--text-muted)",
              }}>{step}</div>
              {i < arr.length - 1 && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>→</span>}
            </>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>
          Hugging Face NLP/NER integration pending · Steps 5+ show "Integration Pending" state
        </div>
      </div>

      {/* Files table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>File</th>
              <th>Type</th>
              <th>Case</th>
              <th>Size</th>
              <th>Status</th>
              <th>Entities</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataSources.map(ds => {
              const cfg = statusConfig[ds.status as keyof typeof statusConfig];
              return (
                <tr key={ds.id}>
                  <td><span className="font-mono" style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{ds.name}</span></td>
                  <td><span style={{ fontSize: 11, background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 6, color: "var(--text-muted)" }}>{ds.type}</span></td>
                  <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-muted)" }}>{ds.case}</span></td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{ds.size}</td>
                  <td>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: cfg.bg, color: cfg.color }}>
                      {ds.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: ds.entities > 0 ? "var(--text-secondary)" : "var(--text-muted)" }}>
                    {ds.entities > 0 ? ds.entities : "—"}
                  </td>
                  <td><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ds.uploaded}</span></td>
                  <td>
                    <button style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 10, color: "var(--text-muted)" }}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
