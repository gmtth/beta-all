import rawCatalog from "../config/movidesk_semantic_models.json";

export type SemanticCategory = { label?: string; strong_signals?: string[]; supporting_signals?: string[]; contextual_groups?: unknown[]; negative_contexts?: unknown[]; [key: string]: unknown };
export type SemanticPolicy = { stopwords: string[]; action_classes: { noise_patterns: string[]; operational_patterns: string[]; technical_patterns: string[] }; line_noise_patterns: string[]; scoring_weights: Record<string, number>; protected_numeric_patterns: string[]; fallback?: { policy: string; maximum_ratio: number; stopwords: string[]; noise_patterns: string[] } };
export type SemanticCatalog = { schema_version: string; ruleset_version: string; name: string; phase: string; parser: Record<string, unknown>; filters: Record<string, unknown>; semantic_policy?: SemanticPolicy; semantic_types: Record<string, unknown>; classification: { scoring?: Record<string, unknown>; universal_weak_terms?: string[]; categories: Record<string, SemanticCategory>; source_context?: Record<string, unknown> }; disambiguation: Record<string, unknown>; confidence: Record<string, unknown>; safety_fallbacks: Record<string, unknown> };

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** Validate the generated runtime snapshot. The YAML source is validated by the catalog test/CI command. */
export function validateSemanticCatalog(value: unknown): SemanticCatalog {
  if (!isRecord(value)) throw new Error("semantic_catalog_invalid_root");
  for (const field of ["schema_version", "ruleset_version", "name", "phase"]) if (!isNonEmptyString(value[field])) throw new Error(`semantic_catalog_missing_${field}`);
  if (!isRecord(value.classification) || !isRecord(value.classification.categories)) throw new Error("semantic_catalog_missing_categories");
  if (value.semantic_policy !== undefined) {
    const policy = value.semantic_policy;
    if (!isRecord(policy) || !Array.isArray(policy.stopwords) || !isRecord(policy.action_classes) || !Array.isArray(policy.line_noise_patterns) || !isRecord(policy.scoring_weights)) throw new Error("semantic_catalog_invalid_semantic_policy");
    for (const field of ["stopwords", "line_noise_patterns"] as const) if (policy[field].some((item) => !isNonEmptyString(item))) throw new Error(`semantic_catalog_invalid_semantic_policy_${field}`);
    for (const field of ["noise_patterns", "operational_patterns", "technical_patterns"] as const) if (!Array.isArray(policy.action_classes[field]) || policy.action_classes[field].some((item) => !isNonEmptyString(item))) throw new Error(`semantic_catalog_invalid_semantic_policy_${field}`);
  }
  const categories = value.classification.categories;
  const ids = new Set<string>();
  for (const [id, category] of Object.entries(categories)) {
    if (ids.has(id) || !isRecord(category) || !isNonEmptyString(category.label)) throw new Error(`semantic_catalog_invalid_category_${id}`);
    ids.add(id);
    for (const field of ["strong_signals", "supporting_signals"]) if (category[field] !== undefined && (!Array.isArray(category[field]) || category[field].some((signal) => !isNonEmptyString(signal)))) throw new Error(`semantic_catalog_invalid_${field}_${id}`);
  }
  return value as SemanticCatalog;
}

let catalog: SemanticCatalog;
try {
  catalog = validateSemanticCatalog(rawCatalog);
} catch (error) {
  // Keep Phase 2 and factual extraction available if configuration is invalid.
  console.error("Phase3A semantic ruleset unavailable; using deterministic fallback.", error);
  catalog = { schema_version: "fallback", ruleset_version: "fallback", name: "fallback", phase: "3A", parser: {}, filters: {}, semantic_policy: { stopwords: ["a", "e", "de", "do", "da", "em", "para", "com", "que", "uma", "um"], action_classes: { noise_patterns: ["confidential", "atenciosamente"], operational_patterns: ["^bom dia", "^boa tarde", "^obrigad"], technical_patterns: ["erro", "falha", "offline", "sensor"] }, line_noise_patterns: ["confidential", "atenciosamente"], scoring_weights: { subject: 12, description: 12, actions_technical: 14, category: 6, service: 6, team: 3 }, protected_numeric_patterns: ["\\b(?:erro|error)\\s+[45]\\d{2}\\b"], fallback: { policy: "minimal_safe_subset", maximum_ratio: 0.1, stopwords: ["a", "e", "de", "do", "da", "em", "para", "com", "que"], noise_patterns: ["confidential", "atenciosamente"] } }, semantic_types: {}, classification: { categories: {} }, disambiguation: {}, confidence: {}, safety_fallbacks: {} };
}

export const semanticCatalog = Object.freeze(catalog);
export const semanticRulesetVersion = semanticCatalog.ruleset_version;
