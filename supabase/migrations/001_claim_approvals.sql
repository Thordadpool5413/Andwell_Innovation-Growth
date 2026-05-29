-- Claim approval persistence for Andwell Intelligence Platform
-- Run this in your Supabase SQL Editor before using Claim Governance server sync.
--
-- Table stores one row per approved claim ID (a truncated claim string).
-- The app upserts the full set on every save and reads all rows on load.

CREATE TABLE IF NOT EXISTS public.cih_claim_approvals (
  claim_id   text        NOT NULL PRIMARY KEY,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cih_claim_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access" ON public.cih_claim_approvals;
REVOKE ALL ON TABLE public.cih_claim_approvals FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cih_claim_approvals TO service_role;
