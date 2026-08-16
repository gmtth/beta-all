# Ferramentas Movidesk

Todas as ferramentas são somente leitura e exigem um Bearer temporário com o escopo `movidesk:read`.

## `movidesk_get_ticket`

Consulta um ticket pelo campo obrigatório `ticket_id`, composto somente por 1 a 30 dígitos. Retorna os campos autorizados de identificação, assunto, status, solicitante/cliente, responsável, prioridade/urgência, datas e interações quando disponíveis.

Exemplo de pedido: “Consulte o ticket 12345 e resuma o histórico.”

## `movidesk_search_tickets`

Pesquisa tickets com filtros amigáveis ou OData. Parâmetros principais:

- Identidade e texto: `id`, `protocol`, `keyword`.
- Datas: `from_date`, `to_date` e `date_field`, que aceita `createdDate`, `lastUpdate`, `resolvedIn` ou `closedIn`.
- Responsabilidade: `responsible_id`, `responsible_email`, `owner_team`.
- Classificação: `status`, `base_status`, `urgency`, `category`, `service`, `client_id`.
- Histórico: `include_past`, padrão `false`.
- OData: `filter`, `select`, `expand`, `orderby`.
- Paginação: `top` de 1 a 100, padrão 25; `skip` de 0 a 10000.

`created_date` funciona como alias de `from_date`; quando `last_update` é informado, a busca usa `lastUpdate` como campo de data.

Preferir filtros nomeados. Usar `filter` somente quando a condição não puder ser expressa com eles. Não inserir ponto e vírgula nem quebras de linha em filtros OData.

Exemplos:

- “Busque até 20 tickets criados desde 2026-08-01 que contenham VPN.”
- “Liste tickets da equipe Infra com status Em atendimento, ordenados pela atualização mais recente.”
- “Traga a próxima página de 25 resultados” usando `top: 25` e `skip: 25`.

## `movidesk_list_open_tickets`

Lista tickets não resolvidos, fechados ou cancelados em uma data. `created_date` é obrigatório e aceita `YYYY-MM-DD`, `DD/MM/AAAA` ou `DD/MM`. Aceita ainda `filter`, `orderby`, `top` e `skip`.

O filtro padrão exclui `Resolved`, `Closed` e `Canceled`, com ordenação `createdDate desc`.

## `movidesk_search_people`

Pesquisa pessoas com os filtros compartilhados de busca e o parâmetro opcional `active`. Usar paginação para resultados extensos.

## `movidesk_list_services`

Lista serviços com filtros compartilhados, `active`, `page` e `page_size`. `page_size` aceita 1 a 100; `page` começa em 1. Internamente, a página é convertida em `top` e `skip`.

## Apresentação dos resultados

- Registrar em linguagem natural o período, status, equipe e paginação aplicados.
- Diferenciar “nenhum resultado” de falha de autenticação ou indisponibilidade.
- Não inferir valores ausentes.
- Ao resumir tickets, priorizar identificador, assunto, status, responsável, urgência e última atualização.
