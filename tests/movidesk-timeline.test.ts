import assert from "node:assert/strict";
import test from "node:test";
import { buildTicketTimeline } from "../worker/movidesk-timeline";

test("timeline sorts actions chronologically and keeps equal-date order", () => {
  const timeline = buildTicketTimeline({ status: "In Progress", actions: [
    { createdDate: "2026-08-16T10:00:00Z", origin: "team", description: "resposta" },
    { createdDate: "2026-08-15T10:00:00Z", origin: "client", description: "problema" },
    { createdDate: "2026-08-15T10:00:00Z", origin: "client", description: "complemento" },
  ] });
  assert.deepEqual(timeline.events.map((event) => event.summary), ["problema", "complemento", "resposta"]);
  assert.equal(timeline.firstClientManifestation?.summary, "problema");
  assert.equal(timeline.lastTeamResponse?.summary, "resposta");
  assert.equal(timeline.terminalStatus, "In Progress");
});

test("timeline preserves missing values as null and detects attachments", () => {
  const [event] = buildTicketTimeline({ actions: [{ attachments: [{ id: 1 }], text: "anexo" }] }).events;
  assert.equal(event.date, null);
  assert.equal(event.author, null);
  assert.equal(event.hasAttachments, true);
});
