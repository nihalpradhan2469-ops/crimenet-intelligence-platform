# 🛡️ CRIMENET — Master System Architecture & Functional Specification

**AI-Powered Criminal Network Analysis & Intelligence System**

---

## 🧭 Executive Summary & System Flow

CRIMENET is an end-to-end criminal intelligence platform engineered for law enforcement agencies, investigative branches, and intelligence analysts. Rather than simply serving as a visual dashboard, CRIMENET ingests fragmented, multi-source raw records (FIRs, CDRs, banking transactions, ANPR surveillance, vehicle registers, and field reports), standardizes the data, extracts entities and relationships, computes mathematical graph topologies using NetworkX, flags behavioral anomalies with machine learning, and produces non-hallucinatory, evidence-backed investigative dossiers for human officers.

```text
DATA SOURCES (FIR, CDR, Transactions, Vehicles, Movements, etc.)
    ↓
DATA INGESTION (CSV, JSON, PDF / Unstructured Text)
    ↓
DATA CLEANING & NORMALIZATION (Standardized Timestamps, Deduplication)
    ↓
NLP / TEXT PROCESSING (Sentence Tokenization & Syntax Parsing)
    ↓
NER — NAMED ENTITY RECOGNITION (PERSON, LOCATION, VEHICLE, ORG, PHONE, CASE, EVENT, TRANSACTION)
    ↓
ENTITY RESOLUTION (Fuzzy Matching, Similarity Scoring, Non-Authoritative Flag)
    ↓
RELATIONSHIP EXTRACTION (CALLED, SENT MONEY, OWNS, MOVED TO, ASSOCIATED WITH, OCCURRED AT)
    ↓
GRAPH DATABASE / POSTGRESQL (Supabase Live Relational Graph)
    ↓
GRAPH ANALYTICS (NetworkX Engine: Degree, Betweenness, Closeness, Connected Components)
    ↓
ANOMALY DETECTION (Isolation Forest, Burstiness, Nocturnal Surge, Location Hop)
    ↓
LLM INTELLIGENCE (Structured Grounding, Zero Hallucination, Explainable Briefings)
    ↓
INVESTIGATION DOSSIER (Complete 360° Suspect Profile & Multi-Modal Intelligence)
    ↓
INVESTIGATION TIMELINE (Unified Chronological Sequence)
    ↓
ALERTS + EVIDENCE PROVENANCE (Traceable Evidence IDs + SHA-256 Integrity Hashes)
    ↓
RECOMMENDED INVESTIGATION LEADS (High Priority, Medium Priority, Potential Link, Verify)
    ↓
HUMAN INVESTIGATOR (Final Operational Decision)
```

---

# 1. 📥 Data Sources

The platform is architected to ingest data from heterogeneous operational feeds:

### Supported Sources
* **FIR (First Information Reports):** Incident text, offenses, suspects, co-accused, reporting stations.
* **CDR (Call Detail Records):** Caller MSISDN, Receiver MSISDN, timestamp, call duration, cell-tower geocodes.
* **Transaction Records:** Financial transfers, banking channels (NEFT, RTGS, IMPS, UPI, Cash), transaction amounts in INR, counterparty accounts.
* **Police Reports & Diary Entries:** Daily station log books, general diary notes, interrogation summaries.
* **Intelligence Reports:** Field informant dispatches, classified intelligence briefs.
* **Surveillance Records:** Automated Number Plate Recognition (ANPR) logs, toll plaza camera captures.
* **Vehicle Records:** Regional Transport Office (RTO) vehicle registrations, engine/chassis numbers, owner IDs.
* **Location / Movement Records:** Monitored transit checkpoints, precinct boundaries, GPS breadcrumbs.
* **Social-Media Intelligence:** Public OSINT records lawfully obtained.
* **Case Records:** Official case numbers, penal code sections (IPC/BNS), court docket references.

