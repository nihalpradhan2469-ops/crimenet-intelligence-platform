Build a complete full-stack Smart India Hackathon prototype called:

"AI-Assisted Criminal Network Intelligence Platform"

PROJECT PURPOSE

The platform is an investigation-support system that helps investigators
analyze heterogeneous crime and intelligence data and discover potentially
relevant relationships, unusual patterns and network structures.

The application will use SYNTHETIC / DUMMY DATA for the prototype.

IMPORTANT SAFETY AND DESIGN PRINCIPLE:

The system must NOT declare that a person is a criminal.
It must NOT make final accusations or legal decisions.

AI outputs must be presented as:
- Potential Lead
- Possible Relationship
- Anomaly
- Investigative Insight

Every AI-generated insight should have:
- Confidence score
- Source record
- Supporting evidence
- Explanation/reason/signals
- Timestamp

Investigator must be able to:
- Review
- Verify
- Dismiss

The investigator remains the final decision maker.

==================================================
TECH STACK
==================================================

FRONTEND

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Lucide React
- Recharts
- Interactive graph visualization library

BACKEND

- Python
- FastAPI
- Pydantic

DATABASE

- Supabase PostgreSQL

AUTHENTICATION

- Supabase Auth

STORAGE

- Supabase Storage

AI / ML ARCHITECTURE

Prepare integration points for:

- Hugging Face Transformers
- Hugging Face NER models
- Hugging Face sentence-transformer models
- Sentence Transformers
- spaCy
- scikit-learn
- NetworkX
- PyTorch Geometric
- Optional GNN

The AI/ML architecture must be modular so models can be replaced later.

DO NOT hard-code a dependency on a paid AI API.

==================================================
APPLICATION ARCHITECTURE
==================================================

Frontend
    ↓
FastAPI Backend
    ↓
Data Processing Layer
    ↓
AI / ML Layer
    ↓
Supabase PostgreSQL
    ↓
Graph / Analytics Layer
    ↓
Evidence & Confidence Layer
    ↓
Investigator Interface

Keep frontend, backend and AI modules separated.

==================================================
MAIN APPLICATION MODULES
==================================================

Create the following modules:

1. Authentication
2. Dashboard
3. Cases
4. Investigations
5. Data Sources
6. Data Upload
7. FIR Processing
8. NLP / NER
9. Entities
10. Entity Resolution
11. Relationships
12. Network Graph
13. Key Person Analysis
14. Anomaly Detection
15. Potential Hidden Links
16. Evidence
17. Alerts
18. Investigator Review
19. Analytics
20. Audit Logs
21. Settings

All pages must be connected through React Router.

==================================================
MAIN SIDEBAR
==================================================

Create a professional sidebar with:

Dashboard
Cases
Investigations
Network Graph
Entities
Alerts
Evidence
Data Sources
Analytics
Audit Logs
Settings

Add icons using Lucide React.

==================================================
TOP BAR
==================================================

Include:

- Global Search
- Notifications
- Current investigation/case selector
- User profile
- Theme control if practical

Global search should eventually support:

Person
Phone
Vehicle
Location
Organization
Case
FIR
Transaction

==================================================
DASHBOARD
==================================================

Create a professional intelligence dashboard.

Top metric cards:

- Total Cases
- Total Persons
- Total Relationships
- High Priority Alerts
- Anomalies
- Potential Links

Create:

1. Network Activity chart
2. Cases over time chart
3. Alert severity chart
4. Entity type distribution
5. Priority Alerts panel
6. Recent Investigations table
7. Recent Evidence panel

Use synthetic data.

Do not claim synthetic values are real.

==================================================
CASE MANAGEMENT
==================================================

Cases page should contain:

- Case ID
- Case title
- Case type
- Date
- Location
- Status
- Priority
- Number of entities
- Number of relationships
- Last updated

Actions:

View
Open Investigation
Search Network
View Evidence

Case details page should show:

Case information
Related persons
Vehicles
Phones
Locations
Organizations
Events
FIRs
Transactions
Network graph
Alerts
Evidence

==================================================
DATA SOURCES
==================================================

Support conceptual ingestion of:

