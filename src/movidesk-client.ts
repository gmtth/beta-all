export type MovideskClientOptions = { proxyUrl: string; fetchImpl?: typeof fetch; timeoutMs?: number; sleep?: (ms: number) => Promise<void> };
export class MovideskHttpError extends Error { constructor(public readonly status: number, message: string) { super(message); this.name = "MovideskHttpError"; } }
const networkErrorDetail = (error: unknown) => {
  if (!(error instanceof Error)) return "unknown network error";
  const cause = error.cause instanceof Error ? `; cause=${error.cause.name}: ${error.cause.message}` : "";
  return `${error.name}: ${error.message}${cause}`.slice(0, 500);
};
class RateLimiter { private readonly calls: number[] = []; async acquire(): Promise<void> { while (true) { const now = Date.now(); while (this.calls.length && this.calls[0] <= now - 60000) this.calls.shift(); if (this.calls.length < 10) { this.calls.push(now); return; } await new Promise((resolve) => setTimeout(resolve, Math.max(50, this.calls[0] + 60000 - now))); } } }
export class MovideskClient {
  private readonly proxyUrl: string; private readonly fetchImpl: typeof fetch; private readonly timeoutMs: number; private readonly sleep: (ms: number) => Promise<void>; private readonly limiter = new RateLimiter();
  constructor(options: MovideskClientOptions) { this.proxyUrl = options.proxyUrl.replace(/\/$/, ""); this.fetchImpl = (options.fetchImpl ?? fetch).bind(globalThis); this.timeoutMs = options.timeoutMs ?? 15000; this.sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms))); }
  async get(resource: string, params: Record<string, string | number | boolean | undefined>, accessToken: string): Promise<unknown> {
    await this.limiter.acquire(); const url = new URL(this.proxyUrl + "/api/" + resource); for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
    for (let attempt = 0; attempt < 3; attempt++) { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), this.timeoutMs); try { const response = await this.fetchImpl(url, { method: "GET", signal: controller.signal, headers: { Accept: "application/json", Authorization: "Bearer " + accessToken } }); if (response.ok) return await response.json(); const body = await response.text(); const detail = body ? `: ${body.slice(0, 500)}` : ""; const error = new MovideskHttpError(response.status, "Movidesk proxy request failed with HTTP " + response.status + detail); if (response.status !== 429 && response.status < 500) throw error; if (attempt === 2) throw error; } catch (error) { if (error instanceof MovideskHttpError) { if (error.status !== 429 && error.status < 500) throw error; if (attempt === 2) throw error; } else if (attempt === 2) throw new Error(`Movidesk proxy request failed after retries: ${networkErrorDetail(error)}`, { cause: error }); } finally { clearTimeout(timeout); } await this.sleep(250 * 2 ** attempt); }
    throw new Error("Movidesk API request failed");
  }
  getTicket(id: string, accessToken: string) { return this.get("tickets", { id }, accessToken); } searchTickets(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("tickets", params, accessToken); } searchPeople(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("persons", params, accessToken); } listServices(params: Record<string, string | number | boolean | undefined>, accessToken: string) { return this.get("services", params, accessToken); }
}