### Ingestion Service Functions
* **Upload CSV:** Batch ingestion pipelines with schema validation.
* **Upload JSON:** RESTful payload ingestion with structured nested records.
* **Upload PDF / Document:** Automated text extraction from digital police case files.
* **Import Structured Data:** Direct ETL pipeline from police database dumps.
* **Data-Source Status & Telemetry:** Ingestion health, records processed, error logs.
* **Record Count:** Live counter across all relational tables.
* **Last Synchronization:** High-precision ISO-8601 UTC timestamp of last import.
* **Import History & Audit Log:** Traceability of ingestion operations.
* **Failed-Record Quarantined Report:** Dead-letter queue isolating malformed records.

### Active Synthetic Dataset (26,645 Records Live in Supabase):
```text
├── persons.csv        (507 records: Suspect names, aliases, cities, threat levels)
├── vehicles.csv       (350 records: Registration plates, models, owners)
├── locations.csv      (80 records: Cities, precincts, coordinates)
├── cdr.csv            (6,000 records: Call logs, durations, cell towers)
├── firs.csv           (1,000 records: Narrative texts, penal sections, accused)
├── movements.csv      (4,500 records: Vehicle checkpoint sightings)
├── relationships.csv  (10,000 records: Multi-modal graph relational edges)
├── transactions.csv   (3,000 records: Financial transfers in INR)
└── alerts.csv         (1,208 records: Automated intelligence threat alerts)
```

---

# 2. 🧹 Data Cleaning & Normalization

Raw operational data is frequently noisy, inconsistent, and fragmented. Data never enters the primary graph without strict cleansing:

### Cleansing Rules
* **Duplicate Record Detection:** Composite key hashing across unique record attributes.
* **Missing Value Imputation:** Graceful flagging of incomplete fields without data corruption.
* **Date / Time Standardization:** All dates and timestamps converted into standardized ISO-8601 UTC format (`YYYY-MM-DDTHH:MM:SSZ`).
* **Identifier Validation:** Validation of national IDs, phone numbers (E.164 standard), and vehicle registration formats.
* **Name Normalization:** Removal of honorifics, whitespace stripping, and canonical casing.
* **Location Name Normalization:** Mapping colloquial police station/checkpoint names to canonical geocodes.
* **Relationship Type Normalization:** Standardizing edge semantics (e.g., `"called"`, `"phone_call"`, `"outgoing"` ➔ `CALLED`).
* **Invalid Record Quarantine:** Malformed records redirected to inspection log.

### Identity Disambiguation Example:
```text
"Rahul Sharma"
"RAHUL SHARMA"
"Rahul S."
```
> **Human-in-the-Loop Constraint:** The system automatically flags these as potential duplicate identities with a similarity score, but **the final identity merging requires explicit investigator confirmation**.

---

# 3. 🤖 NLP — Natural Language Processing

Unstructured police text (FIRs, general diaries, interrogation transcripts) contains critical network intelligence.

### Processing Pipeline:
```text
Raw Narrative Text
        ↓
Text Normalization & Cleansing
        ↓
Sentence Tokenization & Chunking
        ↓
Syntactic Dependency Parsing (Subject - Verb - Object)
        ↓
Entity Identification (Spans & Categories)
        ↓
Relational Triple Extraction
```

### Operational Example:
> *"Investigators noted repeated interaction between Aditya Joshi and Ravi Mehta in Jabalpur."*

The NLP engine decomposes this sentence into:
* **Subject:** `Aditya Joshi` [PERSON]
* **Predicate:** `repeated interaction` [INTERACTION / RELATIONSHIP]
* **Object:** `Ravi Mehta` [PERSON]
* **Location Context:** `Jabalpur` [LOCATION]

---

# 4. 🏷️ NER — Named Entity Recognition

Dedicated NER models extract structured entities from unstructured narratives:

### Extracted Entity Archetypes:
* `PERSON`: Suspects, co-accused, witnesses, aliases.
* `LOCATION`: Cities, precincts, street landmarks, transit points.
* `VEHICLE`: License plates, vehicle make/model.
* `ORGANIZATION`: Front corporations, syndicates, banking institutions.
* `PHONE`: 10-digit mobile numbers, IMEI, IMSI codes.
* `CASE`: FIR numbers, case files, court dockets.
* `EVENT`: Meetings, contraband transfers, observed dates.
* `TRANSACTION`: Monetary sums in INR (₹, Lakhs, Crores).

### Concrete Example:
```text
"Rahul met Amit in Bhopal."

Rahul   → PERSON
Amit    → PERSON
Bhopal  → LOCATION
Edge    → Rahul [ASSOCIATED_WITH] Amit (Context: Bhopal)
```

---

# 5. 🔗 Entity Resolution (Identity Matching)

Resolves disparate entity representations across multiple independent files into a unified candidate pool without destructive automatic merges.

### Matching Methodology:
* **Levenshtein Distance & Jaro-Winkler Similarity:** Character-level phonetic alignment.
* **Token Overlap Scoring:** Handles abbreviated surnames and transposed first/last names.
* **Attribute Correlation:** Cross-referencing shared mobile numbers, vehicle ownership, or precinct locations.

```text
Record A: "Rahul Sharma"
Record B: "Rahul S."

Similarity Score: 0.91 (91%)
Confidence Status: Requires Verification
Policy: Identity similarity score is an analytical lead and does not constitute judicial proof of identity.
```

---

# 6. 🔗 Relationship Extraction

Synthesizes typed, directed graph edges connecting resolved entities across data streams:

```text
PERSON  ──[CALLED]───────────► PERSON     (Source: CDR records)
PERSON  ──[SENT_MONEY]───────► PERSON     (Source: Bank transactions)
PERSON  ──[OWNS]─────────────► VEHICLE    (Source: RTO vehicle registers)
VEHICLE ──[MOVED_TO]─────────► LOCATION   (Source: ANPR surveillance movements)
PERSON  ──[ASSOCIATED_WITH]──► FIR        (Source: Police FIR records)
FIR     ──[OCCURRED_AT]──────► LOCATION   (Source: Precinct incident geocodes)
```

---

# 7. 🕸️ Network Graph Canvas

The primary situational awareness interface for analysts, rendering topologies dynamically from the Supabase relational database.

### Node Archetypes:
* **Person:** Suspects, couriers, financiers, syndicate leads.
* **Vehicle:** Monitored transport assets.
* **Location:** Transit points, safehouses, incident scenes.
* **FIR / Case:** Official registered cases.
* **Transaction:** High-value monetary conduits.
* **Phone:** MSISDN endpoints when physical CDR numbers exist.
* **Organization:** Front businesses, criminal syndicates.
* **Event:** Intercepts, raids, coordinated meetings.

### Interactive Graph Capabilities:
* **Fluid Zoom & Pan:** Smooth navigational canvas.
* **Search & Highlight:** Instant lookup by Suspect ID, Name, or Vehicle.
* **Type-Based Filtering:** Toggle visibility of Persons, Vehicles, Locations, or Transactions.
* **Reset & Center Canvas:** Re-align camera to graph center of mass.
* **Expand Connections:** Dynamically query and reveal degree-$k$ neighbors.
* **Node & Edge Inspection:** Detailed side-drawer display of edge weights, relationship types, confidence scores, and raw evidence provenance.
* **Hide Unrelated Nodes:** Focus mode isolating selected subgraphs.

---

# 8. 📊 Graph Analytics (NetworkX Engine)

Mathematical network analysis executed via Python's **NetworkX** library:

### 1. Degree Centrality
Measures the number of direct edges incident upon a node.
$$\text{Centrality}_{deg}(v) = \frac{\text{deg}(v)}{|V| - 1}$$
*Identifies primary structural hubs, high-frequency callers, and broad-contact financiers.*

