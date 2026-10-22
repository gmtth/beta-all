import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FEEDBACK_WRITE_SCOPE } from "../app/oauth/clients";
import type { OAuthPrincipalAuthorization } from "../app/oauth/_lib";
import { mcpAuthorizationError } from "./oauth-auth-challenge";
import { FeedbackStoreError, type SupabaseFeedbackStore } from "./supabase-feedback";

const categories = [
  "answer_quality", "missing_context", "knowledge_coverage", "tool_capability",
  "tool_execution_follow_through", "latency_experience", "connection_experience",
  "result_relevance", "other_review_required",
] as const;
const sources = ["explicit_user", "user_confirmed_inference", "agent_self_report", "observed_task_outcome"] as const;
const reasonCategories = ["repeated_unmet_request", "slow_response", "tool_error", "inaccurate_answer", "missing_information", "irrelevant_result", "other", "unknown"] as const;
const piiRedactors = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,
  /https?:\/\/\S+/giu,
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/gu,
  /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/gu,
  /(?:\+?55\s*)?\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/gu,
];

function sanitizeText(value: string, limit: number) {
  let result = value.normalize("NFC").trim();
  for (const pattern of piiRedactors) result = result.replace(pattern, "[removido]");
  return result.replace(/\p{Cc}/gu, "").slice(0, limit);
}

const eventBaseSchema = z.object({
  idempotency_key: z.string().uuid(),
  event_type: z.enum(["feedback", "knowledge_gap", "capability_gap", "experience_issue", "self_diagnosis"]),
  category: z.enum(categories),
  signal_source: z.enum(sources),
  feedback_polarity: z.enum(["positive", "negative", "corrective", "neutral"]).optional(),
  friction_level: z.number().int().min(0).max(3),
  frustration_evidence: z.enum(["none", "explicit_emotion", "user_confirmed_inference"]).default("none"),
  user_confirmed: z.literal(true).optional(),
  context: z.object({
    goal_summary: z.string().trim().min(1).max(500),
    observed_outcome: z.string().trim().min(1).max(500),
    identified_gap: z.string().trim().min(1).max(500),
    evidence_refs: z.array(z.string().regex(/^(movidesk|clickup):[A-Za-z0-9_-]{1,80}$/i)).max(5).default([]),
  }).strict(),
  declared_reason: z.string().trim().max(600).optional(),
  reason_category: z.enum(reasonCategories).optional(),
  reason_inference: z.string().trim().max(600).optional(),
  reason_confidence: z.number().min(0).max(1).optional(),
  tool_event_ref: z.string().regex(/^[A-Za-z0-9:_-]{1,200}$/).optional(),
  profanity: z.array(z.object({
    exact_term: z.string().trim().min(1).max(80),
    target: z.enum(["beta", "other_person", "unclear"]),
  }).strict()).max(5).default([]),
}).strict();

const eventSchema = eventBaseSchema.superRefine((event, context) => {
  if (event.event_type === "feedback" && !event.feedback_polarity) context.addIssue({ code: "custom", message: "feedback_polarity is required for feedback" });
  if (event.event_type === "feedback" && !["explicit_user", "user_confirmed_inference"].includes(event.signal_source)) context.addIssue({ code: "custom", message: "feedback requires a user-originated signal" });
  if (event.event_type === "self_diagnosis" && event.signal_source !== "agent_self_report") context.addIssue({ code: "custom", message: "self diagnosis requires an agent self-report" });
  if (event.signal_source === "user_confirmed_inference" && event.user_confirmed !== true) context.addIssue({ code: "custom", message: "user confirmation is required" });
  if (event.frustration_evidence === "user_confirmed_inference" && event.user_confirmed !== true) context.addIssue({ code: "custom", message: "frustration inference must be confirmed" });
  if (event.frustration_evidence === "explicit_emotion" && event.signal_source !== "explicit_user") context.addIssue({ code: "custom", message: "explicit emotion requires an explicit user signal" });
  if ((event.reason_inference === undefined) !== (event.reason_confidence === undefined)) context.addIssue({ code: "custom", message: "inference and confidence must be provided together" });
  if (event.profanity.length && event.signal_source !== "explicit_user") context.addIssue({ code: "custom", message: "profanity capture requires an explicit user signal" });
});

const writeAnnotations = { readOnlyHint: false, destructiveHint: false, openWorldHint: false } as const;
const storageFailure = "Não foi possível registrar este feedback com segurança. Nenhum sucesso de gravação foi confirmado.";

