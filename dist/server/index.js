import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { MovideskClient } from "../src/movidesk-client.js";
import { bearerToken, loadProxyOAuthConfig, oauthAuthorizationServerMetadata, protectedResourceMetadata } from "../src/auth.js";
import { registerTools } from "../src/tools/index.js";
const corsHeaders = {
    "access-control-allow-origin": "https://chatgpt.com",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Authorization, Content-Type, Accept, MCP-Protocol-Version, Last-Event-ID",
    "access-control-expose-headers": "WWW-Authenticate, MCP-Session-Id",
};
const withCors = (response) => new Response(response.body, { status: response.status, statusText: response.statusText, headers: { ...Object.fromEntries(response.headers), ...corsHeaders } });
const json = (data, init = {}) => new Response(JSON.stringify(data), { ...init, headers: { "content-type": "application/json", ...corsHeaders, ...(init.headers ?? {}) } });
const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
const landingPage = (config) => {
    const publicUrl = escapeHtml(config.publicUrl);
    const resourceUrl = escapeHtml(config.resource);
    const authorizationUrl = escapeHtml(config.authorizationEndpoint);
    return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Documentação do servidor MCP somente leitura para consultas autorizadas no Movidesk." />
    <title>Movidesk MCP · conexão segura</title>
    <style>
      :root { color-scheme: dark; --bg: #08090d; --panel: rgba(21, 23, 31, .82); --line: rgba(255,255,255,.11); --muted: #a4a9b8; --text: #f7f8fb; --red: #ff1839; --orange: #ff9d1d; --purple: #7547ff; }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { margin: 0; min-width: 320px; font: 15px/1.6 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--text); background: radial-gradient(circle at 85% -10%, rgba(255, 24, 57, .22), transparent 34rem), radial-gradient(circle at 10% 15%, rgba(117, 71, 255, .18), transparent 30rem), var(--bg); }
      a { color: inherit; text-decoration: none; }
      .shell { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
      .nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; }
      .brand { display: flex; align-items: center; gap: 12px; font-weight: 760; letter-spacing: -.02em; }
      .brand-mark { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px; color: white; font-size: 25px; font-weight: 900; line-height: 1; background: linear-gradient(135deg, #f00024 5%, #ff6c13 58%, #ffb31e); box-shadow: 0 8px 24px rgba(255, 44, 47, .28); transform: skew(-4deg); }
      .brand-mark span { transform: skew(4deg) translateY(-1px); }
      .nav-links { display: flex; gap: 22px; color: var(--muted); font-size: 13px; }
      .nav-links a:hover { color: var(--text); }
      .hero { display: grid; grid-template-columns: 1.15fr .85fr; gap: 56px; align-items: center; padding: 84px 0 92px; }
      .eyebrow { display: inline-flex; align-items: center; gap: 8px; color: #ffae2b; font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .eyebrow::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: #57e389; box-shadow: 0 0 0 5px rgba(87,227,137,.12); }
      h1 { max-width: 720px; margin: 18px 0 18px; font-size: clamp(42px, 6vw, 76px); line-height: .98; letter-spacing: -.065em; }
      h1 em { font-style: normal; background: linear-gradient(100deg, #ff2745, #ffae24 75%); -webkit-background-clip: text; background-clip: text; color: transparent; }
      .lede { max-width: 590px; margin: 0; color: var(--muted); font-size: 18px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
      .button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 17px; border: 1px solid var(--line); border-radius: 12px; background: rgba(255,255,255,.04); font-weight: 740; font-size: 13px; transition: .2s ease; }
      .button:hover { transform: translateY(-2px); border-color: rgba(255,255,255,.3); background: rgba(255,255,255,.08); }
      .button.primary { border: 0; color: white; background: linear-gradient(110deg, #ed1235, #ff8619); box-shadow: 0 12px 28px rgba(255, 45, 42, .22); }
      .hero-card, .card { border: 1px solid var(--line); border-radius: 22px; background: linear-gradient(145deg, rgba(33,35,46,.86), rgba(13,14,20,.87)); box-shadow: 0 20px 80px rgba(0,0,0,.28); }
      .hero-card { position: relative; overflow: hidden; padding: 25px; }
      .hero-card::before { content: ""; position: absolute; inset: -80px -100px auto auto; width: 230px; height: 230px; border-radius: 50%; background: #ff2442; filter: blur(60px); opacity: .23; }
      .card-kicker { position: relative; display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; }
      .live { color: #66e38f; }
      .terminal { position: relative; margin: 30px 0 18px; padding: 17px; border: 1px solid rgba(255,255,255,.08); border-radius: 14px; background: #0a0b10; color: #d8dbea; font: 12px/1.8 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .terminal .prompt { color: #ff9c22; }
      .terminal .ok { color: #72df91; }
      .status-row { position: relative; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-top: 17px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; }
      .pill { padding: 4px 9px; border-radius: 999px; color: #a8edbb; background: rgba(88,224,137,.1); }
      section { padding: 28px 0 76px; }
      .section-heading { max-width: 680px; margin-bottom: 26px; }
      h2 { margin: 0 0 9px; font-size: clamp(26px, 4vw, 38px); letter-spacing: -.045em; }
      .section-heading p, .card p { margin: 0; color: var(--muted); }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
      .card { padding: 22px; }
      .card h3 { margin: 0 0 8px; font-size: 16px; }
      .icon { display: grid; place-items: center; width: 34px; height: 34px; margin-bottom: 18px; border-radius: 10px; color: #ff9e28; background: rgba(255, 140, 28, .12); font-size: 17px; }
      .docs { display: grid; grid-template-columns: .9fr 1.1fr; gap: 16px; align-items: stretch; }
      .code { overflow: auto; margin: 0; padding: 20px; border: 1px solid var(--line); border-radius: 14px; background: #0a0b10; color: #d9dbea; font: 12px/1.75 ui-monospace, SFMono-Regular, Menlo, monospace; }
      .code .key { color: #ff9f2a; }.code .string { color: #8fe1a5; }.code .comment { color: #74798a; }
      .endpoint { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 14px; padding: 13px 15px; border: 1px solid rgba(255,255,255,.09); border-radius: 12px; background: rgba(255,255,255,.035); }
      .endpoint code { flex: 1; min-width: 220px; color: #ffb43c; font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; }
      footer { padding: 30px 0 42px; border-top: 1px solid var(--line); color: #7f8493; font-size: 12px; }
      footer .shell { display: flex; justify-content: space-between; gap: 20px; }
      @media (max-width: 820px) { .hero, .docs { grid-template-columns: 1fr; gap: 30px; padding-top: 48px; } .grid { grid-template-columns: 1fr; } .nav-links { display: none; } h1 { font-size: clamp(44px, 13vw, 68px); } footer .shell { flex-direction: column; } }
    </style>
  </head>
  <body>
    <header class="shell nav"><a class="brand" href="#top"><span class="brand-mark" aria-hidden="true"><span>m</span></span><span>Movidesk MCP</span></a><nav class="nav-links" aria-label="Navegação"><a href="#como-funciona">Como funciona</a><a href="#configuracao">Configuração</a><a href="${escapeHtml(config.resource)}">Endpoint MCP</a></nav></header>
    <main id="top">
      <section class="shell hero">
        <div><div class="eyebrow">serviço online · somente leitura</div><h1>Consultas do Movidesk, <em>do jeito certo.</em></h1><p class="lede">Um servidor MCP remoto para conectar clientes compatíveis ao Movidesk com OAuth, PKCE e acesso controlado aos tickets autorizados.</p><div class="actions"><a class="button primary" href="#configuracao">Ver configuração</a><a class="button" href="#como-funciona">Entender o fluxo ↓</a></div></div>
        <div class="hero-card"><div class="card-kicker"><span>STATUS DO SERVIÇO</span><span class="live">● online</span></div><div class="terminal"><div><span class="prompt">$</span> GET /health</div><div class="ok">{ "status": "ok" }</div><br /><div><span class="prompt">$</span> POST /mcp</div><div class="ok">Streamable HTTP · OAuth Bearer</div></div><div class="status-row"><span>Recurso protegido</span><span class="pill">movidesk:read</span></div></div>
      </section>
      <section id="como-funciona" class="shell"><div class="section-heading"><h2>Uma ponte pequena e segura.</h2><p>O MCP não guarda o token do Movidesk. Ele valida o acesso recebido pelo proxy OAuth e encaminha apenas a consulta autorizada.</p></div><div class="grid"><article class="card"><div class="icon">01</div><h3>Autorize com PKCE</h3><p>O cliente inicia Authorization Code com PKCE S256 no proxy OAuth, sem expor segredo no navegador.</p></article><article class="card"><div class="icon">02</div><h3>Conecte no /mcp</h3><p>Depois da autorização, o cliente envia o Bearer temporário para o endpoint MCP via Streamable HTTP.</p></article><article class="card"><div class="icon">03</div><h3>Consulte o ticket</h3><p>A ferramenta disponível é <strong>movidesk_get_ticket</strong>, marcada como somente leitura e limitada ao ticket informado.</p></article></div></section>
      <section id="configuracao" class="shell"><div class="section-heading"><h2>Configuração do cliente</h2><p>Use a URL abaixo como servidor MCP. O cliente deve suportar OAuth 2.0 com Authorization Code, PKCE S256 e escopo <strong>${escapeHtml(config.scope)}</strong>.</p></div><div class="docs"><div class="card"><h3>Dados essenciais</h3><div class="endpoint"><span>Endpoint</span><code>${resourceUrl}</code></div><div class="endpoint"><span>Autorização</span><code>${authorizationUrl}</code></div><div class="endpoint"><span>Escopo</span><code>${escapeHtml(config.scope)}</code></div><p style="margin-top:18px">A raiz desta página é apenas documentação. As requisições MCP devem usar <strong>POST /mcp</strong>; o health check fica em <strong>GET /health</strong>.</p></div><pre class="code"><span class="comment">// Exemplo conceitual de configuração</span>
{
  <span class="key">"mcpServers"</span>: {
    <span class="key">"movidesk"</span>: {
      <span class="key">"url"</span>: <span class="string">"${resourceUrl}"</span>,
      <span class="key">"oauth"</span>: {
        <span class="key">"client_id"</span>: <span class="string">"movidesk-gpt"</span>,
        <span class="key">"scope"</span>: <span class="string">"${escapeHtml(config.scope)}"</span>,
        <span class="key">"code_challenge_method"</span>: <span class="string">"S256"</span>
      }
    }
  }
}</pre></div></section>
    </main>
    <footer><div class="shell"><span>Movidesk MCP · integração autorizada e somente leitura</span><span>OAuth metadata disponível em <strong>/.well-known</strong></span></div></footer>
  </body>
</html>`;
};
const createMcpServer = (env, accessToken) => { const server = new McpServer({ name: "movidesk-mcp", version: "1.0.0" }); registerTools(server, new MovideskClient({ proxyUrl: env.OAUTH_PROXY_URL }), accessToken); return server; };
export default { async fetch(request, env) {
        const url = new URL(request.url);
        const config = loadProxyOAuthConfig(env);
        if (request.method === "OPTIONS")
            return new Response(null, { status: 204, headers: corsHeaders });
        if (request.method === "GET" && url.pathname === "/")
            return new Response(landingPage(config), { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=60", ...corsHeaders } });
        if (request.method === "GET" && url.pathname === "/health")
            return json({ status: "ok" });
        const protectedResourceMetadataPaths = new Set([
            "/.well-known/oauth-protected-resource",
            "/.well-known/oauth-protected-resource/mcp",
            "/mcp/.well-known/oauth-protected-resource",
        ]);
        const authorizationServerMetadataPaths = new Set([
            "/.well-known/oauth-authorization-server",
            "/.well-known/oauth-authorization-server/mcp",
            "/mcp/.well-known/oauth-authorization-server",
        ]);
        if (request.method === "GET" && protectedResourceMetadataPaths.has(url.pathname))
            return json(protectedResourceMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
        if (request.method === "GET" && authorizationServerMetadataPaths.has(url.pathname))
            return json(oauthAuthorizationServerMetadata(config), { headers: { "cache-control": "public, max-age=300" } });
        if (url.pathname !== "/mcp" || request.method !== "POST")
            return new Response("Not found", { status: 404, headers: corsHeaders });
        const accessToken = bearerToken(request.headers.get("authorization") ?? undefined);
        if (!accessToken) {
            const metadata = config.publicUrl + "/.well-known/oauth-protected-resource";
            return json({ error: "invalid_token" }, { status: 401, headers: { "www-authenticate": 'Bearer resource_metadata="' + metadata + '", scope="' + config.scope + '"' } });
        }
        const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        const server = createMcpServer(env, accessToken);
        await server.connect(transport);
        return withCors(await transport.handleRequest(request));
    } };
