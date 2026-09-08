REDESIGN THE NETWORK GRAPH MODULE INTO A PREMIUM
INTELLIGENCE-CENTERED NETWORK VISUALIZATION.

IMPORTANT:
Do NOT copy any existing product branding, text, logos, colors,
or exact visual assets from the reference.

Use the reference only as inspiration for the STRUCTURE and
visual hierarchy.

==================================================
CORE GRAPH CONCEPT
==================================================

The graph should NOT look like a basic node-and-edge diagram.

Create a cinematic intelligence-flow visualization where a
central "Network Intelligence" node acts as the main analytical
hub.

The visual flow should be:

DATA SOURCES
      ↓
ENTITY STREAMS
      ↓
CENTRAL NETWORK INTELLIGENCE
      ↓
RELATIONSHIPS / INSIGHTS
      ↓
INVESTIGATIVE FINDINGS

The central graph should dominate the screen.

==================================================
LAYOUT
==================================================

Use a wide full-screen graph workspace.

LEFT SIDE:
Show multiple incoming entity/data streams.

Examples:

FIR
CDR
Transactions
Police Reports
Surveillance
Intelligence Reports

Each source should feed into relevant entities.

Example:

FIR ───────────────┐
CDR ───────────────┤
Transaction ───────┤
Report ─────────────┤
                    ↓
             ENTITY LAYER
                    ↓
          NETWORK INTELLIGENCE
                    ↓
       ┌────────────┼────────────┐
       ↓            ↓            ↓
  Relationships   Alerts     Insights

==================================================
CENTRAL VISUALIZATION
==================================================

Create a large central circular intelligence visualization.

Center:

NETWORK
INTELLIGENCE

Around the center create multiple concentric layers.

Layer 1:
small connected entity nodes

Layer 2:
relationship indicators

Layer 3:
subtle circular/radial lines

Layer 4:
very subtle animated intelligence pulse

The center should feel like an analytical engine,
NOT like a decorative circle.

==================================================
ENTITY NODES
==================================================

Represent different entity types using different shapes/icons.

PERSON
→ circular node

PHONE
→ small communication node

VEHICLE
→ compact square/rounded node

LOCATION
→ location/pin node

ORGANIZATION
→ structured square node

CASE
→ case/document node

EVENT
→ event marker

TRANSACTION
→ financial node

Use small clean icons from Lucide React.

Do not make nodes huge.

==================================================
RELATIONSHIP LINES
==================================================

Relationships should be smooth curved lines.

Avoid straight rigid lines wherever possible.

Use:

- thin lines for normal relationships
- slightly brighter lines for important relationships
- orange highlight for selected relationships
- subtle glow only on selected/high-priority paths

Examples:

Person → Phone
Person → Vehicle
Person → Location
Person → Case
Person → Organization
Person → Person
Person → Transaction

The edges should visually flow into the central intelligence
area.

==================================================
FLOWING CONNECTIONS
==================================================

Create flowing curved connections inspired by enterprise
network-intelligence visualizations.

Incoming connections from the left should converge toward
the central analytical area.

Outgoing connections should branch toward:

Potential Links
Anomalies
Key Persons
Investigation Leads
Related Cases

The graph should visually communicate:

"fragmented data → connected intelligence"

==================================================
RIGHT SIDE INSIGHTS
==================================================

On the right side of the graph show compact analytical
result panels.

Example:

93
RELATIONSHIPS

17
KEY ENTITIES

12
ANOMALIES

8
POTENTIAL LINKS

3
HIGH PRIORITY

Use large numeric values with small labels.

These values MUST come from actual application data when
backend integration is available.

Do NOT hard-code fake analytical results in production mode.

==================================================
KEY PERSON VISUALIZATION
==================================================

If a person has high graph centrality:

make their node slightly larger.

Show a subtle orange halo.

On selection display:

PERSON
Centrality Score
Connections
Related Cases
Locations
Potential Links

Use terminology:

"High Network Centrality"

Do NOT use:

"Criminal"
"Guilty"
"Confirmed Criminal"

==================================================
GRAPH INTERACTION
==================================================

Implement:

