-- Narrow, read-only catalog and row previews for the master-only admin page.
-- The HTTP Worker must validate the ChatGPT master account before calling either RPC.
BEGIN;

CREATE OR REPLACE FUNCTION beta.get_admin_database_schema()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
WITH approved_tables(table_name, preview_allowed) AS (
    VALUES
        ('source_system'::text, true),
        ('source_record'::text, true),
        ('record_chunk'::text, false),
        ('knowledge_ingest_audit'::text, true)
),
table_catalog AS (
    SELECT approved.table_name, approved.preview_allowed, schema_ns.oid AS schema_oid,
           relation.oid AS relation_oid, relation.relowner, relation.relacl,
           relation.relrowsecurity
    FROM approved_tables AS approved
    JOIN pg_catalog.pg_namespace AS schema_ns ON schema_ns.nspname = 'beta'
    JOIN pg_catalog.pg_class AS relation
      ON relation.relnamespace = schema_ns.oid
     AND relation.relname = approved.table_name
     AND relation.relkind IN ('r', 'p')
),
tables AS (
    SELECT jsonb_agg(jsonb_build_object(
        'key', table_catalog.table_name,
        'preview_allowed', table_catalog.preview_allowed,
        'columns', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'name', attribute.attname,
                'position', attribute.attnum,
                'type', pg_catalog.format_type(attribute.atttypid, attribute.atttypmod),
                'nullable', NOT attribute.attnotnull,
                'generated', attribute.attgenerated <> ''
            ) ORDER BY attribute.attnum)
            FROM pg_catalog.pg_attribute AS attribute
            WHERE attribute.attrelid = table_catalog.relation_oid
              AND attribute.attnum > 0
              AND NOT attribute.attisdropped
        ), '[]'::jsonb),
        'constraints', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'name', constraint_row.conname,
                'type', CASE constraint_row.contype
                    WHEN 'p' THEN 'PRIMARY KEY'
                    WHEN 'f' THEN 'FOREIGN KEY'
                    WHEN 'u' THEN 'UNIQUE'
                END,
                'columns', (
                    SELECT jsonb_agg(column_attribute.attname ORDER BY key_column.ordinality)
                    FROM unnest(constraint_row.conkey) WITH ORDINALITY AS key_column(attnum, ordinality)
                    JOIN pg_catalog.pg_attribute AS column_attribute
                      ON column_attribute.attrelid = constraint_row.conrelid
                     AND column_attribute.attnum = key_column.attnum
                ),
                'referenced_table', CASE WHEN constraint_row.contype = 'f'
                    THEN referenced_schema.nspname || '.' || referenced_relation.relname
                    ELSE NULL END,
                'referenced_columns', CASE WHEN constraint_row.contype = 'f' THEN (
                    SELECT jsonb_agg(referenced_attribute.attname ORDER BY referenced_column.ordinality)
                    FROM unnest(constraint_row.confkey) WITH ORDINALITY AS referenced_column(attnum, ordinality)
                    JOIN pg_catalog.pg_attribute AS referenced_attribute
                      ON referenced_attribute.attrelid = constraint_row.confrelid
                     AND referenced_attribute.attnum = referenced_column.attnum
                ) ELSE NULL END
            ) ORDER BY constraint_row.conname)
            FROM pg_catalog.pg_constraint AS constraint_row
            LEFT JOIN pg_catalog.pg_class AS referenced_relation ON referenced_relation.oid = constraint_row.confrelid
            LEFT JOIN pg_catalog.pg_namespace AS referenced_schema ON referenced_schema.oid = referenced_relation.relnamespace
            WHERE constraint_row.conrelid = table_catalog.relation_oid
              AND constraint_row.contype IN ('p', 'f', 'u')
        ), '[]'::jsonb),
        'indexes', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'name', index_relation.relname,
                'method', access_method.amname,
                'unique', index_info.indisunique,
                'columns', (
                    SELECT jsonb_agg(index_attribute.attname ORDER BY index_column.ordinality)
                    FROM unnest(index_info.indkey::smallint[]) WITH ORDINALITY AS index_column(attnum, ordinality)
                    JOIN pg_catalog.pg_attribute AS index_attribute
                      ON index_attribute.attrelid = index_info.indrelid
                     AND index_attribute.attnum = index_column.attnum
                    WHERE index_column.ordinality <= index_info.indnkeyatts
                      AND index_column.attnum > 0
                )
            ) ORDER BY index_relation.relname)
            FROM pg_catalog.pg_index AS index_info
            JOIN pg_catalog.pg_class AS index_relation ON index_relation.oid = index_info.indexrelid
            JOIN pg_catalog.pg_am AS access_method ON access_method.oid = index_relation.relam
            WHERE index_info.indrelid = table_catalog.relation_oid
        ), '[]'::jsonb),
        'rls', jsonb_build_object(
            'enabled', table_catalog.relrowsecurity,
            'policies', COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                    'name', policy.polname,
                    'command', CASE policy.polcmd
                        WHEN 'r' THEN 'SELECT'
                        WHEN 'a' THEN 'INSERT'
                        WHEN 'w' THEN 'UPDATE'
                        WHEN 'd' THEN 'DELETE'
                        WHEN '*' THEN 'ALL'
                    END
                ) ORDER BY policy.polname)
                FROM pg_catalog.pg_policy AS policy
                WHERE policy.polrelid = table_catalog.relation_oid
            ), '[]'::jsonb)
        ),
        'grants', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('role', grant_row.role_name, 'privileges', grant_row.privileges) ORDER BY grant_row.role_name)
            FROM (
                SELECT COALESCE(database_role.rolname, 'PUBLIC') AS role_name,
                       jsonb_agg(DISTINCT acl.privilege_type ORDER BY acl.privilege_type) AS privileges
                FROM pg_catalog.aclexplode(COALESCE(
                    table_catalog.relacl,
                    pg_catalog.acldefault('r', table_catalog.relowner)
                )) AS acl
                LEFT JOIN pg_catalog.pg_roles AS database_role ON database_role.oid = acl.grantee
                WHERE acl.grantee = 0
                   OR database_role.rolname IN ('anon', 'authenticated', 'service_role')
                GROUP BY acl.grantee, database_role.rolname
            ) AS grant_row
        ), '[]'::jsonb)
    ) ORDER BY table_catalog.table_name) AS result
    FROM table_catalog
)
SELECT jsonb_build_object(
    'schema', jsonb_build_object(
        'name', 'beta',
        'grants', COALESCE((
            SELECT jsonb_agg(jsonb_build_object('role', grant_row.role_name, 'privileges', grant_row.privileges) ORDER BY grant_row.role_name)
            FROM pg_catalog.pg_namespace AS schema_ns
            CROSS JOIN LATERAL (
                SELECT COALESCE(database_role.rolname, 'PUBLIC') AS role_name,
                       jsonb_agg(DISTINCT acl.privilege_type ORDER BY acl.privilege_type) AS privileges
                FROM pg_catalog.aclexplode(COALESCE(schema_ns.nspacl, pg_catalog.acldefault('n', schema_ns.nspowner))) AS acl
                LEFT JOIN pg_catalog.pg_roles AS database_role ON database_role.oid = acl.grantee
                WHERE acl.grantee = 0 OR database_role.rolname IN ('anon', 'authenticated', 'service_role')
                GROUP BY acl.grantee, database_role.rolname
            ) AS grant_row
            WHERE schema_ns.nspname = 'beta'
        ), '[]'::jsonb)
    ),
    'missing_tables', COALESCE((
        SELECT jsonb_agg(approved.table_name ORDER BY approved.table_name)
        FROM approved_tables AS approved
        LEFT JOIN table_catalog ON table_catalog.table_name = approved.table_name
        WHERE table_catalog.table_name IS NULL
    ), '[]'::jsonb),
    'tables', COALESCE((SELECT tables.result FROM tables), '[]'::jsonb),
    'rpcs', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
            'name', procedure.proname,
            'security_definer', procedure.prosecdef,
            'execute_roles', COALESCE((
                SELECT jsonb_agg(DISTINCT COALESCE(database_role.rolname, 'PUBLIC') ORDER BY COALESCE(database_role.rolname, 'PUBLIC'))
                FROM pg_catalog.aclexplode(COALESCE(procedure.proacl, pg_catalog.acldefault('f', procedure.proowner))) AS acl
                LEFT JOIN pg_catalog.pg_roles AS database_role ON database_role.oid = acl.grantee
                WHERE acl.privilege_type = 'EXECUTE'
                  AND (acl.grantee = 0 OR database_role.rolname IN ('anon', 'authenticated', 'service_role'))
            ), '[]'::jsonb)
        ) ORDER BY procedure.proname)
        FROM pg_catalog.pg_proc AS procedure
        JOIN pg_catalog.pg_namespace AS procedure_schema ON procedure_schema.oid = procedure.pronamespace
        WHERE procedure_schema.nspname = 'beta'
          AND procedure.proname IN (
              'get_admin_database_schema',
              'get_admin_database_page',
              'get_knowledge_admin_overview',
              'upsert_movidesk_knowledge_record'
          )
    ), '[]'::jsonb)
);
$$;

