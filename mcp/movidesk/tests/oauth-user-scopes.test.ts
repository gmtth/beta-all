import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { test } from "node:test";
import { areUserScopesEnabled, ensureUserScopeDefaults, getUserScopeGrants } from "../app/oauth/user-scopes.js";

function testDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE oauth_tokens (user_email TEXT, scope TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE oauth_refresh_tokens (user_email TEXT NOT NULL, scope TEXT NOT NULL, expires_at INTEGER NOT NULL, consumed_at INTEGER, revoked_at INTEGER);
    CREATE TABLE oauth_user_scopes (user_email TEXT NOT NULL, scope TEXT NOT NULL, enabled INTEGER NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY (user_email, scope));
  `);
  const database = {
    prepare(sql: string) {
      const statement: { sql: string; values: SQLInputValue[] } = { sql, values: [] };
      return {
        bind(...values: unknown[]) { statement.values = values as SQLInputValue[]; return this; },
        async all<T>() { return { results: sqlite.prepare(statement.sql).all(...statement.values) as T[] }; },
        async run() { return sqlite.prepare(statement.sql).run(...statement.values); },
      };
    },
    sqlite,
  };
  return database;
}

test("new master and analyst accounts get the requested default scopes, while knowledge writes stay opt-in", async () => {
  const database = testDatabase();
  try {
    for (const email of ["master@example.com", "analyst@example.com"]) {
      await ensureUserScopeDefaults(database, email, 100);
      const scopes = await getUserScopeGrants(database, email, 100);
      assert.equal(scopes["feedback:write"], true);
      assert.equal(scopes["knowledge:read"], true);
      assert.equal(scopes.offline_access, true);
      assert.equal(scopes["movidesk:read"], true);
      assert.equal(scopes["knowledge:write"], false);
    }
  } finally { database.sqlite.close(); }
});

test("first-time settings preserve an existing token grant and an administrator can disable or re-enable it", async () => {
  const database = testDatabase();
  try {
    database.sqlite.prepare("INSERT INTO oauth_tokens (user_email, scope, expires_at) VALUES (?, ?, ?)").run("legacy@example.com", "movidesk:read knowledge:write", 200);
    await ensureUserScopeDefaults(database, "Legacy@Example.com", 100);
    let scopes = await getUserScopeGrants(database, "legacy@example.com", 100);
    assert.equal(scopes["knowledge:write"], true);
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), true);

    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope = ?").run("legacy@example.com", "knowledge:write");
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), false);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 1 WHERE user_email = ? AND scope = ?").run("legacy@example.com", "knowledge:write");
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), true);
  } finally { database.sqlite.close(); }
});

test("first-time settings ignore expired, consumed, or revoked legacy token grants", async () => {
  const database = testDatabase();
  try {
    database.sqlite.prepare("INSERT INTO oauth_tokens (user_email, scope, expires_at) VALUES (?, ?, ?)").run("expired-access@example.com", "movidesk:read knowledge:write", 99);
    database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (user_email, scope, expires_at, consumed_at, revoked_at) VALUES (?, ?, ?, ?, ?)").run("expired-refresh@example.com", "movidesk:read knowledge:write", 99, null, null);
    database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (user_email, scope, expires_at, consumed_at, revoked_at) VALUES (?, ?, ?, ?, ?)").run("consumed-refresh@example.com", "movidesk:read knowledge:write", 200, 80, null);
    database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (user_email, scope, expires_at, consumed_at, revoked_at) VALUES (?, ?, ?, ?, ?)").run("revoked-refresh@example.com", "movidesk:read knowledge:write", 200, null, 80);
    database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (user_email, scope, expires_at, consumed_at, revoked_at) VALUES (?, ?, ?, ?, ?)").run("valid-refresh@example.com", "movidesk:read knowledge:write", 200, null, null);

    for (const email of ["expired-access@example.com", "expired-refresh@example.com", "consumed-refresh@example.com", "revoked-refresh@example.com"]) {
      const scopes = await ensureUserScopeDefaults(database, email, 100);
      assert.equal(scopes["knowledge:write"], false, email);
    }
    const validRefreshScopes = await ensureUserScopeDefaults(database, "valid-refresh@example.com", 100);
    assert.equal(validRefreshScopes["knowledge:write"], true);
  } finally { database.sqlite.close(); }
});
