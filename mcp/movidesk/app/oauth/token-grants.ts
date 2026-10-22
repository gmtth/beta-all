import { OFFLINE_ACCESS_SCOPE, SUPPORTED_OAUTH_SCOPES } from "./clients";

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T>(): Promise<T | null>;
  run(): Promise<{ meta?: { changes?: number } }>;
};
export type TokenGrantDatabase = {
  prepare(sql: string): D1Statement;
  batch(statements: D1Statement[]): Promise<Array<{ meta?: { changes?: number } }>>;
};

export type AuthorizationCodeGrant = {
  codeHash: string;
  now: number;
  accessTokenHash: string;
  accessExpiresAt: number;
  refreshTokenHash?: string;
  refreshExpiresAt?: number;
  familyId?: string;
  clientId: string;
  userId: string;
  userEmail: string;
  scope: string;
  resource: string;
};

export type RefreshTokenGrant = {
  tokenHash: string;
  replacementRefreshTokenHash: string;
  accessTokenHash: string;
  clientId: string;
  resource: string;
  requestedScope?: string;
  now: number;
  accessExpiresAt: number;
};

export type UserTokenRevocation = {
  accessTokens: number;
  authorizationCodes: number;
  refreshTokens: number;
};

type StoredRefreshToken = {
  family_id: string;
  client_id: string;
  user_id: string;
  user_email: string;
  scope: string;
  resource: string;
  expires_at: number;
  consumed_at: number | null;
  revoked_at: number | null;
  user_active: number;
};

function changes(result: { meta?: { changes?: number } } | undefined) {
  return Number(result?.meta?.changes ?? 0);
}

export async function revokeUserTokens(database: TokenGrantDatabase, userEmail: string, now: number): Promise<UserTokenRevocation> {
  const email = userEmail.trim().toLowerCase();
  const results = await database.batch([
    database.prepare("UPDATE oauth_refresh_tokens SET revoked_at = ? WHERE lower(trim(user_email)) = ? AND revoked_at IS NULL").bind(now, email),
    database.prepare("DELETE FROM oauth_tokens WHERE lower(trim(user_email)) = ?").bind(email),
    database.prepare("DELETE FROM oauth_codes WHERE lower(trim(user_email)) = ?").bind(email),
  ]);
  return {
    refreshTokens: changes(results[0]),
    accessTokens: changes(results[1]),
    authorizationCodes: changes(results[2]),
  };
}

export async function createAuthorizationCodeGrant(database: TokenGrantDatabase, grant: AuthorizationCodeGrant) {
  const statements: D1Statement[] = [
    database.prepare("DELETE FROM oauth_codes WHERE code_hash = ? AND expires_at >= ?").bind(grant.codeHash, grant.now),
    database.prepare("INSERT INTO oauth_tokens (token_hash, client_id, user_id, user_email, scope, resource, family_id, expires_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1")
      .bind(grant.accessTokenHash, grant.clientId, grant.userId, grant.userEmail, grant.scope, grant.resource, grant.familyId ?? null, grant.accessExpiresAt),
  ];
  if (grant.refreshTokenHash && grant.familyId && grant.refreshExpiresAt) {
    statements.push(database.prepare("INSERT INTO oauth_refresh_tokens (token_hash, family_id, client_id, user_id, user_email, scope, resource, expires_at, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1")
      .bind(grant.refreshTokenHash, grant.familyId, grant.clientId, grant.userId, grant.userEmail, grant.scope, grant.resource, grant.refreshExpiresAt, grant.now));
  }
  const result = await database.batch(statements);
  return changes(result.at(-1)) === 1;
}

async function revokeRefreshFamily(database: TokenGrantDatabase, familyId: string, now: number) {
  await database.batch([
    database.prepare("UPDATE oauth_refresh_tokens SET revoked_at = COALESCE(revoked_at, ?) WHERE family_id = ?").bind(now, familyId),
    database.prepare("DELETE FROM oauth_tokens WHERE family_id = ?").bind(familyId),
  ]);
}

function requestedScopeIsAllowed(requestedScope: string | undefined, grantedScope: string) {
  if (requestedScope === undefined) return true;
  const requested = requestedScope.split(/\s+/).filter(Boolean);
  const granted = new Set(grantedScope.split(/\s+/).filter(Boolean));
  return requested.length > 0
    && new Set(requested).size === requested.length
    && requested.every((scope) => granted.has(scope) && (SUPPORTED_OAUTH_SCOPES as readonly string[]).includes(scope));
}

export async function rotateRefreshToken(database: TokenGrantDatabase, grant: RefreshTokenGrant) {
  const row = await database.prepare("SELECT r.*, EXISTS (SELECT 1 FROM oauth_users u WHERE u.email = r.user_email AND u.active = 1) AS user_active FROM oauth_refresh_tokens r WHERE r.token_hash = ?")
    .bind(grant.tokenHash).first<StoredRefreshToken>();
  if (!row || row.client_id !== grant.clientId || row.resource !== grant.resource) return null;
  if (row.consumed_at !== null) {
    await revokeRefreshFamily(database, row.family_id, grant.now);
    return null;
  }
  if (row.revoked_at !== null || row.expires_at <= grant.now) return null;
  if (!row.user_active) {
    await revokeRefreshFamily(database, row.family_id, grant.now);
    return null;
  }
  if (!row.scope.split(/\s+/).includes(OFFLINE_ACCESS_SCOPE) || !requestedScopeIsAllowed(grant.requestedScope, row.scope)) return null;

  const accessScope = grant.requestedScope ?? row.scope;
  const results = await database.batch([
    database.prepare("UPDATE oauth_refresh_tokens SET consumed_at = ?, replaced_by_hash = ? WHERE token_hash = ? AND consumed_at IS NULL AND revoked_at IS NULL AND expires_at > ? AND EXISTS (SELECT 1 FROM oauth_users WHERE email = ? AND active = 1)")
      .bind(grant.now, grant.replacementRefreshTokenHash, grant.tokenHash, grant.now, row.user_email),
    database.prepare("INSERT INTO oauth_refresh_tokens (token_hash, family_id, client_id, user_id, user_email, scope, resource, expires_at, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1 AND EXISTS (SELECT 1 FROM oauth_users WHERE email = ? AND active = 1)")
      .bind(grant.replacementRefreshTokenHash, row.family_id, row.client_id, row.user_id, row.user_email, row.scope, row.resource, row.expires_at, grant.now, row.user_email),
    database.prepare("INSERT INTO oauth_tokens (token_hash, client_id, user_id, user_email, scope, resource, family_id, expires_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE changes() = 1 AND EXISTS (SELECT 1 FROM oauth_users WHERE email = ? AND active = 1)")
      .bind(grant.accessTokenHash, row.client_id, row.user_id, row.user_email, accessScope, row.resource, row.family_id, grant.accessExpiresAt, row.user_email),
  ]);
  if (changes(results.at(-1)) === 1) return { scope: accessScope, refreshScope: row.scope, resource: row.resource, refreshExpiresAt: row.expires_at };

  const latest = await database.prepare("SELECT consumed_at FROM oauth_refresh_tokens WHERE token_hash = ?").bind(grant.tokenHash).first<{ consumed_at: number | null }>();
  if (latest?.consumed_at !== null && latest?.consumed_at !== undefined) await revokeRefreshFamily(database, row.family_id, grant.now);
  return null;
}
