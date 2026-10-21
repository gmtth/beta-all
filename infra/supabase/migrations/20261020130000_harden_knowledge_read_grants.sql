-- Incremental ACL hardening for the already initialized knowledge schema.
-- Preconditions: the catalog matches the 2026-10-20 inspection and the
-- baseline has been recorded as applied in the chosen migration workflow.
-- This changes grants only; it does not modify or delete table data.
-- The current MCP reader only lists beta.source_system.

BEGIN;

REVOKE ALL ON SCHEMA beta FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA beta TO service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA beta FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE beta.source_system TO service_role;

COMMIT;
