-- Schema for explicit feedback and Beta self-diagnostics.
-- Applying schema does not enable collection. Keep runtime capture disabled
-- until the privacy notice/terms and production owner/contact are confirmed.

BEGIN;

CREATE TABLE beta.feedback_cluster (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    label text NOT NULL,
    summary text NOT NULL DEFAULT '',
    status text NOT NULL DEFAULT 'suggested',
    grouping_source text NOT NULL DEFAULT 'ai',
    grouping_version text NOT NULL,
    confidence numeric(4,3),
    merged_into uuid,
    created_by_user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + interval '12 months') NOT NULL,
    reviewed_by_user_id text,
    reviewed_at timestamp with time zone,
    CONSTRAINT feedback_cluster_pkey PRIMARY KEY (id),
    CONSTRAINT feedback_cluster_category_check CHECK (category IN (
        'answer_quality', 'missing_context', 'knowledge_coverage',
        'tool_capability', 'tool_execution_follow_through',
        'latency_experience', 'connection_experience',
        'result_relevance', 'other_review_required'
    )),
    CONSTRAINT feedback_cluster_label_check CHECK (length(btrim(label)) BETWEEN 1 AND 180),
    CONSTRAINT feedback_cluster_summary_check CHECK (length(summary) <= 1200),
    CONSTRAINT feedback_cluster_status_check CHECK (status IN ('suggested', 'confirmed', 'merged', 'dismissed')),
    CONSTRAINT feedback_cluster_grouping_source_check CHECK (grouping_source IN ('ai', 'human')),
    CONSTRAINT feedback_cluster_grouping_version_check CHECK (length(btrim(grouping_version)) BETWEEN 1 AND 80),
    CONSTRAINT feedback_cluster_confidence_check CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 1),
    CONSTRAINT feedback_cluster_merge_check CHECK ((status = 'merged') = (merged_into IS NOT NULL)),
    CONSTRAINT feedback_cluster_no_self_merge_check CHECK (merged_into IS NULL OR merged_into <> id),
    CONSTRAINT feedback_cluster_expiry_check CHECK (expires_at > created_at),
    CONSTRAINT feedback_cluster_merged_into_fkey FOREIGN KEY (merged_into)
        REFERENCES beta.feedback_cluster(id)
);

CREATE TABLE beta.feedback_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    idempotency_key uuid NOT NULL,
    schema_version smallint NOT NULL DEFAULT 1,
    event_type text NOT NULL,
    category text NOT NULL,
    signal_source text NOT NULL,
    feedback_polarity text,
    friction_level smallint NOT NULL,
    frustration_evidence text NOT NULL DEFAULT 'none',
    user_confirmed boolean,
    actor_status text NOT NULL,
    actor_user_id text,
    actor_email text,
    unidentified_reason text,
    context jsonb NOT NULL,
    declared_reason text,
    reason_category text,
    reason_inference text,
    reason_confidence numeric(4,3),
    tool_event_ref text,
    cluster_id uuid,
    review_status text NOT NULL DEFAULT 'new',
    recorded_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + interval '90 days') NOT NULL,
    CONSTRAINT feedback_event_pkey PRIMARY KEY (id),
    CONSTRAINT feedback_event_idempotency_key_key UNIQUE (idempotency_key),
    CONSTRAINT feedback_event_schema_version_check CHECK (schema_version = 1),
    CONSTRAINT feedback_event_type_check CHECK (event_type IN (
        'feedback', 'knowledge_gap', 'capability_gap', 'experience_issue', 'self_diagnosis'
    )),
    CONSTRAINT feedback_event_category_check CHECK (category IN (
        'answer_quality', 'missing_context', 'knowledge_coverage',
        'tool_capability', 'tool_execution_follow_through',
        'latency_experience', 'connection_experience',
        'result_relevance', 'other_review_required'
    )),
    CONSTRAINT feedback_event_signal_source_check CHECK (signal_source IN (
        'explicit_user', 'user_confirmed_inference', 'agent_self_report', 'observed_task_outcome'
    )),
    CONSTRAINT feedback_event_polarity_check CHECK (
        feedback_polarity IS NULL OR feedback_polarity IN ('positive', 'negative', 'corrective', 'neutral')
    ),
    CONSTRAINT feedback_event_feedback_polarity_required_check CHECK (
        event_type <> 'feedback' OR feedback_polarity IS NOT NULL
    ),
    CONSTRAINT feedback_event_friction_level_check CHECK (friction_level BETWEEN 0 AND 3),
    CONSTRAINT feedback_event_frustration_evidence_check CHECK (frustration_evidence IN (
        'none', 'explicit_emotion', 'user_confirmed_inference'
    )),
    CONSTRAINT feedback_event_confirmed_inference_source_check CHECK (
        frustration_evidence <> 'user_confirmed_inference' OR signal_source = 'user_confirmed_inference'
    ),
    CONSTRAINT feedback_event_explicit_emotion_source_check CHECK (
        frustration_evidence <> 'explicit_emotion' OR signal_source = 'explicit_user'
    ),
    CONSTRAINT feedback_event_user_confirmed_check CHECK (
        user_confirmed IS NULL OR (user_confirmed = true AND signal_source = 'user_confirmed_inference')
    ),
    CONSTRAINT feedback_event_actor_status_check CHECK (actor_status IN ('identified', 'unidentified')),
    CONSTRAINT feedback_event_actor_identity_check CHECK (
        (actor_status = 'identified' AND actor_user_id IS NOT NULL AND length(btrim(actor_user_id)) BETWEEN 1 AND 200
            AND actor_email IS NOT NULL AND length(btrim(actor_email)) BETWEEN 3 AND 320
            AND unidentified_reason IS NULL)
        OR (actor_status = 'unidentified' AND actor_user_id IS NULL AND actor_email IS NULL
            AND unidentified_reason IS NOT NULL AND length(btrim(unidentified_reason)) BETWEEN 1 AND 160)
    ),
    CONSTRAINT feedback_event_context_check CHECK (
        jsonb_typeof(context) = 'object' AND octet_length(context::text) <= 12000
    ),
    CONSTRAINT feedback_event_declared_reason_check CHECK (declared_reason IS NULL OR length(declared_reason) <= 600),
    CONSTRAINT feedback_event_reason_category_check CHECK (reason_category IS NULL OR reason_category IN (
        'repeated_unmet_request', 'slow_response', 'tool_error', 'inaccurate_answer',
        'missing_information', 'irrelevant_result', 'other', 'unknown'
    )),
    CONSTRAINT feedback_event_reason_inference_check CHECK (reason_inference IS NULL OR length(reason_inference) <= 600),
    CONSTRAINT feedback_event_reason_confidence_check CHECK (reason_confidence IS NULL OR reason_confidence BETWEEN 0 AND 1),
    CONSTRAINT feedback_event_reason_separation_check CHECK (
        (reason_inference IS NULL AND reason_confidence IS NULL)
        OR (reason_inference IS NOT NULL AND reason_confidence IS NOT NULL)
    ),
    CONSTRAINT feedback_event_tool_event_ref_check CHECK (tool_event_ref IS NULL OR length(tool_event_ref) <= 200),
    CONSTRAINT feedback_event_review_status_check CHECK (review_status IN ('new', 'reviewed', 'resolved', 'dismissed')),
    CONSTRAINT feedback_event_expiry_check CHECK (expires_at > recorded_at),
    CONSTRAINT feedback_event_cluster_fkey FOREIGN KEY (cluster_id)
        REFERENCES beta.feedback_cluster(id) ON DELETE SET NULL
);

