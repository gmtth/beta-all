type ServiceStatus = "online" | "offline";

export type SupabaseConnectionHealth = {
  status: ServiceStatus;
  configured: boolean;
  latencyMs: number | null;
};

async function isHealthy(url: URL, headers: HeadersInit) {
  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(4_000),
      cache: "no-store",
    });
    await response.body?.cancel();
    return response.ok;
  } catch {
    return false;
  }
}

async function movideskStatus(): Promise<ServiceStatus> {
  const token = process.env.MOVIDESK_TOKEN;
  if (!token) return "offline";

  const url = new URL("https://api.movidesk.com/public/v1/persons");
  url.searchParams.set("$top", "1");
  url.searchParams.set("$select", "id");
  url.searchParams.set("token", token);
  return (await isHealthy(url, { Accept: "application/json" })) ? "online" : "offline";
}

export async function checkSupabaseConnection(): Promise<SupabaseConnectionHealth> {
  const baseUrl = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_SECRET_KEY;
  if (!baseUrl || !apiKey) return { status: "offline", configured: false, latencyMs: null };

  const started = performance.now();
  try {
    const base = new URL(baseUrl);
    if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) {
      return { status: "offline", configured: true, latencyMs: null };
    }
    const url = new URL("/rest/v1/source_system", base);
    url.searchParams.set("select", "id");
    url.searchParams.set("limit", "1");
    const online = await isHealthy(url, {
      Accept: "application/json",
      "Accept-Profile": "beta",
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    });
    return { status: online ? "online" : "offline", configured: true, latencyMs: Math.round(performance.now() - started) };
  } catch {
    return { status: "offline", configured: true, latencyMs: Math.round(performance.now() - started) };
  }
}

export async function getIntegrationStatuses() {
  const [movidesk, supabase] = await Promise.all([movideskStatus(), checkSupabaseConnection()]);
  return { movidesk, supabase: supabase.status };
}