### 2. Betweenness Centrality (Brandes Algorithm)
Quantifies the frequency with which a node falls along the shortest path between all pairs of nodes.
$$C_B(v) = \sum_{s \neq v \neq t} \frac{\sigma_{st}(v)}{\sigma_{st}}$$
*Exposes critical syndicate bridges and brokers who connect otherwise isolated criminal cells.*

### 3. Closeness Centrality
Calculates the reciprocal of the sum of the shortest path distances from a node to all other reachable nodes.
$$C(v) = \frac{|V| - 1}{\sum_{u \neq v} d(v, u)}$$
*Identifies entities capable of rapidly propagating information or resources across the syndicate.*

### 4. Connected Components
Decomposes the global graph into isolated sub-graphs ($G_1, G_2, \dots, G_k$).
*Isolates distinct gangs, independent operational syndicates, and disconnected cells.*

---

# 9. 🚨 Anomaly Detection

Identifies statistical and behavioral outliers from established baseline distributions:

### Monitored Anomaly Patterns:
* **Transaction Velocity / Burstiness:** Baseline of 3 transactions/month surging to 25 transactions/week.
* **Telecommunication Surges:** Unprecedented spikes in CDR call frequency or nocturnal calling windows (01:00 AM – 04:30 AM).
* **Rapid Spatiotemporal Movement:** Vehicles crossing multiple geographically disparate ANPR toll checkpoints within an impossibly narrow temporal interval.
* **Unsupervised Modeling:** **Isolation Forest** algorithms isolating multi-dimensional feature outliers.

```text
CRITICAL PRINCIPLE:
Anomaly ≠ Crime
All anomalies are analytical leads flagged for investigator verification.
```

---

# 10. 🧠 LLM — Large Language Model Intelligence

Translates complex graph topologies, mathematical centrality rankings, and multi-source anomalies into clear, concise, human-readable intelligence summaries.

### Anti-Hallucination Guardrails:
* **Strict Grounded Injection:** The LLM prompt is populated exclusively with structured, verified facts (verified IDs, exact transaction totals, confirmed CDR counts).
* **Zero Fact Invention:** The model is prohibited from inferring unverified crimes, motivations, or associations.
* **Structured Output:** Generates executive summaries, structural syndicate assessments, and actionable recommendations.

---

# 11. 🔎 Investigation Dossier

The central intelligence artifact generated whenever an investigator selects a suspect.

### Dossier Contents:
1. **Entity Profile:** Suspect name, canonical ID, verified aliases, registered city, jurisdiction.
2. **Communication Profile:** Total CDR count, frequent counterparties, call durations, off-hours interactions.
3. **Financial Dossier:** Senders, recipients, total transfer volume in INR, transaction channels.
4. **FIR & Legal History:** FIR numbers, offense descriptions, co-accused rosters.
5. **Vehicle Fleet:** Registered vehicles, license plates, vehicle classifications.
6. **Spatio-Temporal Movements:** ANPR surveillance sightings, checkpoint locations, movement timestamps.
7. **Network Relationships:** Explicitly mapped graph connections with evidentiary backing.
8. **Intelligence Alerts:** Active rule-based and ML-generated threat alerts.

---

# 12. 🕐 Investigation Chronological Timeline

A unified chronological sequence interleaving all multimodal events into an unbroken timeline of activity:

```text
24 Aug 2026, 10:15 ──► FIR Recorded (FIR-00051 filed naming suspect)
26 Aug 2026, 23:42 ──► CDR Telecommunication (Outgoing call to P0136; 480s duration)
28 Aug 2026, 14:20 ──► Vehicle Movement (Vehicle MP09AB1234 spotted at Checkpoint L012)
30 Aug 2026, 16:05 ──► Financial Transfer (₹1,50,000 sent to P0383 via RTGS)
01 Sep 2026, 09:30 ──► Threat Alert Triggered (Transaction Burst & Nocturnal Call Spike)
```

---

# 13. 🚨 Alert & Early Warning System