export function registerFeedbackTools(
  server: McpServer,
  store: SupabaseFeedbackStore,
  options: { resource: string; authorizeWrite: () => Promise<OAuthPrincipalAuthorization> },
) {
  server.registerTool(
    "beta_record_feedback",
    {
      title: "Registrar feedback ou lacuna observada da Beta",
      description: "Registra feedback explícito do usuário ou autodiagnóstico baseado em resultado que a Beta realmente observou. Use somente quando houver evidência contextual clara; nunca deduza frustração por palavrões, informalidade ou silêncio. Não envie transcript, raciocínio interno, credenciais, dados pessoais ou conteúdo integral de chamados. Informe no máximo três resumos curtos (objetivo, resultado, lacuna) e referências de origem permitidas. Palavras ofensivas só podem ser incluídas se estiverem literalmente na mensagem recebida; não as use para aumentar o nível de fricção. A identidade do analista vem da autorização OAuth validada, não dos argumentos. Requer `feedback:write`.",
      inputSchema: {
        idempotency_key: z.string().uuid(),
        event_type: eventBaseSchema.shape.event_type,
        category: eventBaseSchema.shape.category,
        signal_source: eventBaseSchema.shape.signal_source,
        feedback_polarity: eventBaseSchema.shape.feedback_polarity,
        friction_level: eventBaseSchema.shape.friction_level,
        frustration_evidence: eventBaseSchema.shape.frustration_evidence,
        user_confirmed: eventBaseSchema.shape.user_confirmed,
        context: eventBaseSchema.shape.context,
        declared_reason: eventBaseSchema.shape.declared_reason,
        reason_category: eventBaseSchema.shape.reason_category,
        reason_inference: eventBaseSchema.shape.reason_inference,
        reason_confidence: eventBaseSchema.shape.reason_confidence,
        tool_event_ref: eventBaseSchema.shape.tool_event_ref,
        profanity: eventBaseSchema.shape.profanity,
      },
      outputSchema: { recorded: z.boolean(), duplicate: z.boolean() },
      securitySchemes: [{ type: "oauth2" as const, scopes: [FEEDBACK_WRITE_SCOPE] }],
      annotations: writeAnnotations,
    },
    async (rawArgs: unknown) => {
      const parsed = eventSchema.safeParse(rawArgs);
      if (!parsed.success) return { isError: true, content: [{ type: "text" as const, text: "Os dados do feedback estão incompletos ou excedem os limites permitidos; nada foi gravado." }] };

      let authorization: OAuthPrincipalAuthorization;
      try { authorization = await options.authorizeWrite(); }
      catch { return { isError: true, content: [{ type: "text" as const, text: "Não foi possível validar a autorização de feedback." }] }; }
      if (!authorization.authorized) return mcpAuthorizationError(authorization.error, options.resource, [FEEDBACK_WRITE_SCOPE]);
      const actor = authorization.principal;
      if (!actor.userId || process.env.FEEDBACK_CAPTURE_ENABLED !== "true") {
        return { isError: true, content: [{ type: "text" as const, text: "O registro de feedback ainda não está habilitado neste ambiente." }] };
      }

      const event = parsed.data;
      const profanity = event.profanity.map((term) => ({
        exact_term: sanitizeText(term.exact_term, 80),
        normalized_term: sanitizeText(term.exact_term.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR").replace(/[^\p{L}\p{N}_ -]/gu, " ").replace(/\s+/gu, " ").trim(), 80),
        target: term.target,
      }));
      if (profanity.some((term) => !term.exact_term || !term.normalized_term)) {
        return { isError: true, content: [{ type: "text" as const, text: "O termo de linguagem ofensiva não pôde ser normalizado com segurança; nada foi gravado." }] };
      }
      const payload = {
        schema_version: 1,
        idempotency_key: event.idempotency_key,
        event_type: event.event_type,
        category: event.category,
        signal_source: event.signal_source,
        feedback_polarity: event.feedback_polarity ?? null,
        friction_level: event.friction_level,
        frustration_evidence: event.frustration_evidence,
        user_confirmed: event.user_confirmed ?? null,
        context: {
          goal_summary: sanitizeText(event.context.goal_summary, 500),
          observed_outcome: sanitizeText(event.context.observed_outcome, 500),
          identified_gap: sanitizeText(event.context.identified_gap, 500),
          evidence_refs: event.context.evidence_refs,
        },
        declared_reason: event.declared_reason ? sanitizeText(event.declared_reason, 600) : null,
        reason_category: event.reason_category ?? null,
        reason_inference: event.reason_inference ? sanitizeText(event.reason_inference, 600) : null,
        reason_confidence: event.reason_confidence ?? null,
        tool_event_ref: event.tool_event_ref ?? null,
        profanity,
      };

      try {
        const result = await store.record(payload, actor.userId, actor.email);
        return {
          content: [{ type: "text" as const, text: result.inserted ? "Feedback registrado." : "Este feedback já havia sido registrado; a repetição foi ignorada." }],
          structuredContent: { recorded: true, duplicate: !result.inserted },
        };
      } catch (error) {
        const diagnostic = error instanceof FeedbackStoreError ? error.diagnostic : "unexpected";
        return { isError: true, content: [{ type: "text" as const, text: `${storageFailure} (diagnóstico: ${diagnostic})` }] };
      }
    },
  );
}