- FIR
- Police reports
- CDR
- Transaction records
- Surveillance records
- Intelligence reports
- Social media intelligence
- Criminal history

For prototype support:

- PDF
- CSV
- JSON
- TXT

Create upload UI with:

Drag and drop
File selector
Data source type
Case selection
Upload status
Processing status

==================================================
DATA PROCESSING PIPELINE
==================================================

Implement the architecture:

Input
 ↓
Upload
 ↓
Validation
 ↓
Parsing
 ↓
Cleaning
 ↓
Normalization
 ↓
NLP / NER
 ↓
Entity Extraction
 ↓
Entity Resolution
 ↓
Relationship Extraction
 ↓
Graph Construction
 ↓
Analytics
 ↓
Evidence + Confidence
 ↓
Investigator Review

Create backend service interfaces for every stage.

==================================================
FIR PROCESSING
==================================================

For PDF/TXT documents:

1. Extract text
2. Clean text
3. Pass text to NLP pipeline
4. Extract entities
5. Extract potential relationships
6. Save source references
7. Show processing status

Entities should include:

PERSON
PHONE
LOCATION
VEHICLE
ORGANIZATION
DATE
CASE
EVENT

Use Hugging Face as the planned NLP/NER layer.

Create a model adapter/service so a Hugging Face model can be
changed without rewriting the entire application.

==================================================
HUGGING FACE INTEGRATION
==================================================

Prepare a dedicated backend module:

backend/ai/
    nlp/
    ner/
    embeddings/
    entity_resolution/
    anomaly/
    graph/
    gnn/

Use Hugging Face Transformers for NLP/NER.

Use sentence-transformer embeddings for semantic similarity.

Do not send sensitive data to external services by default.

The system should be capable of using local models where practical.

==================================================
ENTITY RESOLUTION
==================================================

Create an Entity Resolution module.

Example:

Rahul Sharma
R. Sharma
Rahul S.

The system should calculate a POSSIBLE MATCH score using multiple signals:

- Name similarity
- Phone number
- Location
- Vehicle
- Organization
- Case association
- Temporal information

Output:

Possible Match
Confidence: XX%

Never treat similarity as proof.

Show:

Matched attributes
Supporting records
Confidence
Reason

Investigator actions:

Review
Confirm
Reject

==================================================
ENTITY MANAGEMENT
==================================================

Entities page should support:

Persons
Phones
Vehicles
Locations
Organizations
Cases
Events

Each entity should have:

- ID
- Name/value
- Type
- Related cases
- Connections
- Source records
- Confidence
- Timeline

==================================================
RELATIONSHIP ENGINE
==================================================

Create relationships such as:

Person ↔ Person
Person ↔ Phone
Person ↔ Vehicle
Person ↔ Location
Person ↔ Organization
Person ↔ Case
Person ↔ Event
Person ↔ Transaction

Every relationship must contain:

- source entity
- target entity
- relationship type
- source record
- confidence
- timestamp
- evidence reference

==================================================
NETWORK GRAPH
==================================================

Create an interactive graph visualization.

Nodes:

Person
Phone
Vehicle
Location
Organization
Case
Event
Transaction

Edges:

Called
Associated With
Located At
Owns/Uses
Connected To
Involved In
Transferred To
Met
Related To

Graph features:

- Zoom
- Pan
- Search
- Node selection
- Edge selection
- Filters
- Entity type filters
- Case filters
- Date filters
- Relationship filters
- Expand node
- Collapse node

Clicking a node should open an entity detail panel.

Clicking an edge should show:

Relationship
Source
Evidence
Timestamp
Confidence

==================================================
KEY PERSON ANALYSIS
==================================================

Create a Key Person Analysis module.

Use graph analytics:

- Degree Centrality
- Betweenness Centrality
- PageRank

Show:

Person
Centrality score
Connections
Cases
Locations
Relationships
Explanation

Do NOT label the person as a criminal.

Use terminology such as:

"High network centrality"
"Investigation priority"
"Potentially influential node"

==================================================
ANOMALY DETECTION
==================================================

Create an anomaly detection module using:

Scikit-learn Isolation Forest

Possible features:

- communication frequency
- number of unique contacts
- transaction frequency
- unusual transaction values
- location changes
- unusual timing
- relationship growth
- interaction bursts

Output:

Anomaly detected

Anomaly score
Reason/signals
Source records
Timestamp

Show the result as an investigative lead.

==================================================
POTENTIAL HIDDEN LINKS
==================================================

Create a Potential Hidden Links module.

Use:

- semantic similarity
- shared attributes
- common locations
- common phone numbers
- common vehicles
- shared cases
- temporal overlap
- graph proximity

Optional future module:

PyTorch Geometric GNN

The GNN must be modular and optional.

Output:

Potential Link

Confidence: XX%

Signals:
- Shared location
- Common contact
- Related case
- Graph proximity

Evidence:
Source records

Actions:

Review
Verify
Dismiss

==================================================
EVIDENCE SYSTEM
==================================================

Create an evidence panel.

Every important insight should show:

Finding
Confidence
Evidence
Source
Reason
Timestamp

Example:

Potential relationship detected

Confidence: 84%

Evidence:
FIR-014
CDR-021
TXN-087

Signals:
Shared phone contact
Common location
Repeated interaction

Buttons:

Review
Verify
Dismiss

==================================================
ALERTS
==================================================

Create alert categories:

High Priority
Anomaly
Potential Link
Unusual Activity
Entity Match
Network Change

Each alert should show:

Severity
Type
Entity
Reason
Confidence
Created time
Source

Allow:

Open
Review
Dismiss
Mark as Verified

==================================================
INVESTIGATOR REVIEW
==================================================

Create a dedicated review workflow.

For each AI-generated lead:

--------------------------------
Potential Investigation Lead

Finding:
Potential relationship between Entity A and Entity B

Confidence:
84%

Evidence:
FIR-014
CDR-021
TXN-087

Reason:
Shared contact
Common location
Repeated interaction

Actions:

[ VERIFY ]
[ DISMISS ]
[ REVIEW EVIDENCE ]
--------------------------------

Store investigator decision in database.

==================================================
TIMELINE
==================================================

Create timeline visualization for investigations.

Show:

- FIR events
- Calls
- Transactions
- Locations
- Meetings
- Vehicle sightings
- Other events

Allow filtering by:

Date
Person
Case
Event type

==================================================
ANALYTICS
==================================================

Create analytics page with:

Cases over time
Entity growth
Relationship growth
Alert trends
Anomaly trends
Network statistics
Top central nodes
Potential link trends

Use Recharts.

==================================================
AUDIT LOG
==================================================

Create audit logging.

Track:

- Login
- Upload
- Data processing
- Entity creation
- Relationship creation
- AI finding
- Investigator review
- Verification
- Dismissal
- Data modification

Each log should contain:

User
Action
Record
Timestamp
Status

==================================================
DATABASE DESIGN
==================================================

Prepare Supabase PostgreSQL schema for:

users
cases
investigations
persons
phones
vehicles
locations
organizations
events
fir_reports
cdr_records
transactions
data_sources
entities
relationships
alerts
evidence
ai_findings
entity_matches
investigator_reviews
audit_logs

Use UUID primary keys.

Use timestamps.

Create proper foreign keys.

Add indexes for commonly searched fields.

Prepare Row Level Security policies.

Never expose Supabase service-role keys in frontend.

==================================================
SUPABASE
==================================================

Create environment variable templates.

Frontend:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Backend:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

Never commit actual secrets.

Create Supabase service layer.

Prepare:

Authentication
Database queries
Storage upload
File metadata
Audit logging

==================================================
SECURITY
==================================================

Implement basic security practices:

- Environment variables
- Input validation
- File type validation
- File size validation
- Authentication
- Authorization
- Row Level Security
- API validation
- No secrets in frontend
- Audit logging

Sensitive investigation data must not be placed on a public blockchain.

==================================================
BLOCKCHAIN / INTEGRITY LAYER
==================================================

Prepare an OPTIONAL future integrity module.

Do NOT store raw FIR/CDR/PII on blockchain.

Instead prepare a design where:

Record
 ↓
Hash
 ↓