CREATE OR REPLACE FUNCTION beta.get_admin_database_page(
    p_table_key text,
    p_page_size integer DEFAULT 25,
    p_after_id bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    result_rows jsonb;
    next_cursor text;
BEGIN
    IF p_table_key IS NULL OR p_table_key NOT IN ('source_system', 'source_record', 'knowledge_ingest_audit') THEN
        RAISE EXCEPTION 'unsupported table key' USING ERRCODE = '22023';
    END IF;
    IF p_page_size IS NULL OR p_page_size < 1 OR p_page_size > 25 THEN
        RAISE EXCEPTION 'page size is outside the allowed range' USING ERRCODE = '22023';
    END IF;
    IF p_after_id IS NOT NULL AND p_after_id < 1 THEN
        RAISE EXCEPTION 'cursor is outside the allowed range' USING ERRCODE = '22023';
    END IF;

    IF p_table_key = 'source_system' THEN
        WITH page AS MATERIALIZED (
            SELECT id, code, name, active, created_at
            FROM beta.source_system
            WHERE p_after_id IS NULL OR id > p_after_id
            ORDER BY id ASC
            LIMIT p_page_size + 1
        ), numbered AS (
            SELECT page.*, row_number() OVER (ORDER BY id ASC) AS row_number
            FROM page
        )
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
                   'id', id::text, 'code', code, 'name', name, 'active', active, 'created_at', created_at
               ) ORDER BY id ASC) FILTER (WHERE row_number <= p_page_size), '[]'::jsonb),
               CASE WHEN count(*) > p_page_size THEN max(id::text) FILTER (WHERE row_number = p_page_size) ELSE NULL END
          INTO result_rows, next_cursor
          FROM numbered;
    ELSIF p_table_key = 'source_record' THEN
        WITH page AS MATERIALIZED (
            SELECT id, source_system_id, external_id, record_type, status, classification,
                   source_created_at, source_updated_at, imported_at, deleted_at
            FROM beta.source_record
            WHERE p_after_id IS NULL OR id < p_after_id
            ORDER BY id DESC
            LIMIT p_page_size + 1
        ), numbered AS (
            SELECT page.*, row_number() OVER (ORDER BY id DESC) AS row_number
            FROM page
        )
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
                   'id', id::text, 'source_system_id', source_system_id, 'external_id', external_id,
                   'record_type', record_type, 'status', status, 'classification', classification,
                   'source_created_at', source_created_at, 'source_updated_at', source_updated_at,
                   'imported_at', imported_at, 'deleted_at', deleted_at
               ) ORDER BY id DESC) FILTER (WHERE row_number <= p_page_size), '[]'::jsonb),
               CASE WHEN count(*) > p_page_size THEN max(id::text) FILTER (WHERE row_number = p_page_size) ELSE NULL END
          INTO result_rows, next_cursor
          FROM numbered;
    ELSE
        WITH page AS MATERIALIZED (
            SELECT id, source_record_id, operation, chunk_count, created_at
            FROM beta.knowledge_ingest_audit
            WHERE p_after_id IS NULL OR id < p_after_id
            ORDER BY id DESC
            LIMIT p_page_size + 1
        ), numbered AS (
            SELECT page.*, row_number() OVER (ORDER BY id DESC) AS row_number
            FROM page
        )
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
                   'id', id::text, 'source_record_id', source_record_id::text,
                   'operation', operation, 'chunk_count', chunk_count, 'created_at', created_at
               ) ORDER BY id DESC) FILTER (WHERE row_number <= p_page_size), '[]'::jsonb),
               CASE WHEN count(*) > p_page_size THEN max(id::text) FILTER (WHERE row_number = p_page_size) ELSE NULL END
          INTO result_rows, next_cursor
          FROM numbered;
    END IF;

    RETURN jsonb_build_object(
        'table', p_table_key,
        'rows', COALESCE(result_rows, '[]'::jsonb),
        'next_cursor', next_cursor,
        'page_size', p_page_size
    );
END;
$$;

REVOKE ALL ON FUNCTION beta.get_admin_database_schema() FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.get_admin_database_page(text, integer, bigint) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION beta.get_admin_database_schema() TO service_role;
GRANT EXECUTE ON FUNCTION beta.get_admin_database_page(text, integer, bigint) TO service_role;

COMMIT;
