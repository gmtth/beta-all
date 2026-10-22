BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SELECT extensions.plan(3);

INSERT INTO beta.source_system (code, name, active)
VALUES ('knowledge-search-ranking-test', 'Search Ranking Test', true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO beta.source_record (source_system_id, external_id, record_type, title, classification)
SELECT id, 'ranking-match', 'test', 'Machine offline status on panel', 'internal'
FROM beta.source_system
WHERE code = 'knowledge-search-ranking-test'
ON CONFLICT (source_system_id, external_id) DO NOTHING;

INSERT INTO beta.record_chunk (source_record_id, ordinal, section_title, content)
SELECT id, 0, 'Test', 'searchrankzzq: The machine is offline on the panel while the process still operates.'
FROM beta.source_record
WHERE external_id = 'ranking-match'
ON CONFLICT (source_record_id, ordinal) DO NOTHING;

INSERT INTO beta.source_record (source_system_id, external_id, record_type, title, classification)
SELECT id, 'ranking-noise', 'test', 'Panel filter', 'internal'
FROM beta.source_system
WHERE code = 'knowledge-search-ranking-test'
ON CONFLICT (source_system_id, external_id) DO NOTHING;

INSERT INTO beta.record_chunk (source_record_id, ordinal, section_title, content)
SELECT id, 0, 'Test', 'searchrankzzq: The panel lists machine records and filter options.'
FROM beta.source_record
WHERE external_id = 'ranking-noise'
ON CONFLICT (source_record_id, ordinal) DO NOTHING;

SELECT extensions.is(
    (
        SELECT result.external_id
        FROM beta.search_knowledge('machine offline panel searchrankzzq', 10) AS result
        WHERE result.external_id IN ('ranking-match', 'ranking-noise')
        ORDER BY result.relevance DESC
        LIMIT 1
    ),
    'ranking-match',
    'the record covering more query terms ranks above a noisy partial match'
);

SELECT extensions.ok(
    (
        SELECT result.relevance >= 0.0 AND result.relevance <= 1.0
        FROM beta.search_knowledge('machine offline panel searchrankzzq', 10) AS result
        WHERE result.external_id = 'ranking-match'
    ),
    'lexical relevance is a bounded score, not a confidence percentage'
);

SELECT extensions.is(
    (
        SELECT result.relevance
        FROM beta.search_knowledge('ranking-match', 5) AS result
        WHERE result.external_id = 'ranking-match'
    ),
    1.0::real,
    'exact internal ID lookup retains its exact-match score'
);

SELECT * FROM extensions.finish();
ROLLBACK;
