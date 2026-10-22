-- Bounded lexical retrieval over approved records in the shared knowledge copy.
-- The MCP validates the analyst's OAuth scope before calling this SECURITY DEFINER RPC.

BEGIN;

CREATE OR REPLACE FUNCTION beta.search_knowledge(
    p_query text,
    p_limit integer DEFAULT 5
)
RETURNS TABLE (
    record_id text,
    external_id text,
    record_type text,
    title text,
    source_name text,
    source_created_at timestamp with time zone,
    section_title text,
    excerpt text,
    relevance real
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_query_text text;
    v_query tsquery;
BEGIN
    IF p_query IS NULL OR length(btrim(p_query)) < 3 OR length(p_query) > 500
       OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10 THEN
        RAISE EXCEPTION 'invalid knowledge search request' USING ERRCODE = '22023';
    END IF;

    -- Build an OR query from at most 20 normalized, prefix-matched terms. This
    -- tolerates long natural-language symptom descriptions without requiring
    -- every word to occur in the same chunk. The input is split before being
    -- quoted as tsquery lexemes, so it cannot inject tsquery operators.
    SELECT string_agg(pg_catalog.quote_literal(term) || ':*', ' | ' ORDER BY first_position)
    INTO v_query_text
    FROM (
        SELECT term, min(position) AS first_position
        FROM (
            SELECT pg_catalog.lower(word) AS term, position
            FROM pg_catalog.regexp_split_to_table(pg_catalog.btrim(p_query), '[^[:alnum:]]+')
                 WITH ORDINALITY AS split(word, position)
            WHERE pg_catalog.char_length(word) BETWEEN 3 AND 40
              AND pg_catalog.lower(word) NOT IN (
                  'com', 'uma', 'que', 'para', 'dos', 'das', 'por', 'sem', 'mais',
                  'the', 'and', 'for', 'from', 'this', 'that'
              )
        ) AS words
        GROUP BY term
        ORDER BY first_position
        LIMIT 20
    ) AS terms;

    IF v_query_text IS NULL THEN
        RETURN;
    END IF;
    v_query := pg_catalog.to_tsquery('simple'::pg_catalog.regconfig, v_query_text);

    RETURN QUERY
    SELECT
        sr.id::text,
        sr.external_id,
        pg_catalog.left(sr.record_type, 80),
        pg_catalog.left(sr.title, 500),
        pg_catalog.left(ss.name, 120),
        sr.source_created_at,
        rc.section_title,
        pg_catalog.left(rc.content, 1600),
        CASE
            WHEN sr.external_id = pg_catalog.btrim(p_query) THEN 1.0::real
            WHEN pg_catalog.ts_rank_cd(rc.search_vector, v_query)
                 >= pg_catalog.ts_rank_cd(pg_catalog.to_tsvector('simple'::pg_catalog.regconfig, sr.title), v_query)
                THEN pg_catalog.ts_rank_cd(rc.search_vector, v_query)
            ELSE pg_catalog.ts_rank_cd(pg_catalog.to_tsvector('simple'::pg_catalog.regconfig, sr.title), v_query)
        END::real
    FROM beta.record_chunk AS rc
    JOIN beta.source_record AS sr ON sr.id = rc.source_record_id
    JOIN beta.source_system AS ss ON ss.id = sr.source_system_id
    WHERE sr.deleted_at IS NULL
      AND sr.classification IN ('internal', 'shareable')
      AND ss.active
      AND (
          rc.search_vector @@ v_query
          OR pg_catalog.to_tsvector('simple'::pg_catalog.regconfig, sr.title) @@ v_query
          OR sr.external_id = pg_catalog.btrim(p_query)
      )
    ORDER BY
        9 DESC,
        sr.source_updated_at DESC NULLS LAST,
        sr.imported_at DESC,
        rc.ordinal ASC
    LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION beta.search_knowledge(text, integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION beta.search_knowledge(text, integer) TO service_role;

COMMIT;
