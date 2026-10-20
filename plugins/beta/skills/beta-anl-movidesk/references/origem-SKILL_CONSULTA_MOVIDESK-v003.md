# SKILL — CONSULTA MOVIDESK

```yaml
artifact_id: SKILL_CONSULTA_MOVIDESK
version: v003
created_at: 2026-08-16
status: immutable_snapshot
supersedes: v002
```

## Quando usar
Use como skill primária quando a intenção principal for consultar, localizar, listar, filtrar, recuperar, comparar ou resumir dados reais de tickets do Movidesk.

Exemplos:
- consultar ticket por ID;
- localizar tickets por assunto, categoria, serviço ou palavra-chave;
- pesquisar palavra ou expressão registrada no assunto, descrição inicial ou interações;
- listar tickets por período, status, urgência, responsável, equipe ou cliente;
- recuperar tickets criados, atualizados, resolvidos ou fechados em determinado período;
- mostrar tickets mais recentes ou antigos;
- resumir tickets retornados;
- produzir visão operacional de volume, distribuição, pendências ou padrões observáveis;
- recuperar histórico/interações quando necessário.

Não use como primária apenas porque o pedido menciona ticket, chamado ou Movidesk.

Se o objetivo final for investigar problema, determinar regra, explicar funcionamento ou criar testes, use a skill correspondente e trate o Movidesk como apoio conforme o Router.

## Objetivo
Transformar uma solicitação operacional em busca segura e útil no Movidesk, recuperar somente os dados necessários e apresentar resultados comparáveis e acionáveis.

Esta skill recupera fatos operacionais e pode resumir padrões observáveis. Não converte tickets em regra funcional, causa raiz ou comportamento esperado. As regras globais de evidência são definidas pelo Router.

## Guided prompting
Pergunte somente quando faltar informação que altere materialmente a consulta e não puder ser inferida com segurança.

Perguntas de alto valor:
- qual período deve ser consultado;
- qual equipe, responsável, cliente, status ou categoria é o alvo quando houver ambiguidade;
- se o período se refere a criação, atualização, resolução ou fechamento;
- qual palavra, mensagem ou expressão deve ser localizada quando o objetivo for pesquisar conteúdo textual;
- qual ticket deve ser consultado quando for necessário um caso específico e não houver identificador ou critério pesquisável.

Responda diretamente quando:
- houver ID suficiente;
- os filtros já definirem uma busca útil;
- houver `keyword` e escopo suficiente para pesquisa de conteúdo;
- a consulta puder ser executada com critério seguro;
- expressões temporais forem claras;
- um padrão seguro puder ser aplicado sem distorcer a intenção.

Não transforme filtros opcionais em perguntas obrigatórias.

## Modo de leitura

### Primeiro: Movidesk
Use o Movidesk como fonte principal para fatos do ticket.

Selecione a Action conforme a pergunta operacional:

- `searchTickets`: consulta estruturada por ID, período, status, urgência, responsável, equipe, cliente, categoria, serviço e demais filtros operacionais; também para recuperar campos e coleções relacionadas quando necessário.
- `searchTicketContent`: pesquisa textual de palavra ou expressão no assunto, descrição inicial e interações dos tickets, sempre com ao menos um filtro de escopo.

Recupere somente o necessário.

Na `searchTickets`, expanda `owner`, `clients` ou `actions` apenas quando responsável, cliente, histórico ou ações forem relevantes.

Na `searchTicketContent`, use o retorno textual apenas como evidência do que foi registrado. O local do match pode ajudar a diferenciar assunto, descrição inicial e interação.

### Depois: conhecimento funcional
Consulte o Knowledge Master apenas quando for necessário interpretar:
- termos;
- categorias;
- fluxos;
- estados;
- conceitos funcionais presentes nos tickets.

Siga o protocolo transversal de evidência do Router.

## Método
1. identificar o objetivo operacional;
2. extrair filtros fornecidos ou inferíveis com segurança;
3. escolher a Action adequada;
4. definir o campo temporal correto quando houver período;
5. executar a consulta com escopo proporcional;
6. paginar ou expandir coleções quando necessário e suportado;
7. separar fatos retornados de padrões derivados;
8. verificar se a intenção mudou para outra skill;
9. responder no formato adequado.

### Seleção da Action

Use `searchTickets` quando o objetivo principal for:
- recuperar ticket por ID;
- filtrar por campos operacionais;
- listar tickets;
- consultar estado, responsável, equipe, cliente, urgência, categoria ou serviço;
- recuperar histórico/ações de um ticket identificado;
- produzir distribuições ou sínteses de um conjunto estruturado.

Use `searchTicketContent` quando o objetivo principal for:
- localizar uma mensagem de erro;
- localizar uma palavra ou expressão citada em atendimento;
- encontrar tickets em que determinado sintoma foi descrito nas interações;
- pesquisar conteúdo que pode não estar presente no assunto ou nos campos estruturados.

Não use `searchTicketContent` como pesquisa semântica ampla. A `keyword` deve representar texto ou expressão pesquisável.

Quando a pesquisa textual encontrar candidatos e for necessário reconstruir todo o histórico de um caso específico, complemente com `searchTickets` por ID e expanda ações somente se isso contribuir materialmente para a resposta.

### Campo temporal
Para `searchTickets`:
- criado → `createdDate`;
- atualizado → `lastUpdate`;
- resolvido → `resolvedIn`;
- fechado → `closedIn`.

Para `searchTicketContent`, use o campo temporal suportado pelo schema da Action:
- criado → `createdDate`;
- atualizado → `lastUpdate`;
- resolvido → `resolvedIn`;
- fechado → `closedIn`.

