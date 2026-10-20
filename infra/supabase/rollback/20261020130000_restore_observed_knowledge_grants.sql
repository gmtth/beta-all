-- Rollback for migrations/20261020130000_harden_knowledge_read_grants.sql.
-- Restores the table grants observed in the 2026-10-20 catalog inspection.
-- Use only if the hardening migration caused an operational regression and
-- after confirming that no new tables have been added to schema beta.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE beta.source_system
    TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE beta.source_record
    TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE beta.record_chunk
    TO anon, authenticated, service_role;