CREATE TABLE beta.feedback_event_profanity (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    exact_term text NOT NULL,
    normalized_term text NOT NULL,
    target text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_event_profanity_pkey PRIMARY KEY (id),
    CONSTRAINT feedback_event_profanity_event_term_key UNIQUE (event_id, normalized_term, target),
    CONSTRAINT feedback_event_profanity_exact_check CHECK (length(btrim(exact_term)) BETWEEN 1 AND 80),
    CONSTRAINT feedback_event_profanity_normalized_check CHECK (length(btrim(normalized_term)) BETWEEN 1 AND 80),
    CONSTRAINT feedback_event_profanity_target_check CHECK (target IN ('beta', 'other_person', 'unclear')),
    CONSTRAINT feedback_event_profanity_event_fkey FOREIGN KEY (event_id)
        REFERENCES beta.feedback_event(id) ON DELETE CASCADE
);

CREATE TABLE beta.feedback_monthly_aggregate (
    month_start date NOT NULL,
    actor_bucket text NOT NULL,
    actor_user_id text,
    actor_email text,
    event_type text NOT NULL,
    category text NOT NULL,
    signal_source text NOT NULL,
    feedback_polarity text NOT NULL DEFAULT '',
    friction_level smallint NOT NULL,
    cluster_id uuid,
    cluster_bucket uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    event_count bigint NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_monthly_aggregate_actor_check CHECK (
        (actor_bucket = '__unidentified__' AND actor_user_id IS NULL AND actor_email IS NULL)
        OR (actor_bucket <> '__unidentified__'
            AND actor_user_id IS NOT NULL
            AND actor_user_id = actor_bucket
            AND actor_email IS NOT NULL)
    ),
    CONSTRAINT feedback_monthly_aggregate_event_type_check CHECK (event_type IN (
        'feedback', 'knowledge_gap', 'capability_gap', 'experience_issue', 'self_diagnosis'
    )),
    CONSTRAINT feedback_monthly_aggregate_category_check CHECK (category IN (
        'answer_quality', 'missing_context', 'knowledge_coverage',
        'tool_capability', 'tool_execution_follow_through',
        'latency_experience', 'connection_experience',
        'result_relevance', 'other_review_required'
    )),
    CONSTRAINT feedback_monthly_aggregate_signal_source_check CHECK (signal_source IN (
        'explicit_user', 'user_confirmed_inference', 'agent_self_report', 'observed_task_outcome'
    )),
    CONSTRAINT feedback_monthly_aggregate_polarity_check CHECK (feedback_polarity IN ('', 'positive', 'negative', 'corrective', 'neutral')),
    CONSTRAINT feedback_monthly_aggregate_friction_check CHECK (friction_level BETWEEN 0 AND 3),
    CONSTRAINT feedback_monthly_aggregate_count_check CHECK (event_count > 0),
    CONSTRAINT feedback_monthly_aggregate_cluster_key_check CHECK (
        cluster_bucket = COALESCE(cluster_id, '00000000-0000-0000-0000-000000000000'::uuid)
    ),
    CONSTRAINT feedback_monthly_aggregate_month_check CHECK (date_trunc('month', month_start::timestamp)::date = month_start),
    CONSTRAINT feedback_monthly_aggregate_cluster_fkey FOREIGN KEY (cluster_id)
        REFERENCES beta.feedback_cluster(id)
);