Continuous background evaluation flagging high-risk analytical conditions:

### Alert Categories:
* `HIGH_CENTRALITY_HUB`: Entity surpasses top 5th percentile of direct network connections.
* `TRANSACTION_BURST`: High financial turnover within narrow timeframes.
* `COMMUNICATION_SPIKE`: Severe surges in telecommunication volume.
* `NOCTURNAL_CALL_PATTERN`: Concentrated calling during off-hours.
* `RAPID_LOCATION_HOP`: High-velocity geographic transit between surveillance checkpoints.

### Alert Lifecyle Statuses:
* `New` ➔ `Under Review` ➔ `Verified` ➔ `Dismissed`

---

# 14. 🧾 Evidence Management & Chain of Custody

Every analytical finding is explicitly tied to immutable evidentiary provenance:

```text
Finding: Potential syndicate link detected between P0152 and P0136
Source Exhibits:
  ├── CDR Record: C03632 (Recorded at 2026-08-26 23:42 UTC)
  ├── FIR Record: F00051 (Filed at Police Precinct 04)
  └── Cryptographic Hash: SHA-256 (3a7b9c...f4e1)
```

### Functions:
* View source exhibits.
* Evidence ID cross-referencing.
* Verification status tracking.
* Complete chain-of-custody audit history.

---

# 15. 📈 Analytics Dashboard

Reflects true live database values (no hardcoded mock metrics):

### Live Supabase Counters:
* **Total Entities:** 507 Suspects
* **Total Relationships:** 10,000 Network Edges
* **Total FIRs:** 1,000 Case Records
* **Total CDR Records:** 6,000 Telecommunication Logs
* **Total Transactions:** 3,000 Financial Transfers
* **Total Vehicles:** 350 Registered Vehicles
* **Total Locations:** 80 Geographic Nodes
* **Total Alerts:** 1,208 Intelligence Flags

### Analytical Visualizations:
* Network Growth & Topology Density.
* Relationship Type Distribution (Calls vs. Money vs. FIRs).
* Alert Severity Breakdown (Critical, High, Medium, Low).
* Transaction Velocity Trends over Time.
* Geographic Checkpoint Heatmaps.

---

# 16. 🔍 Global Multimodal Search

A single unified search bar capable of indexing and routing across:
* **Person ID** (`P0152`, `PRS-001`)
* **Suspect Name / Alias** (`Sameer Sethi`, `Sam`)
* **Vehicle Registration** (`MP09AB1234`)
* **FIR / Case ID** (`FIR-00051`)
* **Transaction ID** (`T02456`)
* **Location Name** (`Bhopal`, `MP Nagar`)
* **Relationship ID** (`R000001`)

```text
Search: P0152
       ↓
Person Profile ──► Connections ──► FIRs ──► Transactions ──► Graph ──► Investigation Dossier
```

---

# 17. 🗃️ Case Management

Dedicated case management views:
* Case / FIR Docket Number.
* Reporting Station & Incident Date.
* Primary Suspects & Co-Accused Entities.
* Related Evidence Exhibits.
* Focused Subgraph for Case Investigation.
* Comprehensive Case Dossier Export.

---

# 18. 👤 Entity Management

Directory classifying all cataloged objects into distinct categories:
* `Persons`
* `Vehicles`
* `Locations`
* `Cases`
* `Transactions`
* `Organizations`
* `Events`

Selecting any entity opens its dedicated profile, connection sub-graph, chronological timeline, evidentiary provenance, and alert history.

---

# 19. 🧩 Hidden / Potential Links

Pathfinding and link prediction algorithms identifying non-obvious associations:

### Triadic Closure:
```text
Entity A ──[COMMUNICATES WITH]──► Entity B
Entity C ──[COMMUNICATES WITH]──► Entity B
            ↓
System Flags: Potential Indirect Link between Entity A and Entity C
```

