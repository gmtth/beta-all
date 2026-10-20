-- Baseline snapshot of the catalog inspected on 2026-10-20. It preserves the
-- observed grants so an existing project can be baselined faithfully. Apply
-- the following hardening migration immediately on a fresh project. Do not
-- run this file against the already initialized project; register it as
-- applied only after verifying that the complete catalog, including grants,
-- matches this baseline.

CREATE SCHEMA IF NOT EXISTS beta;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE beta.source_system (
    id smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT source_system_code_key UNIQUE (code),
    CONSTRAINT source_system_pkey PRIMARY KEY (id)
);

CREATE TABLE beta.source_record (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    source_system_id smallint NOT NULL,
    external_id text NOT NULL,
    record_type text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    status text,
    classification text DEFAULT 'internal'::text NOT NULL,
    source_url text,
    source_created_at timestamp with time zone,
    source_updated_at timestamp with time zone,
    imported_at timestamp with time zone DEFAULT now() NOT NULL,
    content_hash text,
    attributes jsonb DEFAULT '{}'::jsonb NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT source_record_classification_check
        CHECK (classification = ANY (ARRAY['shareable'::text, 'internal'::text, 'restricted'::text, 'confidential'::text])),
    CONSTRAINT source_record_pkey PRIMARY KEY (id),
    CONSTRAINT source_record_source_system_id_external_id_key UNIQUE (source_system_id, external_id),
    CONSTRAINT source_record_source_system_id_fkey
        FOREIGN KEY (source_system_id) REFERENCES beta.source_system(id)
);

CREATE TABLE beta.record_chunk (
    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    source_record_id bigint NOT NULL,
    ordinal integer NOT NULL,
    section_title text DEFAULT ''::text NOT NULL,
    content text NOT NULL,
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector(
            'simple'::regconfig,
            (COALESCE(section_title, ''::text) || ' '::text) || COALESCE(content, ''::text)
        )
    ) STORED,
    CONSTRAINT record_chunk_pkey PRIMARY KEY (id),
    CONSTRAINT record_chunk_source_record_id_fkey
        FOREIGN KEY (source_record_id) REFERENCES beta.source_record(id) ON DELETE CASCADE,
    CONSTRAINT record_chunk_source_record_id_ordinal_key UNIQUE (source_record_id, ordinal)
);

CREATE INDEX record_chunk_search_idx
    ON beta.record_chunk USING gin (search_vector);
CREATE INDEX record_chunk_source_record_idx
    ON beta.record_chunk USING btree (source_record_id);
CREATE INDEX source_record_classification_idx
    ON beta.source_record USING btree (classification);
CREATE INDEX source_record_type_status_idx
    ON beta.source_record USING btree (record_type, status);

ALTER TABLE beta.source_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.source_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.record_chunk ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA beta TO service_role;

-- Historical grants observed in the live catalog on 2026-10-20. The next
-- migration revokes these broader table privileges and retains only the
-- source-list reader's SELECT permission.
GRANT SELECT, INSERT, UPDATE, DELETE
    ON ALL TABLES IN SCHEMA beta
    TO anon, authenticated, service_role;