CREATE UNIQUE INDEX feedback_monthly_aggregate_dimensions_key
    ON beta.feedback_monthly_aggregate (
        month_start, actor_bucket, event_type, category, signal_source,
        feedback_polarity, friction_level, cluster_bucket
    );

CREATE TABLE beta.feedback_monthly_profanity (
    month_start date NOT NULL,
    actor_bucket text NOT NULL,
    actor_user_id text,
    actor_email text,
    normalized_term text NOT NULL,
    target text NOT NULL,
    reason_category text NOT NULL,
    event_count bigint NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_monthly_profanity_actor_check CHECK (
        (actor_bucket = '__unidentified__' AND actor_user_id IS NULL AND actor_email IS NULL)
        OR (actor_bucket <> '__unidentified__'
            AND actor_user_id IS NOT NULL
            AND actor_user_id = actor_bucket
            AND actor_email IS NOT NULL)
    ),
    CONSTRAINT feedback_monthly_profanity_term_check CHECK (length(btrim(normalized_term)) BETWEEN 1 AND 80),
    CONSTRAINT feedback_monthly_profanity_target_check CHECK (target IN ('beta', 'other_person', 'unclear')),
    CONSTRAINT feedback_monthly_profanity_reason_check CHECK (reason_category IN (
        'repeated_unmet_request', 'slow_response', 'tool_error', 'inaccurate_answer',
        'missing_information', 'irrelevant_result', 'other', 'unknown'
    )),
    CONSTRAINT feedback_monthly_profanity_count_check CHECK (event_count > 0),
    CONSTRAINT feedback_monthly_profanity_month_check CHECK (date_trunc('month', month_start::timestamp)::date = month_start)
);

CREATE UNIQUE INDEX feedback_monthly_profanity_dimensions_key
    ON beta.feedback_monthly_profanity (
        month_start, actor_bucket, normalized_term, target, reason_category
    );

CREATE TABLE beta.feedback_review_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    object_type text NOT NULL,
    object_id uuid NOT NULL,
    actor_user_id text NOT NULL,
    actor_email text NOT NULL,
    subject_user_hash text,
    action text NOT NULL,
    changed_fields text[] NOT NULL DEFAULT ARRAY[]::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + interval '90 days') NOT NULL,
    CONSTRAINT feedback_review_audit_pkey PRIMARY KEY (id),
    CONSTRAINT feedback_review_audit_object_type_check CHECK (object_type IN ('event', 'cluster', 'analyst')),
    CONSTRAINT feedback_review_audit_subject_hash_check CHECK (subject_user_hash IS NULL OR subject_user_hash ~ '^[a-f0-9]{64}$'),
    CONSTRAINT feedback_review_audit_action_check CHECK (action IN (
        'review', 'resolve', 'dismiss', 'confirm', 'correct', 'assign_cluster',
        'merge_cluster', 'split_cluster', 'delete'
    )),
    CONSTRAINT feedback_review_audit_expiry_check CHECK (expires_at > created_at)
);

CREATE INDEX feedback_event_expiry_idx ON beta.feedback_event (expires_at);
CREATE INDEX feedback_event_actor_time_idx ON beta.feedback_event (actor_user_id, recorded_at DESC);
CREATE INDEX feedback_event_review_time_idx ON beta.feedback_event (review_status, recorded_at DESC);
CREATE INDEX feedback_event_cluster_time_idx ON beta.feedback_event (cluster_id, recorded_at DESC);
CREATE INDEX feedback_event_profanity_term_idx ON beta.feedback_event_profanity (normalized_term, created_at DESC);
CREATE INDEX feedback_monthly_aggregate_time_idx ON beta.feedback_monthly_aggregate (month_start DESC, category);
CREATE INDEX feedback_monthly_aggregate_actor_idx ON beta.feedback_monthly_aggregate (actor_user_id, month_start DESC);
CREATE INDEX feedback_monthly_profanity_time_idx ON beta.feedback_monthly_profanity (month_start DESC, normalized_term);
CREATE INDEX feedback_monthly_profanity_actor_idx ON beta.feedback_monthly_profanity (actor_user_id, month_start DESC);
CREATE INDEX feedback_review_audit_expiry_idx ON beta.feedback_review_audit (expires_at);

