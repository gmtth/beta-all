-- Removes only the search RPC; no knowledge records or indexes are changed.
BEGIN;
REVOKE ALL ON FUNCTION beta.search_knowledge(text, integer) FROM PUBLIC, anon, authenticated, service_role;
DROP FUNCTION beta.search_knowledge(text, integer);
COMMIT;
