-- Rank lexical candidates by how much of the user's query they actually cover.
-- Exact internal IDs and Movidesk protocols remain exact-match overrides.
BEGIN;

CREATE OR REPLACE FUNCTION beta.search_knowledge(
    p_query text,
    p_limit integer DEFAULT 5
)
RETURNS TABLE (
    record_id text,
    external_id text,
    protocol text,
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
    v_terms text[];
    v_query_text text;
    v_query tsquery;
    v_term_count integer;
BEGIN
    IF p_query IS NULL OR length(btrim(p_query)) < 3 OR length(p_query) > 500
       OR p_limit IS NULL OR p_limit < 1 OR p_limit > 10 THEN
        RAISE EXCEPTION 'invalid knowledge search request' USING ERRCODE = '22023';
    END IF;

    -- Keep the same bounded, prefix-tolerant query contract as the preceding
    -- migration. Terms are split and deduplicated before becoming tsquery input.
    SELECT array_agg(term ORDER BY first_position)
    INTO v_terms
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

    IF v_terms IS NULL OR pg_catalog.cardinality(v_terms) = 0 THEN
        RETURN;
    END IF;

    v_term_count := pg_catalog.cardinality(v_terms);
    SELECT pg_catalog.string_agg(pg_catalog.quote_literal(term) || ':*', ' | ' ORDER BY ordinal)
    INTO v_query_text
    FROM pg_catalog.unnest(v_terms) WITH ORDINALITY AS query_term(term, ordinal);

    v_query := pg_catalog.to_tsquery('simple'::pg_catalog.regconfig, v_query_text);

    RETURN QUERY
    WITH query_terms AS MATERIALIZED (
        SELECT
            query_term.term,
            pg_catalog.to_tsquery(
                'simple'::pg_catalog.regconfig,
                pg_catalog.quote_literal(query_term.term) || ':*'
            ) AS term_query
        FROM pg_catalog.unnest(v_terms) AS query_term(term)
    ), candidates AS (
        SELECT
            sr.id::text AS candidate_record_id,
            sr.external_id AS candidate_external_id,
            CASE WHEN ss.name = 'Movidesk' THEN NULLIF(sr.attributes ->> 'protocol', '') END AS candidate_protocol,
            pg_catalog.left(sr.record_type, 80) AS candidate_record_type,
            pg_catalog.left(sr.title, 500) AS candidate_title,
            pg_catalog.left(ss.name, 120) AS candidate_source_name,
            sr.source_created_at AS candidate_created_at,
            rc.section_title AS candidate_section_title,
            pg_catalog.left(rc.content, 1600) AS candidate_excerpt,
            CASE
                WHEN sr.external_id = pg_catalog.btrim(p_query)
                  OR (ss.name = 'Movidesk' AND sr.attributes ->> 'protocol' = pg_catalog.btrim(p_query))
                    THEN 1.0::real
                ELSE (
                    0.70::real * (
                        SELECT (pg_catalog.count(*) FILTER (
                            WHERE query_terms.term_query @@ rc.search_vector
                        ))::real / v_term_count::real
                        FROM query_terms
                    )
                    + 0.20::real * (
                        SELECT (pg_catalog.count(*) FILTER (
                            WHERE query_terms.term_query @@ title_doc.search_vector
                        ))::real / v_term_count::real
                        FROM query_terms
                    )
                    + 0.10::real * (
                        greatest(
                            pg_catalog.ts_rank_cd(rc.search_vector, v_query, 32),
                            pg_catalog.ts_rank_cd(title_doc.search_vector, v_query, 32)
                        )
                        / (
                            1.0::real + greatest(
                                pg_catalog.ts_rank_cd(rc.search_vector, v_query, 32),
                                pg_catalog.ts_rank_cd(title_doc.search_vector, v_query, 32)
                            )
                        )
                    )
                )::real
            END AS candidate_relevance,
            rc.ordinal AS chunk_ordinal,
            sr.source_updated_at AS candidate_updated_at,
            sr.imported_at AS candidate_imported_at,
            sr.id AS internal_record_id
        FROM beta.record_chunk AS rc
        JOIN beta.source_record AS sr ON sr.id = rc.source_record_id
        JOIN beta.source_system AS ss ON ss.id = sr.source_system_id
        CROSS JOIN LATERAL (
            SELECT pg_catalog.to_tsvector('simple'::pg_catalog.regconfig, sr.title) AS search_vector
        ) AS title_doc
        WHERE sr.deleted_at IS NULL
          AND sr.classification IN ('internal', 'shareable')
          AND ss.active
          AND (
              rc.search_vector @@ v_query
              OR title_doc.search_vector @@ v_query
              OR sr.external_id = pg_catalog.btrim(p_query)
              OR (ss.name = 'Movidesk' AND sr.attributes ->> 'protocol' = pg_catalog.btrim(p_query))
          )
    ), ranked AS (
        SELECT candidates.*,
               pg_catalog.row_number() OVER (
                   PARTITION BY internal_record_id
                   ORDER BY candidate_relevance DESC, chunk_ordinal ASC
               ) AS record_rank
        FROM candidates
    )
    SELECT
        candidate_record_id,
        candidate_external_id,
        candidate_protocol,
        candidate_record_type,
        candidate_title,
        candidate_source_name,
        candidate_created_at,
        candidate_section_title,
        candidate_excerpt,
        candidate_relevance
    FROM ranked
    WHERE record_rank = 1
    ORDER BY
        candidate_relevance DESC,
        candidate_updated_at DESC NULLS LAST,
        candidate_imported_at DESC,
        chunk_ordinal ASC
    LIMIT p_limit;
END;
$$;

REVOKE ALL ON FUNCTION beta.search_knowledge(text, integer) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION beta.search_knowledge(text, integer) TO service_role;

COMMIT;
