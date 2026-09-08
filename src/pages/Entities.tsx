import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, User, TrendingUp, Phone, Car, MapPin, Building2, Network } from "lucide-react";
import { persons } from "../data/mockData";

const phonesData = [
  { id: "PH-001", number: "+91-98765-43210", user: "Rahul Sharma", source: "CDR-021", caseId: "CASE-2024-001", type: "Mobile / Primary", calls: 42, status: "Active Intercept" },
  { id: "PH-002", number: "+91-87654-32109", user: "Mohammed Raza", source: "CDR-033", caseId: "CASE-2024-001", type: "Burner SIM", calls: 68, status: "Flagged" },
  { id: "PH-003", number: "+91-76543-21098", user: "Vikram Desai", source: "CDR-041", caseId: "CASE-2024-002", type: "VoIP / Encrypted", calls: 29, status: "Monitored" },
  { id: "PH-004", number: "+91-65432-10987", user: "Suresh Nair", source: "CDR-058", caseId: "CASE-2024-006", type: "Mobile SIM", calls: 15, status: "Under Review" },
];

const vehiclesData = [
  { id: "VH-001", reg: "MH-01-AX-4521", type: "Toyota Fortuner (Black)", owner: "Mohammed Raza / Rahul Sharma", source: "SURV-014", caseId: "CASE-2024-001", sightings: 7, status: "Under Surveillance" },
  { id: "VH-002", reg: "DL-02-BZ-7890", type: "Honda City (White)", owner: "Vikram Desai", source: "SURV-019", caseId: "CASE-2024-002", sightings: 4, status: "Impounded Track" },
  { id: "VH-003", reg: "KA-04-ME-1122", type: "Commercial Delivery Van", owner: "Deepak Choudhary", source: "CAS-006", caseId: "CASE-2024-006", sightings: 9, status: "Flagged Checkpost" },
];

const locationsData = [
  { id: "LOC-001", name: "Dharavi, Mumbai", type: "Safehouse / Operational Hub", linked: "Rahul Sharma, Mohammed Raza", source: "FIR-014", caseId: "CASE-2024-001", events: 14, status: "High Priority" },
  { id: "LOC-002", name: "Chandni Chowk, Delhi", type: "Hawala Cash Drop", linked: "Vikram Desai, Arjun Mehta", source: "SURV-022", caseId: "CASE-2024-002", events: 8, status: "Active Watch" },
  { id: "LOC-003", name: "Park Street, Kolkata", type: "Transit Office", linked: "Suresh Nair", source: "INT-009", caseId: "CASE-2024-003", events: 5, status: "Periodic Check" },
];

const orgsData = [
  { id: "ORG-001", name: "Nexus Trading Corp", type: "Corporate Front / Hawala Conduit", directors: "Vikram Desai, Anita Kapoor", source: "TXN-087", caseId: "CASE-2024-002", turnover: "₹4.8 Cr", status: "Accounts Frozen" },
  { id: "ORG-002", name: "Silverline Logistics", type: "Shell Transport Entity", directors: "Rahul Sharma", source: "FIR-014", caseId: "CASE-2024-001", turnover: "₹1.2 Cr", status: "Under Investigation" },
];

