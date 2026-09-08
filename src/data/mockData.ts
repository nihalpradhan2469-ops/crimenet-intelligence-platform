export const metrics = {
  totalCases: 47,
  totalPersons: 312,
  totalRelationships: 893,
  highPriorityAlerts: 14,
  anomalies: 23,
  potentialLinks: 61,
};

export const cases = [
  { id: "CASE-2024-001", title: "Operation Silverline", type: "Organized Crime", date: "2024-01-12", location: "Mumbai", status: "Active", priority: "High", entities: 34, relationships: 87, updated: "2024-03-14" },
  { id: "CASE-2024-002", title: "Project Nexus", type: "Financial Fraud", date: "2024-01-28", location: "Delhi", status: "Active", priority: "Critical", entities: 21, relationships: 54, updated: "2024-03-13" },
  { id: "CASE-2024-003", title: "Operation Crossroads", type: "Drug Trafficking", date: "2024-02-05", location: "Kolkata", status: "Under Review", priority: "High", entities: 18, relationships: 43, updated: "2024-03-12" },
  { id: "CASE-2024-004", title: "Task Force Omega", type: "Cybercrime", date: "2024-02-14", location: "Bangalore", status: "Active", priority: "Medium", entities: 9, relationships: 22, updated: "2024-03-11" },
  { id: "CASE-2024-005", title: "Operation Sundarbans", type: "Human Trafficking", date: "2024-02-19", location: "West Bengal", status: "Closed", priority: "High", entities: 27, relationships: 68, updated: "2024-03-08" },
  { id: "CASE-2024-006", title: "Project Aravalli", type: "Arms Smuggling", date: "2024-02-25", location: "Rajasthan", status: "Active", priority: "Critical", entities: 15, relationships: 39, updated: "2024-03-14" },
  { id: "CASE-2024-007", title: "Operation Delta", type: "Money Laundering", date: "2024-03-01", location: "Chennai", status: "Under Review", priority: "Medium", entities: 11, relationships: 28, updated: "2024-03-10" },
  { id: "CASE-2024-008", title: "Task Force Indigo", type: "Extortion Network", date: "2024-03-06", location: "Pune", status: "Active", priority: "High", entities: 19, relationships: 47, updated: "2024-03-13" },
];

export const persons = [
  { id: "PRS-001", name: "Rahul Sharma", alias: "R. Sharma", age: 38, location: "Mumbai", cases: 3, connections: 17, phones: 2, vehicles: 1, centrality: 0.87, status: "Under Investigation", source: "FIR-014" },
  { id: "PRS-002", name: "Vikram Desai", alias: "VD", age: 45, location: "Delhi", cases: 2, connections: 12, phones: 3, vehicles: 2, centrality: 0.72, status: "Under Investigation", source: "CDR-021" },
  { id: "PRS-003", name: "Anita Kapoor", alias: "AK", age: 32, location: "Mumbai", cases: 1, connections: 8, phones: 1, vehicles: 0, centrality: 0.54, status: "Person of Interest", source: "TXN-087" },
  { id: "PRS-004", name: "Mohammed Raza", alias: "Raza", age: 41, location: "Kolkata", cases: 4, connections: 24, phones: 4, vehicles: 3, centrality: 0.93, status: "Under Investigation", source: "FIR-031" },
  { id: "PRS-005", name: "Priya Singh", alias: "PS", age: 29, location: "Delhi", cases: 1, connections: 6, phones: 1, vehicles: 1, centrality: 0.41, status: "Person of Interest", source: "CDR-045" },
  { id: "PRS-006", name: "Arjun Mehta", alias: "AJM", age: 52, location: "Bangalore", cases: 2, connections: 14, phones: 2, vehicles: 2, centrality: 0.68, status: "Under Investigation", source: "TXN-112" },
  { id: "PRS-007", name: "Suresh Nair", alias: "SN", age: 36, location: "Chennai", cases: 1, connections: 9, phones: 2, vehicles: 1, centrality: 0.49, status: "Person of Interest", source: "FIR-052" },
];

