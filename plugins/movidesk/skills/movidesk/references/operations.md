# Operação e diagnóstico

## Conectar no Codex ou ChatGPT

Usar:

- Endpoint: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`
- Authorization server: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`
- Client ID: `movidesk-mcp-app`
- Scope: `movidesk:read`
- Authorization Code com PKCE S256

Manter a barra final de `/mcp/`. Concluir a autorização com uma conta presente na allowlist do projeto.

## Desenvolvimento do site integrado

Pré-requisito: Node.js 22.13 ou superior.

```bash
npm install
npm run dev
npm test
npm run build
npm run lint
```

`npm test` executa o build e valida o HTML renderizado. O projeto usa vinext, React 19, Cloudflare, D1 e Drizzle.

## Desenvolvimento do servidor independente

Executar dentro de `source-bundle/`:

```bash
npm install
npm run dev
npm test
npm run build
```

Variáveis esperadas:

```env
PORT=3000
MCP_PUBLIC_URL=https://SEU-MCP.example.com
OAUTH_PROXY_URL=https://SEU-PROXY.example.com
OAUTH_SCOPE=movidesk:read
OAUTH_CLIENT_ID=movidesk-mcp-app
```

`OAUTH_PROXY_SITE_TOKEN` pode autenticar o salto privado entre sites quando a implantação exigir. Não colocar `MOVIDESK_TOKEN` no servidor MCP independente; esse segredo pertence ao proxy OAuth.

## Diagnóstico

- `401 invalid_token`: Bearer ausente, inválido ou expirado. Refazer autorização.
- `403 forbidden`: conta não está autorizada na allowlist. Solicitar ao administrador a concessão de acesso.
- `400 search_criteria_required`: fornecer ao menos um critério de pesquisa.
- `400 invalid_filter`: revisar o filtro OData; remover ponto e vírgula, quebras de linha ou excesso de tamanho.
- `400 invalid_pagination`: usar `top` entre 1 e 100 e `skip` entre 0 e 10000.
- `502 Movidesk indisponível`: falha de rede ou indisponibilidade upstream; tentar novamente depois.
- `503 Proxy não configurado`: o segredo do Movidesk não está configurado no ambiente do proxy.
- Falha de descoberta: confirmar HTTPS e a barra final no endpoint `/mcp/`.
- Falha de PKCE: confirmar `code_challenge_method=S256` e o Client ID MCP correto.

Nunca diagnosticar pedindo tokens, segredos ou códigos OAuth ao usuário.
