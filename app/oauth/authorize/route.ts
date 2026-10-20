import { getChatGPTUser, chatGPTSignInPath } from "../../chatgpt-auth";
import { allowedScopes, canonicalResource, db, ensureSchema, getUserRole, json, randomToken, hash, oauthClient, validateAuthorizationRequest } from "../_lib";

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
function bad(message: string) { return json({ error: "invalid_request", error_description: message }, { status: 400 }); }

function validate(clientId: string, responseType: string, redirectUri: string, scope: string, challenge: string, method: string, resource: string, origin: string) {
  const client = oauthClient(clientId);
  if (!client || !validateAuthorizationRequest(clientId, responseType, redirectUri, scope, challenge, method, process.env)) return null;
  if (client.kind === "mcp" && resource !== canonicalResource(origin)) return null;
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
  const resource = url.searchParams.get("resource") || canonicalResource(url.origin);
  const client = validate(requestedClient, url.searchParams.get("response_type") ?? "", redirectUri, scope, challenge, method, resource, url.origin);
  if (!client) return bad("Invalid OAuth parameters.");
  await ensureSchema();
  const user = await getChatGPTUser();
  if (!user) return Response.redirect(new URL(chatGPTSignInPath(`/oauth/authorize${url.search}`), url), 302);
  if (!(await getUserRole(user.email))) return bad("This account is not authorized.");
  const challengeFields = client.requiresPkce
    ? `<input type="hidden" name="code_challenge" value="${escapeHtml(challenge)}"><input type="hidden" name="code_challenge_method" value="S256">`
    : "";
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Autorizar Beta MCP</title><style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;background:#100d13;color:#f8f7f5;display:grid;place-items:center;min-height:100vh;margin:0;padding:28px 20px;overflow-x:hidden}.shell{width:100%;position:relative;display:grid;place-items:center}.ambient{position:fixed;width:360px;height:360px;border-radius:50%;filter:blur(80px);opacity:.16;pointer-events:none}.one{top:-180px;left:-100px;background:#ff8a24}.two{right:-140px;bottom:-190px;background:#ffb24a}.card{width:min(600px,100%);position:relative;padding:clamp(24px,5vw,46px);border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(145deg,rgba(40,31,40,.95),rgba(20,16,24,.98));box-shadow:0 30px 100px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.05)}.brandbar{display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800;letter-spacing:-.06em}.brand img{width:112px;height:32px;object-fit:contain}.brand-product{margin-left:-5px;padding:4px 7px;border:1px solid rgba(255,138,36,.32);border-radius:999px;color:#ffad60;font-size:9px;letter-spacing:.12em}.secure{color:#87838a;font-size:10px;font-weight:700;letter-spacing:.14em}.dot{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:#ff8a24;box-shadow:0 0 12px #ff8a24}.hero{padding:62px 0 30px}.eyebrow{display:flex;align-items:center;gap:10px;color:#ffad60;font-size:10px;font-weight:800;letter-spacing:.18em}.pulse{width:8px;height:8px;border-radius:50%;background:#ff8a24;box-shadow:0 0 0 5px rgba(255,138,36,.14),0 0 18px #ff8a24}.hero h1{margin:20px 0 15px;font-size:clamp(38px,7vw,64px);line-height:.94;letter-spacing:-.075em}.hero h1 em{color:#ff9d3d;font-style:normal}.lead{max-width:470px;margin:0;color:#a3a0a4;font-size:15px;line-height:1.6}.panel{padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(255,255,255,.065)}.panel-label{display:flex;align-items:center;justify-content:space-between;color:#aaa6ad;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.status{padding:6px 8px;border-radius:999px;color:#ffbd8c;background:rgba(255,138,36,.12);font-size:9px;letter-spacing:.1em}.account{display:flex;align-items:center;gap:13px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.12)}.avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff8a24,#ffb24a);font-weight:800}.account strong,.permission strong{display:block;color:#f8f7f5;font-size:14px}.account small,.permission small{display:block;margin-top:4px;color:#8f8b92;font-size:12px;line-height:1.4}.permission{display:flex;align-items:center;gap:13px;padding-top:18px}.permission-icon{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;color:#ffad60;background:rgba(255,138,36,.14);font-weight:800}.actions{display:flex;align-items:center;gap:14px;margin-top:28px}.actions button{border:0;border-radius:11px;padding:14px 18px;color:#fff;background:linear-gradient(135deg,#ff8a24,#ffb24a);font-weight:800;cursor:pointer;box-shadow:0 10px 24px rgba(255,138,36,.2)}.actions button:hover{filter:brightness(1.08)}.cancel{color:#a3a0a4;font-size:12px;text-decoration:none}.cancel:hover{color:#ffad60}.footer{display:flex;justify-content:space-between;gap:16px;margin-top:28px;color:#817c84;font-size:10px;letter-spacing:.1em}.footer strong{color:#ffad60;font-size:10px}.footer span:last-child{color:#69646d}@media(max-width:600px){.brandbar{align-items:flex-start;flex-direction:column}.secure{order:-1}.hero{padding-top:52px}.actions{align-items:stretch;flex-direction:column}.actions button{width:100%}.cancel{text-align:center}.footer{align-items:flex-start;flex-direction:column}}
  </style></head><body><div class="shell"><div class="ambient one"></div><div class="ambient two"></div><main class="card" aria-labelledby="page-title"><header class="brandbar"><div class="brand"><img src="/beta-logo.svg" alt="Beta"><span class="brand-product">MCP</span></div><span class="secure"><span class="dot"></span> CONEXÃO SEGURA</span></header><section class="hero"><div class="eyebrow"><span class="pulse"></span> AUTORIZAÇÃO DE ACESSO</div><h1 id="page-title">Conectar ao<br><em>MCP da Beta.</em></h1><p class="lead">O MCP da Beta solicita acesso à integração Movidesk. Confira a permissão abaixo antes de continuar.</p></section><section class="panel" aria-label="Detalhes da autorização"><div class="panel-label"><span>Conta conectada</span><span class="status">AUTORIZAÇÃO PKCE</span></div><div class="account"><span class="avatar">${escapeHtml(user.email.slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(user.email)}</strong><small>Usuário autenticado pelo ChatGPT</small></div></div><div class="permission"><span class="permission-icon">✓</span><div><strong>Movidesk · leitura de tickets</strong><small>Permissão solicitada: ${escapeHtml(scope)}</small></div></div></section><form method="post" action="/oauth/authorize"><input type="hidden" name="client_id" value="${escapeHtml(requestedClient)}"><input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}"><input type="hidden" name="state" value="${escapeHtml(state)}"><input type="hidden" name="scope" value="${escapeHtml(scope)}"><input type="hidden" name="resource" value="${escapeHtml(resource)}">${challengeFields}<div class="actions"><button type="submit">Autorizar acesso</button><a class="cancel" href="${escapeHtml(redirectUri)}?error=access_denied&amp;state=${encodeURIComponent(state)}">Cancelar</a></div></form><footer class="footer"><strong>BETA / MCP ACCESS</strong><span>PKCE S256 ATIVO</span></footer></main></div></body></html>`;
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
  const origin = new URL(request.url).origin;
  const resource = String(form.get("resource") ?? canonicalResource(origin));
  const client = validate(requestedClient, "code", redirectUri, scope, challenge, method, resource, origin);
  const user = await getChatGPTUser();
  await ensureSchema();
  if (!client || !user || !(await getUserRole(user.email))) return bad("Invalid authorization.");
  const code = randomToken();
  await db().prepare("INSERT INTO oauth_codes (code_hash, client_id, redirect_uri, user_id, user_email, scope, resource, code_challenge, code_challenge_method, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(await hash(code), requestedClient, redirectUri, user.userId, user.email.toLowerCase(), scope, resource, client.requiresPkce ? challenge : null, client.requiresPkce ? method : null, Date.now() + 300000).run();
  const callback = new URL(redirectUri);
  callback.searchParams.set("code", code);
  if (state) callback.searchParams.set("state", state);
  if (client.kind === "mcp") callback.searchParams.set("iss", origin);
  return Response.redirect(callback, 302);
}

