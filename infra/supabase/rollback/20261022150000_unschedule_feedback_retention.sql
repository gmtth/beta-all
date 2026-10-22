-- Removes only Beta's retention job; shared pg_cron extension and other jobs remain.

BEGIN;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.unschedule(jobid)
          FROM cron.job
         WHERE jobname IN ('beta-feedback-retention-hourly', 'beta-cron-history-cleanup-daily');
    END IF;
END;
$$;

COMMIT;
