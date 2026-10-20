-- Disable future MCP ingestion calls while preserving records and audit history.
BEGIN;

REVOKE EXECUTE ON FUNCTION beta.upsert_movidesk_knowledge_record(
    text, text, text, timestamp with time zone, timestamp with time zone,
    text, jsonb, jsonb, text
) FROM service_role;

DROP FUNCTION beta.upsert_movidesk_knowledge_record(
    text, text, text, timestamp with time zone, timestamp with time zone,
    text, jsonb, jsonb, text
);

COMMIT;
