-- Controlled, atomic ingestion for an explicitly requested Movidesk ticket.
-- Direct table privileges stay revoked; the MCP can execute only this RPC.

BEGIN;

CREATE TABLE beta.knowledge_ingest_audit (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    source_record_id bigint NOT NULL,
    actor_email text NOT NULL,
    operation text NOT NULL DEFAULT 'upsert',
    content_hash text NOT NULL,
    chunk_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT knowledge_ingest_audit_pkey PRIMARY KEY (id),
    CONSTRAINT knowledge_ingest_audit_source_record_id_fkey
        FOREIGN KEY (source_record_id) REFERENCES beta.source_record(id),
    CONSTRAINT knowledge_ingest_audit_operation_check CHECK (operation = 'upsert'),
    CONSTRAINT knowledge_ingest_audit_chunk_count_check CHECK (chunk_count BETWEEN 1 AND 50),
    CONSTRAINT knowledge_ingest_audit_content_hash_check CHECK (content_hash ~ '^[a-f0-9]{64}$')
);

ALTER TABLE beta.knowledge_ingest_audit ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION beta.upsert_movidesk_knowledge_record(
    p_external_id text,
    p_title text,
    p_status text,
    p_source_created_at timestamp with time zone,
    p_source_updated_at timestamp with time zone,
    p_content_hash text,
    p_attributes jsonb,
    p_chunks jsonb,
    p_actor_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_source_count integer;
    v_source_system_id smallint;
    v_record_id bigint;
    v_chunk_count integer;
    v_chunk jsonb;
    v_ordinal integer;
    v_section_title text;
    v_content text;
BEGIN
    IF p_external_id IS NULL OR p_external_id !~ '^[0-9]{1,30}$'
       OR p_title IS NULL OR length(btrim(p_title)) = 0 OR length(p_title) > 500
       OR p_content_hash IS NULL OR p_content_hash !~ '^[a-f0-9]{64}$'
       OR p_actor_email IS NULL OR p_actor_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
       OR p_attributes IS NULL OR jsonb_typeof(p_attributes) <> 'object'
       OR p_chunks IS NULL OR jsonb_typeof(p_chunks) <> 'array'
       OR jsonb_array_length(p_chunks) < 1 OR jsonb_array_length(p_chunks) > 50 THEN
        RAISE EXCEPTION 'invalid knowledge import payload' USING ERRCODE = '22023';
    END IF;

    SELECT count(*)::integer, min(id) INTO v_source_count, v_source_system_id
    FROM beta.source_system WHERE lower(code) = 'movidesk' AND active;
    IF v_source_count = 0 THEN
        SELECT count(*)::integer, min(id) INTO v_source_count, v_source_system_id
        FROM beta.source_system WHERE lower(name) = 'movidesk' AND active;
    END IF;
    IF v_source_count <> 1 OR v_source_system_id IS NULL THEN
        RAISE EXCEPTION 'Movidesk source system is missing or ambiguous' USING ERRCODE = '22023';
    END IF;

    INSERT INTO beta.source_record (
        source_system_id, external_id, record_type, title, status,
        classification, source_created_at, source_updated_at, imported_at,
        content_hash, attributes, deleted_at
    ) VALUES (
        v_source_system_id, p_external_id, 'ticket', btrim(p_title), p_status,
        'internal', p_source_created_at, p_source_updated_at, now(),
        p_content_hash, p_attributes, NULL
    )
    ON CONFLICT (source_system_id, external_id) DO UPDATE SET
        record_type = EXCLUDED.record_type,
        title = EXCLUDED.title,
        status = EXCLUDED.status,
        classification = 'internal',
        source_created_at = COALESCE(EXCLUDED.source_created_at, source_record.source_created_at),
        source_updated_at = COALESCE(EXCLUDED.source_updated_at, source_record.source_updated_at),
        imported_at = now(),
        content_hash = EXCLUDED.content_hash,
        attributes = EXCLUDED.attributes,
        deleted_at = NULL
    RETURNING id INTO v_record_id;

    DELETE FROM beta.record_chunk WHERE source_record_id = v_record_id;
    v_chunk_count := 0;
    FOR v_chunk IN SELECT value FROM jsonb_array_elements(p_chunks) AS chunk(value) LOOP
        IF jsonb_typeof(v_chunk) <> 'object'
           OR jsonb_typeof(v_chunk->'ordinal') <> 'number'
           OR jsonb_typeof(v_chunk->'section_title') <> 'string'
           OR jsonb_typeof(v_chunk->'content') <> 'string' THEN
            RAISE EXCEPTION 'invalid knowledge chunk' USING ERRCODE = '22023';
        END IF;
        v_ordinal := (v_chunk->>'ordinal')::integer;
        v_section_title := btrim(v_chunk->>'section_title');
        v_content := btrim(v_chunk->>'content');
        IF v_ordinal < 0 OR length(v_section_title) = 0 OR length(v_section_title) > 120
           OR length(v_content) = 0 OR length(v_content) > 1500 THEN
            RAISE EXCEPTION 'knowledge chunk is outside allowed limits' USING ERRCODE = '22023';
        END IF;
        INSERT INTO beta.record_chunk (source_record_id, ordinal, section_title, content)
        VALUES (v_record_id, v_ordinal, v_section_title, v_content);
        v_chunk_count := v_chunk_count + 1;
    END LOOP;

    INSERT INTO beta.knowledge_ingest_audit (
        source_record_id, actor_email, operation, content_hash, chunk_count
    ) VALUES (
        v_record_id, lower(btrim(p_actor_email)), 'upsert', p_content_hash, v_chunk_count
    );

    RETURN jsonb_build_object('record_id', v_record_id::text, 'chunk_count', v_chunk_count);
END;
$$;

REVOKE ALL ON TABLE beta.knowledge_ingest_audit FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.upsert_movidesk_knowledge_record(
    text, text, text, timestamp with time zone, timestamp with time zone,
    text, jsonb, jsonb, text
) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION beta.upsert_movidesk_knowledge_record(
    text, text, text, timestamp with time zone, timestamp with time zone,
    text, jsonb, jsonb, text
) TO service_role;

COMMIT;