### Shared Asset / Geo Overlap:
```text
Person A ──► Owns Vehicle V1 ──► Observed at Location L1
Person B ──► Spotted in FIR at Location L1 at identical timestamp
            ↓
System Flags: Potential Association via Shared Spatiotemporal Overlap
```
> **Policy:** `Potential Link ≠ Confirmed Relationship`. Flagged as an analytical lead for verification.

---

# 20. 🔐 Enterprise Security Architecture

* **Role-Based Access Control (RBAC):** Restricts dossier editing to authorized officers.
* **Environment Variable Isolation:** Database URLs and API tokens isolated via `.env`.
* **Zero Frontend Secrets:** No `service_role` or administrative credentials exposed in client bundles.
* **Supabase Row-Level Security (RLS):** Database-level access policies.
* **HTTPS / TLS 1.3:** Mandatory transport layer security.

---

# 21. ⛓️ Blockchain / Evidence Integrity Layer

Maintains cryptographic chain-of-custody integrity to prevent evidence tampering:

```text
Raw Evidence Record (FIR / CDR / Transaction)
        ↓
Cryptographic SHA-256 Hashing
        ↓
Immutable Ledger / Blockchain Audit Entry
        ↓
Timestamped Digest + Evidence ID
```
*Any unauthorized database modification alters the recalculation hash, immediately raising a `TAMPER_DETECTED` alert.*

---

# 22. 📜 Complete Audit Logging

Every critical investigative action is logged for judicial compliance:

```text
Timestamp:   2026-09-08 19:05:12 UTC
User:        Investigator IO-402
Action:      OPENED_INVESTIGATION_DOSSIER
Entity ID:   P0152 (Sameer Sethi)
Result:      SUCCESS (Generated Actionable Intelligence Dossier)
Audit Hash:  SHA-256 (e4b2...99a1)
```

---

# 23. 🧑💼 Human-in-the-Loop Philosophy

CRIMENET is strictly an **Investigative Decision-Support Tool**.

```text
The system NEVER outputs:
❌ "Person is guilty."
❌ "Person is a confirmed criminal."

The system EXCLUSIVELY outputs:
✅ "Potential Link Detected"
✅ "Analytical Lead"
✅ "Anomalous Behavioral Pattern"
✅ "Requires Verification"
```
**Final decisions, arrests, and legal actions remain strictly within the human officer's authority.**

---

# 24. ⚙️ Backend API Architecture

FastAPI microservice endpoints powering all platform functions:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service liveness health check |
| `GET` | `/health/supabase` | Supabase database connection and schema check |
| `GET` | `/api/test/database` | Live counts across all 9 synthetic tables |
| `GET` | `/api/persons` | Paginated suspect directory with search |
| `GET` | `/api/persons/{id}` | Single person profile |
| `GET` | `/api/persons/{id}/vehicles` | Registered vehicles for suspect |
| `GET` | `/api/persons/{id}/cdr` | Call detail records for suspect |
| `GET` | `/api/persons/{id}/transactions` | Financial transactions for suspect |
| `GET` | `/api/persons/{id}/firs` | FIRs naming suspect |
| `GET` | `/api/persons/{id}/movements` | ANPR surveillance vehicle movements |
| `GET` | `/api/persons/{id}/relationships` | Graph relationships for suspect |
| `GET` | `/api/persons/{id}/alerts` | Flagged threat alerts for suspect |
| `GET` | `/api/persons/{id}/dossier` | Complete raw dossier from Supabase |
| `GET` | `/api/graph` | Global network graph topology with NetworkX centralities |
| `GET` | `/api/graph/{entity_id}` | Ego-network subgraph centered on target entity |
| `GET` | `/api/investigations/{entity_id}` | Actionable Investigation Intelligence Dossier |
| `GET` | `/api/entities/{id}/connections` | Unified entity connections & key counterparties |
| `GET` | `/api/entities/{id}/timeline` | Chronological multi-source investigation timeline |
| `GET` | `/api/entities/{id}/evidence` | Evidence provenance catalog with SHA-256 hashes |
| `GET` | `/api/alerts` | Paginated system threat alerts with severity filtering |
| `GET` | `/api/cases` | Active cases and FIR directory |
| `POST`| `/api/ingestion` | Ingest batch records with cryptographic receipt |
| `POST`| `/api/nlp/extract` | NLP / NER text extraction for entities & relationships |
| `POST`| `/api/entity-resolution` | Entity matching with similarity confidence scores |
| `POST`| `/api/anomaly-detection` | Multi-factor anomaly scoring (burstiness & surges) |
| `POST`| `/api/llm/explain` | Grounded, non-hallucinatory LLM intelligence summary |

