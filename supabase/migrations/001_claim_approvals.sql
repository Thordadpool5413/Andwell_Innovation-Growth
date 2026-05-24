-- Claim approval persistence for Andwell Intelligence Platform
-- Run this in your Supabase SQL Editor before using Claim Governance server sync.
--
-- Table stores one row per approved claim ID (a truncated claim string).
-- The app upserts the full set on every save and reads all rows on load.

CREATE TABLE IF NOT EXISTS cih_claim_approvals (
  claim_id   text        NOT NULL PRIMARY KEY,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: allow the service-role key to bypass RLS (default for server-side calls)
ALTER TABLE cih_claim_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access"
  ON cih_claim_approvals
  FOR ALL
  USING (true)
  WITH CHECK (true);