export const alerts = [
  { id: "ALT-001", severity: "critical", type: "Potential Link Detected", entity: "Rahul Sharma", reason: "Shared communication pattern with known associate", confidence: 84, timestamp: "2024-03-14 09:23", source: "CDR-021", status: "Open" },
  { id: "ALT-002", severity: "high", type: "Anomaly Detected", entity: "Mohammed Raza", reason: "Unusual transaction frequency — 3x baseline", confidence: 91, timestamp: "2024-03-14 08:47", source: "TXN-087", status: "Open" },
  { id: "ALT-003", severity: "high", type: "Network Change", entity: "CASE-2024-002", reason: "New entity connection discovered via graph expansion", confidence: 76, timestamp: "2024-03-14 07:15", source: "CDR-033", status: "Under Review" },
  { id: "ALT-004", severity: "medium", type: "Entity Match", entity: "Vikram Desai", reason: "Possible alias match: 'V. Desai' in FIR-031", confidence: 67, timestamp: "2024-03-13 22:41", source: "FIR-031", status: "Open" },
  { id: "ALT-005", severity: "medium", type: "Unusual Activity", entity: "Arjun Mehta", reason: "Location change to 4 distinct cities within 48 hours", confidence: 79, timestamp: "2024-03-13 18:30", source: "SURV-014", status: "Open" },
  { id: "ALT-006", severity: "low", type: "Potential Link", entity: "Priya Singh", reason: "Common location overlap with PRS-001 on 3 occasions", confidence: 52, timestamp: "2024-03-13 14:22", source: "CDR-047", status: "Dismissed" },
  { id: "ALT-007", severity: "critical", type: "High Priority", entity: "CASE-2024-006", reason: "New evidence record links to active case investigation", confidence: 88, timestamp: "2024-03-13 11:05", source: "FIR-061", status: "Open" },
  { id: "ALT-008", severity: "high", type: "Anomaly Detected", entity: "Suresh Nair", reason: "Communication burst — 47 calls in 90-minute window", confidence: 85, timestamp: "2024-03-12 23:18", source: "CDR-058", status: "Verified" },
];

export const evidence = [
  { id: "EVD-001", finding: "Potential relationship detected between PRS-001 and PRS-004", confidence: 84, sources: ["FIR-014", "CDR-021", "TXN-087"], signals: ["Shared contact", "Common location", "Repeated interaction"], timestamp: "2024-03-14 09:23", status: "Pending Review" },
  { id: "EVD-002", finding: "Anomalous transaction pattern suggesting financial structuring", confidence: 91, sources: ["TXN-087", "TXN-092", "TXN-101"], signals: ["Transaction frequency", "Amount threshold", "Timing pattern"], timestamp: "2024-03-14 08:47", status: "Under Review" },
  { id: "EVD-003", finding: "Possible alias resolution: Rahul Sharma ↔ R. Sharma in FIR-031", confidence: 67, sources: ["FIR-014", "FIR-031"], signals: ["Name similarity", "Phone match", "Location overlap"], timestamp: "2024-03-13 22:41", status: "Verified" },
  { id: "EVD-004", finding: "Network proximity: PRS-002 and PRS-004 share 3 common contacts", confidence: 76, sources: ["CDR-021", "CDR-033", "CDR-041"], signals: ["Graph proximity", "Shared contacts", "Temporal overlap"], timestamp: "2024-03-13 18:30", status: "Pending Review" },
  { id: "EVD-005", finding: "Location co-occurrence: PRS-001 and PRS-003 at same site on 3 dates", confidence: 79, sources: ["SURV-014", "SURV-019"], signals: ["Location match", "Time overlap", "Frequency"], timestamp: "2024-03-13 14:22", status: "Dismissed" },
];

export const networkActivityData = [
  { time: "00:00", events: 12 }, { time: "02:00", events: 8 }, { time: "04:00", events: 5 },
  { time: "06:00", events: 14 }, { time: "08:00", events: 31 }, { time: "10:00", events: 47 },
  { time: "12:00", events: 38 }, { time: "14:00", events: 52 }, { time: "16:00", events: 43 },
  { time: "18:00", events: 35 }, { time: "20:00", events: 28 }, { time: "22:00", events: 19 },
];

export const casesOverTimeData = [
  { month: "Oct", cases: 6 }, { month: "Nov", cases: 8 }, { month: "Dec", cases: 11 },
  { month: "Jan", cases: 9 }, { month: "Feb", cases: 14 }, { month: "Mar", cases: 12 },
];

export const alertSeverityData = [
  { name: "Critical", value: 4, color: "#FF5C6C" },
  { name: "High", value: 6, color: "#7C5CFF" },
  { name: "Medium", value: 7, color: "#FBBF24" },
  { name: "Low", value: 3, color: "#686576" },
];

export const entityDistributionData = [
  { name: "Persons", value: 312 },
  { name: "Phones", value: 241 },
  { name: "Locations", value: 189 },
  { name: "Vehicles", value: 97 },
  { name: "Organizations", value: 64 },
  { name: "Events", value: 134 },
];

