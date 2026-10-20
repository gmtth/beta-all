-- Removes only the admin overview RPC; no data is changed.
BEGIN;
REVOKE ALL ON FUNCTION beta.get_knowledge_admin_overview() FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.get_knowledge_admin_overview();
COMMIT;
