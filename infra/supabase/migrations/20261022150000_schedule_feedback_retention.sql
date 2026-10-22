-- Schedule detail expiration and monthly rollup after the feedback schema exists.
-- Enable the Supabase Cron module (pg_cron) in the dashboard before applying.
-- This migration intentionally does not enable/disable pg_cron itself.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_extension WHERE extname = 'pg_cron') THEN
        RAISE EXCEPTION 'Enable the Supabase Cron module (pg_cron) before applying this migration';
    END IF;

    -- Keep the migration idempotent if a prior manual setup used this job name.
    PERFORM cron.unschedule(jobid)
      FROM cron.job
     WHERE jobname = 'beta-feedback-retention-hourly';

    PERFORM cron.schedule(
        'beta-feedback-retention-hourly',
        '0 * * * *',
        'SELECT beta.aggregate_and_expire_feedback_events();'
    );
    PERFORM cron.unschedule(jobid)
      FROM cron.job
     WHERE jobname = 'beta-cron-history-cleanup-daily';
    PERFORM cron.schedule(
        'beta-cron-history-cleanup-daily',
        '0 4 * * *',
        'DELETE FROM cron.job_run_details
          WHERE end_time < now() - interval ''7 days''
            AND jobid IN (
                SELECT jobid FROM cron.job
                 WHERE jobname IN (''beta-feedback-retention-hourly'', ''beta-cron-history-cleanup-daily'')
            )'
    );
END;
$$;

COMMIT;
