import { getChatGPTUser, chatGPTSignInPath } from "../../chatgpt-auth";
import { canonicalResource, db, ensureSchema, getUserRole, json, randomToken, hash, oauthClient, validateAuthorizationRequest } from "../_lib";

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
function bad(message: string) { return json({ error: "invalid_request", error_description: message }, { status: 400 }); }
const autoAuthorizeScript = `<script>
(() => {
  const form = document.getElementById("authorization-form");
  const button = document.getElementById("authorize-button");
  const status = document.getElementById("authorization-countdown");
  if (!(form instanceof HTMLFormElement) || !(button instanceof HTMLButtonElement) || !status) return;
  let seconds = 10;
  const update = () => {
    button.textContent = "Autorizar agora · " + seconds + " s";
    if (seconds === 10 || seconds === 5 || seconds <= 3) {
      status.textContent = "A autorização será enviada automaticamente em " + seconds + " segundos.";
    }
  };
  update();
  const timer = window.setInterval(() => {
    seconds -= 1;
    if (seconds <= 0) {
      window.clearInterval(timer);
      button.textContent = "Autorizando…";
      button.disabled = true;
      form.requestSubmit();
      return;
    }
    update();
  }, 1000);
  form.addEventListener("submit", () => window.clearInterval(timer), { once: true });
})();
</script>`;

const scopeDescriptions: Record<string, string> = {
  "movidesk:read": "Consultar chamados e informações do Movidesk",
  "knowledge:read": "Consultar fontes e registros da base de conhecimento",
  "knowledge:write": "Adicionar à base o chamado que você solicitar",
  "offline_access": "Manter a conexão ativa com renovação automática",
};

