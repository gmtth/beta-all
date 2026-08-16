import fs from "node:fs";
import yaml from "js-yaml";

const filename = new URL("../config/movidesk_semantic_models.yaml", import.meta.url);
const catalog = yaml.load(fs.readFileSync(filename, "utf8"));
const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);
if (!isRecord(catalog)) throw new Error("semantic_catalog_invalid_root");
for (const field of ["schema_version", "ruleset_version", "name", "phase"]) if (typeof catalog[field] !== "string" || !catalog[field].trim()) throw new Error(`semantic_catalog_missing_${field}`);
if (!isRecord(catalog.classification) || !isRecord(catalog.classification.categories)) throw new Error("semantic_catalog_missing_categories");
const categories = catalog.classification.categories;
for (const [id, category] of Object.entries(categories)) {
  if (!isRecord(category) || typeof category.label !== "string" || !category.label.trim()) throw new Error(`semantic_catalog_invalid_category_${id}`);
  for (const field of ["strong_signals", "supporting_signals"]) if (category[field] !== undefined && (!Array.isArray(category[field]) || category[field].some((signal) => typeof signal !== "string" || !signal.trim()))) throw new Error(`semantic_catalog_invalid_${field}_${id}`);
}
const knownLabels = new Set(Object.values(categories).map((category) => category.label));
const walk = (value) => {
  if (Array.isArray(value)) return value.forEach(walk);
  if (!isRecord(value)) return;
  if (typeof value.target_category === "string" && !knownLabels.has(value.target_category) && !categories[value.target_category]) throw new Error(`semantic_catalog_unknown_category_${value.target_category}`);
  Object.values(value).forEach(walk);
};
walk(catalog);
console.log(`Phase3A semantic ruleset valid: ${catalog.ruleset_version} (${Object.keys(categories).length} categories)`);