-- The Worker must validate the OAuth principal and scope before invoking any
-- SECURITY DEFINER function. Actor identity is passed separately from model
-- content so event JSON cannot impersonate an analyst.
CREATE OR REPLACE FUNCTION beta.record_feedback_event(
    p_event jsonb,
    p_actor_user_id text,
    p_actor_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_event_id uuid;
    v_inserted boolean := false;
    v_term jsonb;
BEGIN
    IF p_event IS NULL OR jsonb_typeof(p_event) IS DISTINCT FROM 'object' THEN
        RAISE EXCEPTION 'feedback event must be a JSON object' USING ERRCODE = '22023';
    END IF;
    IF (p_actor_user_id IS NULL) <> (p_actor_email IS NULL)
       OR (p_actor_user_id IS NOT NULL AND length(btrim(p_actor_user_id)) NOT BETWEEN 1 AND 200)
       OR (p_actor_email IS NOT NULL AND length(btrim(p_actor_email)) NOT BETWEEN 3 AND 320) THEN
        RAISE EXCEPTION 'actor identity must be complete or explicitly unidentified' USING ERRCODE = '22023';
    END IF;
    IF p_actor_user_id IS NULL AND (
        p_event->>'actor_status' IS DISTINCT FROM 'unidentified'
        OR length(btrim(COALESCE(p_event->>'unidentified_reason', ''))) NOT BETWEEN 1 AND 160
    ) THEN
        RAISE EXCEPTION 'unidentified events require a bounded reason' USING ERRCODE = '22023';
    END IF;
    IF p_event ? 'profanity' AND jsonb_typeof(p_event->'profanity') <> 'array' THEN
        RAISE EXCEPTION 'profanity must be an array' USING ERRCODE = '22023';
    END IF;
    IF jsonb_array_length(COALESCE(p_event->'profanity', '[]'::jsonb)) > 5 THEN
        RAISE EXCEPTION 'at most five profanity terms may be recorded per event' USING ERRCODE = '22023';
    END IF;

    INSERT INTO beta.feedback_event (
        idempotency_key, schema_version, event_type, category, signal_source,
        feedback_polarity, friction_level, frustration_evidence, user_confirmed,
        actor_status, actor_user_id, actor_email, unidentified_reason, context, declared_reason,
        reason_category, reason_inference, reason_confidence, tool_event_ref
    ) VALUES (
        (p_event->>'idempotency_key')::uuid,
        COALESCE((p_event->>'schema_version')::smallint, 1),
        p_event->>'event_type', p_event->>'category', p_event->>'signal_source',
        nullif(p_event->>'feedback_polarity', ''),
        (p_event->>'friction_level')::smallint,
        COALESCE(p_event->>'frustration_evidence', 'none'),
        (p_event->>'user_confirmed')::boolean,
        CASE WHEN p_actor_user_id IS NULL THEN 'unidentified' ELSE 'identified' END,
        nullif(btrim(p_actor_user_id), ''), nullif(lower(btrim(p_actor_email)), ''),
        CASE WHEN p_actor_user_id IS NULL THEN btrim(p_event->>'unidentified_reason') ELSE NULL END,
        p_event->'context', p_event->>'declared_reason', p_event->>'reason_category',
        p_event->>'reason_inference', (p_event->>'reason_confidence')::numeric,
        p_event->>'tool_event_ref'
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_event_id;

    v_inserted := v_event_id IS NOT NULL;
    IF NOT v_inserted THEN
        SELECT id INTO v_event_id FROM beta.feedback_event
        WHERE idempotency_key = (p_event->>'idempotency_key')::uuid;
    ELSE
        FOR v_term IN SELECT value
            FROM jsonb_array_elements(COALESCE(p_event->'profanity', '[]'::jsonb)) AS terms(value)
        LOOP
            INSERT INTO beta.feedback_event_profanity (event_id, exact_term, normalized_term, target)
            VALUES (v_event_id, v_term->>'exact_term', v_term->>'normalized_term', v_term->>'target')
            ON CONFLICT (event_id, normalized_term, target) DO NOTHING;
        END LOOP;
    END IF;

    RETURN jsonb_build_object('event_id', v_event_id, 'inserted', v_inserted);
END;
$$;

CREATE OR REPLACE FUNCTION beta.list_feedback_groups(
    p_from date DEFAULT NULL,
    p_limit integer DEFAULT 25,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    group_id uuid,
    cluster_id uuid,
    category text,
    label text,
    summary text,
    status text,
    event_count bigint,
    last_recorded_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
    WITH grouped AS (
        SELECT c.id AS group_id, c.id AS cluster_id, c.category, c.label, c.summary,
               c.status, count(e.id)::bigint AS event_count, max(e.recorded_at) AS last_recorded_at
        FROM beta.feedback_cluster AS c
        LEFT JOIN beta.feedback_event AS e ON e.cluster_id = c.id
            AND e.expires_at > now()
            AND (p_from IS NULL OR e.recorded_at >= p_from::timestamp AT TIME ZONE 'UTC')
        GROUP BY c.id
    ), standalone AS (
        SELECT e.id AS group_id, NULL::uuid AS cluster_id, e.category,
               e.category AS label, ''::text AS summary, e.review_status AS status,
               1::bigint AS event_count, e.recorded_at AS last_recorded_at
        FROM beta.feedback_event AS e
        WHERE e.cluster_id IS NULL
          AND e.expires_at > now()
          AND (p_from IS NULL OR e.recorded_at >= p_from::timestamp AT TIME ZONE 'UTC')
    ), all_groups AS (
        SELECT * FROM grouped
        UNION ALL
        SELECT * FROM standalone
    )
    SELECT g.group_id, g.cluster_id, g.category, g.label, g.summary, g.status,
           g.event_count, g.last_recorded_at
    FROM all_groups AS g
    WHERE g.last_recorded_at IS NOT NULL
    ORDER BY g.last_recorded_at DESC, g.group_id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100)
    OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000);
$$;

CREATE OR REPLACE FUNCTION beta.list_feedback_group_events(
    p_group_id uuid,
    p_limit integer DEFAULT 25,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    event_id uuid,
    event_type text,
    category text,
    signal_source text,
    feedback_polarity text,
    friction_level smallint,
    frustration_evidence text,
    actor_user_id text,
    actor_email text,
    context jsonb,
    declared_reason text,
    reason_category text,
    reason_inference text,
    reason_confidence numeric,
    review_status text,
    recorded_at timestamp with time zone,
    profanity jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
    SELECT e.id, e.event_type, e.category, e.signal_source, e.feedback_polarity,
           e.friction_level, e.frustration_evidence, e.actor_user_id, e.actor_email,
           e.context, e.declared_reason, e.reason_category, e.reason_inference,
           e.reason_confidence, e.review_status, e.recorded_at,
           COALESCE((
               SELECT jsonb_agg(jsonb_build_object(
                   'exact_term', p.exact_term, 'normalized_term', p.normalized_term,
                   'target', p.target
               ) ORDER BY p.normalized_term)
               FROM beta.feedback_event_profanity AS p WHERE p.event_id = e.id
           ), '[]'::jsonb) AS profanity
    FROM beta.feedback_event AS e
    WHERE (e.cluster_id = p_group_id
       OR (e.id = p_group_id AND e.cluster_id IS NULL))
      AND e.expires_at > now()
    ORDER BY e.recorded_at DESC, e.id
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100)
    OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000);