export default function Entities() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof persons[0] | null>(null);
  const [selectedPhone, setSelectedPhone] = useState<typeof phonesData[0] | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<typeof vehiclesData[0] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<typeof locationsData[0] | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<typeof orgsData[0] | null>(null);
  const [tab, setTab] = useState("persons");

  return (
    <div style={{ padding: 28, animation: "fadeIn 0.25s ease-out" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Users size={16} color="var(--orange)" />
          <span style={{ fontSize: 11, color: "var(--orange)", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Entity Management</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Entities</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 24, marginBottom: 20, borderBottom: "1px solid var(--border)" }}>
        {["persons", "phones", "vehicles", "locations", "organizations"].map(t => (
          <button key={t} onClick={() => { setTab(t); setSelected(null); setSelectedPhone(null); setSelectedVehicle(null); setSelectedLocation(null); setSelectedOrg(null); }} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "0 0 12px",
            fontSize: 13, fontWeight: 600,
            color: tab === t ? "var(--orange)" : "var(--text-muted)",
            borderBottom: tab === t ? "2px solid var(--orange)" : "2px solid transparent",
            marginBottom: -1,
            textTransform: "capitalize",
          }}>{t}</button>
        ))}
      </div>

      {/* PERSONS TAB */}
      {tab === "persons" && (
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Cases</th>
                  <th>Connections</th>
                  <th>Centrality</th>
                  <th>Status</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {persons.map(p => (
                  <tr key={p.id} onClick={() => setSelected(selected?.id === p.id ? null : p)} style={{ cursor: "pointer", background: selected?.id === p.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Alias: {p.alias}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.location}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{p.cases}</td>
                    <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{p.connections}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ height: 4, width: 60, background: "var(--bg-secondary)", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${p.centrality * 100}%`, background: p.centrality > 0.8 ? "var(--orange)" : p.centrality > 0.6 ? "var(--orange-soft)" : "var(--text-muted)", borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>{Math.round(p.centrality * 100)}%</span>
                        {p.centrality > 0.8 && <TrendingUp size={10} color="var(--orange)" />}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        background: "rgba(143,168,255,0.12)", color: "#8FA8FF",
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{p.source}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selected && (
            <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,106,0,0.12)", border: "1.5px solid rgba(255,106,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={20} color="var(--orange)" />
                </div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>Alias: {selected.alias} · Age: {selected.age}</div>

              {selected.centrality > 0.8 && (
                <div style={{ background: "rgba(255,106,0,0.1)", border: "1px solid rgba(255,106,0,0.2)", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: "var(--orange)", fontWeight: 600 }}>
                  ◆ High Network Centrality — {Math.round(selected.centrality * 100)}%
                </div>
              )}

              {[
                { label: "Location", value: selected.location },
                { label: "Cases", value: selected.cases.toString() },
                { label: "Connections", value: selected.connections.toString() },
                { label: "Phones", value: selected.phones.toString() },
                { label: "Vehicles", value: selected.vehicles.toString() },
                { label: "Status", value: selected.status },
                { label: "Source Record", value: selected.source },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate(`/network?entity=${encodeURIComponent(selected.name)}`)}
                >
                  <Network size={14} /> View Network
                </button>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, cursor: "pointer" }}
                  onClick={() => navigate(`/investigations?entity=${encodeURIComponent(selected.name)}`)}
                >
                  Timeline
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHONES TAB */}
      {tab === "phones" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedPhone ? "1fr 360px" : "1fr", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Phone Number</th>
                  <th>Primary Associate</th>
                  <th>Source Document</th>
                  <th>Associated Case</th>
                  <th>Total Calls</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {phonesData.map(ph => (
                  <tr key={ph.id} onClick={() => setSelectedPhone(selectedPhone?.id === ph.id ? null : ph)} style={{ cursor: "pointer", background: selectedPhone?.id === ph.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{ph.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--orange-soft)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{ph.number}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{ph.type}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 12 }}>{ph.user}</td>
                    <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{ph.source}</span></td>
                    <td><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{ph.caseId}</span></td>
                    <td><span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{ph.calls}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(255,106,0,0.12)", color: "var(--orange)" }}>
                        {ph.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedPhone && (
            <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,154,61,0.12)", border: "1.5px solid rgba(255,154,61,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={20} color="#FF9A3D" />
                </div>
                <button onClick={() => setSelectedPhone(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{selectedPhone.number}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>{selectedPhone.type} · Associate: {selectedPhone.user}</div>

              {[
                { label: "Associated Case", value: selectedPhone.caseId },
                { label: "Source Telemetry", value: selectedPhone.source },
                { label: "Intercept Status", value: selectedPhone.status },
                { label: "Call Records", value: `${selectedPhone.calls} logged calls` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate(`/network?entity=${encodeURIComponent(selectedPhone.number)}`)}
                >
                  <Network size={14} /> View Network
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VEHICLES TAB */}
      {tab === "vehicles" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedVehicle ? "1fr 360px" : "1fr", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Registration</th>
                  <th>Model / Description</th>
                  <th>Associated Suspect</th>
                  <th>Source Document</th>
                  <th>Sightings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vehiclesData.map(vh => (
                  <tr key={vh.id} onClick={() => setSelectedVehicle(selectedVehicle?.id === vh.id ? null : vh)} style={{ cursor: "pointer", background: selectedVehicle?.id === vh.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{vh.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#60A5FA", fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>{vh.reg}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-primary)" }}>{vh.type}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{vh.owner}</td>
                    <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{vh.source}</span></td>
                    <td><span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{vh.sightings}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(96,165,250,0.12)", color: "#60A5FA" }}>
                        {vh.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedVehicle && (
            <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(96,165,250,0.12)", border: "1.5px solid rgba(96,165,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Car size={20} color="#60A5FA" />
                </div>
                <button onClick={() => setSelectedVehicle(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{selectedVehicle.reg}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>{selectedVehicle.type}</div>

              {[
                { label: "Associated Suspect", value: selectedVehicle.owner },
                { label: "Related Case", value: selectedVehicle.caseId },
                { label: "Surveillance Record", value: selectedVehicle.source },
                { label: "Sightings Recorded", value: `${selectedVehicle.sightings} locations` },
                { label: "Current Status", value: selectedVehicle.status },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate(`/network?entity=${encodeURIComponent(selectedVehicle.reg)}`)}
                >
                  <Network size={14} /> View Network
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LOCATIONS TAB */}
      {tab === "locations" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedLocation ? "1fr 360px" : "1fr", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Location Name</th>
                  <th>Designation</th>
                  <th>Linked Persons</th>
                  <th>Source Document</th>
                  <th>Events</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {locationsData.map(loc => (
                  <tr key={loc.id} onClick={() => setSelectedLocation(selectedLocation?.id === loc.id ? null : loc)} style={{ cursor: "pointer", background: selectedLocation?.id === loc.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{loc.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{loc.name}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{loc.type}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{loc.linked}</td>
                    <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{loc.source}</span></td>
                    <td><span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{loc.events}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(255,92,108,0.12)", color: "#FF5C6C" }}>
                        {loc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLocation && (
            <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(96,165,250,0.12)", border: "1.5px solid rgba(96,165,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MapPin size={20} color="#60A5FA" />
                </div>
                <button onClick={() => setSelectedLocation(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedLocation.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>{selectedLocation.type}</div>

              {[
                { label: "Linked Operatives", value: selectedLocation.linked },
                { label: "Case Association", value: selectedLocation.caseId },
                { label: "Discovery Document", value: selectedLocation.source },
                { label: "Surveillance Hits", value: `${selectedLocation.events} events` },
                { label: "Priority Classification", value: selectedLocation.status },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate(`/network?entity=${encodeURIComponent(selectedLocation.name)}`)}
                >
                  <Network size={14} /> View Network
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORGANIZATIONS TAB */}
      {tab === "organizations" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedOrg ? "1fr 360px" : "1fr", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Entity Name</th>
                  <th>Corporate Designation</th>
                  <th>Known Signatories</th>
                  <th>Source Document</th>
                  <th>Estimated Flow</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orgsData.map(org => (
                  <tr key={org.id} onClick={() => setSelectedOrg(selectedOrg?.id === org.id ? null : org)} style={{ cursor: "pointer", background: selectedOrg?.id === org.id ? "var(--bg-elevated)" : undefined }}>
                    <td><span className="font-mono" style={{ fontSize: 10, color: "var(--text-muted)" }}>{org.id}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#4ADE80", fontSize: 13 }}>{org.name}</div>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{org.type}</td>
                    <td style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{org.directors}</td>
                    <td><span className="font-mono" style={{ fontSize: 11, color: "var(--text-secondary)" }}>{org.source}</span></td>
                    <td><span style={{ fontWeight: 600, color: "#FBBF24" }}>{org.turnover}</span></td>
                    <td>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "rgba(74,222,128,0.12)", color: "#4ADE80" }}>
                        {org.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedOrg && (
            <div className="card" style={{ padding: 20, animation: "fadeIn 0.2s ease-out", alignSelf: "flex-start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(74,222,128,0.12)", border: "1.5px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={20} color="#4ADE80" />
                </div>
                <button onClick={() => setSelectedOrg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{selectedOrg.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 14 }}>{selectedOrg.type}</div>

              {[
                { label: "Key Signatories", value: selectedOrg.directors },
                { label: "Case Association", value: selectedOrg.caseId },
                { label: "Evidence Source", value: selectedOrg.source },
                { label: "Identified Flow", value: selectedOrg.turnover },
                { label: "Operational Status", value: selectedOrg.status },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{value}</span>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  style={{ flex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  onClick={() => navigate(`/network?entity=${encodeURIComponent(selectedOrg.name)}`)}
                >
                  <Network size={14} /> View Network
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