---

# 25. 🧠 Complete AI Pipeline

The operational intelligence engine orchestrates multiple specialized AI and mathematical models:

```text
FIR / Unstructured Reports
        ↓
Natural Language Processing (Tokenization & Dependency Parsing)
        ↓
Named Entity Recognition (PERSON, LOCATION, VEHICLE, ORG, PHONE, CASE, EVENT, TRANSACTION)
        ↓
Entity Extraction & Canonicalization
        ↓
Entity Resolution (Levenshtein & Token Overlap Similarity)
        ↓
Relationship Extraction (CALLED, SENT MONEY, OWNS, MOVED TO, ASSOCIATED WITH)
        ↓
NetworkX Graph Construction
        ↓
Centrality Analysis (Degree, Betweenness, Closeness)
        ↓
Anomaly Detection (Isolation Forest & Multi-Channel Burstiness)
        ↓
Potential Link Inference (Triadic Closure & Asset Overlap)
        ↓
LLM Grounded Synthesis (Strict Fact Injection)
        ↓
Human-Readable Investigation Dossier
        ↓
Human Investigator Verification & Operational Action
```

---

# 🗺️ Implementation Priority Roadmap

To maintain architectural rigor, implementation follows seven phases:

* **Phase 1 — Backend Foundation (COMPLETED):**
  * Supabase PostgreSQL schema established.
  * 26,645 synthetic records ingested across 9 tables.
  * Live connectivity verified with `/api/test/database`.
* **Phase 2 — Investigation Intelligence (COMPLETED):**
  * `/api/investigations/{entity_id}` generating complete dossiers.
  * Unified chronological timeline cross-referencing FIRs, CDRs, Transactions, and Movements.
* **Phase 3 — NetworkX Graph Analytics (COMPLETED):**
  * Direct Supabase-to-NetworkX graph topology construction.
  * Degree, Betweenness, and Closeness centralities computed live.
  * Global graph (`/api/graph`) and ego-subgraph (`/api/graph/{id}`) endpoints active.
* **Phase 4 — NLP & NER Engine (COMPLETED):**
  * `/api/nlp/extract` extracting structured entities and relational triples from free text.
* **Phase 5 — Anomaly Detection & ML (COMPLETED):**
  * `/api/anomaly-detection` evaluating transaction bursts, communication spikes, and nocturnal patterns.
* **Phase 6 — Grounded LLM Intelligence (COMPLETED):**
  * `/api/llm/explain` synthesizing structured metrics into explainable briefings.
* **Phase 7 — Security, Blockchain & Evidence Integrity (COMPLETED):**
  * SHA-256 cryptographic provenance hashing on evidence records.
  * Tamper-evident verification and audit logging.

---

# 🎯 Final Output for Investigator: Actionable Intelligence Dossier

The core value delivered to an investigating officer is not raw tabular data, but an **Actionable Investigation Intelligence Dossier**:

```text
                CRIMENET
        INVESTIGATION INTELLIGENCE
                 ↓
          SELECTED ENTITY
                 ↓
    ┌───────────────────────────┐
    │ 1. Entity Profile         │
    │ 2. Network Connections    │
    │ 3. Chronological Timeline │
    │ 4. Key Relationships      │
    │ 5. Anomalies Detected     │
    │ 6. Potential Links        │
    │ 7. Evidence Provenance    │
    │ 8. Grounded AI Summary    │
    │ 9. Risk & Priority Tier   │
    └───────────────────────────┘
                 ↓
       RECOMMENDED LEADS
   (High, Medium, Potential, Verify)
                 ↓
       INVESTIGATOR DECISION
```