$$;

CREATE OR REPLACE FUNCTION beta.get_feedback_summary(p_months integer DEFAULT 1)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
    WITH params_window AS (
        SELECT (date_trunc('month', now() AT TIME ZONE 'UTC')
            - (LEAST(GREATEST(COALESCE(p_months, 1), 1), 12) - 1) * interval '1 month')::date AS first_month
    ), selected AS (
        SELECT a.actor_bucket, a.actor_user_id, a.actor_email, a.category,
               a.signal_source, a.feedback_polarity, a.friction_level, a.event_count
        FROM beta.feedback_monthly_aggregate AS a, params_window AS w
        WHERE a.month_start >= w.first_month
        UNION ALL
        SELECT COALESCE(e.actor_user_id, '__unidentified__'), e.actor_user_id,
               e.actor_email, e.category, e.signal_source,
               COALESCE(e.feedback_polarity, ''), e.friction_level, 1::bigint
        FROM beta.feedback_event AS e, params_window AS w
        WHERE e.recorded_at >= w.first_month::timestamp AT TIME ZONE 'UTC'
          AND e.expires_at > now()
    ), profanity AS (
        SELECT p.actor_bucket, p.actor_user_id, p.actor_email, p.normalized_term,
               p.target, p.reason_category, p.event_count
        FROM beta.feedback_monthly_profanity AS p, params_window AS w
        WHERE p.month_start >= w.first_month
        UNION ALL
        SELECT COALESCE(e.actor_user_id, '__unidentified__'), e.actor_user_id,
               e.actor_email, p.normalized_term, p.target,
               COALESCE(e.reason_category, 'unknown'), 1::bigint
        FROM beta.feedback_event AS e
        JOIN beta.feedback_event_profanity AS p ON p.event_id = e.id,
             params_window AS w
        WHERE e.recorded_at >= w.first_month::timestamp AT TIME ZONE 'UTC'
          AND e.expires_at > now()
    )
    SELECT jsonb_build_object(
        'months', LEAST(GREATEST(COALESCE(p_months, 1), 1), 12),
        'by_category', COALESCE((SELECT jsonb_agg(jsonb_build_object('category', category, 'count', total) ORDER BY total DESC, category)
            FROM (SELECT category, sum(event_count)::bigint AS total FROM selected GROUP BY category) AS x), '[]'::jsonb),
        'by_friction_level', COALESCE((SELECT jsonb_agg(jsonb_build_object('level', friction_level, 'count', total) ORDER BY friction_level)
            FROM (SELECT friction_level, sum(event_count)::bigint AS total FROM selected GROUP BY friction_level) AS x), '[]'::jsonb),
        'by_signal_source', COALESCE((SELECT jsonb_agg(jsonb_build_object('source', signal_source, 'count', total) ORDER BY total DESC, signal_source)
            FROM (SELECT signal_source, sum(event_count)::bigint AS total FROM selected GROUP BY signal_source) AS x), '[]'::jsonb),
        'by_feedback_polarity', COALESCE((SELECT jsonb_agg(jsonb_build_object('polarity', nullif(feedback_polarity, ''), 'count', total) ORDER BY total DESC, feedback_polarity)
            FROM (SELECT feedback_polarity, sum(event_count)::bigint AS total FROM selected GROUP BY feedback_polarity) AS x), '[]'::jsonb),
        'by_analyst', COALESCE((SELECT jsonb_agg(jsonb_build_object('user_id', actor_user_id, 'email', actor_email, 'count', total) ORDER BY total DESC, actor_email)
            FROM (SELECT actor_user_id, max(actor_email) AS actor_email, sum(event_count)::bigint AS total
                  FROM selected
                  WHERE actor_bucket <> '__unidentified__'
                    AND (friction_level > 0 OR feedback_polarity IN ('negative', 'corrective'))
                  GROUP BY actor_user_id) AS x), '[]'::jsonb),
        'unidentified_count', COALESCE((SELECT sum(event_count)::bigint FROM selected WHERE actor_bucket = '__unidentified__'), 0),
        'profanity_occurrences', COALESCE((SELECT sum(event_count)::bigint FROM profanity), 0)
    );
$$;