Timestamp
 ↓
Integrity Record

The actual sensitive data remains in secure storage.

Create the UI placeholder for:

Evidence Integrity
Hash
Timestamp
Verification status

Do not implement a public blockchain dependency unless necessary.

==================================================
DESIGN SYSTEM
==================================================

Create a professional intelligence/investigation interface.

Style:

- Modern
- Clean
- Professional
- High information density but readable
- Responsive
- Consistent spacing
- Clear hierarchy
- Accessible
- Minimal gradients
- No gaming UI
- No excessive animations

Use reusable:

Cards
Buttons
Badges
Tables
Drawers
Modals
Tabs
Charts
Filters
Search
Timeline
Graph panels

==================================================
DEMO DATA
==================================================

Create realistic SYNTHETIC data for demonstration.

Example entities:

Persons
Phones
Vehicles
Locations
Organizations
Cases
Relationships
Transactions
Alerts

Clearly label demo/synthetic data.

Do not use real people's personal information.

==================================================
PROJECT STRUCTURE
==================================================

Use a clean architecture.

frontend/
backend/
data/
docs/

Frontend:

src/
  components/
  pages/
  layouts/
  services/
  hooks/
  types/
  data/
  graph/
  charts/

Backend:

app/
  main.py
  api/
  models/
  schemas/
  services/
  repositories/
  ai/
    nlp/
    ner/
    embeddings/
    entity_resolution/
    anomaly/
    graph/
    gnn/
  ingestion/
  graph/
  audit/

==================================================
API ENDPOINTS
==================================================

Prepare REST endpoints for:

/auth
/cases
/investigations
/entities
/persons
/phones
/vehicles
/locations
/organizations
/fir
/cdr
/transactions
/data-sources
/upload
/process
/relationships
/graph
/alerts
/anomalies
/potential-links
/evidence
/reviews
/analytics
/audit-logs

Use Pydantic schemas.

==================================================
IMPORTANT DEVELOPMENT RULE
==================================================

Build this as a modular application.

Do NOT put the entire application into one giant file.

Do NOT create fake backend endpoints that silently return misleading data.

Clearly separate:

Frontend
Backend
Database
AI/ML
Graph
Evidence
Audit

Use mock/synthetic data until Supabase and AI services are connected.

==================================================
IMPLEMENTATION ORDER
==================================================

Build the project in this order:

PHASE 1
Project setup + frontend shell

PHASE 2
Supabase configuration + database schema

PHASE 3
Authentication

PHASE 4
Dashboard + navigation

PHASE 5
Cases + investigations

PHASE 6
Data upload + ingestion

PHASE 7
FIR/PDF processing

PHASE 8
Hugging Face NLP/NER

PHASE 9
Entity management

PHASE 10
Entity resolution

PHASE 11
Relationship engine

PHASE 12
Interactive network graph

PHASE 13
Key person graph analytics

PHASE 14
Isolation Forest anomaly detection

PHASE 15
Potential hidden links

PHASE 16
Evidence + confidence system

PHASE 17
Investigator review

PHASE 18
Timeline + analytics

PHASE 19
Audit logs

PHASE 20
Optional integrity/blockchain layer

PHASE 21
Testing + security review

PHASE 22
Final UI polish + SIH demo mode

==================================================
CRITICAL INSTRUCTION
==================================================

For this initial generation, create the COMPLETE application
architecture, navigation, database models, UI pages, reusable components,
API structure and integration interfaces.

Use synthetic/mock data where real services are not connected.

Do NOT claim that advanced AI is working if it is only a placeholder.

Where a feature requires a model or service that is not yet configured,
show a clear "Integration Pending" or demo state.

After generation:

1. Install dependencies.
2. Run frontend.
3. Run backend.
4. Check for compilation errors.
5. Check API startup.
6. Fix errors.
7. Verify all routes.
8. Verify responsive UI.
9. Verify mock data rendering.
10. Provide a clear setup guide.

Do not delete or overwrite existing user files unnecessarily.

Keep the project ready for further development in VS Code and Antigravity.

The final application should feel like a professional
AI-assisted investigation intelligence platform suitable for an
SIH demonstration.