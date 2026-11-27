import assert from "node:assert/strict";
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(new URL("../sync-sites-checkout.mjs", import.meta.url)));
const repoRoot = path.resolve(scriptsDir, "..");
const syncScript = path.join(scriptsDir, "sync-sites-checkout.mjs");
const productionId = JSON.parse(readFileSync(path.join(repoRoot, "mcp/movidesk/.openai/hosting.json"), "utf8")).project_id;
const homologId = JSON.parse(readFileSync(path.join(repoRoot, "mcp/movidesk-environments/homolog/.openai/hosting.json"), "utf8")).project_id;

function withCheckout(projectId, run) {
  const parent = mkdtempSync(path.join(os.tmpdir(), "sites-sync-test-"));
  try {
    const checkout = path.join(parent, "checkout");
    mkdirSync(path.join(checkout, ".openai"), { recursive: true });
    writeFileSync(path.join(checkout, ".openai/hosting.json"), JSON.stringify({ project_id: projectId }));
    const init = spawnSync("git", ["init", checkout], { encoding: "utf8" });
    assert.equal(init.status, 0, init.stderr);
    run(checkout);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}

function sync(checkout, ...args) {
  return spawnSync(process.execPath, [syncScript, checkout, ...args], { encoding: "utf8" });
}

test("Sites sync accepts the explicitly selected homolog project", () => {
  withCheckout(homologId, (checkout) => {
    const result = sync(checkout, "--target", "homolog", "--dry-run");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Simulação:/);
  });
});

test("Sites sync keeps production as the default target", () => {
  withCheckout(productionId, (checkout) => {
    const result = sync(checkout, "--dry-run");
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Simulação:/);
  });
});

test("Sites sync rejects a checkout whose Site ID does not match the selected environment", () => {
  withCheckout(productionId, (checkout) => {
    const result = sync(checkout, "--target", "homolog", "--dry-run");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /não corresponde ao destino homolog/);
  });
});

test("Sites sync rejects unknown environment names before touching a checkout", () => {
  withCheckout(homologId, (checkout) => {
    const result = sync(checkout, "--target", "staging", "--dry-run");
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /destino precisa ser production ou homolog/);
  });
});
