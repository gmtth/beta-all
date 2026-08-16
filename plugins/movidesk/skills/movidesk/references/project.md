# Projeto MCP Movidesk

## Visão geral

O projeto disponibiliza um servidor MCP remoto somente leitura para o Movidesk. A aplicação principal combina site, proxy OAuth e endpoint MCP em um projeto vinext/Cloudflare. O diretório `source-bundle/` contém uma variante independente do servidor MCP em Node.js.

## Arquitetura

1. O cliente conecta-se ao endpoint HTTPS `/mcp/`.
2. A descoberta OAuth anuncia o servidor de autorização do próprio site.
3. O fluxo Authorization Code exige PKCE S256 para o cliente MCP `movidesk-mcp-app`.
4. O proxy valida o usuário autorizado e emite um Bearer temporário com escopo `movidesk:read`.
5. O MCP encaminha esse Bearer às rotas internas `/api/tickets`, `/api/persons` e `/api/services`.
6. As rotas validam token, expiração, escopo e allowlist do usuário antes de usar o segredo `MOVIDESK_TOKEN` no servidor.

O token real do Movidesk nunca é recebido como argumento de ferramenta e não deve aparecer em respostas ou logs.

## Endpoints públicos

- MCP: `POST /mcp/`
- OAuth authorization: `GET/POST /oauth/authorize`
- OAuth token: `POST /oauth/token`
- Protected Resource Metadata: `GET /.well-known/oauth-protected-resource`
- Authorization Server Metadata: `GET /.well-known/oauth-authorization-server`
- Privacidade: `GET /privacy`

URL pública atual: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`.

## Clientes OAuth

- MCP: `movidesk-mcp-app`; PKCE S256 obrigatório; redirects oficiais do ChatGPT Connector ou loopback local autorizado.
- GPT Action: `movidesk-gpt-action`; cliente separado, com configuração e segredo próprios.
- Escopo único atual: `movidesk:read`.

Não reutilizar identificadores ou regras de redirect de um cliente no outro.

## Dados e segurança

- Códigos OAuth são de uso único e expiram em cinco minutos.
- Tokens são armazenados como hash e expiram em uma hora.
- O acesso exige identidade do ChatGPT e usuário presente na allowlist administrativa.
- O transporte público usa HTTPS.
- Todas as ferramentas usam anotações de somente leitura e não destrutivas.
- Consultas limitam `top` a 100 e `skip` a 10000.
- Filtros livres têm limite de 1000 caracteres e rejeitam ponto e vírgula ou quebras de linha.

## Áreas do repositório

- `app/`: páginas, OAuth, administração de usuários e APIs de proxy.
- `worker/`: transporte MCP e registro das ferramentas no build do site.
- `source-bundle/`: servidor MCP independente, cliente do proxy e testes.
- `tests/`: verificações do site e clientes OAuth.
- `.openai/hosting.json`: declaração do projeto hospedado e binding D1.
- `db/` e `drizzle/`: esquema e migração de dados.

## Fonte de verdade

Ao alterar ou explicar comportamento, verificar primeiro `worker/mcp-tools.ts`, `worker/mcp.ts`, `app/oauth/clients.ts` e as rotas em `app/api/`. O `source-bundle/README.md` pode representar uma configuração anterior e não deve prevalecer sobre o código atual.
