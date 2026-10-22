-- Roll back only the database browser RPCs introduced by migration 20261021160000.
BEGIN;
DROP FUNCTION IF EXISTS beta.get_admin_database_page(text, integer, bigint);
DROP FUNCTION IF EXISTS beta.get_admin_database_schema();
COMMIT;
