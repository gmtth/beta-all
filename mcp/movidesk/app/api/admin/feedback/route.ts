import { getChatGPTUser } from "../../../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster, json } from "../../../../oauth/_lib";
import { FeedbackStoreError, SupabaseFeedbackStore } from "../../../../worker/supabase-feedback";

export const dynamic = "force-dynamic";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const privateJson = (data: unknown, init: ResponseInit = {}) => json(data, {
  ...init,
  headers: { ...(init.headers ?? {}), "cache-control": "no-store, private" },
});
const parseBoundedInteger = (value: string | null, fallback: number, min: number, max: number) => {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  return Math.min(max, Math.max(min, Number(value)));
};

async function requireMaster() {
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!user) return { response: privateJson({ error: "unauthorized" }, { status: 401 }) };
  if (!isMaster(await getUserRole(user.email))) return { response: privateJson({ error: "forbidden" }, { status: 403 }) };
  return { user };
}

function unavailable(error: unknown) {
  const diagnostic = error instanceof FeedbackStoreError ? error.diagnostic : "unavailable";
  return privateJson({ status: "unavailable", data: null, diagnostic }, { status: 503 });
}

export async function GET(request: Request) {
  const auth = await requireMaster();
  if ("response" in auth) return auth.response;
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "summary";
  const store = new SupabaseFeedbackStore();
  try {
    if (view === "summary") {
      const months = parseBoundedInteger(url.searchParams.get("months"), 1, 1, 12);
      return privateJson({ status: "available", data: await store.getSummary(months) });
    }
    if (view === "groups") {
      const rawFrom = url.searchParams.get("from");
      const from = rawFrom && /^\d{4}-\d{2}-\d{2}$/.test(rawFrom) && Number.isFinite(Date.parse(`${rawFrom}T00:00:00Z`)) ? rawFrom : null;
      const limit = parseBoundedInteger(url.searchParams.get("limit"), 25, 1, 100);
      const offset = parseBoundedInteger(url.searchParams.get("offset"), 0, 0, 10000);
      return privateJson({ status: "available", data: await store.listGroups(from, limit, offset) });
    }
    if (view === "events") {
      const groupId = url.searchParams.get("group_id") ?? "";
      if (!uuidPattern.test(groupId)) return privateJson({ error: "invalid_group_id" }, { status: 400 });
      const limit = parseBoundedInteger(url.searchParams.get("limit"), 25, 1, 100);
      const offset = parseBoundedInteger(url.searchParams.get("offset"), 0, 0, 10000);
      return privateJson({ status: "available", data: await store.listGroupEvents(groupId, limit, offset) });
    }
    if (view === "profanity") {
      const months = parseBoundedInteger(url.searchParams.get("months"), 1, 1, 12);
      const limit = parseBoundedInteger(url.searchParams.get("limit"), 25, 1, 100);
      const offset = parseBoundedInteger(url.searchParams.get("offset"), 0, 0, 10000);
      return privateJson({ status: "available", data: await store.listProfanity(months, limit, offset) });
    }
    return privateJson({ error: "invalid_view" }, { status: 400 });
  } catch (error) {
    return unavailable(error);
  }
}

export async function POST(request: Request) {
  const auth = await requireMaster();
  if ("response" in auth) return auth.response;
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > 4096) return privateJson({ error: "request_too_large" }, { status: 413 });
  let body: unknown;
  try { body = JSON.parse(rawBody); } catch { body = null; }
  if (!body || typeof body !== "object" || Array.isArray(body)) return privateJson({ error: "invalid_request" }, { status: 400 });
  const value = body as Record<string, unknown>;
  const objectType = value.object_type;
  const objectId = value.object_id;
  const action = value.action;
  const store = new SupabaseFeedbackStore();
  if (action === "delete_analyst_history") {
    if (typeof value.target_user_id !== "string" || value.target_user_id.trim().length < 1 || value.target_user_id.length > 200) {
      return privateJson({ error: "invalid_target_user_id" }, { status: 400 });
    }
    try {
      const deleted = await store.deleteAnalystHistory(value.target_user_id, auth.user.userId, auth.user.email);
      return privateJson({ deleted });
    } catch (error) { return unavailable(error); }
  }
  if (objectType === "event" && objectId && typeof objectId === "string" && uuidPattern.test(objectId) && action === "correct") {
    const patch = value.patch;
    const allowedFields = ["goal_summary", "observed_outcome", "identified_gap", "declared_reason"] as const;
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) return privateJson({ error: "invalid_patch" }, { status: 400 });
    const entries = Object.entries(patch as Record<string, unknown>);
    if (!entries.length || entries.some(([key, text]) => !allowedFields.includes(key as typeof allowedFields[number]) || typeof text !== "string" || text.length > (key === "declared_reason" ? 600 : 500))) {
      return privateJson({ error: "invalid_patch" }, { status: 400 });
    }
    try {
      const updated = await store.correctEvent(objectId, Object.fromEntries(entries) as Record<string, string>, auth.user.userId, auth.user.email);
      return updated ? privateJson({ updated: true }) : privateJson({ error: "not_found_or_expired" }, { status: 404 });
    } catch (error) { return unavailable(error); }
  }
  if (objectType === "event" && objectId && typeof objectId === "string" && uuidPattern.test(objectId) && action === "delete") {
    try {
      const deleted = await store.deleteEvent(objectId, auth.user.userId, auth.user.email);
      return deleted ? privateJson({ deleted: true }) : privateJson({ error: "not_found_or_expired" }, { status: 404 });
    } catch (error) { return unavailable(error); }
  }
  const validAction = objectType === "event"
    ? ["review", "resolve", "dismiss"].includes(String(action))
    : objectType === "cluster" && ["confirm", "dismiss"].includes(String(action));
  if ((objectType !== "event" && objectType !== "cluster") || typeof objectId !== "string" || !uuidPattern.test(objectId) || !validAction) {
    return privateJson({ error: "invalid_request" }, { status: 400 });
  }
  const reviewObjectType = objectType as "event" | "cluster";
  const reviewAction = action as "review" | "resolve" | "dismiss" | "confirm";
  try {
    const updated = await store.review(reviewObjectType, objectId, reviewAction, auth.user.userId, auth.user.email);
    return updated ? privateJson({ updated: true }) : privateJson({ error: "not_found" }, { status: 404 });
  } catch (error) {
    return unavailable(error);
  }
}
