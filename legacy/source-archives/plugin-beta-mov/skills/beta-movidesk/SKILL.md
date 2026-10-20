---
name: beta-movidesk
description: Consultar tickets, pessoas e serviços autorizados do Movidesk pelo MCP Beta MOV, escolhendo filtros compatíveis e respostas rápidas. Usar quando o usuário pedir consultas ou análises do Movidesk.
---

# Beta MOV

Quando o usuário invocar `@beta-movidesk` ou `$beta-movidesk`, use diretamente as ferramentas MCP disponíveis no ambiente. A conexão e o OAuth são responsabilidade do host: não tente descobrir endpoints com navegador, shell ou chamadas HTTP próprias.

## Regras essenciais

- Operar somente em modo leitura; não prometer alterações de tickets, status, atribuições ou comentários.

## Escolha da ferramenta

- ID numérico de ticket: `movidesk_get_ticket`.
- Linha do tempo, resumo ou classificação: use a ferramenta específica, com `ticket_id` ou `protocol`; faça uma única consulta.
- Busca por assunto, categoria, status, datas ou filtros: `movidesk_search_tickets`.
- Tickets abertos em uma data: `movidesk_list_open_tickets`.
- Pessoas: `movidesk_search_people`.
- Serviços: `movidesk_list_services`.
- Busca dentro da descrição e interações: `movidesk_search_ticket_content`, somente quando o usuário pedir explicitamente conteúdo textual.

## Filtros corretos

- Em `movidesk_search_people`, `keyword` não é um filtro de nome enviado ao Movidesk. Para procurar uma pessoa por nome, use `filter` OData, por exemplo `contains(businessName, 'Gedore')`; combine com `active: true` somente se isso fizer sentido para o pedido.
- Em `movidesk_list_services`, forneça um critério real como `id`, `status`, `category`, `owner_team` ou `filter`; não use `keyword` isoladamente.
- Em `movidesk_search_ticket_content`, informe sempre `keyword`, um escopo temporal explícito e `top: 50`. Se o usuário não informar datas, use uma janela ampla de seis anos até a data atual, com `date_field: "createdDate"`, e informe esse escopo na resposta. Se o usuário pedir histórico completo, amplie o período em vez de remover o escopo.
- Para buscas amplas de uma palavra no conteúdo, use diretamente `movidesk_search_ticket_content` com `keyword`, `from_date`, `to_date`, `date_field: "createdDate"`, `top: 50` e `skip: 0`. Não comece com uma chamada sem escopo.
- Use `top: 50` por padrão. Use até 100 somente quando o usuário pedir uma lista ainda mais ampla. Use `skip` para continuar a paginação quando necessário.

## Velocidade e tentativas

- Faça a menor consulta que responde ao pedido. Não execute automaticamente buscas em pessoas, tickets e conteúdo ao mesmo tempo se o usuário não pediu todas.
- Consultas independentes e explicitamente pedidas podem ser feitas em paralelo, mantendo cada uma com seus parâmetros completos; por exemplo, pessoas e conteúdo dos tickets.
- Após `search_criteria_required`, corrija adicionando o escopo ou `filter` que faltou e repita a chamada uma vez. Nunca repita a mesma chamada incompleta.
- Após HTTP 502/503 ou indisponibilidade, repita uma vez com os mesmos parâmetros. Se falhar novamente, informe a indisponibilidade e pare.
- Não anuncie plano, conexão, diagnóstico ou cada tentativa. Entregue apenas o resultado, os filtros relevantes e a limitação encontrada.

## Segurança e resposta

- Operar somente em leitura. Nunca prometer alteração de tickets, status, atribuições ou comentários.
- Se retornar 401/invalid_token, informe que é necessário reconectar o MCP pelo ChatGPT. Nunca solicite ou exponha tokens, segredos, Bearer tokens ou códigos OAuth.
- Diferencie claramente nenhum resultado, filtro inválido, falta de permissão e indisponibilidade.
- Não invente dados ausentes nem faça inferências além do conteúdo retornado pelo Movidesk.

## Configuração de referência

- Endpoint: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`
- Manter a barra final de `/mcp/`.
- Escopo: `movidesk:read`.
- Fluxo: Authorization Code com PKCE S256.
