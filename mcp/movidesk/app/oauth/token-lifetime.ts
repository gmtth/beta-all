export const DEFAULT_ACCESS_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
export const MIN_ACCESS_TOKEN_LIFETIME_MS = 60 * 1000;
export const MAX_ACCESS_TOKEN_LIFETIME_MS = DEFAULT_ACCESS_TOKEN_LIFETIME_MS;
export const ACCESS_TOKEN_LIFETIME_SETTING_KEY = "access_token_lifetime_ms";

type SettingsDatabase = Pick<D1Database, "prepare">;

export function isAccessTokenLifetimeMs(value: unknown): value is number {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= MIN_ACCESS_TOKEN_LIFETIME_MS
    && value <= MAX_ACCESS_TOKEN_LIFETIME_MS;
}

export async function getAccessTokenLifetimeMs(database: SettingsDatabase) {
  const row = await database.prepare("SELECT setting_value FROM oauth_settings WHERE setting_key = ?")
    .bind(ACCESS_TOKEN_LIFETIME_SETTING_KEY)
    .first<{ setting_value: number }>();
  return row && isAccessTokenLifetimeMs(row.setting_value) ? row.setting_value : DEFAULT_ACCESS_TOKEN_LIFETIME_MS;
}

export async function setAccessTokenLifetimeMs(database: SettingsDatabase, value: number) {
  if (!isAccessTokenLifetimeMs(value)) throw new RangeError("Access-token lifetime is outside the allowed range.");
  await database.prepare("INSERT INTO oauth_settings (setting_key, setting_value) VALUES (?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value")
    .bind(ACCESS_TOKEN_LIFETIME_SETTING_KEY, value)
    .run();
}