- zoom
- pan
- drag nodes
- click node
- click relationship
- expand node
- collapse node
- search entity
- filter entity type
- filter relationship type
- filter case
- filter date range
- reset graph
- fit graph to screen

When a node is selected:

highlight its direct connections.

Dim unrelated nodes and edges.

==================================================
NODE DETAIL PANEL
==================================================

Clicking a node should open a right-side detail drawer.

Example:

PERSON

Rahul Sharma

High Network Centrality

Connections:
17

Cases:
3

Phones:
2

Locations:
4

Potential Links:
3

Anomalies:
1

Evidence:
FIR-014
CDR-021
TXN-087

Actions:

[VIEW EVIDENCE]
[VIEW TIMELINE]
[OPEN INVESTIGATION]

==================================================
EDGE DETAIL
==================================================

Clicking an edge should show:

Relationship Type
Source Entity
Target Entity
Source Record
Timestamp
Confidence
Supporting Evidence

Example:

Relationship:
Communication

Source:
CDR-021

Confidence:
84%

Evidence:
Repeated communication pattern

==================================================
COLOR SYSTEM
==================================================

Use the application's existing dark premium theme.

Background:
#0B0806

Graph canvas:
#080706

Cards:
#18110C

Border:
#30231B

Primary Orange:
#FF6A00

Bright Orange:
#FF8A1F

Soft Orange:
#FFB15C

Primary Text:
#F5F1EC

Secondary Text:
#A9A19A

Muted:
#716961

Danger:
#FF5C5C

Success:
#6FD08C

Do NOT make the entire graph orange.

Most normal nodes and connections should remain subtle.

Orange should represent:

selected
important
active
high-priority
analytical focus

==================================================
CENTRAL GLOW
==================================================

Add a VERY subtle orange atmospheric glow around the central
Network Intelligence visualization.

Use:

rgba(255,106,0,0.12)

and

rgba(255,106,0,0.05)

The glow must be subtle.

Do not create a giant neon effect.

==================================================
BACKGROUND DETAILS
==================================================

Add extremely subtle radial/dotted patterns around the central
graph.

Possible elements:

- tiny dots
- concentric circles
- faint radial lines
- subtle grid
- small data particles

These should create depth but must never reduce readability.

==================================================
ANIMATION
==================================================

Use subtle intelligence-flow animation.

Possible animations:

- small particles moving along selected edges
- slow central pulse
- relationship highlight
- node hover glow
- smooth graph transitions

Animation duration should be approximately:

150ms–500ms for UI interactions.

Slow ambient animations can be 2–5 seconds.

Avoid distracting animations.

==================================================
GRAPH HEADER
==================================================

Top of graph:

NETWORK INTELLIGENCE

Subtitle:

Interactive relationship and entity analysis

Right side:

Search
Filters
Date Range
Reset
Fit Graph

==================================================
GRAPH FOOTER / LEGEND
==================================================

Add a compact legend:

PERSON
PHONE
VEHICLE
LOCATION
ORGANIZATION
CASE
EVENT
TRANSACTION

Relationship types can also be shown.

==================================================
BOTTOM ANALYTICS BAR
==================================================

At the bottom of the graph workspace show compact metrics:

Network Density
Active Entities
Relationships
Potential Links
Anomalies

Again:

These metrics must be calculated from actual graph/application
data once backend integration is connected.

==================================================
RESPONSIVE DESIGN
==================================================

Desktop:
graph should use most of the available screen.

Tablet:
reduce side panels.

Mobile:
convert details into drawers and keep graph horizontally
scrollable/interactive.

==================================================
IMPORTANT
==================================================

The graph must communicate a clear story visually:

MULTIPLE DATA SOURCES
        ↓
ENTITY EXTRACTION
        ↓
RELATIONSHIP MAPPING
        ↓
CENTRAL NETWORK INTELLIGENCE
        ↓
KEY PERSONS
ANOMALIES
POTENTIAL LINKS
RELATED CASES
        ↓
INVESTIGATOR REVIEW

Make this the signature visual element of the application.

The final graph should feel like a premium
AI intelligence command center rather than a generic
React graph component.