import assert from "node:assert/strict";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { test } from "node:test";
import { areUserScopesEnabled, ensureUserScopeDefaults, getEnabledUserScopes, getUserScopeGrants } from "../app/oauth/user-scopes.js";

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
    const scopes = await getUserScopeGrants(database, "legacy@example.com", 100);
    assert.equal(scopes["knowledge:write"], true);
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), true);

    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope = ?").run("legacy@example.com", "knowledge:write");
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), false);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 1 WHERE user_email = ? AND scope = ?").run("legacy@example.com", "knowledge:write");
    assert.equal(await areUserScopesEnabled(database, "legacy@example.com", ["knowledge:write"]), true);
  } finally { database.sqlite.close(); }
});

test("authorization scopes come from the account permissions; one disabled scope does not block the others", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "service25@example.com", 100);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope = ?")
      .run("service25@example.com", "knowledge:write");

    assert.deepEqual(await getEnabledUserScopes(database, "service25@example.com"), [
      "movidesk:read", "knowledge:read", "feedback:write", "offline_access",
    ]);
    assert.equal(await areUserScopesEnabled(database, "service25@example.com", ["movidesk:read", "knowledge:read"]), true);
    assert.equal(await areUserScopesEnabled(database, "service25@example.com", ["knowledge:write"]), false);
    assert.deepEqual(await getEnabledUserScopes(database, "service25@example.com", ["movidesk:read"]), ["movidesk:read"]);
  } finally { database.sqlite.close(); }
});

test("authorization grants are isolated by normalized account email", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "service25@example.com", 100);
    await ensureUserScopeDefaults(database, "service37@example.com", 100);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope IN (?, ?)")
      .run("service25@example.com", "movidesk:read", "knowledge:read");
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope = ?")
      .run("service37@example.com", "feedback:write");

    assert.deepEqual(await getEnabledUserScopes(database, " SERVICE25@EXAMPLE.COM "), ["feedback:write", "offline_access"]);
    assert.deepEqual(await getEnabledUserScopes(database, "service37@example.com"), ["movidesk:read", "knowledge:read", "offline_access"]);
  } finally { database.sqlite.close(); }
});

test("authorization recomputes current grants and returns no usable scopes when all are disabled", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "dynamic@example.com", 100);
    assert.ok((await getEnabledUserScopes(database, "dynamic@example.com")).includes("knowledge:write") === false);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 1 WHERE user_email = ? AND scope = ?")
      .run("dynamic@example.com", "knowledge:write");
    assert.ok((await getEnabledUserScopes(database, "dynamic@example.com")).includes("knowledge:write"));

    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ?")
      .run("dynamic@example.com");
    assert.deepEqual(await getEnabledUserScopes(database, "dynamic@example.com"), []);
    assert.equal(await areUserScopesEnabled(database, "dynamic@example.com", ["movidesk:read"]), false);
  } finally { database.sqlite.close(); }
});

test("client-specific scopes limit the grant without changing account permissions", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "action@example.com", 100);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 1 WHERE user_email = ? AND scope = ?")
      .run("action@example.com", "knowledge:write");

    assert.deepEqual(await getEnabledUserScopes(database, "action@example.com", ["movidesk:read"]), ["movidesk:read"]);
    assert.equal((await getUserScopeGrants(database, "action@example.com", 100))["knowledge:write"], true);
  } finally { database.sqlite.close(); }
});

test("unknown client scopes are never granted", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "known@example.com", 100);
    assert.deepEqual(await getEnabledUserScopes(database, "known@example.com", ["knowledge:read", "unknown:admin"]), ["knowledge:read"]);
  } finally { database.sqlite.close(); }
});

test("disabling offline access does not disable independently granted resource scopes", async () => {
  const database = testDatabase();
  try {
    await ensureUserScopeDefaults(database, "analyst@example.com", 100);
    database.sqlite.prepare("UPDATE oauth_user_scopes SET enabled = 0 WHERE user_email = ? AND scope = ?")
      .run("analyst@example.com", "offline_access");

    const scopes = await getEnabledUserScopes(database, "analyst@example.com");
    assert.ok(scopes.includes("movidesk:read"));
    assert.ok(scopes.includes("knowledge:read"));
    assert.ok(!scopes.includes("offline_access"));
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
