import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { test } from "node:test";
import { createAuthorizationCodeGrant, revokeUserTokens, rotateRefreshToken, type TokenGrantDatabase } from "../app/oauth/token-grants.js";

type BoundStatement = { sql: string; values: SQLInputValue[] };

function testDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(`
    CREATE TABLE oauth_codes (code_hash TEXT PRIMARY KEY, user_email TEXT, expires_at INTEGER NOT NULL);
    CREATE TABLE oauth_users (email TEXT PRIMARY KEY, active INTEGER NOT NULL);
    CREATE TABLE oauth_tokens (token_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT, scope TEXT NOT NULL, resource TEXT, family_id TEXT, expires_at INTEGER NOT NULL);
    CREATE TABLE oauth_refresh_tokens (token_hash TEXT PRIMARY KEY, family_id TEXT NOT NULL, client_id TEXT NOT NULL, user_id TEXT NOT NULL, user_email TEXT NOT NULL, scope TEXT NOT NULL, resource TEXT NOT NULL, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL, consumed_at INTEGER, replaced_by_hash TEXT, revoked_at INTEGER);
  `);
  const database = {
    prepare(sql: string) {
      const statement: BoundStatement = { sql, values: [] };
      return {
        bind(...values: unknown[]) { statement.values = values as SQLInputValue[]; return this; },
        async first<T>() { return sqlite.prepare(statement.sql).get(...statement.values) as T | undefined ?? null; },
        async run() { const result = sqlite.prepare(statement.sql).run(...statement.values); return { meta: { changes: Number(result.changes) } }; },
        _statement: statement,
      };
    },
    async batch(input: Array<{ _statement: BoundStatement }>) {
      sqlite.exec("BEGIN");
      try {
        const results = input.map(({ _statement }) => {
          const result = sqlite.prepare(_statement.sql).run(..._statement.values);
          return { meta: { changes: Number(result.changes) } };
        });
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
    close() { sqlite.close(); },
    sqlite,
  };
  return database as unknown as TokenGrantDatabase & { close(): void; sqlite: DatabaseSync };
}

function seedRefreshGrant(database: ReturnType<typeof testDatabase>) {
  database.sqlite.prepare("INSERT INTO oauth_users (email, active) VALUES (?, 1)").run("analyst@example.com");
  database.sqlite.prepare("INSERT INTO oauth_tokens (token_hash, client_id, user_id, user_email, scope, resource, family_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .run("old-access", "movidesk-mcp-app", "user-1", "analyst@example.com", "movidesk:read offline_access", "https://beta.example/mcp/", "family-1", 5000);
  database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (token_hash, family_id, client_id, user_id, user_email, scope, resource, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run("old-refresh", "family-1", "movidesk-mcp-app", "user-1", "analyst@example.com", "movidesk:read offline_access", "https://beta.example/mcp/", 10_000, 100);
}

test("the D1 migration adds refresh-family storage to the existing OAuth token schema", () => {
  const sqlite = new DatabaseSync(":memory:");
  try {
    sqlite.exec("CREATE TABLE oauth_tokens (token_hash TEXT PRIMARY KEY NOT NULL, client_id TEXT NOT NULL, user_id TEXT NOT NULL, scope TEXT NOT NULL, expires_at INTEGER NOT NULL)");
    sqlite.exec(readFileSync(new URL("../drizzle/0002_oauth_refresh_tokens.sql", import.meta.url), "utf8"));
    const tokenColumns = sqlite.prepare("PRAGMA table_info(oauth_tokens)").all().map((column) => column.name);
    const refreshColumns = sqlite.prepare("PRAGMA table_info(oauth_refresh_tokens)").all().map((column) => column.name);
    assert.ok(tokenColumns.includes("family_id"));
    assert.ok(refreshColumns.includes("token_hash"));
    assert.ok(refreshColumns.includes("replaced_by_hash"));
    assert.ok(refreshColumns.includes("revoked_at"));
  } finally { sqlite.close(); }
});

test("admin logout revokes every token and pending code for one user without removing account access", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    database.sqlite.prepare("INSERT INTO oauth_users (email, active) VALUES (?, 1)").run("other@example.com");
    database.sqlite.prepare("INSERT INTO oauth_tokens (token_hash, client_id, user_id, user_email, scope, resource, family_id, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run("other-access", "movidesk-mcp-app", "user-2", "other@example.com", "movidesk:read", "https://beta.example/mcp/", null, 5000);
    database.sqlite.prepare("INSERT INTO oauth_refresh_tokens (token_hash, family_id, client_id, user_id, user_email, scope, resource, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("other-refresh", "family-2", "movidesk-mcp-app", "user-2", "other@example.com", "movidesk:read offline_access", "https://beta.example/mcp/", 10_000, 100);
    database.sqlite.prepare("INSERT INTO oauth_codes (code_hash, user_email, expires_at) VALUES (?, ?, ?)").run("pending-code", "analyst@example.com", 5000);
    database.sqlite.prepare("INSERT INTO oauth_codes (code_hash, user_email, expires_at) VALUES (?, ?, ?)").run("other-code", "other@example.com", 5000);

    const revoked = await revokeUserTokens(database, " Analyst@Example.com ", 200);

    assert.deepEqual(revoked, { accessTokens: 1, authorizationCodes: 1, refreshTokens: 1 });
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens WHERE lower(trim(user_email)) = ?").get("analyst@example.com")?.count, 0);
    assert.equal(database.sqlite.prepare("SELECT revoked_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("old-refresh")?.revoked_at, 200);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_codes WHERE user_email = ?").get("analyst@example.com")?.count, 0);
    assert.equal(database.sqlite.prepare("SELECT active FROM oauth_users WHERE email = ?").get("analyst@example.com")?.active, 1);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens WHERE user_email = ?").get("other@example.com")?.count, 1);
    assert.equal(database.sqlite.prepare("SELECT revoked_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("other-refresh")?.revoked_at, null);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_codes WHERE user_email = ?").get("other@example.com")?.count, 1);
  } finally { database.close(); }
});

test("authorization code exchange creates a hashed-token grant only once", async () => {
  const database = testDatabase();
  try {
    database.sqlite.prepare("INSERT INTO oauth_codes (code_hash, expires_at) VALUES (?, ?)").run("code-hash", 10_000);
    const grant = {
      codeHash: "code-hash", now: 100, accessTokenHash: "access-hash", accessExpiresAt: 20_000,
      refreshTokenHash: "refresh-hash", refreshExpiresAt: 30_000, familyId: "family-1",
      clientId: "movidesk-mcp-app", userId: "user-1", userEmail: "analyst@example.com",
      scope: "movidesk:read offline_access", resource: "https://beta.example/mcp/",
    };
    assert.equal(await createAuthorizationCodeGrant(database, grant), true);
    assert.equal(await createAuthorizationCodeGrant(database, { ...grant, accessTokenHash: "second-access", refreshTokenHash: "second-refresh" }), false);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens").get()?.count, 1);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_refresh_tokens").get()?.count, 1);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_codes").get()?.count, 0);
  } finally { database.close(); }
});

test("refresh rotates one-time tokens while keeping the grant scope, client, resource, and family bound", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    const result = await rotateRefreshToken(database, {
      tokenHash: "old-refresh", replacementRefreshTokenHash: "next-refresh", accessTokenHash: "next-access",
      clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", now: 200, accessExpiresAt: 30_000,
    });
    assert.deepEqual(result, {
      scope: "movidesk:read offline_access", refreshScope: "movidesk:read offline_access",
      resource: "https://beta.example/mcp/", refreshExpiresAt: 10_000,
    });
    assert.equal(database.sqlite.prepare("SELECT consumed_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("old-refresh")?.consumed_at, 200);
    assert.equal(database.sqlite.prepare("SELECT family_id FROM oauth_refresh_tokens WHERE token_hash = ?").get("next-refresh")?.family_id, "family-1");
    assert.equal(database.sqlite.prepare("SELECT family_id FROM oauth_tokens WHERE token_hash = ?").get("next-access")?.family_id, "family-1");
  } finally { database.close(); }
});

test("refresh rejects client/resource mismatch and scope expansion without consuming the token", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    const base = { tokenHash: "old-refresh", replacementRefreshTokenHash: "next-refresh", accessTokenHash: "next-access", now: 200, accessExpiresAt: 30_000 };
    assert.equal(await rotateRefreshToken(database, { ...base, clientId: "other-client", resource: "https://beta.example/mcp/" }), null);
    assert.equal(await rotateRefreshToken(database, { ...base, clientId: "movidesk-mcp-app", resource: "https://other.example/mcp/" }), null);
    assert.equal(await rotateRefreshToken(database, { ...base, clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", requestedScope: "movidesk:read knowledge:write" }), null);
    assert.equal(database.sqlite.prepare("SELECT consumed_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("old-refresh")?.consumed_at, null);
  } finally { database.close(); }
});

test("refresh may narrow the access token scope without narrowing the rotated refresh grant", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    const result = await rotateRefreshToken(database, {
      tokenHash: "old-refresh", replacementRefreshTokenHash: "next-refresh", accessTokenHash: "next-access",
      clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", requestedScope: "movidesk:read", now: 200, accessExpiresAt: 30_000,
    });
    assert.equal(result?.scope, "movidesk:read");
    assert.equal(result?.refreshScope, "movidesk:read offline_access");
    assert.equal(database.sqlite.prepare("SELECT scope FROM oauth_tokens WHERE token_hash = ?").get("next-access")?.scope, "movidesk:read");
    assert.equal(database.sqlite.prepare("SELECT scope FROM oauth_refresh_tokens WHERE token_hash = ?").get("next-refresh")?.scope, "movidesk:read offline_access");
  } finally { database.close(); }
});

test("replay revokes the whole refresh family and its active access tokens", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    const base = { clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", now: 200, accessExpiresAt: 30_000 };
    assert.ok(await rotateRefreshToken(database, { ...base, tokenHash: "old-refresh", replacementRefreshTokenHash: "next-refresh", accessTokenHash: "next-access" }));
    assert.equal(await rotateRefreshToken(database, { ...base, tokenHash: "old-refresh", replacementRefreshTokenHash: "replay-refresh", accessTokenHash: "replay-access" }), null);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens WHERE family_id = ?").get("family-1")?.count, 0);
    assert.equal(database.sqlite.prepare("SELECT revoked_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("next-refresh")?.revoked_at, 200);
  } finally { database.close(); }
});

test("concurrent refresh reuse allows one rotation then revokes the family", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    const base = { tokenHash: "old-refresh", clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", now: 200, accessExpiresAt: 30_000 };
    const results = await Promise.all([
      rotateRefreshToken(database, { ...base, replacementRefreshTokenHash: "next-a", accessTokenHash: "access-a" }),
      rotateRefreshToken(database, { ...base, replacementRefreshTokenHash: "next-b", accessTokenHash: "access-b" }),
    ]);
    assert.equal(results.filter(Boolean).length, 1);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens WHERE family_id = ?").get("family-1")?.count, 0);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_refresh_tokens WHERE family_id = ? AND revoked_at IS NULL AND consumed_at IS NULL").get("family-1")?.count, 0);
  } finally { database.close(); }
});

test("refresh revokes a family when its authenticated user is inactive", async () => {
  const database = testDatabase();
  try {
    seedRefreshGrant(database);
    database.sqlite.prepare("UPDATE oauth_users SET active = 0 WHERE email = ?").run("analyst@example.com");
    const result = await rotateRefreshToken(database, {
      tokenHash: "old-refresh", replacementRefreshTokenHash: "next-refresh", accessTokenHash: "next-access",
      clientId: "movidesk-mcp-app", resource: "https://beta.example/mcp/", now: 200, accessExpiresAt: 30_000,
    });
    assert.equal(result, null);
    assert.equal(database.sqlite.prepare("SELECT revoked_at FROM oauth_refresh_tokens WHERE token_hash = ?").get("old-refresh")?.revoked_at, 200);
    assert.equal(database.sqlite.prepare("SELECT COUNT(*) AS count FROM oauth_tokens WHERE family_id = ?").get("family-1")?.count, 0);
  } finally { database.close(); }
});
