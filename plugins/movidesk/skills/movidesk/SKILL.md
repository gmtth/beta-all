---
name: movidesk
description: Consultar tickets, pessoas e serviços autorizados no Movidesk por meio do conector MCP somente leitura e orientar manutenção, configuração ou diagnóstico da integração deste projeto. Usar quando o usuário pedir dados do Movidesk, buscas e relatórios de tickets, explicações sobre as ferramentas, filtros, paginação, OAuth/PKCE, implantação, arquitetura ou segurança do conector Movidesk.
---

# Movidesk

Usar as ferramentas `movidesk_*` para consultas ao ambiente autorizado. Tratar a integração como somente leitura: não prometer respostas, alterações de status, atribuições ou qualquer mutação de tickets.

## Consultar dados

1. Escolher a ferramenta mais específica:
   - `movidesk_get_ticket` para um identificador numérico conhecido.
   - `movidesk_list_open_tickets` para tickets abertos em uma data.
   - `movidesk_search_tickets` para filtros, intervalos e paginação.
   - `movidesk_search_people` para pessoas.
   - `movidesk_list_services` para o catálogo de serviços.
2. Solicitar apenas os parâmetros necessários. Começar com `top` pequeno e paginar com `skip` quando houver muitos resultados.
3. Resumir os resultados sem inventar campos ausentes. Informar filtros aplicados e quantidade retornada.
4. Se a consulta falhar por autenticação, orientar uma nova autorização OAuth; nunca pedir que o usuário cole tokens ou segredos.

Ler [references/tools.md](references/tools.md) para parâmetros, limites e exemplos de cada ferramenta.

## Trabalhar no projeto

Ler [references/project.md](references/project.md) antes de explicar ou alterar arquitetura, endpoints, OAuth, variáveis de ambiente, implantação ou segurança. Considerar o código atual do repositório como fonte final quando houver divergência com documentação histórica.

Ler [references/operations.md](references/operations.md) para instalação do conector, execução local, testes e diagnóstico.

## Guardrails

- Manter todas as operações em modo somente leitura.
- Não aceitar nem expor `MOVIDESK_TOKEN`, segredos OAuth, Bearer tokens ou códigos de autorização em prompts, logs ou respostas.
- Usar o endpoint MCP com barra final: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`.
- Usar o cliente MCP `movidesk-mcp-app`, o escopo `movidesk:read` e PKCE S256.
- Não confundir o cliente MCP com o cliente separado da GPT Action.
- Tratar filtros OData livres como entrada avançada; preferir parâmetros nomeados sempre que possível.