function renderScopePermissions(scope: string) {
  const scopes = [...new Set(scope.split(/\s+/).filter(Boolean))];
  return scopes.map((item) => `<li class="scope-item"><span class="scope-name">${escapeHtml(item)}</span><span class="scope-description">${escapeHtml(scopeDescriptions[item] ?? "Acesso solicitado por esta integração")}</span></li>`).join("");
}

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
  const scopePermissions = renderScopePermissions(scope);
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
  :root{color-scheme:dark}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;background:#100d13;color:#f8f7f5;display:grid;place-items:center;min-height:100vh;margin:0;padding:28px 20px;overflow-x:hidden}.shell{width:100%;position:relative;display:grid;place-items:center}.ambient{position:fixed;width:360px;height:360px;border-radius:50%;filter:blur(80px);opacity:.16;pointer-events:none}.one{top:-180px;left:-100px;background:#ff8a24}.two{right:-140px;bottom:-190px;background:#ffb24a}.card{width:min(600px,100%);position:relative;padding:clamp(24px,5vw,46px);border:1px solid rgba(255,255,255,.12);border-radius:28px;background:linear-gradient(145deg,rgba(40,31,40,.95),rgba(20,16,24,.98));box-shadow:0 30px 100px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.05)}.brandbar{display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800;letter-spacing:-.06em}.brand img{width:112px;height:32px;object-fit:contain}.brand-product{margin-left:-5px;padding:4px 7px;border:1px solid rgba(255,138,36,.32);border-radius:999px;color:#ffad60;font-size:9px;letter-spacing:.12em}.secure{color:#87838a;font-size:10px;font-weight:700;letter-spacing:.14em}.dot{display:inline-block;width:6px;height:6px;margin-right:6px;border-radius:50%;background:#ff8a24;box-shadow:0 0 12px #ff8a24}.hero{padding:8px 0 28px}.eyebrow{display:flex;align-items:center;gap:10px;color:#ffad60;font-size:10px;font-weight:800;letter-spacing:.18em}.pulse{width:8px;height:8px;border-radius:50%;background:#ff8a24;box-shadow:0 0 0 5px rgba(255,138,36,.14),0 0 18px #ff8a24}.hero h1{margin:0 0 18px;font-size:clamp(38px,7vw,64px);line-height:.94;letter-spacing:-.075em}.hero h1 em{color:#ff9d3d;font-style:normal}.lead{max-width:520px;margin:0;padding:14px 16px;border:1px solid rgba(255,138,36,.2);border-radius:12px;background:rgba(255,138,36,.07);color:#d1ccd3;font-size:14px;line-height:1.55}.panel{padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:rgba(255,255,255,.065)}.panel-label{display:flex;align-items:center;justify-content:space-between;color:#aaa6ad;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.status{padding:6px 8px;border-radius:999px;color:#ffbd8c;background:rgba(255,138,36,.12);font-size:9px;letter-spacing:.1em}.account{display:flex;align-items:center;gap:13px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.12)}.avatar{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,#ff8a24,#ffb24a);font-weight:800}.account strong,.permission strong{display:block;color:#f8f7f5;font-size:14px}.account small,.permission small{display:block;margin-top:4px;color:#8f8b92;font-size:12px;line-height:1.4}.permission{padding-top:18px}.scope-list{display:grid;gap:9px;margin:14px 0 0;padding:0;list-style:none}.scope-item{display:flex;align-items:flex-start;gap:11px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(0,0,0,.12)}.scope-name{flex:0 0 auto;padding:4px 7px;border-radius:999px;color:#ffc28f;background:rgba(255,138,36,.13);font:700 10px/1.2 Arial,Helvetica,sans-serif}.scope-description{color:#c2bdc5;font-size:12px;line-height:1.45}.actions{display:flex;align-items:center;gap:14px;margin-top:28px}.actions button{border:0;border-radius:11px;padding:14px 18px;color:#fff;background:linear-gradient(135deg,#ff8a24,#ffb24a);font-weight:800;cursor:pointer;box-shadow:0 10px 24px rgba(255,138,36,.2)}.actions button:hover{filter:brightness(1.08)}.actions button:disabled{opacity:.75;cursor:wait}.authorization-countdown{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.cancel{color:#a3a0a4;font-size:12px;text-decoration:none}.cancel:hover{color:#ffad60}.footer{display:flex;justify-content:space-between;gap:16px;margin-top:28px;color:#817c84;font-size:10px;letter-spacing:.1em}.footer strong{color:#ffad60;font-size:10px}.footer span:last-child{color:#69646d}@media(max-width:600px){.brandbar{align-items:flex-start;flex-direction:column}.secure{order:-1}.actions{align-items:stretch;flex-direction:column}.actions button{width:100%}.cancel{text-align:center}.footer{align-items:flex-start;flex-direction:column}}
  </style></head><body><div class="shell"><div class="ambient one"></div><div class="ambient two"></div><main class="card" aria-labelledby="page-title"><section class="hero"><h1 id="page-title">Conectar ao<br><em>MCP da Beta.</em></h1><p class="lead">A autorização será enviada automaticamente em 10 segundos. Se você não reconhece esta solicitação, cancele.</p></section><section class="panel" aria-label="Detalhes da autorização"><div class="panel-label"><span>Conta conectada</span></div><div class="account"><span class="avatar">${escapeHtml(user.email.slice(0, 1).toUpperCase())}</span><div><strong>${escapeHtml(user.email)}</strong><small>Usuário autenticado pelo ChatGPT</small></div></div><div class="permission"><strong>Permissões para esta conexão</strong><small>O que cada acesso permite:</small><ul class="scope-list">${scopePermissions}</ul></div></section><form id="authorization-form" method="post" action="/oauth/authorize"><input type="hidden" name="client_id" value="${escapeHtml(requestedClient)}"><input type="hidden" name="redirect_uri" value="${escapeHtml(redirectUri)}"><input type="hidden" name="state" value="${escapeHtml(state)}"><input type="hidden" name="scope" value="${escapeHtml(scope)}"><input type="hidden" name="resource" value="${escapeHtml(resource)}">${challengeFields}<p id="authorization-countdown" class="authorization-countdown" role="status" aria-live="polite">Autorização automática em 10 segundos.</p><div class="actions"><button id="authorize-button" type="submit">Autorizar agora · 10 s</button><a class="cancel" href="${escapeHtml(redirectUri)}?error=access_denied&amp;state=${encodeURIComponent(state)}">Cancelar</a></div></form></main></div>${autoAuthorizeScript}</body></html>`;
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