CREATE OR REPLACE FUNCTION beta.list_feedback_profanity(
    p_months integer DEFAULT 1,
    p_limit integer DEFAULT 25,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    normalized_term text,
    target text,
    reason_category text,
    actor_user_id text,
    actor_email text,
    identified boolean,
    event_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
    WITH params_window AS (
        SELECT (date_trunc('month', now() AT TIME ZONE 'UTC')
            - (LEAST(GREATEST(COALESCE(p_months, 1), 1), 12) - 1) * interval '1 month')::date AS first_month
    ), occurrences AS (
        SELECT p.actor_bucket, p.actor_user_id, p.actor_email, p.normalized_term,
               p.target, p.reason_category, p.event_count
        FROM beta.feedback_monthly_profanity AS p, params_window AS w
        WHERE p.month_start >= w.first_month
        UNION ALL
        SELECT COALESCE(e.actor_user_id, '__unidentified__'), e.actor_user_id,
               e.actor_email, p.normalized_term, p.target,
               COALESCE(e.reason_category, 'unknown'), 1::bigint
        FROM beta.feedback_event AS e
        JOIN beta.feedback_event_profanity AS p ON p.event_id = e.id,
             params_window AS w
        WHERE e.recorded_at >= w.first_month::timestamp AT TIME ZONE 'UTC'
          AND e.expires_at > now()
    )
    SELECT o.normalized_term, o.target, o.reason_category, o.actor_user_id,
           max(o.actor_email) AS actor_email, o.actor_bucket <> '__unidentified__',
           sum(o.event_count)::bigint AS event_count
    FROM occurrences AS o
    GROUP BY o.normalized_term, o.target, o.reason_category, o.actor_bucket, o.actor_user_id
    ORDER BY event_count DESC, o.normalized_term, o.actor_bucket
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 25), 1), 100)
    OFFSET LEAST(GREATEST(COALESCE(p_offset, 0), 0), 10000);
$$;

