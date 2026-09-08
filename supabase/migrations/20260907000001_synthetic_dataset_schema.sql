-- ============================================================================
-- CrimeGraph AI - Synthetic Dataset Tables (Clean DDL - Fast Execution)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.locations (
    location_id TEXT PRIMARY KEY,
    location_name TEXT,
    city TEXT,
    area TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vehicles (
    vehicle_id TEXT PRIMARY KEY,
    owner_id TEXT,
    registration TEXT,
    vehicle_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.firs (
    fir_id TEXT PRIMARY KEY,
    date TIMESTAMPTZ,
    text TEXT,
    person_ids TEXT,
    location_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.movements (
    movement_id TEXT PRIMARY KEY,
    vehicle_id TEXT,
    location_id TEXT,
    timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cdr (
    cdr_id TEXT PRIMARY KEY,
    caller_id TEXT,
    receiver_id TEXT,
    timestamp TIMESTAMPTZ,
    duration_seconds INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    transaction_id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    amount_inr NUMERIC(12, 2),
    date TIMESTAMPTZ,
    method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure compatibility columns exist on existing tables
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS person_id TEXT;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.persons ADD COLUMN IF NOT EXISTS record_date TIMESTAMPTZ;

ALTER TABLE public.relationships ADD COLUMN IF NOT EXISTS relationship_id TEXT;
ALTER TABLE public.relationships ADD COLUMN IF NOT EXISTS source_entity TEXT;
ALTER TABLE public.relationships ADD COLUMN IF NOT EXISTS target_entity TEXT;
ALTER TABLE public.relationships ADD COLUMN IF NOT EXISTS evidence_id TEXT;

ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS alert_id TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS entity_id TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS alert_type TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS evidence_id TEXT;
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS explanation TEXT;
