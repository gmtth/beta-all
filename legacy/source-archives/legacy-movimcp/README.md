# movidesk-mcp-server

Servidor MCP remoto somente leitura para consultar dados do Movidesk.

Ferramentas expostas:

- `movidesk_get_ticket`: consulta um ticket por protocolo.
- `movidesk_search_tickets`: busca tickets por protocolo, status, datas ou filtro OData.
- `movidesk_list_open_tickets`: lista tickets não resolvidos/cancelados dentro de um período.
- `movidesk_list_services`: lista serviços.

## Arquitetura

O MCP nao implementa Auth0 e nao armazena o token do Movidesk. O proxy OAuth existente executa o Authorization Code, valida contas autorizadas e fornece o Bearer temporario. O MCP encaminha esse Bearer ao proxy em `/api/tickets`.

## Configuracao do Site publicado

Estas sao as variaveis configuradas no Site `Movidesk MCP Server`. Os valores nao secretos abaixo correspondem a configuracao atual:

| Variavel | Valor atual | Segredo? | Como recuperar |
| --- | --- | --- | --- |
| `MCP_PUBLIC_URL` | `https://movidesk-mcp-server.thngrns.chatgpt.site` | Nao | URL publicada do Site MCP. |
| `OAUTH_CLIENT_ID` | `movidesk-mcp-app` | Nao | Client ID cadastrado no proxy OAuth `Beta MCP`. |
| `OAUTH_PROXY_URL` | `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site` | Nao | URL publicada do Site proxy `Beta MCP`. |
| `OAUTH_SCOPE` | `movidesk:read` | Nao | Escopo de leitura aceito pelo proxy OAuth. |
| `OAUTH_PROXY_SITE_TOKEN` | Nao registrar o valor neste arquivo | **Sim** | Recuperar o `siwc_bypass_bearer_token` do Site proxy `Beta MCP` usando Sites `get_site` como proprietario. Inserir o valor somente na variavel secreta do Site `Movidesk MCP Server`. |

Para obter `OAUTH_PROXY_SITE_TOKEN`, consulte o Site `Beta MCP` (proxy OAuth, projeto `appgprj_6a7e4b46e0488191bf0e58066ab738d6`) no Sites como proprietario e copie o campo `siwc_bypass_bearer_token` retornado por `get_site`. Esse token autentica a chamada do MCP ao proxy. Se o campo nao estiver disponivel, solicite ao proprietario/administrador do Sites a recuperacao ou reemissao da credencial; nao substitua pelo token de outro Site. Mantenha a opcao **Secreta** habilitada ao configurar o valor e nunca o grave no `.env.example`, README, GitHub ou logs.

Para execucao local, `PORT=3000` e a porta padrao. `MCP_PUBLIC_URL` deve apontar para a URL pela qual a instancia local sera acessada; as demais variaveis usam os valores acima. Nao versione o arquivo `.env`.

O Site `Movidesk MCP Server` nao tem banco D1 vinculado. O proxy `Beta MCP` tem o banco D1 `DB`, com as tabelas `oauth_codes`, `oauth_tokens` e `oauth_users`. Esses dados nao estao neste repositorio. Para preservar o fluxo OAuth ao desativar o proxy, exporte ou faca backup do D1 do projeto `Beta MCP` e guarde-o em armazenamento protegido, separado do GitHub; ele pode conter codigos, tokens e dados de usuarios. Antes de depender do backup, confirme que ele pode ser restaurado.

O endpoint MCP e `POST /mcp`. O health check e `GET /health`. Metadata OAuth fica em `/.well-known/oauth-protected-resource` e `/.well-known/oauth-authorization-server`.

O MCP nao aceita `MOVIDESK_TOKEN`, `OAUTH_CLIENT_SECRET` ou Bearer como argumento de ferramenta. Nenhum segredo e registrado em logs, respostas ou metadados. As ferramentas atuais são somente leitura; ações como responder, alterar status ou atribuir tickets exigem suporte correspondente no proxy OAuth antes de serem adicionadas.

## Execucao

```bash
npm install
npm run dev
npm test
npm run build
```

No cliente MCP, use a URL publica `https://SEU-MCP.sites.openai.com/mcp`, client ID `movidesk-gpt`, escopo `movidesk:read` e Authorization Code com PKCE S256. O redirect URI precisa estar cadastrado no proxy OAuth.