CREATE OR REPLACE FUNCTION beta.review_feedback_item(
    p_object_type text,
    p_object_id uuid,
    p_action text,
    p_actor_user_id text,
    p_actor_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
BEGIN
    IF p_actor_user_id IS NULL OR length(btrim(p_actor_user_id)) NOT BETWEEN 1 AND 200
       OR p_actor_email IS NULL OR length(btrim(p_actor_email)) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION 'validated reviewer identity is required' USING ERRCODE = '22023';
    END IF;

    IF p_object_type = 'event' AND p_action IN ('review', 'resolve', 'dismiss') THEN
        UPDATE beta.feedback_event
        SET review_status = CASE p_action WHEN 'review' THEN 'reviewed' WHEN 'resolve' THEN 'resolved' ELSE 'dismissed' END
        WHERE id = p_object_id;
    ELSIF p_object_type = 'cluster' AND p_action IN ('confirm', 'dismiss') THEN
        UPDATE beta.feedback_cluster
        SET status = CASE p_action WHEN 'confirm' THEN 'confirmed' ELSE 'dismissed' END,
            reviewed_by_user_id = btrim(p_actor_user_id), reviewed_at = now(), updated_at = now()
        WHERE id = p_object_id;
    ELSE
        RAISE EXCEPTION 'unsupported feedback review action' USING ERRCODE = '22023';
    END IF;

    IF NOT FOUND THEN RETURN false; END IF;
    INSERT INTO beta.feedback_review_audit (object_type, object_id, actor_user_id, actor_email, action)
    VALUES (p_object_type, p_object_id, btrim(p_actor_user_id), lower(btrim(p_actor_email)), p_action);
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION beta.correct_feedback_event(
    p_event_id uuid,
    p_patch jsonb,
    p_actor_user_id text,
    p_actor_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_fields text[];
BEGIN
    IF p_actor_user_id IS NULL OR length(btrim(p_actor_user_id)) NOT BETWEEN 1 AND 200
       OR p_actor_email IS NULL OR length(btrim(p_actor_email)) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION 'validated reviewer identity is required' USING ERRCODE = '22023';
    END IF;
    IF p_patch IS NULL OR jsonb_typeof(p_patch) IS DISTINCT FROM 'object'
       OR p_patch = '{}'::jsonb
       OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_patch) AS k(key)
                  WHERE key NOT IN ('goal_summary', 'observed_outcome', 'identified_gap', 'declared_reason'))
       OR EXISTS (SELECT 1 FROM jsonb_each(p_patch) AS item(key, value)
                  WHERE jsonb_typeof(value) <> 'string'
                     OR length(value #>> '{}') > CASE key WHEN 'declared_reason' THEN 600 ELSE 500 END) THEN
        RAISE EXCEPTION 'feedback correction contains unsupported or invalid fields' USING ERRCODE = '22023';
    END IF;
    SELECT array_agg(key ORDER BY key) INTO v_fields FROM jsonb_object_keys(p_patch) AS k(key);

    UPDATE beta.feedback_event
    SET context = context || (p_patch - 'declared_reason'),
        declared_reason = CASE WHEN p_patch ? 'declared_reason' THEN p_patch->>'declared_reason' ELSE declared_reason END
    WHERE id = p_event_id AND expires_at > now();
    IF NOT FOUND THEN RETURN false; END IF;
    INSERT INTO beta.feedback_review_audit (object_type, object_id, actor_user_id, actor_email, action, changed_fields)
    VALUES ('event', p_event_id, btrim(p_actor_user_id), lower(btrim(p_actor_email)), 'correct', v_fields);
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION beta.delete_feedback_event(
    p_event_id uuid,
    p_actor_user_id text,
    p_actor_email text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_cluster_id uuid;
BEGIN
    IF p_actor_user_id IS NULL OR length(btrim(p_actor_user_id)) NOT BETWEEN 1 AND 200
       OR p_actor_email IS NULL OR length(btrim(p_actor_email)) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION 'validated reviewer identity is required' USING ERRCODE = '22023';
    END IF;
    SELECT cluster_id INTO v_cluster_id FROM beta.feedback_event WHERE id = p_event_id AND expires_at > now();
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    INSERT INTO beta.feedback_review_audit (object_type, object_id, actor_user_id, actor_email, action, changed_fields)
    VALUES ('event', p_event_id, btrim(p_actor_user_id), lower(btrim(p_actor_email)), 'delete', ARRAY['event_detail','profanity_terms']);
    IF v_cluster_id IS NOT NULL THEN
        DELETE FROM beta.feedback_review_audit WHERE object_type = 'cluster' AND object_id = v_cluster_id;
        UPDATE beta.feedback_event SET cluster_id = NULL WHERE cluster_id = v_cluster_id;
        UPDATE beta.feedback_monthly_aggregate
           SET cluster_id = NULL, cluster_bucket = '00000000-0000-0000-0000-000000000000'::uuid
         WHERE cluster_id = v_cluster_id;
        UPDATE beta.feedback_cluster SET status = 'suggested', merged_into = NULL, updated_at = now()
         WHERE merged_into = v_cluster_id;
        DELETE FROM beta.feedback_cluster WHERE id = v_cluster_id;
    END IF;
    DELETE FROM beta.feedback_event WHERE id = p_event_id;
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION beta.delete_feedback_analyst_history(
    p_target_user_id text,
    p_target_user_hash text,
    p_actor_user_id text,
    p_actor_email text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_subject_hash text;
    v_event_ids uuid[];
    v_cluster_ids uuid[];
    v_detail_count integer;
    v_aggregate_count integer;
    v_profanity_count integer;
    v_cluster_count integer;
BEGIN
    IF p_actor_user_id IS NULL OR length(btrim(p_actor_user_id)) NOT BETWEEN 1 AND 200
       OR p_actor_email IS NULL OR length(btrim(p_actor_email)) NOT BETWEEN 3 AND 320 THEN
        RAISE EXCEPTION 'validated reviewer identity is required' USING ERRCODE = '22023';
    END IF;
    IF p_target_user_id IS NULL OR length(btrim(p_target_user_id)) NOT BETWEEN 1 AND 200 THEN
        RAISE EXCEPTION 'target analyst identity is required' USING ERRCODE = '22023';
    END IF;
    IF p_target_user_hash IS NULL OR p_target_user_hash !~ '^[a-f0-9]{64}$' THEN
        RAISE EXCEPTION 'target analyst hash is invalid' USING ERRCODE = '22023';
    END IF;
    v_subject_hash := p_target_user_hash;
    SELECT COALESCE(array_agg(id), ARRAY[]::uuid[]) INTO v_event_ids
      FROM beta.feedback_event WHERE actor_user_id = btrim(p_target_user_id);
    SELECT COALESCE(array_agg(id), ARRAY[]::uuid[]) INTO v_cluster_ids
      FROM beta.feedback_cluster
     WHERE created_by_user_id = btrim(p_target_user_id)
        OR id IN (SELECT cluster_id FROM beta.feedback_event WHERE actor_user_id = btrim(p_target_user_id) AND cluster_id IS NOT NULL)
        OR id IN (SELECT cluster_id FROM beta.feedback_monthly_aggregate WHERE actor_user_id = btrim(p_target_user_id) AND cluster_id IS NOT NULL);

    DELETE FROM beta.feedback_review_audit
     WHERE object_id = ANY(v_event_ids) OR object_id = ANY(v_cluster_ids)
        OR actor_user_id = btrim(p_target_user_id)
        OR subject_user_hash = v_subject_hash;
    DELETE FROM beta.feedback_monthly_aggregate WHERE actor_user_id = btrim(p_target_user_id);
    GET DIAGNOSTICS v_aggregate_count = ROW_COUNT;
    DELETE FROM beta.feedback_monthly_profanity WHERE actor_user_id = btrim(p_target_user_id);
    GET DIAGNOSTICS v_profanity_count = ROW_COUNT;
    UPDATE beta.feedback_event SET cluster_id = NULL WHERE cluster_id = ANY(v_cluster_ids);
    UPDATE beta.feedback_monthly_aggregate
       SET cluster_id = NULL, cluster_bucket = '00000000-0000-0000-0000-000000000000'::uuid
     WHERE cluster_id = ANY(v_cluster_ids);
    UPDATE beta.feedback_cluster
       SET status = 'suggested', merged_into = NULL, updated_at = now()
     WHERE merged_into = ANY(v_cluster_ids);
    DELETE FROM beta.feedback_event WHERE actor_user_id = btrim(p_target_user_id);
    GET DIAGNOSTICS v_detail_count = ROW_COUNT;
    DELETE FROM beta.feedback_cluster WHERE id = ANY(v_cluster_ids);
    GET DIAGNOSTICS v_cluster_count = ROW_COUNT;

    INSERT INTO beta.feedback_review_audit (
        object_type, object_id, actor_user_id, actor_email, subject_user_hash, action, changed_fields
    ) VALUES (
        'analyst', gen_random_uuid(), btrim(p_actor_user_id), lower(btrim(p_actor_email)), v_subject_hash,
        'delete', ARRAY['event_details','monthly_aggregates','offensive_term_counts','clusters']
    );
    RETURN jsonb_build_object(
        'event_details_deleted', v_detail_count,
        'monthly_aggregate_rows_deleted', v_aggregate_count,
        'offensive_term_rows_deleted', v_profanity_count,
        'clusters_deleted', v_cluster_count
    );
END;
$$;

ALTER TABLE beta.feedback_cluster ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.feedback_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.feedback_event_profanity ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.feedback_monthly_aggregate ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.feedback_monthly_profanity ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta.feedback_review_audit ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE
    beta.feedback_cluster,
    beta.feedback_event,
    beta.feedback_event_profanity,
    beta.feedback_monthly_aggregate,
    beta.feedback_monthly_profanity,
    beta.feedback_review_audit
FROM PUBLIC, anon, authenticated, service_role;

-- All RPC callers still require OAuth authorization in the Worker. Cleanup
-- moves expired event details into monthly counters before deleting context.
CREATE OR REPLACE FUNCTION beta.aggregate_and_expire_feedback_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
    v_deleted integer;
BEGIN
    LOCK TABLE beta.feedback_event IN SHARE ROW EXCLUSIVE MODE;

    INSERT INTO beta.feedback_monthly_aggregate (
        month_start, actor_bucket, actor_user_id, actor_email,
        event_type, category, signal_source, feedback_polarity,
        friction_level, cluster_id, cluster_bucket, event_count
    )
    SELECT
        date_trunc('month', e.recorded_at AT TIME ZONE 'UTC')::date,
        COALESCE(e.actor_user_id, '__unidentified__'),
        e.actor_user_id,
        e.actor_email,
        e.event_type,
        e.category,
        e.signal_source,
        COALESCE(e.feedback_polarity, ''),
        e.friction_level,
        e.cluster_id,
        COALESCE(e.cluster_id, '00000000-0000-0000-0000-000000000000'::uuid),
        count(*)
    FROM beta.feedback_event AS e
    WHERE e.expires_at <= now()
    GROUP BY 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
    ON CONFLICT (
        month_start, actor_bucket, event_type, category, signal_source,
        feedback_polarity, friction_level, cluster_bucket
    ) DO UPDATE SET
        event_count = beta.feedback_monthly_aggregate.event_count + EXCLUDED.event_count,
        actor_email = COALESCE(EXCLUDED.actor_email, beta.feedback_monthly_aggregate.actor_email),
        updated_at = now();

    INSERT INTO beta.feedback_monthly_profanity (
        month_start, actor_bucket, actor_user_id, actor_email,
        normalized_term, target, reason_category, event_count
    )
    SELECT
        date_trunc('month', e.recorded_at AT TIME ZONE 'UTC')::date,
        COALESCE(e.actor_user_id, '__unidentified__'),
        e.actor_user_id,
        e.actor_email,
        p.normalized_term,
        p.target,
        COALESCE(e.reason_category, 'unknown'),
        count(*)
    FROM beta.feedback_event AS e
    JOIN beta.feedback_event_profanity AS p ON p.event_id = e.id
    WHERE e.expires_at <= now()
    GROUP BY 1, 2, 3, 4, 5, 6, 7
    ON CONFLICT (
        month_start, actor_bucket, normalized_term, target, reason_category
    ) DO UPDATE SET
        event_count = beta.feedback_monthly_profanity.event_count + EXCLUDED.event_count,
        actor_email = COALESCE(EXCLUDED.actor_email, beta.feedback_monthly_profanity.actor_email),
        updated_at = now();

    DELETE FROM beta.feedback_event WHERE expires_at <= now();
    GET DIAGNOSTICS v_deleted = ROW_COUNT;

    DELETE FROM beta.feedback_monthly_aggregate
    WHERE month_start < (date_trunc('month', now() AT TIME ZONE 'UTC') - interval '11 months')::date;
    DELETE FROM beta.feedback_monthly_profanity
    WHERE month_start < (date_trunc('month', now() AT TIME ZONE 'UTC') - interval '11 months')::date;
    DELETE FROM beta.feedback_review_audit WHERE expires_at <= now();
    DELETE FROM beta.feedback_cluster AS c
    WHERE c.expires_at <= now()
      AND NOT EXISTS (SELECT 1 FROM beta.feedback_event AS e WHERE e.cluster_id = c.id)
      AND NOT EXISTS (SELECT 1 FROM beta.feedback_monthly_aggregate AS a WHERE a.cluster_id = c.id)
      AND NOT EXISTS (SELECT 1 FROM beta.feedback_cluster AS child WHERE child.merged_into = c.id);

    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION beta.record_feedback_event(jsonb, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.list_feedback_groups(date, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.list_feedback_group_events(uuid, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.get_feedback_summary(integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.list_feedback_profanity(integer, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.review_feedback_item(text, uuid, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.correct_feedback_event(uuid, jsonb, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.delete_feedback_event(uuid, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.delete_feedback_analyst_history(text, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION beta.aggregate_and_expire_feedback_events() FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION beta.record_feedback_event(jsonb, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION beta.list_feedback_groups(date, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION beta.list_feedback_group_events(uuid, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION beta.get_feedback_summary(integer) TO service_role;
GRANT EXECUTE ON FUNCTION beta.list_feedback_profanity(integer, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION beta.review_feedback_item(text, uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION beta.correct_feedback_event(uuid, jsonb, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION beta.delete_feedback_event(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION beta.delete_feedback_analyst_history(text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION beta.aggregate_and_expire_feedback_events() TO service_role;

COMMIT;
