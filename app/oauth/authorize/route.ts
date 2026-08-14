import { getChatGPTUser, chatGPTSignInPath } from "../../chatgpt-auth";
import { allowedScopes, db, ensureSchema, getUserRole, json, randomToken, hash, oauthClient, validateAuthorizationRequest } from "../_lib";

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
function bad(message: string) { return json({ error: "invalid_request", error_description: message }, { status: 400 }); }

function validate(clientId: string, responseType: string, redirectUri: string, scope: string, challenge: string, method: string) {
  const client = oauthClient(clientId);
  if (!client || !validateAuthorizationRequest(clientId, responseType, redirectUri, scope, challenge, method, process.env)) return null;
  return client;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestedClient = url.searchParams.get("client_id") ?? "";
  const redirectUri = url.searchParams.get("redirect_uri") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const scope = url.searchParams.get("scope") ?? "";
  const challenge = url.searchParams.get("code_challenge") ?? "";
  const method = url.searchParams.get("code_challenge_method") ?? "";
  const client = validate(requestedClient, url.searchParams.get("response_type") ?? "", redirectUri, scope, challenge, method);
  if (!client) return bad("Invalid OAuth parameters.");
  await ensureSchema();
  const user = await getChatGPTUser();
  if (!user) return Response.redirect(new URL(chatGPTSignInPath(`/oauth/authorize${url.search}`), url), 302);
  if (!(await getUserRole(user.email))) return bad("This account is not authorized.");
  const challengeFields = client.requiresPkce
    ? `<input type="hidden" name="code_challenge" value="${escapeHtml(challenge)}"><input type="hidden" name="code_challenge_method" value="S256">`
    : "";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Authorize Movidesk</title><style>body{font-family:Arial;background:#f3f0e8;color:#17211d;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px}.card{max-width:480px;background:#fffffc;border:1px solid #c9d2c5;border-radius:22px;padding:38px;box-shadow:0 20px 60px #1f392722}button{background:#31543a;color:white;border:0;border-radius:10px;padding:13px 18px;font-weight:700;cursor:pointer}a{color:#31543a;margin-left:15px}</style></head><body><main class="card"><h1>Authorize Movidesk</h1><p>GPT may read tickets for <strong>${escapeHtml(user.email)}</strong>.</p><p>Permission: <strong>${escapeHtml(scope)}</strong></p><form method="post" action="/oauth/authorize"><input type="hidden" name="client_id" value="${escapeHtml(requestedClient)}"><input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}"><input type="hidden" name="state" value="${escapeHtml(state)}"><input type="hidden" name="scope" value="${escapeHtml(scope)}">${challengeFields}<button type="submit">Authorize access</button><a href="${escapeHtml(redirectUri)}?error=access_denied&amp;state=${encodeURIComponent(state)}">Cancel</a></form></main></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const form = await request.formData();
  const requestedClient = String(form.get("client_id") ?? "");
  const redirectUri = String(form.get("redirect_uri") ?? "");
  const state = String(form.get("state") ?? "");
  const scope = String(form.get("scope") ?? "");
  const challenge = String(form.get("code_challenge") ?? "");
  const method = String(form.get("code_challenge_method") ?? "");
  const client = validate(requestedClient, "code", redirectUri, scope, challenge, method);
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!client || !user || !(await getUserRole(user.email))) return bad("Invalid authorization.");
  const code = randomToken();
  await db().prepare("INSERT INTO oauth_codes (code_hash, client_id, redirect_uri, user_id, user_email, scope, code_challenge, code_challenge_method, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(await hash(code), requestedClient, redirectUri, user.userId, user.email.toLowerCase(), scope, client.requiresPkce ? challenge : null, client.requiresPkce ? method : null, Date.now() + 300000).run();
  const callback = new URL(redirectUri);
  callback.searchParams.set("code", code);
  if (state) callback.searchParams.set("state", state);
  return Response.redirect(callback, 302);
}