---

### Concrete Walkthrough: Suspect P0152 (Sameer Sethi)

When an officer investigates **Entity P0152**, CRIMENET synthesizes:

#### 1. Entity Profile
* **Name:** Sameer Sethi
* **Entity ID:** `P0152`
* **Alias:** Sam
* **City:** Indore
* **Associated Vehicles:** `MP09AB1234` (SUV)

#### 2. Network Summary
* **Connected Entities:** 34 distinct nodes across telecommunications, financial transfers, and official case filings.
* **Total Relationships:** 34 active graph links.

#### 3. Key Connections
* **Telecommunications:** Frequent call exchanges with Entity `P0136` (Ravi Mehta).
* **Financial:** Significant transfer counterparty: Entity `P0383` (Aditya Joshi).
* **FIR Association:** Named jointly with co-accused suspects.

#### 4. Unified Timeline
* Chronological sequence assembling FIR registration, high-duration CDR calls, ANPR surveillance movements, and bank transfers.

#### 5. Graph Analytics (NetworkX)
* **Degree Centrality:** High ($0.85$ score; structural syndicate hub).
* **Betweenness Centrality:** High (acts as broker between disconnected regional cells).
* **Closeness Centrality:** High (rapid information distribution capability).

#### 6. Detected Anomalies
* **Transaction Burst:** Unusually high financial transfer volume.
* **Communication Surge:** Elevated CDR frequency.
* **Nocturnal Activity:** Repeated calls placed between 01:00 AM and 04:30 AM.

#### 7. Potential Links
* Inferred indirect syndicate connection to Entity `P0383` via mutual intermediary `P0136`.
* Shared vehicle movement patterns detected at monitored highway checkpoint.

#### 8. Evidence Provenance
* `CDR Record: C03632`
* `Transaction ID: T02456`
* `FIR Docket: F00051`
* `Vehicle Record: V0282`
* `Cryptographic Proof: SHA-256 Digest Anchored`

#### 9. Grounded AI Summary
> *"Entity P0152 (Sameer Sethi) demonstrates active connectivity with 34 identified entities across telecommunications, financial transfers, and official case filings. Network centrality analysis classifies this entity in the HIGH degree centrality tier with HIGH betweenness. 3 analytical alerts have been flagged, including anomalies in communication and transaction patterns. These findings are analytical leads generated from multi-source cross-referencing and require human investigator verification."*

---

## ⚡ Recommended Investigation Leads (Actionable Output)

The pinnacle of CRIMENET's intelligence delivery:

```text
🔴 HIGH PRIORITY
→ Verify repeated telecommunication link with Entity P0136 (48 calls recorded).
  [Evidence Exhibit: CDR-C03632]

🔴 HIGH PRIORITY
→ Subpoena transaction ledger for Entity P0383 (₹1,50,000 transferred via RTGS).
  [Evidence Exhibit: TXN-T02456]

🟡 MEDIUM PRIORITY
→ Cross-examine statements in FIR F00051 regarding named co-accused suspects.
  [Evidence Exhibit: FIR-F00051]

🔵 POTENTIAL LINK
→ Investigate indirect connection with Entity P0383 via intermediary P0136.
  [Evidence Exhibit: Inferred Syndicate Pathway]

🟢 REQUIRES VERIFICATION
→ Verify physical custody of vehicle MP09AB1234 during surveillance movements.
  [Evidence Exhibit: VEH-V0282]
```

---

## 🌟 Core Value Proposition (SIH Pitch)

> **“CRIMENET converts fragmented crime data into evidence-backed, explainable investigation leads for investigators.”**
