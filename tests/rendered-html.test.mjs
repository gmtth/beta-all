import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the proxy renders its branded access page", async () => {
  const page = await read("app/page.tsx");
  const layout = await read("app/layout.tsx");
  assert.match(page, /Movidesk/);
  assert.match(page, /Acesso seguro|conector/i);
  assert.match(layout, /Movidesk \\| Acesso seguro/);
  assert.match(layout, /favicon\.png/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview|Your site is taking shape/);
});

test("OAuth metadata advertises only the implemented PKCE flow", async () => {
  const metadata = await read("app/.well-known/oauth-authorization-server/route.ts");
  assert.match(metadata, /authorization_code/);
  assert.match(metadata, /S256/);
  assert.doesNotMatch(metadata, /refresh_token|client_secret_post/);
});
