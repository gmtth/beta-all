-- Destructive rollback for 20261022140000_feedback_diagnostics_schema.sql.
-- Deletes all feedback events, clusters, audit records and aggregates created
-- after that migration. Inspect/export data before running against any remote.

BEGIN;

REVOKE ALL ON FUNCTION beta.aggregate_and_expire_feedback_events() FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.aggregate_and_expire_feedback_events();
REVOKE ALL ON FUNCTION beta.review_feedback_item(text, uuid, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.review_feedback_item(text, uuid, text, text, text);
REVOKE ALL ON FUNCTION beta.delete_feedback_analyst_history(text, text, text, text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.delete_feedback_analyst_history(text, text, text, text);
REVOKE ALL ON FUNCTION beta.delete_feedback_event(uuid, text, text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.delete_feedback_event(uuid, text, text);
REVOKE ALL ON FUNCTION beta.correct_feedback_event(uuid, jsonb, text, text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.correct_feedback_event(uuid, jsonb, text, text);
REVOKE ALL ON FUNCTION beta.get_feedback_summary(integer) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.get_feedback_summary(integer);
REVOKE ALL ON FUNCTION beta.list_feedback_profanity(integer, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.list_feedback_profanity(integer, integer, integer);
REVOKE ALL ON FUNCTION beta.list_feedback_group_events(uuid, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.list_feedback_group_events(uuid, integer, integer);
REVOKE ALL ON FUNCTION beta.list_feedback_groups(date, integer, integer) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.list_feedback_groups(date, integer, integer);
REVOKE ALL ON FUNCTION beta.record_feedback_event(jsonb, text, text) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.record_feedback_event(jsonb, text, text);

DROP TABLE beta.feedback_review_audit;
DROP TABLE beta.feedback_monthly_profanity;
DROP TABLE beta.feedback_monthly_aggregate;
DROP TABLE beta.feedback_event_profanity;
DROP TABLE beta.feedback_event;
DROP TABLE beta.feedback_cluster;

COMMIT;
