# ??? CRIMENET — AI-Powered Criminal Network Analysis & Intelligence System

CRIMENET is an advanced, production-grade law enforcement intelligence platform engineered to ingest heterogeneous multi-modal crime records, perform entity resolution, extract criminal relational matrices, and execute NetworkX topological graph analytics to generate actionable, court-admissible investigation dossiers.

---

## ?? Key Capabilities

1. **Multi-Modal Data Ingestion**:
   - Automated ingestion of Telecom Tower CDR logs, UPI/Hawala bank transactions, ANPR vehicle sightings, and Police FIR incident narratives.
   - Robust normalization pipeline handling aliases, phone prefixes, and phonetic variants.

2. **Graph Analytics & Network Intelligence (NetworkX)**:
   - High-throughput topology modeling calculating **Degree Centrality**, **Betweenness Centrality** (syndicate bridges), and **Closeness Centrality**.
   - Subgraph clustering for automated organized crime syndicate detection.

3. **Actionable Investigation Leads**:
   - Automated lead hierarchy generation (High, Medium, Low Priority) including Lookout Circular (LOC) recommendations, financial asset freezes (Sec 17 PMLA), and targeted surveillance.

4. **Cryptographic Chain-of-Custody (Section 65B Compliance)**:
   - SHA-256 tamper-proof hashing on every evidence record ensuring court admissibility under the Indian Evidence Act.

5. **Multi-Format Solution Deliverables**:
   - **Court-Admissible PDF Case Dossiers** with official police header and IO sign-off block.
   - **Machine-Readable CCTNS JSON Packages** for seamless ingestion into national law enforcement databases.
   - **Interactive Command Center UI** with live graph traversal and temporal sliders.

---

## ??? Architecture Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts
- **Backend API**: FastAPI (Python 3.11+), NetworkX, Pydantic, Uvicorn
- **Database**: Supabase PostgreSQL with relational indexing
- **Security & Provenance**: SHA-256 audit ledger, Role-Based Access Control (RBAC)

---

## ?? Quick Start

### 1. Frontend
`ash
# Install dependencies
pnpm install

# Start Vite development server
npm run dev
`

### 2. Backend Engine
`ash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Run FastAPI backend
uvicorn app.main:app --reload --port 8000
`
