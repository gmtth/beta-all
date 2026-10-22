import { OFFLINE_ACCESS_SCOPE, SUPPORTED_OAUTH_SCOPES, OAUTH_SCOPE, KNOWLEDGE_READ_SCOPE, FEEDBACK_WRITE_SCOPE } from "./clients";

type ScopeDatabase = {
  prepare(sql: string): {
    bind(...values: unknown[]): { run(): Promise<unknown>; all<T>(): Promise<{ results?: T[] }> };
  };
};

export const DEFAULT_USER_SCOPES = [OAUTH_SCOPE, FEEDBACK_WRITE_SCOPE, KNOWLEDGE_READ_SCOPE, OFFLINE_ACCESS_SCOPE] as const;

export async function ensureUserScopeDefaults(database: ScopeDatabase, email: string, now = Date.now()): Promise<Record<string, boolean>> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return {};
  const existing = await database.prepare("SELECT scope, enabled FROM oauth_user_scopes WHERE user_email = ?").bind(normalizedEmail).all<{ scope: string; enabled: number }>();
  const current = Object.fromEntries((existing.results ?? []).map(({ scope, enabled }) => [scope, enabled === 1])) as Record<string, boolean>;
  const existingScopes = new Set(Object.keys(current));
  const missingScopes = SUPPORTED_OAUTH_SCOPES.filter((scope) => !existingScopes.has(scope));
  if (missingScopes.length === 0) return current;
  const [accessTokens, refreshTokens] = await Promise.all([
    database.prepare("SELECT scope FROM oauth_tokens WHERE lower(trim(user_email)) = ? AND expires_at > ?").bind(normalizedEmail, now).all<{ scope: string }>(),
    database.prepare("SELECT scope FROM oauth_refresh_tokens WHERE lower(trim(user_email)) = ? AND expires_at > ? AND consumed_at IS NULL AND revoked_at IS NULL")
      .bind(normalizedEmail, now).all<{ scope: string }>(),
  ]);
  const legacyScopes = new Set([...(accessTokens.results ?? []), ...(refreshTokens.results ?? [])].flatMap((token) => token.scope.split(/\s+/).filter(Boolean)));
  for (const scope of missingScopes) {
    const enabled = DEFAULT_USER_SCOPES.includes(scope as (typeof DEFAULT_USER_SCOPES)[number]) || legacyScopes.has(scope);
    await database.prepare("INSERT OR IGNORE INTO oauth_user_scopes (user_email, scope, enabled, updated_at) VALUES (?, ?, ?, ?)")
      .bind(normalizedEmail, scope, enabled ? 1 : 0, now).run();
  }
  const refreshed = await database.prepare("SELECT scope, enabled FROM oauth_user_scopes WHERE user_email = ?").bind(normalizedEmail).all<{ scope: string; enabled: number }>();
  return Object.fromEntries((refreshed.results ?? []).map(({ scope, enabled }) => [scope, enabled === 1])) as Record<string, boolean>;
}

export async function getUserScopeGrants(database: ScopeDatabase, email: string, now = Date.now()) {
  const normalizedEmail = email.trim().toLowerCase();
  return ensureUserScopeDefaults(database, normalizedEmail, now);
}

/** Admin-configured account grants are the authorization source; request scopes are not an end-user permission request. */
export async function getEnabledUserScopes(database: ScopeDatabase, email: string, clientScopes: readonly string[] = SUPPORTED_OAUTH_SCOPES, now = Date.now()) {
  const grants = await getUserScopeGrants(database, email, now);
  return clientScopes.filter((scope) => grants[scope] === true);
}

export async function areUserScopesEnabled(database: ScopeDatabase, email: string, scopes: readonly string[], now = Date.now()) {
  const grants = await getUserScopeGrants(database, email, now);
  return scopes.every((scope) => grants[scope] === true);
}

export async function scopesEnabledInGrant(database: ScopeDatabase, email: string, grantedScope: string, now = Date.now()) {
  const grants = await getUserScopeGrants(database, email, now);
  return [...new Set(grantedScope.split(/\s+/).filter(Boolean))].filter((scope) => grants[scope] === true).join(" ");
}
