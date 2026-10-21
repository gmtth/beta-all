import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import {
  DEFAULT_ACCESS_TOKEN_LIFETIME_MS,
  getAccessTokenLifetimeMs,
  isAccessTokenLifetimeMs,
  setAccessTokenLifetimeMs,
} from "../app/oauth/token-lifetime.js";

function testDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  const database = {
    prepare(sql: string) {
      let values: unknown[] = [];
      return {
        bind(...bound: unknown[]) { values = bound; return this; },
        async first<T>() { return sqlite.prepare(sql).get(...values) as T | undefined ?? null; },
        async run() { sqlite.prepare(sql).run(...values); return {}; },
      };
    },
    close() { sqlite.close(); },
    sqlite,
  };
  return database;
}

test("the OAuth settings migration seeds the default access-token lifetime", async () => {
  const database = testDatabase();
  try {
    database.sqlite.exec(readFileSync(new URL("../drizzle/0003_oauth_settings.sql", import.meta.url), "utf8"));
    assert.equal(await getAccessTokenLifetimeMs(database as never), DEFAULT_ACCESS_TOKEN_LIFETIME_MS);
  } finally { database.close(); }
});

test("access-token lifetime can be updated and read in milliseconds", async () => {
  const database = testDatabase();
  try {
    database.sqlite.exec("CREATE TABLE oauth_settings (setting_key TEXT PRIMARY KEY, setting_value INTEGER NOT NULL CHECK (setting_value BETWEEN 60000 AND 2592000000))");
    assert.equal(await getAccessTokenLifetimeMs(database as never), DEFAULT_ACCESS_TOKEN_LIFETIME_MS);
    await setAccessTokenLifetimeMs(database as never, 123_456_000);
    assert.equal(await getAccessTokenLifetimeMs(database as never), 123_456_000);
  } finally { database.close(); }
});

test("access-token lifetime rejects values outside the supported integer range", async () => {
  for (const value of [59_999, 2_592_000_001, 60_000.5, Number.NaN, Number.POSITIVE_INFINITY, "60000"]) {
    assert.equal(isAccessTokenLifetimeMs(value), false);
  }
  const database = testDatabase();
  try {
    database.sqlite.exec("CREATE TABLE oauth_settings (setting_key TEXT PRIMARY KEY, setting_value INTEGER NOT NULL CHECK (setting_value BETWEEN 60000 AND 2592000000))");
    await assert.rejects(() => setAccessTokenLifetimeMs(database as never, 59_999), RangeError);
  } finally { database.close(); }
});
