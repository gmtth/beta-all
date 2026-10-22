import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const panel = await readFile(new URL("../app/user-admin-panel.tsx", import.meta.url), "utf8");

test("tool usage and latency charts share the friendly/technical two-row layout", () => {
  assert.match(panel, /className="usage-tool-header"[\s\S]*?item\.calls\.toLocaleString\("pt-BR"\)\} calls/);
  assert.match(panel, /className="usage-metrics"[\s\S]*?className="usage-bar-track"/);
  assert.match(panel, /className="latency-tool-header"[\s\S]*?item\.samples\.toLocaleString\("pt-BR"\)/);
  assert.match(panel, /className="latency-values"[\s\S]*?className="latency-track"/);
  assert.match(panel, /className="tool-name-friendly"/);
  assert.match(panel, /className="tool-name-technical"/);
});
