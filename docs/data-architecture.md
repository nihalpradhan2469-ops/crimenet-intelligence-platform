# Criminal Network Intelligence Platform — Data Architecture

This document describes the end-to-end data pipeline, storage contracts, and architecture progression from initial synthetic foundation to full Supabase persistence and future AI/ML processing.

---

## 1. End-to-End Data Pipeline Flow

```
┌──────────────────────────────────────────────┐
│                Dummy Dataset                 │
│   (data/fir, data/cdr, data/transactions,    │
│    data/reports, data/surveillance, json)    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 Data Upload                  │
│    (Manual ingestion / API upload endpoints) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                   FastAPI                    │
│           (Python backend service)           │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                  Validation                  │
│      (CSV/JSON syntax, schema, file checks)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                Normalization                 │
│      (Entity cleaning, timestamp alignment)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                   Supabase                   │
│        (PostgreSQL relational storage)       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│           Future AI/ML Processing            │
│ (NER, link analysis, Hugging Face, GNN)     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            Real Calculated Results           │
│   (Extracted entities, scored threat levels) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                   Frontend                   │
│       (React dashboard & network graph)      │
└──────────────────────────────────────────────┘
```

---

## 2. Current State vs. Future State

### Current State (Foundation Phase)
- **UI Mock Data**: The active React UI, dashboard metrics, network graphs, and views currently consume mock data directly from [`src/data/mockData.ts`](../src/data/mockData.ts). This ensures zero disruption to the user experience and existing visual components.
- **Backend**: FastAPI runs independently with `/health` and `/health/supabase` endpoints.
- **Storage**: Directory structure in `data/` prepared with strict synthetic-only data isolation guidelines.
- **Frontend Service**: [`src/services/supabaseService.ts`](../src/services/supabaseService.ts) and [`src/lib/supabase.ts`](../src/lib/supabase.ts) provide the client interface. Functions return an explicit "not connected" response state until credentials are provided.

### Future Migration Plan
1. **Schema Migration**: Create database tables in Supabase (`cases`, `persons`, `relationships`, `alerts`, `evidence`).
2. **Ingestion Execution**: Ingest files from `data/` via FastAPI ingestion pipelines (`csv_ingestion.py`, `json_ingestion.py`, and upcoming `pdf_ingestion.py`).
3. **AI/ML Layer**: Introduce entity extraction, relationship scoring, and graph algorithms.
4. **Gradual UI Migration**: Gradually switch UI components from [`src/data/mockData.ts`](../src/data/mockData.ts) to [`src/services/supabaseService.ts`](../src/services/supabaseService.ts) as each dataset is connected.
