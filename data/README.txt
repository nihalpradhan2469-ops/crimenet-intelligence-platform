CrimeGraph AI - Large Synthetic Dataset
=============================================

Purpose:
Prototype/demo dataset for the SIH 2026 CrimeGraph AI concept.

IMPORTANT:
- Entirely synthetic and fictional.
- No real persons, phone numbers, bank accounts, cases, or intelligence records.
- Do not present this as real police/NCRB data.
- Use it to test ingestion, NLP/NER, entity resolution, graph construction,
  anomaly detection, dashboards, and evidence-linked alerts.

Files:
persons.csv         500 persons
cdr.csv             6,000 call records
transactions.csv    3,000 financial records
vehicles.csv        350 vehicles
locations.csv       80 locations
movements.csv       4,500 vehicle movements
firs.csv             1,000 synthetic narrative records
relationships.csv   10,000+ relationship/evidence links
alerts.csv          1,200 synthetic explainable alerts

Suggested pipeline:
FIR text -> NER -> entity resolution -> relationship extraction -> Neo4j
CDR/transactions/movements -> normalization -> Neo4j
Neo4j -> centrality/community/path analysis
Transactions/calls -> anomaly detection
Alerts -> evidence provenance + human review
