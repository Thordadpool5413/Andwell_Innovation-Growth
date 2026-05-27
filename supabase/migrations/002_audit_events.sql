-- Server-side audit persistence for Andwell Intelligence Platform.
-- Supabase CLI was unavailable locally when this migration was added; keep the
-- numbered filename aligned with the existing migration sequence.

CREATE TABLE IF NOT EXISTS public.cih_audit_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  timestamp timestamptz NOT NULL,
  actor text NOT NULL,
  payload jsonb NOT NULL
);

ALTER TABLE public.cih_audit_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.cih_audit_events FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cih_audit_events TO service_role;

CREATE INDEX IF NOT EXISTS cih_audit_events_timestamp_idx
  ON public.cih_audit_events (timestamp DESC);
