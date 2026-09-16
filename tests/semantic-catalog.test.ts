import assert from "node:assert/strict";
import test from "node:test";
import { semanticCatalog, semanticRulesetVersion, validateSemanticCatalog } from "../worker/semantic-catalog";

test("semantic catalog loads a validated immutable ruleset snapshot", () => {
  assert.equal(semanticCatalog.schema_version, "1.1");
  assert.equal(semanticRulesetVersion, "2026.09.16.1");
  assert.ok(Object.keys(semanticCatalog.classification.categories).length >= 10);
  assert.ok(semanticCatalog.semantic_policy);
  assert.equal(semanticCatalog.semantic_policy?.fallback?.maximum_ratio, 0.1);
  assert.equal(Object.isFrozen(semanticCatalog), true);
});

test("semantic catalog validation rejects missing required metadata", () => {
  assert.throws(() => validateSemanticCatalog({}), /semantic_catalog_missing_schema_version/);
  assert.throws(() => validateSemanticCatalog({ schema_version: "1.1", ruleset_version: "x", name: "x", phase: "3A", classification: { categories: { bad: {} } } }), /semantic_catalog_invalid_category_bad/);
  assert.throws(() => validateSemanticCatalog({ schema_version: "1.1", ruleset_version: "x", name: "x", phase: "3A", semantic_policy: {}, classification: { categories: {} } }), /semantic_catalog_invalid_semantic_policy/);
});
