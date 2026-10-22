export type FeedbackStoreDiagnostic = "configuration_missing" | "rpc_missing" | "permission_denied" | "timeout" | "unavailable" | "request_rejected" | "invalid_response";

export class FeedbackStoreError extends Error {
  constructor(readonly diagnostic: FeedbackStoreDiagnostic) {
    super("Feedback storage is unavailable.");
    this.name = "FeedbackStoreError";
  }
}

export type FeedbackEventInput = Record<string, unknown>;

export class SupabaseFeedbackStore {
  private configuration() {
    const projectUrl = process.env.SUPABASE_URL?.trim();
    const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
    if (!projectUrl || !secretKey) throw new FeedbackStoreError("configuration_missing");
    try {
      const base = new URL(projectUrl);
      if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) throw new Error("invalid URL");
      return { base, secretKey };
    } catch {
      throw new FeedbackStoreError("configuration_missing");
    }
  }

  private async rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const { base, secretKey } = this.configuration();
    const endpoint = new URL(`/rest/v1/rpc/${name}`, base);
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          apikey: secretKey,
          Authorization: `Bearer ${secretKey}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "Content-Profile": "beta",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) throw new FeedbackStoreError("timeout");
      throw new FeedbackStoreError("unavailable");
    }

    if (!response.ok) {
      if (response.status === 404) throw new FeedbackStoreError("rpc_missing");
      if (response.status === 401 || response.status === 403) throw new FeedbackStoreError("permission_denied");
      if (response.status === 429) throw new FeedbackStoreError("unavailable");
      if (response.status >= 500) throw new FeedbackStoreError("unavailable");
      throw new FeedbackStoreError("request_rejected");
    }
    try { return await response.json() as T; }
    catch { throw new FeedbackStoreError("invalid_response"); }
  }

  async record(event: FeedbackEventInput, actorUserId: string, actorEmail: string) {
    const result = await this.rpc<unknown>("record_feedback_event", {
      p_event: event,
      p_actor_user_id: actorUserId,
      p_actor_email: actorEmail,
    });
    if (!result || typeof result !== "object" || Array.isArray(result)) throw new FeedbackStoreError("invalid_response");
    const value = result as Record<string, unknown>;
    if (typeof value.event_id !== "string" || typeof value.inserted !== "boolean") throw new FeedbackStoreError("invalid_response");
    return { eventId: value.event_id, inserted: value.inserted };
  }

  async getSummary(months: number) {
    const value = await this.rpc<unknown>("get_feedback_summary", { p_months: months });
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new FeedbackStoreError("invalid_response");
    return value as Record<string, unknown>;
  }

  async listGroups(from: string | null, limit: number, offset: number) {
    const value = await this.rpc<unknown>("list_feedback_groups", { p_from: from, p_limit: limit, p_offset: offset });
    if (!Array.isArray(value)) throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async listGroupEvents(groupId: string, limit: number, offset: number) {
    const value = await this.rpc<unknown>("list_feedback_group_events", { p_group_id: groupId, p_limit: limit, p_offset: offset });
    if (!Array.isArray(value)) throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async listProfanity(months: number, limit: number, offset: number) {
    const value = await this.rpc<unknown>("list_feedback_profanity", { p_months: months, p_limit: limit, p_offset: offset });
    if (!Array.isArray(value)) throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async review(objectType: "event" | "cluster", objectId: string, action: "review" | "resolve" | "dismiss" | "confirm", actorUserId: string, actorEmail: string) {
    const value = await this.rpc<unknown>("review_feedback_item", {
      p_object_type: objectType,
      p_object_id: objectId,
      p_action: action,
      p_actor_user_id: actorUserId,
      p_actor_email: actorEmail,
    });
    if (typeof value !== "boolean") throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async correctEvent(eventId: string, patch: Record<string, string>, actorUserId: string, actorEmail: string) {
    const value = await this.rpc<unknown>("correct_feedback_event", {
      p_event_id: eventId, p_patch: patch, p_actor_user_id: actorUserId, p_actor_email: actorEmail,
    });
    if (typeof value !== "boolean") throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async deleteEvent(eventId: string, actorUserId: string, actorEmail: string) {
    const value = await this.rpc<unknown>("delete_feedback_event", {
      p_event_id: eventId, p_actor_user_id: actorUserId, p_actor_email: actorEmail,
    });
    if (typeof value !== "boolean") throw new FeedbackStoreError("invalid_response");
    return value;
  }

  async deleteAnalystHistory(targetUserId: string, actorUserId: string, actorEmail: string) {
    const normalizedTargetId = targetUserId.trim();
    const targetHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizedTargetId));
    const targetUserHash = Array.from(new Uint8Array(targetHash), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const value = await this.rpc<unknown>("delete_feedback_analyst_history", {
      p_target_user_id: normalizedTargetId, p_target_user_hash: targetUserHash,
      p_actor_user_id: actorUserId, p_actor_email: actorEmail,
    });
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new FeedbackStoreError("invalid_response");
    const result = value as Record<string, unknown>;
    for (const key of ["event_details_deleted", "monthly_aggregate_rows_deleted", "offensive_term_rows_deleted", "clusters_deleted"]) {
      if (typeof result[key] !== "number" || !Number.isInteger(result[key]) || result[key] < 0) throw new FeedbackStoreError("invalid_response");
    }
    return result as { event_details_deleted: number; monthly_aggregate_rows_deleted: number; offensive_term_rows_deleted: number; clusters_deleted: number };
  }
}
