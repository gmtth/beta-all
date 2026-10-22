-- Restore the original ten-import response cap for the admin overview RPC.
BEGIN;

CREATE OR REPLACE FUNCTION beta.get_knowledge_admin_overview()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
    SELECT jsonb_build_object(
        'sources', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'id', s.id::text,
                'code', s.code,
                'name', s.name,
                'active', s.active,
                'record_count', COALESCE(r.record_count, 0),
                'chunk_count', COALESCE(r.chunk_count, 0)
            ) ORDER BY s.id)
            FROM beta.source_system AS s
            LEFT JOIN LATERAL (
                SELECT count(DISTINCT sr.id)::integer AS record_count,
                       count(rc.id)::integer AS chunk_count
                FROM beta.source_record AS sr
                LEFT JOIN beta.record_chunk AS rc ON rc.source_record_id = sr.id
                WHERE sr.source_system_id = s.id AND sr.deleted_at IS NULL
            ) AS r ON true
        ), '[]'::jsonb),
        'record_count', (SELECT count(*)::integer FROM beta.source_record AS sr WHERE sr.deleted_at IS NULL),
        'chunk_count', (SELECT count(*)::integer FROM beta.record_chunk AS rc JOIN beta.source_record AS sr ON sr.id = rc.source_record_id WHERE sr.deleted_at IS NULL),
        'recent_imports', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'ticket_id', sr.external_id,
                'title', sr.title,
                'actor_email', a.actor_email,
                'chunk_count', a.chunk_count,
                'created_at', a.created_at
            ) ORDER BY a.created_at DESC)
            FROM (
                SELECT source_record_id, actor_email, chunk_count, created_at
                FROM beta.knowledge_ingest_audit
                ORDER BY created_at DESC
                LIMIT 10
            ) AS a
            JOIN beta.source_record AS sr ON sr.id = a.source_record_id
            WHERE sr.deleted_at IS NULL
        ), '[]'::jsonb)
    );
$$;

REVOKE ALL ON FUNCTION beta.get_knowledge_admin_overview() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION beta.get_knowledge_admin_overview() TO service_role;

COMMIT;
