-- ============================================================================
-- Criminal Network Intelligence Platform — Initial Supabase Schema
-- Run this script in the Supabase Dashboard -> SQL Editor -> Click "Run"
-- ============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. CASES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    priority TEXT NOT NULL DEFAULT 'Medium',
    entities INT DEFAULT 0,
    relationships INT DEFAULT 0,
    updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. PERSONS OF INTEREST TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.persons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    alias TEXT,
    age INT,
    location TEXT,
    cases INT DEFAULT 1,
    connections INT DEFAULT 0,
    phones INT DEFAULT 0,
    vehicles INT DEFAULT 0,
    centrality NUMERIC(4, 2) DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Under Investigation',
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. RELATIONSHIPS / GRAPH EDGES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    target_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL DEFAULT 'Associate',
    confidence INT DEFAULT 70,
    evidence_count INT DEFAULT 1,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. ALERTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    severity TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
    type TEXT NOT NULL,
    entity TEXT NOT NULL,
    reason TEXT NOT NULL,
    confidence INT DEFAULT 75,
    source TEXT,
    status TEXT NOT NULL DEFAULT 'Open', -- 'Open', 'Under Review', 'Verified', 'Dismissed'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. EVIDENCE & FINDINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence (
    id TEXT PRIMARY KEY,
    finding TEXT NOT NULL,
    confidence INT DEFAULT 80,
    sources TEXT[] DEFAULT '{}',
    signals TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Pending Review',
    case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. DATA SOURCES & INGESTED EVIDENCE FILES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.data_sources (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'FIR', 'CDR', 'Transactions', 'Surveillance', 'Intel Report'
    case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
    size TEXT,
    status TEXT NOT NULL DEFAULT 'Queued', -- 'Queued', 'Processing', 'Processed', 'Failed'
    entities INT DEFAULT 0,
    storage_path TEXT,
    uploaded TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. INVESTIGATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investigations (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    lead TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    entities INT DEFAULT 0,
    leads INT DEFAULT 0,
    started DATE DEFAULT CURRENT_DATE,
    updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    record TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Success',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon and Authenticated Read (SELECT) for frontend dashboard
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['cases', 'persons', 'relationships', 'alerts', 'evidence', 'data_sources', 'investigations', 'audit_logs'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow read access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow read access" ON public.%I FOR SELECT USING (true)', tbl);

        EXECUTE format('DROP POLICY IF EXISTS "Allow service role and authenticated write" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Allow service role and authenticated write" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- ============================================================================
-- SEED DATA (POPULATE FROM INITIAL DEMO DATASET)
-- ============================================================================
INSERT INTO public.cases (id, title, type, date, location, status, priority, entities, relationships, updated)
VALUES
('CASE-2024-001', 'Operation Silverline', 'Organized Crime', '2024-01-12', 'Mumbai', 'Active', 'High', 34, 87, '2024-03-14'),
('CASE-2024-002', 'Project Nexus', 'Financial Fraud', '2024-01-28', 'Delhi', 'Active', 'Critical', 21, 54, '2024-03-13'),
('CASE-2024-003', 'Operation Crossroads', 'Drug Trafficking', '2024-02-05', 'Kolkata', 'Under Review', 'High', 18, 43, '2024-03-12'),
('CASE-2024-004', 'Task Force Omega', 'Cybercrime', '2024-02-14', 'Bangalore', 'Active', 'Medium', 9, 22, '2024-03-11'),
('CASE-2024-005', 'Operation Sundarbans', 'Human Trafficking', '2024-02-19', 'West Bengal', 'Closed', 'High', 27, 68, '2024-03-08'),
('CASE-2024-006', 'Project Aravalli', 'Arms Smuggling', '2024-02-25', 'Rajasthan', 'Active', 'Critical', 15, 39, '2024-03-14'),
('CASE-2024-007', 'Operation Delta', 'Money Laundering', '2024-03-01', 'Chennai', 'Under Review', 'Medium', 11, 28, '2024-03-10'),
('CASE-2024-008', 'Task Force Indigo', 'Extortion Network', '2024-03-06', 'Pune', 'Active', 'High', 19, 47, '2024-03-13')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.persons (id, name, alias, age, location, cases, connections, phones, vehicles, centrality, status, source)
VALUES
('PRS-001', 'Rahul Sharma', 'R. Sharma', 38, 'Mumbai', 3, 17, 2, 1, 0.87, 'Under Investigation', 'FIR-014'),
('PRS-002', 'Vikram Desai', 'VD', 45, 'Delhi', 2, 12, 3, 2, 0.72, 'Under Investigation', 'CDR-021'),
('PRS-003', 'Anita Kapoor', 'AK', 32, 'Mumbai', 1, 8, 1, 0, 0.54, 'Person of Interest', 'TXN-087'),
('PRS-004', 'Mohammed Raza', 'Raza', 41, 'Kolkata', 4, 24, 4, 3, 0.93, 'Under Investigation', 'FIR-031'),
('PRS-005', 'Priya Singh', 'PS', 29, 'Delhi', 1, 6, 1, 1, 0.41, 'Person of Interest', 'CDR-045'),
('PRS-006', 'Arjun Mehta', 'AJM', 52, 'Bangalore', 2, 14, 2, 2, 0.68, 'Under Investigation', 'TXN-112'),
('PRS-007', 'Suresh Nair', 'SN', 36, 'Chennai', 1, 9, 2, 1, 0.49, 'Person of Interest', 'FIR-052')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.alerts (id, severity, type, entity, reason, confidence, timestamp, source, status)
VALUES
('ALT-001', 'critical', 'Potential Link Detected', 'Rahul Sharma', 'Shared communication pattern with known associate', 84, '2024-03-14 09:23', 'CDR-021', 'Open'),
('ALT-002', 'high', 'Anomaly Detected', 'Mohammed Raza', 'Unusual transaction frequency — 3x baseline', 91, '2024-03-14 08:47', 'TXN-087', 'Open'),
('ALT-003', 'high', 'Network Change', 'CASE-2024-002', 'New entity connection discovered via graph expansion', 76, '2024-03-14 07:15', 'CDR-033', 'Under Review'),
('ALT-004', 'medium', 'Entity Match', 'Vikram Desai', 'Possible alias match: ''V. Desai'' in FIR-031', 67, '2024-03-13 22:41', 'FIR-031', 'Open'),
('ALT-005', 'medium', 'Unusual Activity', 'Arjun Mehta', 'Location change to 4 distinct cities within 48 hours', 79, '2024-03-13 18:30', 'SURV-014', 'Open'),
('ALT-006', 'low', 'Potential Link', 'Priya Singh', 'Common location overlap with PRS-001 on 3 occasions', 52, '2024-03-13 14:22', 'CDR-047', 'Dismissed'),
('ALT-007', 'critical', 'High Priority', 'CASE-2024-006', 'New evidence record links to active case investigation', 88, '2024-03-13 11:05', 'FIR-061', 'Open'),
('ALT-008', 'high', 'Anomaly Detected', 'Suresh Nair', 'Communication burst — 47 calls in 90-minute window', 85, '2024-03-12 23:18', 'CDR-058', 'Verified')
ON CONFLICT (id) DO NOTHING;
