import assert from "node:assert/strict";
import { test } from "node:test";
import { MovideskAnalysisSession } from "../worker/movidesk-analysis";

test("analysis session caches identical ticket queries", async () => {
  let calls = 0;
  const session = new MovideskAnalysisSession({ searchTickets: async () => [], getTicket: async () => { calls += 1; return { id: 6280 }; } }, "temporary-token");
  assert.deepEqual(await session.getTicket("6280"), { id: 6280 });
  assert.deepEqual(await session.getTicket("6280"), { id: 6280 });
  assert.deepEqual(session.stats(), { requests: 1, cacheHits: 1, candidates: 0, analyzed: 0, partial: false, warnings: [] });
  assert.equal(calls, 1);
});

test("analysis session enforces the request window without parallel calls", async () => {
  let clock = 0;
  const sleeps: number[] = [];
  let calls = 0;
  const session = new MovideskAnalysisSession({ searchTickets: async () => { calls += 1; return []; }, getTicket: async () => null }, "temporary-token", { maxRequests: 2, windowMs: 1000, now: () => clock, sleep: async (ms) => { sleeps.push(ms); clock += ms; } });
  await session.searchTickets({ filter: "one" });
  await session.searchTickets({ filter: "two" });
  await session.searchTickets({ filter: "three" });
  assert.equal(calls, 3);
  assert.equal(sleeps.length, 1);
  assert.equal(sleeps[0], 1000);
  assert.equal(session.stats().requests, 3);
});

test("analysis session marks bounded analyses as partial", () => {
  const session = new MovideskAnalysisSession({ searchTickets: async () => [], getTicket: async () => null }, "temporary-token", { maxTickets: 2 });
  assert.equal(session.registerCandidates(2), true);
  assert.equal(session.registerCandidates(1), false);
  session.registerAnalyzed(2);
  session.markPartial("Uma página não pôde ser consultada.");
  assert.deepEqual(session.stats(), { requests: 0, cacheHits: 0, candidates: 3, analyzed: 2, partial: true, warnings: ["Limite de 2 tickets por análise atingido.", "Uma página não pôde ser consultada."] });
});
