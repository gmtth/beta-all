# movidesk-mcp-server

Servidor MCP remoto somente leitura para consultar tickets Movidesk. A primeira versao expoe apenas `movidesk_get_ticket`.

## Arquitetura

O MCP nao implementa Auth0 e nao armazena o token do Movidesk. O proxy OAuth existente executa o Authorization Code, valida contas autorizadas e fornece o Bearer temporario. O MCP encaminha esse Bearer ao proxy em `/api/tickets`.

## Configuracao

```env
PORT=3000
MCP_PUBLIC_URL=https://SEU-MCP.sites.openai.com
OAUTH_PROXY_URL=https://movidesk-oauth-proxy.matheusgregoviski.chatgpt.site
OAUTH_SCOPE=movidesk:read
OAUTH_CLIENT_ID=movidesk-gpt
```

O endpoint MCP e `POST /mcp`. O health check e `GET /health`. Metadata OAuth fica em `/.well-known/oauth-protected-resource` e `/.well-known/oauth-authorization-server`.

O MCP nao aceita `MOVIDESK_TOKEN`, `OAUTH_CLIENT_SECRET` ou Bearer como argumento de ferramenta. Nenhum segredo e registrado em logs, respostas ou metadados.

## Execucao

```bash
npm install
npm run dev
npm test
npm run build
```

No cliente MCP, use a URL publica `https://SEU-MCP.sites.openai.com/mcp`, client ID `movidesk-gpt`, escopo `movidesk:read` e Authorization Code com PKCE S256. O redirect URI precisa estar cadastrado no proxy OAuth.