## Parâmetros

### `searchTickets`
Priorize filtros simples:
- `id`;
- `keyword`;
- `from_date` e `to_date`;
- `responsible_id` ou `responsible_email`;
- `owner_team`;
- `status` ou `base_status`;
- `urgency`;
- `category`;
- `service`;
- `client_id`;
- `orderby`;
- `select`;
- `expand`;
- `top`;
- `skip`.

Use `filter` OData somente quando os filtros simples não bastarem e os campos/valores forem conhecidos com segurança.

Nunca invente campo OData para representar conceito de negócio sem mapeamento conhecido.

### `searchTicketContent`
Exige:
- `keyword`;
- ao menos um filtro de escopo.

Filtros de escopo disponíveis:
- `from_date` e/ou `to_date`;
- `owner_team`;
- `status`;
- `base_status`;
- `category`;
- `service`;
- `client_id`;
- `responsible_id` ou `responsible_email`;
- `filter`.

Controles:
- `date_field`;
- `case_sensitive`;
- `top`;
- `skip`.

Não exponha nem dependa de parâmetros internos de recuperação do conteúdo. A Action deve abstrair a busca em assunto, descrição inicial e interações.

## Escopo e paginação
Em consultas amplas, comece com quantidade razoável.

Na `searchTickets`, `top` pode retornar até 100 tickets por página conforme o schema disponível.

Na `searchTicketContent`, `top` limita os candidatos por página e aceita até 20; `skip` permite avançar entre candidatos.

Se o usuário pedir todos os resultados, ou se a conclusão depender disso, use paginação respeitando os limites da Action escolhida.

Não afirme que a quantidade retornada representa o universo total sem confirmação.

Em pesquisa de conteúdo, diferencie:
- tickets candidatos analisados;
- correspondências efetivamente encontradas.

Ausência de correspondência na página consultada não prova inexistência global quando ainda houver candidatos não paginados.

## Histórico antigo
Na `searchTickets`, use `include_past: true` quando:
- o usuário pedir histórico antigo;
- o intervalo exigir tickets com atualização anterior a 90 dias;
- a análise depender explicitamente de registros antigos.

Não amplie para histórico antigo sem necessidade.

Na `searchTicketContent`, respeite os limites do próprio schema e use filtros temporais adequados. Não suponha suporte a `include_past` quando o parâmetro não estiver disponível.

## Síntese operacional
Pode resumir padrões diretamente sustentados pelo conjunto retornado, como:
- distribuição por status;
- distribuição por urgência;
- concentração por equipe ou responsável;
- assuntos/categorias recorrentes;
- mensagens ou expressões recorrentes na amostra pesquisada;
- pendências observáveis;
- datas e intervalos;
- recorrência aparente na amostra.

Apresente-os como observações do conjunto analisado.

## Formato de saída

### Ticket individual
Apresente, quando relevantes e disponíveis:
1. ID e assunto;
2. status;
3. cliente/solicitante;
4. responsável/equipe;
5. urgência;
6. categoria/serviço;
7. datas relevantes;
8. resumo do caso;
9. histórico/interações, se solicitados ou necessários;
10. observações importantes.

Não exiba campos ausentes apenas para preencher estrutura.

### Pesquisa de conteúdo
Apresente, quando relevantes e disponíveis:
1. critérios e expressão pesquisada;
2. quantidade efetivamente analisada/retornada;
3. tickets com correspondência;
4. local da correspondência, quando retornado;
5. trecho contextual suficiente para identificar o registro;
6. limitação de escopo/paginação, quando houver.

Não reproduza conteúdo extenso de interações quando um trecho curto for suficiente.

### Múltiplos tickets
Apresente:
1. critérios aplicados;
2. quantidade efetivamente retornada;
3. resultados em formato comparável;
4. padrões observáveis úteis;
5. limitação de escopo/paginação, quando houver.

Priorize:
- ID;
- assunto;
- status;
- cliente;
- responsável/equipe;
- urgência;
- data relevante.

### Síntese operacional
Apresente:
1. escopo;
2. volume efetivamente analisado;
3. distribuições/padrões;
4. principais pendências ou concentrações;
5. pontos de atenção;
6. limitações da amostra.

Não despeje payload técnico.

## Regras de escrita
Use linguagem operacional, objetiva e verificável.

Diferencie:
- dado do Movidesk;
- observação derivada da amostra;
- interpretação funcional complementar.

Em pesquisa textual, deixe claro quando a evidência vem de assunto, descrição inicial ou interação somente se essa distinção estiver presente no retorno.

Evite linguagem causal quando os tickets demonstrarem apenas correlação, recorrência ou sequência temporal.

Quando períodos relativos puderem gerar ambiguidade, apresente datas concretas.

## Limites
Não:
- criar, editar, atribuir, responder, fechar, reabrir ou excluir tickets;
- afirmar que alteração foi realizada no Movidesk;
- solicitar senha, token, chave ou segredo técnico;
- transformar atendimento em regra;
- concluir causa raiz apenas por semelhança entre tickets;
- inferir comportamento esperado exclusivamente de precedentes;
- criar requisitos;
- inventar campos ou valores OData;
- ampliar silenciosamente critérios de forma material;
- executar `searchTicketContent` sem `keyword` e filtro de escopo;
- tratar correspondência textual como prova de equivalência entre incidentes;
- assumir que uma página representa todos os tickets;
- substituir outra skill quando a intenção principal for investigação, regra, dúvida funcional ou QA;
- tratar ausência de dados numa consulta como prova de inexistência global.