export const auditLogs = [
  { id: "LOG-001", user: "Insp. Verma", action: "Upload", record: "FIR-014.pdf", timestamp: "2024-03-14 09:12", status: "Success" },
  { id: "LOG-002", user: "Insp. Verma", action: "AI Finding", record: "EVD-001", timestamp: "2024-03-14 09:23", status: "Success" },
  { id: "LOG-003", user: "SI Sharma", action: "Review", record: "ALT-001", timestamp: "2024-03-14 09:31", status: "Success" },
  { id: "LOG-004", user: "SI Sharma", action: "Verify", record: "EVD-003", timestamp: "2024-03-14 10:02", status: "Success" },
  { id: "LOG-005", user: "Insp. Verma", action: "Upload", record: "CDR-021.csv", timestamp: "2024-03-14 10:14", status: "Success" },
  { id: "LOG-006", user: "DC Kumar", action: "Login", record: "System", timestamp: "2024-03-14 10:45", status: "Success" },
  { id: "LOG-007", user: "SI Sharma", action: "Dismiss", record: "ALT-006", timestamp: "2024-03-14 11:00", status: "Success" },
  { id: "LOG-008", user: "DC Kumar", action: "Entity Creation", record: "PRS-007", timestamp: "2024-03-14 11:22", status: "Success" },
  { id: "LOG-009", user: "Insp. Verma", action: "AI Finding", record: "EVD-004", timestamp: "2024-03-14 11:45", status: "Success" },
  { id: "LOG-010", user: "DC Kumar", action: "Data Processing", record: "TXN-087.json", timestamp: "2024-03-14 12:03", status: "Processing" },
];

export const investigations = [
  { id: "INV-001", caseId: "CASE-2024-001", title: "Communication Network Analysis - Silverline", lead: "Insp. Verma", status: "Active", entities: 12, leads: 8, started: "2024-02-01", updated: "2024-03-14" },
  { id: "INV-002", caseId: "CASE-2024-002", title: "Financial Flow Tracing - Nexus", lead: "SI Sharma", status: "Active", entities: 9, leads: 5, started: "2024-02-10", updated: "2024-03-13" },
  { id: "INV-003", caseId: "CASE-2024-003", title: "Supply Chain Mapping - Crossroads", lead: "DC Kumar", status: "Paused", entities: 7, leads: 3, started: "2024-02-20", updated: "2024-03-10" },
  { id: "INV-004", caseId: "CASE-2024-006", title: "Cross-border Routes - Aravalli", lead: "Insp. Verma", status: "Active", entities: 14, leads: 11, started: "2024-03-01", updated: "2024-03-14" },
];

export const dataSources = [
  { id: "DS-001", name: "FIR-014.pdf", type: "FIR", case: "CASE-2024-001", size: "2.3 MB", status: "Processed", entities: 8, uploaded: "2024-03-14 09:12" },
  { id: "DS-002", name: "CDR-021.csv", type: "CDR", case: "CASE-2024-001", size: "14.7 MB", status: "Processed", entities: 14, uploaded: "2024-03-14 10:14" },
  { id: "DS-003", name: "TXN-087.json", type: "Transactions", case: "CASE-2024-002", size: "8.2 MB", status: "Processing", entities: 0, uploaded: "2024-03-14 12:03" },
  { id: "DS-004", name: "SURV-014.pdf", type: "Surveillance", case: "CASE-2024-002", size: "5.1 MB", status: "Processed", entities: 6, uploaded: "2024-03-13 16:40" },
  { id: "DS-005", name: "FIR-031.pdf", type: "FIR", case: "CASE-2024-004", size: "1.9 MB", status: "Processed", entities: 5, uploaded: "2024-03-13 11:22" },
  { id: "DS-006", name: "INT-009.txt", type: "Intel Report", case: "CASE-2024-006", size: "0.4 MB", status: "Queued", entities: 0, uploaded: "2024-03-14 13:11" },
];

export const analyticsData = {
  entityGrowth: [
    { month: "Oct", persons: 180, phones: 140, locations: 110 },
    { month: "Nov", persons: 210, phones: 168, locations: 128 },
    { month: "Dec", persons: 248, phones: 192, locations: 152 },
    { month: "Jan", persons: 270, phones: 210, locations: 165 },
    { month: "Feb", persons: 295, phones: 228, locations: 178 },
    { month: "Mar", persons: 312, phones: 241, locations: 189 },
  ],
  alertTrends: [
    { month: "Oct", critical: 2, high: 4, medium: 6 },
    { month: "Nov", critical: 3, high: 5, medium: 5 },
    { month: "Dec", critical: 4, high: 7, medium: 8 },
    { month: "Jan", critical: 3, high: 6, medium: 9 },
    { month: "Feb", critical: 5, high: 8, medium: 7 },
    { month: "Mar", critical: 4, high: 6, medium: 7 },
  ],
  topCentralNodes: [
    { name: "Mohammed Raza", score: 0.93, connections: 24 },
    { name: "Rahul Sharma", score: 0.87, connections: 17 },
    { name: "Vikram Desai", score: 0.72, connections: 12 },
    { name: "Arjun Mehta", score: 0.68, connections: 14 },
    { name: "Suresh Nair", score: 0.49, connections: 9 },
  ],
};
