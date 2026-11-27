import assert from "node:assert/strict";
import { test } from "node:test";
import { hasFormElicitationCapability } from "../worker/mcp-elicitation";

test("form elicitation capability accepts explicit and legacy declarations", () => {
  assert.equal(hasFormElicitationCapability({ elicitation: { form: {} } }), true);
  assert.equal(hasFormElicitationCapability({ elicitation: {} }), true);
});

test("form elicitation capability rejects absent, malformed, and URL-only declarations", () => {
  assert.equal(hasFormElicitationCapability(undefined), false);
  assert.equal(hasFormElicitationCapability({}), false);
  assert.equal(hasFormElicitationCapability({ elicitation: null }), false);
  assert.equal(hasFormElicitationCapability({ elicitation: { url: {} } }), false);
});
