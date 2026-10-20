type ServiceStatus = "online" | "offline";

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

async function supabaseStatus(): Promise<ServiceStatus> {
  const baseUrl = process.env.SUPABASE_URL;
  const apiKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !apiKey) return "offline";

  try {
    const base = new URL(baseUrl);
    if (base.protocol !== "https:") return "offline";
    const url = new URL("/rest/v1/", base.origin);
    return (await isHealthy(url, {
      Accept: "application/openapi+json",
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
    })) ? "online" : "offline";
  } catch {
    return "offline";
  }
}

export async function getIntegrationStatuses() {
  const [movidesk, supabase] = await Promise.all([movideskStatus(), supabaseStatus()]);
  return { movidesk, supabase };
}
