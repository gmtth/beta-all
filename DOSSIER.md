# Dossiê do projeto MCP Movidesk

> **Modo de leitura para LLM:** leia primeiro “Resumo canônico atual”, depois “Regras de autoridade”, “Arquitetura”, “Ferramentas e contratos”, “Fases”, “Estado de entrega” e “Pendências”. Consulte a linha do tempo, ledger de commits e histórico retroativo apenas para rastreabilidade. Em caso de conflito, prevalece a ordem de autoridade definida abaixo.

## Cartão de contexto rápido

Use este bloco quando for necessário entender o projeto antes de uma ação curta. Para qualquer alteração, continue a leitura nas seções detalhadas.

| Pergunta | Resposta canônica |
|---|---|
| O que existe? | MCP Movidesk somente leitura, com consultas, timeline, análises, similaridade e recorrência. |
| Onde roda? | O Site consolidado contém OAuth/PKCE, REST interno e a rota MCP `/mcp/` no Worker; `source-bundle` é um servidor autônomo legado. |
| Qual é a regra de segurança? | Não mutar tickets; não expor segredo/PII; não publicar sem confirmar manifesto e deployment. |
| Qual é a fonte semântica? | YAML legível + snapshot JSON validado; grupos semânticos têm papéis separados. |
| O que está estabilizado? | Fases 0–2, 3A, 3B e implementação de 3C, conforme o estado/evidência de cada seção. |
| O que ainda precisa ser confirmado? | Smoke test direto do endpoint MCP publicado e eventual uso/deployment independente do servidor legado em `source-bundle`. |
| Qual o próximo caminho? | Fase 4 (hardening/publicação), depois calibração, observabilidade e encerramento da beta. |
| O que nunca inferir? | Commit ≠ merge; merge ≠ deploy; deploy ≠ manifesto ativo; teste local ≠ produção. |

### Arquivo histórico opcional

[`CONVERSA_LEGADA.md`](./CONVERSA_LEGADA.md) preserva uma exportação histórica da conversa. Ele não é fonte normativa, não precisa ser lido no trabalho cotidiano e não deve receber decisões novas. Use `AGENTS.md` para regras e este dossiê para fatos, evidências, estado e planejamento.

### Classificação das informações deste dossiê

- **Fato de estado:** commit, branch, versão, PR, saída de teste ou URL explicitamente observada.
- **Decisão:** escolha do usuário ou regra consolidada com motivo.
- **Contrato:** entrada/saída/invariante que não pode regredir.
- **Histórico:** ordem de prompts, testes e correções.
- **Planejamento:** trabalho futuro ainda não implementado.
- **Lacuna:** item que precisa de confirmação; não preencher por inferência.

## Resumo canônico atual

- **Objetivo:** MCP somente leitura para consulta e análise factual de tickets Movidesk.
- **Superfícies:** MCP, GPT Actions, REST interno e OAuth/PKCE coexistem no mesmo projeto Sites. O MCP publicado é implementado no Worker consolidado (`worker/index.ts`, `worker/mcp.ts`, `worker/mcp-tools.ts`); `source-bundle` contém um servidor independente legado e não é importado pelo código da aplicação Sites.
- **Endpoint MCP:** `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/` — a barra final é obrigatória.
- **Raiz local:** `D:\Google Drive\Documents\ChatGPT\MCP Movidesk`.
- **Branch funcional observada:** `codex/phase3b-similarity`.
- **HEAD local observado:** `392c2f8` (`Document consolidated MCP runtime`). O `main` consultado durante a revisão das PRs estava em `79f1f799a6413f15ed4d785c394f4b9426436b39`.
- **Último deploy Sites confirmado:** versão 70, deployment `appgdep_6ad6b8f380a48191b2c9f6f25df2e260`, concluído com sucesso em 2026-10-20, baseado no commit de origem `e25f25d057de902e9ae79aa68a27b79e9d38b582`.
- **MCP na versão publicada:** o código-fonte dessa versão contém `worker/index.ts` chamando `handleMcp` e `worker/mcp.ts` implementando `POST /mcp`. A integração nativa MCP do Sites reportou `has_mcp: false`; isso comprova a implementação personalizada no Worker, não uma declaração MCP nativa da plataforma.
- **`source-bundle`:** o pacote contém outro servidor (`movidesk-mcp`, versão 1.0.0, com ferramentas próprias) e não é referenciado pelo código de aplicação/Worker do Site consolidado. O workspace da versão publicada ainda contém o gitlink do submódulo, mas a rota MCP do Site está no Worker raiz. Evidência indica legado/duplicação para este Site; não foi confirmado se existe deployment independente desse pacote em outro serviço.
- **Limitação de verificação:** não foi possível fazer smoke test HTTP direto ao endpoint publicado nesta checagem. A implementação e o deployment da versão 70 foram verificados por código e metadados Sites.
- **PRs abertas nesta revisão:** #38 (`codex/vendor-source-bundle` → `main`) e #39 (`codex/project-context-docs` → `codex/vendor-source-bundle`). A #39 deve entrar primeiro na branch da #38; depois a #38 pode seguir para `main`. Nenhuma das duas foi mesclada nesta revisão.
- **Working tree:** pode conter alterações de UI/branding e `source-bundle` fora do escopo documental; não assumir que podem ser incluídas em commits.

## Regras de autoridade e precedência

Quando houver informação conflitante, a LLM deve usar esta ordem:

1. pedido explícito mais recente do usuário;
2. `AGENTS.md`, para regras normativas permanentes;
3. esta seção de resumo canônico;
4. contratos e testes atuais do código;
5. estado confirmado por GitHub/Sites;
6. decisões permanentes registradas no dossiê;
7. linha do tempo de prompts;
8. hipóteses, sugestões e diagnósticos históricos.

Um prompt antigo não autoriza uma ação nova. Um commit não prova merge. Um merge não prova deploy. Um deploy não prova manifesto MCP atualizado. Uma ferramenta existente no código não prova que o cliente a recebeu.

## Navegação do dossiê

| Ordem | Seção | Para que serve |
|---:|---|---|
| 1 | Resumo canônico atual | Estado imediato e fatos essenciais |
| 2 | Regras de autoridade | Resolver conflitos e evitar inferências |
| 3 | Arquitetura atual | Entender componentes e fronteiras |
| 4 | Ferramentas publicadas | Saber o que cada ferramenta faz |
| 5 | Fases e estado conhecido | Entender evolução funcional |
| 6 | Decisões permanentes | Regras de produto e contrato |
| 7 | Matriz de ferramentas e invariantes | Avaliar risco de regressão |
| 8 | Contratos e testes | Validar comportamento esperado |
| 9 | Estado de entrega e pendências | Saber o que está ou não publicado |
| 10 | Linha do tempo canônica | Rastrear decisões e mudanças |
| 11 | Ledger de commits/PRs/Sites | Auditoria técnica e temporal |
| 12 | Histórico retroativo | Contexto completo dos prompts |
| 13 | Pacote de contexto externo | Visão autossuficiente para LLM sem a conversa |
| 14 | Máquina de estados e critérios | Saber exatamente quando uma entrega está concluída |
| 15 | Índice de manutenção | Atualizar o dossiê sem apagar histórico |

### Índice por tipo de pergunta

| Se a pergunta for... | Consulte primeiro... |
|---|---|
| “Qual é o estado atual?” | Resumo canônico, Estado verificável, Snapshot do repositório |
| “O que posso alterar?” | AGENTS, Regras de autoridade, Decisões permanentes |
| “Como funciona esta ferramenta?” | Contexto histórico e operacional de cada ferramenta |
| “O que já foi implementado?” | Fases detalhadas, Linha do tempo canônica, Matriz de ferramentas |
| “Por que isso foi decidido?” | Decisões permanentes, Histórico retroativo, Cruzamento commit → decisões |
| “Como provar que está correto?” | Catálogo de autotestes, Matriz de testes, Critérios de aceitação |
| “Está publicado?” | Estados de entrega, Ledger Sites, Ledger PRs, manifesto/smoke test |
| “O que falta?” | Pendências e riscos, Lacunas verificadas, Próximo pacote de evidências |
| “Qual é o próximo trabalho?” | Fases planejadas para finalizar, mantendo status como planejamento |

## Modelo mental do sistema

```text
ChatGPT / GPT Action
        |
        v
OAuth + PKCE ----> token de leitura
        |
        +----> POST /mcp/ ----> registro MCP ----> MovideskReader ----> rotas protegidas
        |
        +----> REST Action ----> rotas /api ----> Movidesk OData

Catálogo YAML --> validação --> snapshot JSON --> políticas de análise
Tickets -------> timeline ----> resumo/classificação/similaridade/recorrência
```

O modelo deve separar quatro perguntas diferentes:

1. O código contém a ferramenta?
2. O schema MCP expõe a ferramenta?
3. A versão publicada contém o código?
4. A conexão ativa recebeu o manifesto atualizado?

Somente evidência específica de cada camada responde à pergunta correspondente.

Documento vivo de contexto, decisões e estado verificável do projeto. Atualize este arquivo após mudanças relevantes, PRs mescladas ou publicações confirmadas.

## Objetivo

Disponibilizar um MCP somente leitura para consultar e analisar tickets autorizados do Movidesk, com OAuth 2.0 Authorization Code + PKCE S256, respostas estruturadas e explicabilidade suficiente para uso pelo ChatGPT e por GPT Actions.

## Arquitetura atual

- Worker MCP/OAuth e rotas REST no mesmo projeto Sites.
- Endpoint MCP: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`.
- OAuth MCP separado do fluxo GPT Action; o conector MCP usa `movidesk-mcp-app` e PKCE.
- Cliente interno do Worker chama as rotas protegidas locais; não há hop HTTP desnecessário entre Workers.
- Fonte semântica: `config/movidesk_semantic_models.yaml`; snapshot runtime: `config/movidesk_semantic_models.json`.

## Ferramentas publicadas

Ferramentas de consulta:

- `movidesk_get_ticket`
- `movidesk_search_tickets`
- `movidesk_list_open_tickets`
- `movidesk_search_ticket_content`
- `movidesk_search_people`
- `movidesk_list_services`

Ferramentas analíticas:

- `movidesk_get_ticket_timeline`: ordenação, `sourceIndex`, autores, origem, tipo, status, manifestações do cliente, última resposta pública da equipe, anexos, terminal status e busca por ID/protocolo.
- `movidesk_summarize_ticket`: resumo factual, ações, pendências, evidências, hipóteses, confiança e indicação de histórico incompleto.
- `movidesk_classify_ticket_issue`: classificação conservadora, categorias compatíveis, categoria oficial, evidências e confiança.
- `movidesk_find_similar_tickets`: busca por keyword ou ticket, ranking explicável, `matchedSignals` e `signalDetails`, filtros e paginação.
- `movidesk_detect_recurrent_issues`: agrupamento de recorrências, tendência mensal, direção, evidências por campo, dimensões de status/urgência/categoria/serviço/equipe, clientes, exemplos, confiança e metadados de amostra.

## Contexto histórico e operacional de cada ferramenta

Esta seção registra não somente o que cada ferramenta faz, mas por que ela existe, quais problemas apareceram durante a conversa, quais decisões estabilizaram seu contrato e quais limites uma LLM deve respeitar. “Publicado” abaixo significa capacidade prevista/registrada no projeto; o estado efetivamente exposto ao cliente deve continuar sendo confirmado pelo manifesto e pelo smoke test.

### `movidesk_get_ticket`

- **Papel:** consulta direta de um ticket autorizado por `ticket_id` numérico; é a referência factual básica para outras análises.
- **Contexto da conversa:** foi usado repetidamente como controle para provar que autenticação, autorização e acesso ao Movidesk estavam funcionando quando ferramentas analíticas falhavam. O ticket 6280, por exemplo, retornou assunto, ações, cliente e resposta da equipe.
- **Decisões:** não alterar essa ferramenta durante correções de timeline, conteúdo ou similaridade; manter identificador interno direto e não convertê-lo indevidamente em protocolo; preservar envelope de ticket.
- **Contrato:** leitura somente; `ticket_id` numérico; retorno do ticket autorizado; erro de inexistente separado de resultado vazio.
- **Proteções:** caracterização do envelope em `mcp-tools.characterization.test.ts`, lookup direto em `rendered-html.test.mjs` e uso como fixture das ferramentas analíticas.
- **Não fazer:** usar `get_ticket` como prova de que outra ferramenta está publicada; modificar seu payload para resolver erro de análise; incluir mutações de ticket.

### `movidesk_search_tickets`

- **Papel:** pesquisa geral por `id`, `keyword`, período, `date_field`, equipe, status, categoria, serviço, cliente, responsável, urgência e filtro OData, com `top`/`skip`.
- **Contexto da conversa:** foi a busca comum usada como comparação quando `searchTicketContent` falhava por `$select`; confirmou que o acesso ao Movidesk e as consultas gerais continuavam disponíveis.
- **Decisões:** aceitar datas documentadas/normalizadas, aplicar `from_date` e `to_date` ao mesmo `date_field`, preservar filtros e paginação e manter consulta somente leitura.
- **Contrato:** coleção estruturada; filtros não podem desaparecer silenciosamente; erro técnico não deve virar lista vazia.
- **Proteções:** caracterização de filtros e envelope, testes de datas/identificador e documentação MCP/Action.
- **Não fazer:** embutir lógica semântica de similaridade ou conteúdo; assumir que uma palavra encontrada no assunto cobre interações; alterar filtros para corrigir uma ferramenta analítica.

### `movidesk_list_open_tickets`

- **Papel:** lista tickets não resolvidos para `created_date`, com filtro, ordenação e paginação.
- **Contexto da conversa:** sua publicação inicialmente retornava `Invalid tools/call result` / `expected record` em `structuredContent`; a correção do envelope chegou antes da nova busca de conteúdo.
- **Decisões:** retorno sempre como objeto com `results`; preservar `created_date`, `top`, `skip`, filtro de status aberto e `orderby`; considerar resolvido/fechado/cancelado fora da lista padrão.
- **Contrato:** aceita `YYYY-MM-DD`, `DD/MM/AAAA` ou `DD/MM`; retorno de coleção estruturado, inclusive quando vazio.
- **Proteções:** caracterização que verifica `results` como objeto; smoke test usado com `created_date=2026-08-16`, `top=20`, `skip=0`.
- **Não fazer:** reutilizar o erro antigo como diagnóstico atual; mudar a semântica de aberto sem atualizar contrato e testes.

### `movidesk_search_ticket_content`

- **Papel:** busca uma palavra/expressão no assunto, descrição inicial e ações/interações, sempre com keyword e escopo suficiente.
- **Contexto da conversa:** nasceu quando a busca de tickets comum não encontrava termos presentes em interações. O consumidor observou que `máquina`, `senha`, `biometria`, `Apollus`, `zeros` e outros apareciam na timeline, mas retornavam zero. Também foi corrigido o problema de `$select` obrigatório e a composição errada de `matchedIn`.
- **Decisões:** o backend define `$select` internamente; o caller não precisa conhecer OData; ações devem ser pesquisadas; `case_sensitive=false` deve normalizar acentos/caixa; `matchedIn` deve apontar para `subject`, `initialDescription` ou `interactions` conforme a origem real.
- **Contrato:** `keyword` mais pelo menos um escopo; filtros existentes; `top`/`skip`; retorno `{ keyword, results, total }`, vazio sem erro técnico.
- **Proteções:** testes de assunto/ação, objeto de ticket individual e match posterior classificado como interação; smoke tests em tickets 6246 e 6280.
- **Não fazer:** voltar a classificar ação como `initialDescription`; exigir `select` no schema sem decisão; alterar a busca que foi confirmada como funcional para corrigir outra ferramenta.

### `movidesk_search_people`

- **Papel:** pesquisa pessoas autorizadas, por filtros compartilhados, `active`, `id` ou filtro OData.
- **Contexto da conversa:** ferramenta de consulta básica mantida como contrato estável e usada na caracterização de Phase 0.
- **Decisões:** preservar filtros OData explícitos, retorno de coleção e escopo somente leitura.
- **Proteções:** caracterização executa `id`/`filter` e confirma chamada conhecida.
- **Não fazer:** misturar pessoas com autores de timeline sem aplicar as regras de atribuição; expor dados além do escopo autorizado.

### `movidesk_list_services`

- **Papel:** lista serviços autorizados, com `id`, `category`, `status`, `owner_team`, `active`, `filter` e paginação por página ou `top`/`skip`.
- **Contexto da conversa:** ferramenta estável de referência para filtros e recursos Movidesk; não foi alvo das correções semânticas.
- **Decisões:** preservar paginação e filtros, aceitar `page`/`page_size` sem quebrar o contrato compartilhado e manter retorno de coleção.
- **Proteções:** caracterização usa `isActive eq true`, página 2 e tamanho 10.
- **Não fazer:** usar serviço como evidência automática de causa ou similaridade; alterar sua saída ao melhorar ranking.

### `movidesk_get_ticket_timeline`

- **Papel:** transforma ações/interações em eventos cronológicos e produz `firstClientManifestation`, `lastTeamResponse` e `terminalStatus`.
- **Contexto da conversa:** foi desenvolvido na Phase 2 e recebeu várias correções após testes reais. O primeiro defeito foi `author=[object Object]`; depois, `firstClientManifestation` vazio e `lastTeamResponse` incorreto. Tickets 6273, 6280 e 5836 demonstraram que `type=1` é nota interna e que respostas públicas da equipe aparecem principalmente como `type=2`.
- **Decisões:** extrair autor textual de `createdBy`; ordenar por `createdDate`; manter `sourceIndex`; cruzar `type`, `origin`, perfil, autor e justification; não usar somente `origin`; aceitar exatamente um entre `ticket_id` e `protocol`; preservar ID interno e protocolo longo.
- **Contrato:** eventos com `summary` contendo o texto integral da ação, além de `status`, `justification`, `type`, `origin`, `hasAttachments`; terminal status separado.
- **Proteções:** sequência cliente/equipe, nota interna, origins 0/2/3/23, resolvido, fechado, ordem original, ID, protocolo longo, inexistente e regressões reais.
- **Não fazer:** trocar `summary` por descrição sem decisão; usar nota interna como resposta pública; reabrir `get_ticket` para resolver timeline.

### `movidesk_summarize_ticket`

- **Papel:** produz representação factual determinística: relato, ações, pendências, evidências, hipóteses, confiança e indicação de histórico incompleto.
- **Contexto da conversa:** foi criada junto com classificação como ferramenta analítica aditiva. A prioridade foi separar o que o ticket afirma do que a análise pode inferir, depois refinar Phase 3A com papéis de chat e catálogo semântico.
- **Decisões:** aceitar `ticket_id` ou `protocol` com XOR em runtime e schema explícito; não determinar causa raiz; não transformar texto administrativo em hipótese; manter evidências e histórico incompleto visíveis.
- **Contrato:** `summary`, `reportedProblem`, `actionsTaken`, `pendingItems`, `evidence`, `hypotheses`, `confidence`, `incomplete`, além de identificadores.
- **Proteções:** testes de separação factual, perguntas respondidas, baixa confiança, categoria contextual, markup escapado e caso 6246.
- **Não fazer:** elevar confiança apenas por contagem de palavras; apagar hipóteses explícitas; confundir ausência de resolução com histórico incompleto automaticamente.

### `movidesk_classify_ticket_issue`

- **Papel:** classifica o problema por sinais explícitos e contexto causal, sem substituir a categoria oficial.
- **Contexto da conversa:** foi introduzida com resumo na Phase 3A. Houve exigência de preservar `officialCategory` e tornar a confiança conservadora, pois a mesma categoria pode permanecer enquanto o conjunto de evidências muda.
- **Decisões:** separar `category`, `categories`, `officialCategory`, `evidence` e `confidence`; usar catálogo contextual; não inferir causa raiz de termo isolado; exigir evidências independentes para `high`.
- **Contrato:** entrada `ticket_id`/`protocol` XOR; classificação explicável e aditiva.
- **Proteções:** categoria oficial, sinais causais em vez de “funcionário”, ausência de categoria por termo isolado, hipóteses explícitas e schema.
- **Não fazer:** sobrescrever a categoria Movidesk; chamar uma hipótese de causa confirmada; tratar similaridade como classificação.

### `movidesk_find_similar_tickets`

- **Papel:** encontra tickets semelhantes por `ticket_id` ou `keyword`, com ranking, filtros, paginação e sinais explicáveis.
- **Contexto da conversa:** Phase 3B começou com HTTP 414 quando o modo por ID colocava descrição/interações na query. Depois o ID era resolvido mas retornava zero porque o conteúdo não alimentava o cálculo. Após correções, o caminho por ID passou a retornar similares e o foco migrou para ranking, tokenização e ruído de actions.
- **Decisões:** resolver ID e usar conteúdo interno; nunca enviar transcript extenso em URL; excluir ticket de origem; normalizar acentos; filtrar `object`, `[object Object]`, anos, IDs, status, nomes, contatos, assinaturas e disclaimers; classificar actions antes de ponderar; retornar `signalDetails` com termo, campo e peso.
- **Contrato:** `ticket_id` ou `keyword`; `top`, `skip`, filtros; `reference`, `results`, `total`, `returned`, `top`, `skip` e erro estruturado; `total`/`returned` representam a página conforme documentação atual.
- **Proteções:** busca por keyword/ID, acentos, termo inexistente, filtro `owner_team`, paginação, 404, ausência de 414, 502 estruturado/retry, ausência de `object`, actions técnicas/operacionais/genéricas e ranking.
- **Não fazer:** alterar `search_ticket_content` para resolver ranking; marcar todo texto de action como `actions.technical`; afirmar `confidence=high` por metadado genérico; converter objetos para string.

### `movidesk_detect_recurrent_issues`

- **Papel:** agrupa problemas recorrentes em janela temporal e mostra evidências, tendência mensal, dimensões, clientes, exemplos, confiança e qualidade da amostra.
- **Contexto da conversa:** foi criada na Phase 3C após levantamento de tickets do ano/últimos 100. As primeiras execuções com `top=50` excederam timeout; a implementação foi refinada com limite de candidatos, concorrência controlada, enriquecimento parcial e metadados de amostra.
- **Decisões:** aceitar `date_field`, `from_date`, `to_date`, `min_occurrences`, `top`, `skip`; aplicar datas ao mesmo campo; enriquecer candidatos; não agrupar falhas de enriquecimento; aplicar mínimo antes da paginação; preservar `candidateCount`, `enrichedCount`, `enrichmentFailures`, `maxCandidates`, `truncated`; deixar claro quando a amostra não representa todo o período.
- **Tendência:** `deltaPercentage > 0` = `rising`; `< 0` = `falling`; `=== 0` = `stable`; `insufficient_data` somente sem dados suficientes para comparar meses. Nenhuma direção pode contradizer `firstCount`/`lastCount`/delta.
- **Contrato:** grupos preservam `key`/`issue`, `occurrences`, `trend`, `confidence`, `examples`; exemplos preservam `id`, `protocol`, `subject`, `category`; envelope preserva `total`, `returned`, `top`, `skip`, `meta` e erro estruturado.
- **Proteções:** tendências positiva/negativa/zero/insuficiente, `min_occurrences`, paginação, truncamento, enriquecimento parcial, zero candidatos, nenhum grupo, datas explícitas, falhas de upstream e consistência numérica.
- **Não fazer:** processar o universo inteiro sem limite; esconder truncamento; inventar grupo a partir de ticket não enriquecido; renomear campos do grupo; alterar similaridade, resumo ou classificação no mesmo escopo.

### Relações entre ferramentas

- `get_ticket` fornece o fato bruto; não substitui análise.
- `get_ticket_timeline` fornece sequência e atribuição; resumo/classificação consomem conteúdo factual, mas não devem reescrever timeline.
- `search_ticket_content` localiza ocorrências; timeline pode confirmar contexto, mas ausência em uma busca não autoriza inferir ausência no ticket sem considerar escopo/filtros.
- `find_similar_tickets` compara problemas; não é classificador oficial nem detector de recorrência global.
- `detect_recurrent_issues` agrupa amostras; não determina causa raiz nem substitui investigação individual.
- O catálogo semântico alimenta regras compartilhadas, mas cada ferramenta consome grupos compatíveis com sua finalidade.

## Fases e estado conhecido

- **Phase 0 — caracterização:** concluída. Testes de contrato para ferramentas estáveis.
- **Phase 1 — camada de análise:** concluída. Sessão de consulta limitada e análises determinísticas.
- **Phase 2 — timeline:** concluída. Linha do tempo cronológica e atribuição de cliente/equipe, incluindo correções de notas internas e respostas públicas.
- **Phase 3 / 3A — resumo, classificação e catálogo semântico:** concluída. Regras factuais, catálogo externo e política semântica centralizada.
- **Phase 3B — similaridade:** implementada e refinada. Busca por ID e keyword, normalização, filtro de ruído de ações, ranking explicável e tratamento de erros upstream.
- **Phase 3C — recorrências:** implementada e refinada. Timeout/concurrency, amostra limitada, enriquecimento parcial, tendências e explicabilidade por campo.
- **Próximo passo:** somente iniciar nova fase após definir objetivo, contrato, impacto, testes e branch dedicada no dossiê.

## Fases detalhadas: realizado, evidência e caminho para finalizar

### Como ler o estado das fases

- **Concluída:** implementação e testes da fase existem; o contrato foi considerado estável no histórico. Ainda é necessário confirmar deploy/manifestações quando o marco de publicação estiver em dúvida.
- **Implementada/refinada:** há código e testes relevantes, mas pode haver PR, merge, deploy ou calibração pendente. Não tratar como “disponível ao cliente” sem prova.
- **Planejada:** é uma proposta de trabalho futuro, não uma funcionalidade existente. Não criar commit, branch ou promessa de publicação sem autorização.
- **Hotfix:** correção restrita a uma fase encerrada; não reabre toda a fase nem autoriza mexer em ferramentas protegidas.

### Phase 0 — fundação e caracterização

**Objetivo:** estabelecer um MCP de leitura, sua fronteira OAuth/Sites, contratos mínimos e testes de caracterização antes de adicionar análise.

**O que foi concretizado:**

- proxy OAuth/PKCE e endpoint MCP identificado;
- leitura autorizada do Movidesk sem operações de mutação;
- testes para congelar envelopes, filtros e ferramentas básicas;
- separação explícita entre MCP, GPT Action, OAuth e Site;
- fluxo de branch, PR, merge, deploy e reconexão documentado.

**Como foi concretizado:** por commits de fundação e `41e1505`/PR #1, com testes de caracterização das ferramentas estáveis e validações de rotas.

**Invariantes:** somente leitura, identificadores diretos, erros distinguíveis, nenhuma credencial/PII em artefatos e endpoint `/mcp/` com barra final.

**Critério de encerramento cumprido:** contratos básicos caracterizados e processo de entrega definido. O estado publicado ainda deve ser confirmado separadamente sempre que houver divergência entre branch, Site e conexão.

### Phase 1 — consulta limitada e exposição de schemas

**Objetivo:** consolidar busca, filtros, datas, paginação e a sessão analítica limitada, sem permitir que análise faça chamadas ilimitadas.

**O que foi concretizado:**

- consultas com `id`/`keyword`, datas e filtros OData;
- uso consistente de `top`/`skip`;
- normalização de datas compatível com Movidesk;
- cache de consultas idênticas e janela de requisições;
- registro explícito de análise parcial quando a janela é limitada;
- schema das ferramentas analíticas exposto com `ticket_id`/`protocol` e XOR em runtime.

**Como foi concretizado:** `1523811`/PR #2, correções de datas/identificadores e `6fa6de8`/PR #8 para schema, sem alterar a lógica interna de ferramentas já estáveis.

**Invariantes:** filtros não desaparecem; limite superior de datas é consistente; erro upstream não vira vazio; schema publicado não pode ser `{}` quando há parâmetros obrigatórios.

**Critério de encerramento cumprido:** busca e schemas caracterizados; smoke test de manifesto continua sendo obrigatório após qualquer publicação.

### Phase 2 — timeline factual

**Objetivo:** criar uma linha do tempo confiável, cronológica e rastreável para alimentar análise posterior.

**O que foi concretizado:**

- eventos ordenados por `createdDate`;
- `sourceIndex` preservado;
- extração de autor aninhado sem `[object Object]`;
- suporte a ID interno e protocolo longo;
- `status`, `justification`, `type`, `origin`, anexos e terminal status preservados;
- `firstClientManifestation` atribuído ao cliente;
- `lastTeamResponse` restrito à última interação pública da equipe;
- `type=1` mantido na timeline, mas excluído de resposta pública;
- 404 controlado para ticket inexistente.

**Como foi concretizado:** `3003855`/PR #3 e hotfixes `b040ef4`, `b788876`, `9a02c29`, com regressões dos tickets 6273, 6280 e 5836 e posterior merge/deploy para reteste.

**Invariantes:** nenhuma ação interna é resposta ao cliente; origem isolada não decide ator; a ordem original do upstream não pode substituir a ordem cronológica.

**Critério de encerramento cumprido:** suíte de timeline cobre sequência de atores, nota interna, origins, resolvido/fechado, IDs, protocolo e inexistente.

### Phase 3 / 3A — resumo, classificação e catálogo semântico

**Objetivo:** transformar a timeline e o conteúdo em análise factual determinística, com vocabulário semântico centralizado e confiança conservadora.

**O que foi concretizado:**

- `summarize_ticket` separa problema, ações, pendências, evidências e hipóteses;
- `classify_ticket_issue` preserva categoria oficial e expõe evidências/confiança;
- papéis de chat, markup escapado e bot tratados sem confundir atores;
- catálogo YAML como fonte humana e JSON como snapshot de runtime;
- grupos separados para aliases, sinais, stopwords, boilerplate e validação estrutural;
- fallback semântico reduzido a 10% conforme decisão registrada;
- hotfixes para contexto, stopwords, boilerplate posicional e evidências independentes.

**Como foi concretizado:** `341bd42`, `bb596bb`, `a6ee84b`, PRs #7, #10 e #13, seguidos por hotfixes 3A e validação do catálogo.

**Invariantes:** hipótese não vira fato; categoria oficial não é substituída; confiança alta não se baseia em palavra genérica; nenhuma lista semântica paralela deve ser recriada no código.

**Critério de encerramento cumprido:** Phase 3A foi considerada encerrada no histórico, com a ressalva documentada de que certos refinamentos semânticos podem continuar como hotfixes isolados.

### Phase 3B — similaridade de tickets

**Objetivo:** encontrar tickets relacionados por palavra-chave ou pelo conteúdo de um ticket de referência, com ranking explicável e sem ruído administrativo.

**O que foi concretizado:**

- busca por `keyword` e `ticket_id`;
- eliminação do HTTP 414 no modo por ID;
- uso do assunto/descrição/interações como referência real;
- exclusão do ticket de origem;
- normalização de acentos e palavras únicas como `máquina`/`erro`;
- filtros, paginação e retorno `total`/`returned`;
- tratamento de 404, 414, 502 e respostas não JSON;
- remoção do token `object`;
- filtragem de nomes, contatos, assinaturas, disclaimers, anos, IDs e status;
- separação entre ações técnicas, operacionais e ruído;
- `signalDetails` com termo, campo e peso.

**Como foi concretizado:** commits de `f7dd748` a `4693f7b`, PRs #18–#27, com retestes dos tickets 5871, 6069, 6631 e 6633 e keywords como senha, máquina, erro, sensor, reiniciando, Apollus e treinamento.

**Invariantes:** não enviar transcript em query string; não marcar toda action como técnica; não supervalorizar metadados; não reabrir a lógica de busca de conteúdo para corrigir ranking.

**Estado:** implementada/refinada. Antes de declarar encerramento operacional, confirmar a versão publicada e realizar smoke test no cliente conectado; refinamentos de relevância continuam permitidos como hotfixes restritos.

### Phase 3C — problemas recorrentes

**Objetivo:** agrupar padrões recorrentes em janela temporal, com amostra limitada, enriquecimento seguro e tendência coerente.

**O que foi concretizado:**

- agrupamento por termos de problema e evidências por campo;
- dimensões de status, urgência, categoria, serviço, equipe e clientes;
- candidatos limitados e enriquecimento com concorrência controlada;
- falhas de enriquecimento contabilizadas e excluídas dos grupos;
- `min_occurrences` antes de `top`/`skip`;
- `candidateCount`, `enrichedCount`, `enrichmentFailures`, `maxCandidates` e `truncated`;
- tendências mensalmente explicáveis e direção derivada do delta;
- retorno parcial quando alguns candidatos falham;
- zero candidatos/nenhum grupo sem erro técnico mascarado.

**Como foi concretizado:** `5008da6`, `5385d39`, `0b1c205`, `5748c2f`, PRs #29, #32, #33 e #35, após timeouts reproduzidos com `top=50`.

**Invariantes:** `rising`/`falling`/`stable` nunca contradizem contagens; `insufficient_data` exige dados insuficientes; amostra truncada não é universo completo; grupos não são inventados a partir de tickets não enriquecidos.

**Estado:** implementada/refinada; o último registro conhecido indica PR #35 e não confirma merge/deploy posterior. Esse ponto precisa ser revalidado antes de dizer que a fase está publicada.

## Próximas fases planejadas para finalizar o desenvolvimento

As fases seguintes são planejamento, não funcionalidades já implementadas. Cada uma precisa de branch, contrato, testes e autorização próprios.

### Fase 4 — hardening de contratos e publicação

**Objetivo:** fechar a diferença entre código local, `main`, Site, manifesto e conexão real.

**Passos obrigatórios:**

1. reconciliar branch funcional, `origin/main`, PRs abertas e alterações locais;
2. revisar PRs pendentes sem incluir `source-bundle`/artefatos não autorizados;
3. executar suíte completa, build e validação do catálogo;
4. mesclar somente após revisão explícita;
5. publicar o SHA mesclado no Sites;
6. verificar versão/URL/deployment;
7. reconectar/reautorizar MCP e conferir manifesto/schema;
8. executar smoke tests de todas as ferramentas analíticas e uma consulta básica;
9. registrar evidência no dossiê.

**Critério de saída:** o mesmo SHA deve ser rastreável de commit a PR, `main`, Site e manifesto ativo; divergências ficam bloqueadas.

### Fase 5 — calibração baseada em amostra real

**Objetivo:** medir qualidade sem alterar contratos estáveis, usando tickets recentes e fixtures sanitizados.

**Passos:**

- selecionar amostra representativa e documentar período/campos;
- medir falsos positivos/negativos de conteúdo, similaridade e recorrência;
- revisar apenas grupos semânticos do catálogo quando a causa for política;
- adicionar fixtures sem PII e testes de regressão;
- comparar antes/depois de scores, confiança, sinais e grupos;
- não aceitar melhora de ranking que regresse timeline, resumo ou consulta básica.

**Critério de saída:** métricas/limitações documentadas e mudanças explicáveis por campo/regra, sem score fixo ou confiança inflada.

### Fase 6 — observabilidade e resiliência

**Objetivo:** diagnosticar timeout, 404, 414, 429, 502/503 e falhas de enriquecimento sem expor dados sensíveis.

**Passos:**

- padronizar códigos/erros estruturados;
- registrar somente contagens, duração, modo de busca, tamanho de referência e status upstream;
- preservar retry com limites e não transformar indisponibilidade em vazio;
- testar concorrência, limite de candidatos, cancelamento e respostas parciais;
- incluir smoke/health checks separados do manifesto.

**Critério de saída:** cada falha observável aponta para uma camada e não exige transcript ou token para diagnóstico.

### Fase 7 — encerramento da beta e manutenção

**Objetivo:** transformar o sistema em uma base estável para novas funcionalidades sem reabrir decisões encerradas.

**Passos:**

- congelar contratos públicos e versionar mudanças incompatíveis;
- definir calendário de revisão do catálogo e do README;
- manter `AGENTS.md` para normas e `DOSSIER.md` para evidências;
- registrar releases como rollback;
- criar checklist de regressão para qualquer nova ferramenta;
- declarar explicitamente o que fica fora de escopo (mutação Movidesk, causa raiz automática, cobertura total sem amostra).

**Critério de saída:** novo trabalho começa por RFC/decisão, não por alteração direta em ferramenta estabilizada; estado publicado e rollback são sempre verificáveis.

### Ordem recomendada de execução futura

```text
Fase 4: reconciliar e publicar com evidência
  -> Fase 5: calibrar qualidade em amostra real
  -> Fase 6: robustez/observabilidade
  -> Fase 7: congelar beta e manutenção
```

Se uma falha aparecer em uma fase anterior, abrir hotfix isolado na fase responsável, atualizar testes e dossiê, e somente então retomar a sequência. Não iniciar uma fase posterior para contornar uma publicação ou contrato não verificado.

## Decisões permanentes

1. Não alterar ferramentas já validadas ao corrigir outra ferramenta.
2. Não publicar uma ferramenta apenas porque ela existe no código: confirmar manifesto MCP, versão Sites e endpoint correto.
3. O endpoint de conexão é `/mcp/`; a raiz do domínio serve à página protegida/OAuth.
4. `type=1` em ações é nota interna e não deve ser tratado como resposta pública da equipe.
5. Busca de conteúdo deve distinguir `subject`, `initialDescription` e `interactions` em `matchedIn`.
6. Similaridade deve ignorar `[object Object]`, nomes, assinaturas, disclaimers e metadados institucionais como evidência técnica.
7. `searchTicketContent` deve definir `$select` internamente; o consumidor não deve precisar conhecer detalhe OData.
8. Em recorrências, `min_occurrences` é aplicado antes da paginação; candidatos não enriquecidos não geram grupos; truncamento é explicitado em `meta`.
9. Tendência é derivada diretamente de `deltaPercentage`: positivo `rising`, negativo `falling`, zero `stable`; menos de dois meses `insufficient_data`.
10. O fallback semântico é reduzido e padronizado; alterações de política devem ocorrer no catálogo, não como listas espalhadas no código.

## Linha do tempo canônica resumida

Esta é a linha do tempo que uma LLM deve usar primeiro; o histórico retroativo e o ledger de commits fornecem os detalhes.

| Ordem | Marco | Decisão/resultado | Evidência |
|---:|---|---|---|
| 1 | Fundação | OAuth PKCE e proxy somente leitura | commits iniciais de 2026-08-13/14 |
| 2 | Separação de clientes | GPT Action e MCP possuem OAuth/clientes distintos | `f011d62` |
| 3 | Contrato de consulta | datas UTC, IDs diretos, filtros e barra `/mcp/` | commits de 2026-08-15/16 |
| 4 | Phase 0 | caracterizar ferramentas estáveis antes de inovar | `41e1505`, PR #1 |
| 5 | Phase 1 | camada de análise limitada/determinística | `1523811`, PR #2 |
| 6 | Phase 2 | timeline cronológica factual | `3003855`, PR #3 |
| 7 | Timeline hotfix | autores, atores, notas internas e resposta pública | `b040ef4`, `b788876`, `9a02c29`, PRs #4–#6 |
| 8 | Phase 3 | resumo e classificação aditivos | `341bd42`, PR #7 |
| 9 | Schemas analíticos | `ticket_id`/`protocol` expostos, XOR em runtime | `6fa6de8`, PR #8 |
| 10 | Phase 3A | análise factual e confiança conservadora | `bb596bb`, PR #10 |
| 11 | Content search | busca em assunto, descrição e ações; `matchedIn` | `da9943a`, `38b47db`, `87f573e`, PRs #11–#12 |
| 12 | Catálogo semântico | YAML fonte, JSON snapshot, política separada | `a6ee84b`, PR #13 |
| 13 | OAuth compatível | callbacks, validade e conteúdo de token | commits de 2026-09-14/15, PR #15 |
| 14 | Limpeza | plugin obsoleto e artefatos gerados tratados separadamente | `dae3d5f`, `9f5d045`, `51c0c7f` |
| 15 | Phase 3B | similaridade por ID e keyword | `f7dd748`, PR #18 |
| 16 | Similaridade por ID | resolver referência sem query longa/transcript | `cc890a4`, `a9f0119`, PRs #19–#20 |
| 17 | Ranking | remover ruído e priorizar problema real | `ab32639`, `776d7fa`, `eac2816`, PRs #21–#23 |
| 18 | Proveniência | `signalDetails` com campo e peso | `0d93577`, PR #24 |
| 19 | Actions sem ruído | separar técnico, operacional e administrativo | `086f4f5`, `84cb711`, `b58ce65`, PRs #25–#27 |
| 20 | Recorrências | nova ferramenta agrupadora | `5008da6`, PR #29 |
| 21 | Política semântica | centralização e fallback controlado | `c43fd95`, PR #30 |
| 22 | Timeout | limite de candidatos e concorrência | `5385d39`, PR #32 |
| 23 | Explicabilidade | tendência, distribuição, dimensões e amostra | `0b1c205`, PR #33 |
| 24 | Documentação | README e instruções MCP atualizados | `806c6cd`, PR #34, Sites v65 |
| 25 | Tendência | direção derivada de `deltaPercentage`; falhas não geram grupos | `5748c2f`, PR #35 pendente |

## Fluxo operacional

1. Ler `AGENTS.md` e este dossiê.
2. Criar/usar branch `codex/...` por fase ou hotfix.
3. Fazer implementação isolada e testes de regressão.
4. Revisar diff e rodar suíte relevante/build/validações.
5. Abrir PR e só mesclar quando explicitamente solicitado.
6. Publicar o `main` mesclado no Sites quando explicitamente solicitado.
7. Confirmar versão/deployment e atualizar este dossiê.

## Estado verificável registrado

- Último commit funcional registrado no histórico desta conversa: `5748c2f` — correção da consistência de tendência e testes da ferramenta de recorrências.
- PR associada registrada: `#35`, criada para esse ajuste. O merge/deploy só deve ser marcado como concluído após confirmação direta.
- O projeto Sites possui publicação anterior confirmada na versão 65, baseada em `31adf33`; essa versão precede o commit `5748c2f`.
- O working tree pode conter alterações de UI/branding e `source-bundle` pertencentes a outros trabalhos. Não incluí-las automaticamente no escopo funcional.

## Pendências e riscos

- Confirmar no conector MCP real que o manifesto expõe todas as ferramentas após cada deploy; conexão antiga ou URL raiz pode mostrar um conjunto diferente.
- Manter testes de regressão para tendências, enriquecimento parcial, truncamento, paginação e zero resultados.
- Revisar o catálogo semântico quando novas classes de ruído, aliases ou campos forem introduzidos.
- Não declarar uma versão como publicada sem URL/estado de deployment confirmado pelo Sites.

## Histórico retroativo desta conversa

Registro cronológico reconstruído a partir dos prompts e avaliações fornecidos nesta conversa; cada entrada representa uma solicitação ou decisão do usuário e seu efeito no projeto.

**Como interpretar:** esta lista é história conversacional, não uma lista de commits. Uma entrada pode ter gerado vários commits, nenhum commit ou apenas uma regra. A associação técnica só é considerada direta quando o ledger de commits, diff ou PR fornece evidência; caso contrário, ela permanece contextual ou não verificada.

1. **Documento inicial de análise:** foi apresentado `analise_movidesk_validacoes_correcoes.md`; as instruções do arquivo deveriam ser distinguidas da solicitação do usuário antes de qualquer ação.
2. **Implementar depois de validar impactos:** ficou estabelecido que mudanças só deveriam ser implementadas após análise de impacto.
3. **Uso de Luna médio:** foi solicitado o uso de raciocínio/modelo Luna em esforço médio quando aplicável.
4. **Erro de push upstream:** foi relatado o erro de branch upstream divergente; a solução conceitual registrada foi escolher explicitamente `HEAD:main` ou `HEAD`, em vez de presumir o destino.
5. **Teste direto no MCP/plugin:** foi perguntado se alterações anteriores já poderiam ser testadas; a resposta operacional passou a exigir confirmação de deploy e reconexão do plugin.
6. **Manifesto antigo com cinco ferramentas:** foi reportado que `movidesk_search_ticket_content` não aparecia e que `list_open_tickets` ainda retornava `expected: record`; isso isolou o problema como publicação/conexão antiga, não como indisponibilidade geral.
7. **Publicação sincronizada no GitHub e Sites:** foi solicitada publicação sincronizada; passou a ser necessário separar commit, merge e deploy como etapas verificáveis.
8. **Dúvida sobre OAuth:** foi perguntado se somente OAuth precisava de commit e publish; ficou decidido que componentes compartilhados devem ser publicados conforme o artefato alterado.
9. **Correção parcial confirmada:** `list_open_tickets` passou a funcionar, enquanto a sexta ferramenta ainda não aparecia; a ausência do manifesto foi tratada como problema de exposição/deploy.
10. **GPT Actions versus MCP:** foi perguntado se Actions precisavam ter a mesma capacidade do MCP; a decisão foi evoluir os dois contratos sem misturar implementações.
11. **Novas pesquisas em GPT Actions:** foi solicitado que Actions ganhassem capacidades equivalentes de pesquisa; isso motivou o conteúdo de ticket e os ajustes de schema.
12. **Nova branch no GitHub:** foi solicitado salvar alterações em branch; o fluxo por branches `codex/...` tornou-se padrão.
13. **Verificação do Sites:** foi perguntado se o Sites estava atualizado; o dossiê passou a exigir confirmação direta da versão publicada.
14. **Publicação anterior do OAuth:** foi questionado se apenas OAuth precisava de commit/publish; a resposta consolidou a necessidade de mapear o componente efetivamente alterado.
15. **Problema `$select` em `searchTicketContent`:** foi fornecido diagnóstico detalhado de que o backend exigia `$select` ausente no schema.
16. **Preferência por `$select` interno:** foi definida a decisão de encapsular seleção OData internamente, sem impor detalhe técnico ao chamador.
17. **Critérios de aceite de conteúdo:** foram definidos busca em assunto, descrição e interações, paginação, acentos, ausência de resultados sem erro e distinção de erro técnico.
18. **Correção de `description` em actions:** foi fornecida orientação para não ler `description` do nível errado; o texto pertence às ações/interações conforme o payload real.
19. **Ajuste adicional do endpoint:** foi solicitado corrigir novamente `/api/ticket-content` sem tocar no restante.
20. **Não alterar funcionamento validado:** foi explicitada a regra de preservar integralmente o que já funcionava durante o hotfix.
21. **Paridade MCP/Actions:** foi perguntado se a nova ferramenta Actions já existia no MCP; o registro passou a tratar MCP e Actions como contratos relacionados, mas independentes.
22. **Comparação de poder:** foi perguntado se ambas eram igualmente poderosas; a conclusão foi que tinham capacidades próximas, com diferenças de transporte/schema.
23. **Leitura de projeto em Markdown:** foi apresentado `projeto_mcp_movidesk_avancado_atualizado.md` para avaliação sem alteração imediata.
24. **Divisão em fases:** foi solicitado separar o projeto em fases para execução incremental.
25. **Uma branch por fase:** foi adotado o modelo de branch dedicada por fase.
26. **Atualização da master e Phase 0:** foi solicitado pull/commit/push do necessário e criação da branch da Phase 0.
27. **Execução da Phase 0:** foi autorizada a implementação da Phase 0 com pedido para solicitar ajuda se necessário.
28. **Avanço para Phase 1:** foi solicitado iniciar a Phase 1 após a conclusão anterior.
29. **Avanço para a próxima fase:** foi solicitado continuar o fluxo para a fase seguinte.
30. **Testabilidade das fases:** foi perguntado como testar as fases; passou a ser exigida evidência por testes automatizados e smoke tests MCP.
31. **PRs das três fases:** foi solicitada recomendação sobre abrir/mesclar PRs das fases 0, 1 e 2 antes da publicação.
32. **Release como rollback:** foi confirmado que releases do GitHub poderiam servir como ponto de rollback.
33. **Fluxo de merge sequencial:** foi definido revisar e mesclar Phase 0, depois Phase 1, Phase 2, testar em `main` e publicar no Sites.
34. **Resync de branch Actions:** foi questionado se `codex/gpt-action-content-search` deveria ser mesclada após resync com `main`; a regra passou a exigir rebase/resync antes de merge quando houver divergência.
35. **Arquivamento:** foi solicitado arquivar o trabalho/branch quando não fosse mais necessário.
36. **Timeline — author:** foi solicitado corrigir `action.createdBy` para não retornar `[object Object]`.
37. **Timeline — primeira manifestação:** foi solicitado corrigir `firstClientManifestation` para reconhecer corretamente o cliente.
38. **Timeline — última resposta:** foi solicitado corrigir `lastTeamResponse` para reconhecer corretamente a equipe.
39. **Preservação da timeline:** foram explicitamente protegidos ordenação, `sourceIndex`, status, justification, type, origin, anexos, terminal status e ID/protocolo.
40. **Testes de timeline:** foram exigidos testes para sequência cliente/equipe, nota interna, origins, resolvido, fechado, ordem original, ID, protocolo longo e inexistente.
41. **Nome de summary:** foi sugerido renomear para `description` ou documentar que o texto integral permanece em `summary`.
42. **Sanitização S3:** foi apontada como melhoria opcional a remoção/sanitização de URLs S3 assinadas em transcripts.
43. **Publicação da correção de timeline:** foi solicitado publicar para permitir testes reais.
44. **Regressão residual de `lastTeamResponse`:** foi demonstrado que notas internas `type=1` ainda eram escolhidas indevidamente.
45. **Regressões reais 6273/6280/5836:** foram fornecidos tickets concretos para validar respostas públicas posteriores e ausência de falso `null`.
46. **Regra de resposta pública:** ficou estabelecido que `type=1` é nota interna e não pode representar `lastTeamResponse`; respostas públicas eram principalmente `type=2`.
47. **Testes obrigatórios de resposta:** foram definidos cinco cenários de regressão, incluindo somente notas internas após resposta pública e ausência completa de resposta pública.
48. **Merge e deploy da timeline:** foi solicitado integrar na `main` e publicar.
49. **Reteste parcial:** foi reportado que author, primeira manifestação, ordenação, sourceIndex, anexos, terminal status, identificadores e 404 estavam corrigidos, restando `lastTeamResponse`.
50. **Novo merge/deploy para testes:** foi solicitado repetir o fluxo após a correção residual.
51. **Conclusão da Phase 3:** foi declarado que a correção estava perfeita e autorizado iniciar a próxima fase.
52. **Merge/deploy com backup:** foi solicitado merge/deploy após criação de release de backup das fases 0, 1 e 2.
53. **Pergunta sobre implantação da timeline:** foi perguntado quando `movidesk_get_ticket_timeline` havia sido implantada; o histórico passou a registrar fases e commits, não apenas estado atual.
54. **Validação entre fases 35 e 36:** foi solicitada comparação das alterações da ferramenta timeline entre versões/fases.
55. **Lista de ferramentas novas:** foi solicitada listagem de ferramentas introduzidas desde a Phase 0.
56. **Schemas vazios nas três análises:** foi reportado que timeline, summarize e classify apareciam como `{}` apesar do runtime exigir `ticket_id` ou `protocol`.
57. **Correção somente do schema MCP:** foi solicitado expor os dois campos e manter XOR no runtime, sem alterar a lógica interna.
58. **Merge/deploy dos schemas:** foi solicitado publicar essa correção para teste.
59. **Refinamento semântico:** foi apresentado objetivo de refinar exclusivamente a semântica de timeline, resumo e classificação.
60. **Commit, merge e publicação semântica:** foi solicitado concluir e publicar a rodada sem expandir o escopo.
61. **Objetivo da Phase 3A:** foi apresentado documento para transformar a implementação em análise factual determinística.
62. **Implementação Phase 3A:** foi solicitado implementar, commitar e publicar.
63. **Reapresentação das fases:** foi solicitado listar novamente as fases do projeto.
64. **Confirmação de não regressão em content search:** foi solicitado validar especificamente `movidesk_search_ticket_content`.
65. **Teste por ticket 6246:** foi reportado que buscas individuais por `senha` retornavam zero apesar de ocorrências na timeline.
66. **Teste por ticket 6264:** foi reportado o mesmo defeito com `biometria` presente em múltiplas ações.
67. **Teste por ticket 6277:** foi reportado que `Apollus` também não era encontrado apesar de ocorrências repetidas.
68. **Correção da busca de conteúdo:** foi solicitado eliminar a regressão sem alterar outras ferramentas.
69. **Publicação da correção de conteúdo:** foi solicitado commit e publicação imediata para eliminar a regressão.
70. **Correção apenas de `matchedIn`:** foi solicitado preservar a lógica de busca e corrigir somente a origem real dos matches entre assunto, descrição e interações.
71. **Publicação de `matchedIn`:** foi solicitado commit e publicação da correção isolada.
72. **Resumo da Phase 3A:** foi solicitado um resumo do que havia sido implantado na fase.
73. **Catálogo semântico YAML 1.1:** foi fornecido novo arquivo YAML e contexto de evolução do catálogo.
74. **Prosseguimento do catálogo:** foi autorizado continuar a evolução da Phase 3A.
75. **PR, merge e deploy do catálogo:** foi solicitado abrir PR, mesclar e publicar para teste.
76. **Duas avaliações de hotfix 3A:** foi solicitado considerar avaliações independentes em um próximo hotfix.
77. **Correções do hotfix 3A:** foi autorizado prosseguir com PR, commit e publicação após incorporar as avaliações.
78. **Pergunta sobre versão do MCP:** foi solicitada a versão do MCP; a resposta diferenciou versão do servidor, versão do Site e versão do OAuth.
79. **Identificação do link OAuth:** foi observado que o link aberto era do OAuth, não necessariamente o endpoint de ferramentas.
80. **Revisão do diagnóstico:** foi solicitada nova validação do link e da arquitetura.
81. **Not Found na página:** foi reportado que a página raiz retornava `Not Found`; isso levou à documentação de que a raiz não é o endpoint MCP.
82. **Admissão sobre mesmo Sites:** foi solicitado reconhecer que MCP e OAuth foram publicados no mesmo Site; o dossiê registra essa arquitetura, distinguindo rotas.
83. **Questionamento sobre arquitetura original:** foi perguntado se o projeto originalmente era diferente; a resposta passou a separar histórico de intenção atual.
84. **Por que mesmo Site:** foi questionada a decisão de hospedar OAuth e MCP juntos; a decisão foi documentar o compartilhamento sem confundir endpoints.
85. **Próxima fase:** foi perguntado qual seria a próxima fase após o fechamento da 3A.
86. **Fechamento da Phase 3A:** foi perguntado como a fase havia sido encerrada; o dossiê passou a exigir critérios e estado verificável.
87. **Pendência deliberadamente mantida:** foi decidido não alterar um ponto pendente da 3A.
88. **Início da Phase 3B:** foi autorizado iniciar a fase de similaridade.
89. **Revisão do repositório antes da 3B:** foi solicitada visualização das alterações existentes antes de continuar.
90. **Merge de timeout de login:** foi perguntado se havia apenas esse merge ou outros impactos; a revisão passou a separar alterações de OAuth de alterações funcionais do MCP.
91. **Imagem de estado do Git:** foi fornecido screenshot com `-265` alterações na limpeza do plugin.
92. **Interpretação das exclusões:** foi perguntado a que se referiam os `-265`; a regra passou a exigir inspeção de diff antes de apagar arquivos.
93. **Exclusão de plugin:** foi perguntado se havia solicitação de exclusão; foi confirmado que a intenção era remover o plugin obsoleto.
94. **Commit da limpeza:** foi autorizado commitar as exclusões do plugin obsoleto.
95. **Verificação de pendências de commit:** foi perguntado se ainda havia algo a commitar; o estado do Git passou a ser parte obrigatória da entrega.
96. **Limpeza dos arquivos do GitHub:** foi levantada a necessidade de retirar sujeira e artefatos gerados; o dossiê registra preservar mudanças do usuário e não limpar destrutivamente.
97. **PR, merge, commit na main e Sites:** foi solicitado concluir o fluxo completo de limpeza/publicação.
98. **Nova beta:** foi perguntado se era possível iniciar a próxima fase beta.
99. **Estratégia da fase:** foi solicitado explicar como a fase seria atacada, incluindo divisão de trabalho e critérios.
100. **Execução do fluxo:** foi autorizado iniciar o fluxo de implementação, testes, PR e publicação.
101. **Primeiro teste de `find_similar_tickets`:** foi reportado HTTP 414 no modo `ticket_id`; o diagnóstico apontou query string longa e necessidade de referência textual interna.
102. **Busca por keyword funcionando:** foi confirmado que `senha`, frases normalizadas, inexistência, filtros e paginação funcionavam, com ambiguidade no campo `total`.
103. **Correção do caminho por ID:** foi solicitado corrigir somente `find_similar_tickets`, sem tocar no restante.
104. **Reteste com zero similares:** foi reportado que o ID era resolvido, mas o conteúdo de referência ainda não alimentava a similaridade.
105. **Extração da referência:** foram solicitadas verificações de assunto, descrição, texto vazio, protocolo versus conteúdo e exclusão do ticket de origem.
106. **Correção do cálculo por ID:** foi solicitado implementar e publicar a correção da referência textual.
107. **Busca por ID operacional:** foi confirmado que 5871 e 6069 passaram a retornar similares e que 414/404 estavam resolvidos.
108. **Qualidade do ranking:** foram apontados sinais fracos como `fechado`, anos, IDs, atendentes e dados institucionais.
109. **Calibração de ranking:** foi solicitado remover ruído, aumentar peso de assunto/descrição e reduzir peso de metadados.
110. **Teste ampliado por domínios:** foram validados `acesso`, `entrega`, `usuário`, `duplicada`, IDs diversos, filtros e paginação; `máquina` e `erro` revelaram inconsistências de tokenização.
111. **Token `object`:** foi identificado vazamento de `[object Object]`/`object` na tokenização de campos estruturados.
112. **Correção de normalização e ponderação:** foi solicitado remover `object`, revisar stopwords e moderar confiança.
113. **Direcionamento em arquivo externo:** foi solicitado implementar as orientações de `direcionamento-ajustes-tickets-similares.md` e publicar.
114. **Reteste de `impressora`, `máquina` e `erro`:** foram confirmados transporte e normalização, mas questionada a confiança alta sem evidência de campo.
115. **Explicabilidade de sinais:** foi solicitado incluir origem/campo dos termos e reduzir score fixo e confiança superestimada.
116. **Publicação da rodada:** foi autorizado fazer e publicar os ajustes de ranking.
117. **Actions técnicas contaminadas:** foi reportado que saudações, nomes, contatos e disclaimers ainda recebiam peso `actions.technical` alto.
118. **Classificação por classe:** foi solicitado separar `actions.technical`, `actions.noise` e `actions.operational` antes da ponderação.
119. **Questionamento sobre edição rápida:** foi perguntado se todo o MD e os últimos testes haviam sido cobertos; isso motivou revisão mais completa do escopo.
120. **Implementação mais completa:** foi solicitado aprofundar a limpeza semântica de ações, assinaturas e disclaimers.
121. **Reteste de sensor/reiniciando/Apollus/treinamento:** foi confirmada operação e retry de 502, mas ainda havia palavras genéricas em `actions.technical`.
122. **Correção final de ações genéricas:** foi autorizado fazer e publicar a separação semântica mais rigorosa.
123. **Levantamento dos últimos 100 tickets:** foi solicitado avaliar se a ferramenta precisava de refinamento adicional com amostra recente.
124. **Implementação de `detect_recurrent_issues`:** foi solicitado criar a ferramenta considerando todos os pontos pesquisados.
125. **Refino adicional com 100 tickets:** foi solicitado refinar e publicar após a análise da amostra.
126. **Listagem de fases restantes:** foi solicitada visão de roadmap remanescente.
127. **Centralização de regras de ações:** foi questionado se stopwords e semântica de ações deveriam ficar em arquivo atualizável.
128. **Reconhecimento do catálogo semântico:** foi observado que já existia catálogo YAML para parte dessas regras.
129. **Consolidação no YAML:** foi solicitado centralizar aliases, sinais, validação estrutural e fallback sem perder informação.
130. **Fallback de 10%:** foi definida a redução do fallback para 10% do catálogo, sem sujeira espalhada no código.
131. **Releitura do pedido:** foi solicitado validar se a resposta anterior havia entendido corretamente a consolidação.
132. **Suspeita de não publicação:** foi questionado se algo havia sido publicado; o dossiê passou a exigir distinguir intenção, commit, merge, versão e deploy.
133. **Consolidação reiterada:** foi repetido o pedido de consolidar o catálogo e separar grupos semânticos corretamente.
134. **Publicação com merge de PR:** foi solicitado publicar a consolidação no GitHub e Sites.
135. **Comparação antes/depois do PR 30:** foram relatadas mudanças de score, evidências e confiança em ferramentas analíticas.
136. **Recomendação de hotfix semântico:** foi recomendada reposição de stopwords, boilerplate contextual, separação de assinatura e confiança baseada em evidências independentes.
137. **Pergunta se só semântico bastava:** foi questionado se o ajuste poderia ser apenas no catálogo; a decisão foi avaliar consumidores antes de editar código.
138. **Duplicidade JSON/YAML:** foi perguntado por que existiam os dois formatos; o dossiê registra YAML como fonte e JSON como snapshot runtime.
139. **Retorno à recorrência:** foi solicitado voltar ao desenvolvimento de `movidesk_detect_recurrent_issues`.
140. **Timeout da recorrência:** foi reportado que três chamadas com `top=50` excederam o tempo limite sem JSON ou HTTP observável.
141. **Detalhamento do timeout:** foi solicitado produzir mensagem técnica para a IA que codava a ferramenta, sem mascarar o timeout como resultado vazio.
142. **Correção de timeout:** foi solicitado commitar e publicar a ferramenta após a correção.
143. **Próxima fase após timeout:** foi perguntado se o projeto poderia avançar após a ferramenta operar com limite/concurrency.
144. **Valor da fase:** foi solicitado explicar como recorrências agregariam valor ao MCP e às respostas.
145. **Implementação cuidadosa:** foi autorizado implementar a fase com avaliação completa e aviso ao terminar.
146. **Refinamento contínuo:** foi solicitado continuar refinando a fase considerando as conversas anteriores.
147. **Novo refinamento contínuo:** foi solicitado repetir a rodada de refinamento antes de PR/deploy.
148. **PR, merge e publicação de recorrências:** foi solicitado concluir o fluxo de integração e publicação.
149. **Revisão de documentação:** foi solicitado revisar instruções de uso de cada ferramenta e todo o README antes de republicar.
150. **Identificação da ferramenta 3C:** foi perguntado qual ferramenta correspondia à Phase 3C; foi identificado `movidesk_detect_recurrent_issues`.
151. **Manifesto MCP ausente no Chat:** foi reportado que o ChatGPT não encontrava a ferramenta mesmo após remover e adicionar novamente o MCP.
152. **Diagnóstico de manifesto/deploy:** foi verificado que o código e a versão publicada continham a ferramenta, levando à hipótese de URL raiz, outro plugin ou cache do conector.
153. **Correção de tendência e contrato:** foi solicitado alterar exclusivamente `movidesk_detect_recurrent_issues`, preservando paginação, candidatos, enriquecimento, campos dos grupos e demais ferramentas.
154. **Testes obrigatórios da recorrência:** foram exigidos cenários de tendência crescente, decrescente, estável, insuficiência, deltas, filtros, paginação, truncamento, falha parcial e ausência de grupos.
155. **Implementação da tendência:** a direção passou a ser derivada diretamente de `deltaPercentage`, com `insufficient_data` apenas para menos de dois meses.
156. **Enriquecimento parcial:** candidatos cujo detalhe falha deixaram de ser usados para inventar grupos; falhas passaram a ser contabilizadas.
157. **Truncamento explícito:** `meta` passou a informar que a análise limitada aos 100 candidatos não representa necessariamente todo o período.
158. **Testes finais:** foram adicionados testes de tendência, consistência numérica, paginação, `min_occurrences`, truncamento, falha parcial, zero candidatos e nenhum grupo; a suíte relevante alcançou 62 testes verdes.
159. **Commit e PR da recorrência:** foi solicitado commit, PR e deploy; o commit `5748c2f` foi enviado e a PR `#35` foi aberta.
160. **Falha de autenticação no merge:** o merge automático da PR não foi confirmado porque o CLI GitHub estava sem credencial válida; isso ficou registrado como pendência, sem declarar merge/deploy.
161. **Criação do `AGENTS.md`:** foi solicitado um arquivo obrigatório de instruções operacionais para impedir repetição de ambiguidades de escopo, publicação e validação.
162. **Criação do dossiê:** foi solicitado um segundo Markdown para manter contexto, decisões, fases, contratos, estado de publicação e pendências.
163. **Localização da raiz:** foi confirmada a raiz local `D:\Google Drive\Documents\ChatGPT\MCP Movidesk`.
164. **Pedido anterior de retroatividade:** foi solicitado ampliar extensamente este dossiê, retroativamente, com pelo menos uma linha para cada prompt da conversa; esta seção foi criada para atender essa exigência.
165. **Pedido atual de auditoria temporal:** foi solicitado detalhar dia, hora e commit gerador de cada alteração, além de avaliar novos campos de contexto; isso gerou o ledger Git completo, a auditoria por marco e as regras temporais no `AGENTS.md`.

### Limitação temporal dos prompts

O histórico exportado da conversa preserva a ordem dos prompts, mas não fornece timestamp confiável para cada mensagem individual. Por isso, as entradas 1–165 são cronológicas por ordem conversacional; horas exatas só foram adicionadas quando evidenciadas pelo Git, PR ou Sites. Nenhum horário de prompt foi inventado.

## Linha do tempo consolidada por eras

### Era A — Fundação e contrato de publicação

- O projeto começou como um proxy autorizado para Movidesk, com leitura de tickets e autenticação OAuth/PKCE.
- A primeira preocupação recorrente foi a diferença entre “código alterado”, “branch enviada”, “PR aberta”, “PR mesclada”, “versão salva” e “deploy ativo”.
- O histórico mostrou repetidamente que a conexão do ChatGPT pode conservar manifesto antigo; por isso o dossiê passou a exigir validação do manifesto e reconexão após deploy.
- A arquitetura final deliberada mantém OAuth e MCP no mesmo Site, mas com rotas distintas e contratos distintos.
- A raiz do domínio é uma página protegida/configuração; o endpoint de ferramentas é `/mcp/` com barra final.

### Era B — Caracterização e fases 0–2

- Phase 0 estabilizou o comportamento das ferramentas antigas antes de introduzir análises.
- Phase 1 criou uma camada de consulta limitada para evitar chamadas ilimitadas e tornar os resultados determinísticos.
- Phase 2 introduziu a timeline como uma transformação factual, sem substituir o ticket original.
- O fluxo de fases adotado foi branch por fase, PR por fase, merge controlado, teste em `main` e publicação posterior.
- Releases do GitHub foram tratados como pontos de rollback; nenhum release foi considerado prova de deploy do Site.

### Era C — Timeline, resumo e classificação

- A timeline foi corrigida iterativamente para autores aninhados, sequência de cliente/equipe, notas internas, respostas públicas, terminal status, anexos, ID interno e protocolo longo.
- Os tickets reais 6273, 6280 e 5836 foram usados como regressões para `lastTeamResponse`.
- O erro mais importante foi confundir `type=1` (nota interna) com resposta pública; a regra foi explicitamente fixada no código e nos testes.
- Schemas vazios `{}` para timeline, resumo e classificação foram tratados como defeito de publicação de contrato, não como defeito da lógica interna.
- O schema foi exposto com `ticket_id` e `protocol` opcionais, mantendo XOR no runtime.
- O resumo e a classificação foram mantidos factuais e conservadores, sem inferência de causa raiz ou substituição da categoria oficial.

### Era D — Conteúdo e GPT Actions

- `searchTicketContent` nasceu para localizar termos em assunto, descrição inicial e interações.
- O backend Movidesk exigia `$select`, mas o caller não deveria conhecer esse detalhe; a seleção passou a ser responsabilidade interna.
- O campo `description` foi corretamente associado ao objeto de ação/interação quando o payload real assim exigia.
- Os tickets 6246, 6264 e 6277 provaram que uma busca por conteúdo não podia considerar apenas o assunto.
- `matchedIn` foi separado em `subject`, `initialDescription` e `interactions`, preservando a lógica de busca já validada.
- MCP e GPT Actions foram tratados como superfícies complementares: capacidades semelhantes, schemas e publicação separados.

### Era E — Phase 3A e catálogo semântico

- A Phase 3A transformou análises livres em extrações determinísticas de fatos, ações, evidências, hipóteses e confiança.
- O catálogo YAML passou a ser fonte semântica editável; o JSON tornou-se snapshot runtime validado.
- Política de stopwords, padrões de ruído, classes de ação, pesos e padrões numéricos protegidos foi externalizada.
- O fallback foi reduzido para evitar listas duplicadas e sujeira semântica no código.
- A consolidação separou aliases/sinais, política semântica e validação estrutural para que uma ferramenta não usasse o grupo errado.
- Comparações antes/depois do PR 30 revelaram perda de evidência no resumo e aumento de confiança na classificação; isso gerou hotfix contextual, não uma reescrita ampla.
- Foi adotado o princípio de confiança alta exigir evidências fortes e independentes, não somente quantidade de tokens.

### Era F — Phase 3B e similaridade

- O modo `ticket_id` de `find_similar_tickets` primeiro falhou com HTTP 414 por enviar conteúdo extenso na query string.
- A correção passou a buscar o ticket por ID, extrair assunto/descrição/interações internamente e consultar candidatos sem transportar transcript integral.
- O fluxo validou 404 para ticket inexistente, exclusão do ticket de origem, filtros, paginação e normalização de acentos.
- Em seguida, o ranking foi refinado para reduzir termos institucionais, anos, IDs, nomes, assinaturas, disclaimers e metadados fracos.
- O token `object` revelou conversão indevida de objetos estruturados para string e passou a ser proibido por teste.
- `signalDetails` foi introduzido para mostrar termo, campo de origem e peso, evitando score sem evidência explicável.
- Ações foram classificadas antes da ponderação: técnicas podem pesar alto; operacionais e ruído devem pesar zero ou quase zero.
- Retry de 502 foi observado como recuperação transitória, sem ser confundido com defeito determinístico.

### Era G — Phase 3C e recorrências

- O objetivo foi identificar grupos recorrentes em uma janela temporal, não apenas retornar tickets parecidos.
- A primeira versão excedia o timeout com `top=50`; a solução combinou limite de candidatos e enriquecimento concorrente controlado.
- O limite de 100 candidatos tornou-se observável por `candidateCount`, `maxCandidates` e `truncated`.
- O enriquecimento passou a contar falhas e continuar com os tickets válidos.
- Grupos receberam tendência mensal, direção, confiança, evidências por campo, dimensões administrativas e exemplos.
- O defeito final identificado foi a direção ser calculada comparando metades do período, enquanto o delta usava primeiro e último mês; a direção agora deriva diretamente do delta publicado.
- Foram adicionados testes para `rising`, `falling`, `stable`, `insufficient_data`, deltas positivo/negativo/zero, paginação, `min_occurrences`, truncamento, falha parcial, zero candidatos e nenhum grupo.

## Matriz de ferramentas e invariantes

| Ferramenta | Papel | Invariantes principais | Risco de regressão |
|---|---|---|---|
| `get_ticket` | Consulta direta | ID, protocolo, envelope do ticket, leitura somente | Alto: é base de todas as análises |
| `search_tickets` | Busca filtrada | filtros, datas, paginação e envelope | Alto: consumidor compartilhado |
| `list_open_tickets` | Tickets abertos | resultado estruturado sem erro `record` | Alto: contrato MCP já teve regressão |
| `search_ticket_content` | Conteúdo textual | assunto/descrição/interações, `matchedIn`, `$select` interno | Alto: Actions e MCP dependem dela |
| `search_people` | Pessoas | filtros autorizados e envelope | Médio |
| `list_services` | Serviços | filtros, página e envelope | Médio |
| `get_ticket_timeline` | Histórico | ordenação, atribuição, notas internas, terminal status | Muito alto: usado por resumo e classificação |
| `summarize_ticket` | Síntese factual | evidências separadas de hipóteses e pendências | Alto: risco de inferência |
| `classify_ticket_issue` | Classificação | categoria oficial preservada e confiança conservadora | Alto: risco de falsa causalidade |
| `find_similar_tickets` | Similaridade | referência por ID/keyword, ranking explicável, ruído filtrado | Alto: ranking pode induzir resposta errada |
| `detect_recurrent_issues` | Recorrência | grupos, tendência coerente, amostra e falhas visíveis | Alto: risco de falsa tendência |

## Contratos de resposta considerados estáveis

- Ticket individual pode aceitar identificador interno ou protocolo conforme a ferramenta; quando ambos são aceitos, o runtime exige exatamente um.
- Coleções devem retornar envelopes previsíveis, mesmo vazias.
- Paginação deve devolver os campos solicitados pelo contrato, sem reinterpretar silenciosamente `top` ou `skip`.
- Erros upstream precisam conservar código HTTP quando disponível e indicar se a resposta é parcial, vazia ou falha técnica.
- A análise nunca deve transformar ausência de histórico em evidência de inexistência do problema.
- Campos de explicabilidade devem apontar a origem factual, não apenas repetir o token que elevou o score.

## Matriz de testes acumulada

### Testes de transporte e publicação

- descoberta OAuth/PKCE;
- proteção do endpoint MCP;
- schemas MCP não vazios;
- manifesto contendo ferramentas novas;
- distinção entre raiz do Site e `/mcp/`;
- página de instruções atualizada;
- build do Worker e rotas.

### Testes de consulta

- ticket por ID;
- ticket por protocolo longo;
- ticket inexistente;
- filtros de data e campo de data;
- paginação;
- resultado vazio;
- erro upstream estruturado;
- preservação de somente leitura.

### Testes de timeline/análise

- ações fora de ordem;
- cliente/equipe alternados;
- nota interna `type=1`;
- resposta pública `type=2`;
- origins 0, 2, 3 e 23;
- resolvido e fechado;
- autor criado por objeto aninhado;
- `firstClientManifestation` e `lastTeamResponse`;
- resumo sem hipóteses inventadas;
- classificação com categoria oficial preservada.

### Testes de conteúdo/similaridade/recorrência

- acentos e case insensitive;
- ações posteriores;
- `matchedIn` correto;
- keyword e ticket de referência;
- 414, 404, 502/503;
- exclusão do ticket de origem;
- sinais sem `object`;
- filtro de assinatura/disclaimer;
- ranking por problema em vez de metadados;
- recorrência crescente, decrescente, estável e insuficiente;
- falha parcial de enriquecimento;
- truncamento explícito;
- `min_occurrences` antes da paginação.

## Estados de entrega

Para cada mudança, registrar os estados separadamente:

1. **local:** código modificado e testes locais;
2. **commit:** SHA existente no Git;
3. **push:** SHA presente na branch remota;
4. **PR:** número, base, head e estado;
5. **merge:** confirmação do GitHub e SHA da `main`;
6. **build:** artefato gerado sem erro;
7. **version:** versão Sites salva com SHA correspondente;
8. **deployment:** estado `succeeded` e URL confirmada;
9. **manifest:** ferramentas observadas no conector real;
10. **rollback:** release/versão anterior conhecida.

Nunca colapsar esses estados em “publicado” sem evidência de todos os passos solicitados.

## Inventário de artefatos e locais

- `worker/mcp.ts`: transporte, autenticação do endpoint e registro do servidor MCP.
- `worker/mcp-tools.ts`: schemas, registro e envelopes públicos das ferramentas.
- `worker/movidesk-timeline.ts`: transformação cronológica e atribuição de atores.
- `worker/movidesk-insights.ts`: resumo e classificação factual.
- `worker/movidesk-similarity.ts`: similaridade, sinais, pesos e ruído.
- `worker/movidesk-recurrence.ts`: recorrência, agrupamento, tendência, amostra e metadados.
- `worker/semantic-catalog.ts`: carregamento/validação das regras semânticas.
- `config/movidesk_semantic_models.yaml`: fonte editável do catálogo.
- `config/movidesk_semantic_models.json`: snapshot runtime.
- `tests/mcp-tools.characterization.test.ts`: contratos MCP e regressões das ferramentas.
- `tests/movidesk-timeline.test.ts`: regressões da timeline.
- `tests/movidesk-insights.test.ts`: resumo, classificação e Phase 3A.
- `tests/semantic-catalog.test.ts`: validação e integridade do catálogo.
- `app/mcp-instructions-panel.tsx`: instruções exibidas para conectar o MCP.
- `README.md`: documentação pública/local de uso e desenvolvimento.
- `.openai/hosting.json`: identidade do Site e bindings; não substituir IDs.
- `AGENTS.md`: regras obrigatórias de execução.
- `DOSSIER.md`: contexto, linha do tempo e estado verificável.

## Lições operacionais registradas

- Um manifesto antigo pode coexistir com código correto; sempre validar a conexão real.
- Um site aberto no navegador não prova que o MCP está conectado.
- A URL raiz pode ser válida para OAuth e inválida para descoberta de ferramentas.
- Um teste de keyword não prova que a busca por ID funciona, e vice-versa.
- Uma busca vazia não pode ser usada como diagnóstico sem verificar a timeline do mesmo ticket.
- Um score alto não é evidência de relevância; é necessário mostrar sinais, campos e qualidade da evidência.
- Um retry bem-sucedido indica instabilidade transitória, não necessariamente correção definitiva.
- Uma PR aberta não deve ser descrita como mesclada; uma versão Sites anterior não deve ser descrita como contendo um commit posterior.
- Alterações pendentes no working tree pertencem ao usuário até prova em contrário.

## Linha do tempo de commits — horário de São Paulo

Os horários abaixo vêm do timestamp autoral do Git (`-03:00`) e são fatos do histórico local/remoto. A presença de um commit não significa, por si só, que ele foi mesclado na `main` ou publicado no Sites.

### 2026-08-13 — fundação OAuth e identidade do Site

- `0e19146015779d2b4b151cf88c60210f06131cd7` — 19:57:13 — `Initial PKCE OAuth proxy` — fundação do proxy OAuth.
- `212be99cd4de4d2b6d5b1feb6424cf7fa62aa323` — 20:33:48 — `Allow Codex PKCE loopback callbacks` — suporte a callbacks loopback.
- `d47b53728c398d6df4d2fe67c4183f39606d18c2` — 23:24:25 — `fix oauth discovery and add favicon` — discovery OAuth e identidade visual inicial.
- `104c96ff1668ea330d6b640a0931f5723c5dff21` — 23:57:40 — `Refresh Movidesk dark access experience` — tela de acesso.

### 2026-08-14 — administração, Actions e instruções MCP

- `df0a4f516a23d36839466620f40baf5e18341ba0` — 00:06:20 — `Redesign authorized users management` — administração de usuários.
- `cbfbaaf92a9d88a87c257290fe2e7ea952a9a923` — 00:08:52 — `Allow master to revoke active users` — revogação de usuários ativos.
- `b608bd85169c6ce4a6119cc927ba8c6eb7fe7b4d` — 00:46:01 — `Align OAuth metadata and harden user administration` — metadados e endurecimento administrativo.
- `f011d6268a859be2578f669b6b68ceb712515dad` — 00:59:38 — `Separate GPT Action and MCP OAuth clients` — separação dos clientes OAuth.
- `049c8774fdce985128fadef3cf275aceba222b3d` — 01:11:02 — `Add GPT Action setup instructions` — instruções da Action.
- `8588281b3f723395573957167ffcac5a2044af70` — 01:17:13 — `Add MCP setup instructions` — instruções do MCP.
- `08fa7ae164ede081ca77f1a654fa6aacbb236227` — 01:21:51 — `Use dedicated MCP setup route` — rota dedicada de configuração MCP.
- `4e0048168541d3060d3d1e87bcc19555058907ce` — 01:37:19 — `Add advanced ticket search to GPT Action` — filtros avançados da Action.
- `1c00e117b6c051e7967ccdb927ade8b3bd644143` — 01:44:18 — `Fix long instruction page layout` — layout de instruções.
- `03dab4b89a635dfc62490a5596662e053b75dbef` — 01:47:50 — `Prevent schema overflow on instruction pages` — proteção de schema na UI.
- `67190384688617ec5922b72675330c19e73479b0` — 01:50:41 — `Remove duplicate instruction page scrolling` — correção de rolagem.
- `f0d1723d0e4cb2a3ef5a41d58c32ee47aa1ce002` — 02:16:00 — `Update MCP setup documentation` — documentação MCP.
- `8d5f60aed6fb365c5d27088474cab9cfe65f50cb` — 02:16:53 — merge da origem Sites/Cloud no histórico local.
- `90b1d7db7805a67d2cf5491351c10d00215013aa` — 02:51:39 — `Document MCP tools and filters` — documentação inicial das ferramentas.

### 2026-08-15 — proxy, datas, identificadores e conteúdo

- `16010faefd7fd74fa91cd0a53ce50e5282dcdb6b` — 21:19:46 — `Merge Movidesk proxy fixes` — merge do proxy.
- `b510267d81d55e7da84463abae8f3f903a26f4d3` — 21:19:46 — `Fix Movidesk proxy queries and resources` — correção de consultas e recursos.
- `8c9865fc142607ea553d711ff013134fc800f7dd` — 23:33:30 — `Document MCP trailing slash requirement` — barra final obrigatória.
- `2a98fbf8747482eced934b565424c4a557c76298` — 23:36:17 — `Accept Brazilian date formats in ticket search` — datas brasileiras.
- `3e874d8eb154eacad8a19d3a5692e4a25dc98c1d` — 23:44:47 — `Require ticket select fields for list queries` — seleção OData.
- `7c1ba3cdebe143669df48f917d40b9c6d18d80f3` — 23:57:04 — `Update published connector URLs` — URLs publicadas.

### 2026-08-16 — OAuth final, ferramentas de conteúdo e fases 0–3A

- `f6258c6f70e5eef67876b809940634d6199bf7c5` — 00:04:26 — `Refresh OAuth authorization screen` — tela de autorização.
- `523c241eb5ae30552a7ca2391696b4eb2b0d56b8` — 00:14:43 — `Use Movidesk OData UTC date literals` — literais UTC.
- `e05bb184d3c82427f6d1d5302639b3f883464876` — 00:25:43 — `Use direct Movidesk identifiers for ticket lookup` — IDs diretos.
- `4af135373ddf6fea934d0cace1dc4dddba32534f` — 00:28:35 — `Use documented UTC literals for ticket date filters` — filtros UTC documentados.
- `e6f29683fe23a016329bcc94f6360647db679b6b` — 01:11:23 — `Run MCP inside OAuth proxy` — MCP integrado ao proxy.
- `bdaf499db3f05d8b7377b8b25783739e100f6d20` — 01:14:07 — `Support ChatGPT MCP discovery fallback` — fallback de discovery.
- `da9943af32c5a815d781f4f3047789e3a04af88a` — 03:06:07 — `Add ticket content search tool and normalize collection results` — ferramenta de conteúdo MCP.
- `cf0036b971c2fb51a56b558768f3cc561e84bbc7` — 03:42:54 — `Add GPT Action ticket content search` — ferramenta equivalente da Action.
- `c801dc8c736f634a8f01366f5ac3059b3dc04137` — 03:50:20 — `Add default select to ticket content search` — `$select` interno.
- `c8e13d8b454435d155cef11838cfe0684556afe9` — 03:58:25 — `Search ticket actions for content matches` — ações incluídas na busca.
- `41e15051f9b94b1284af732a522359e14ccb213a` — 04:11:55 — `Add characterization tests for stable Movidesk tools` — Phase 0.
- `15238110ea595be913090fba4fdf0a9fcca74082f` — 04:13:54 — `Add isolated analysis query session` — Phase 1.
- `3003855337215ffea6d343532080db9946ab3a65` — 04:18:42 — `Add ticket timeline analysis tool` — Phase 2.
- `a76352bf8c6c487da29e601c2c47fe6acf35c162` — 04:23:48 — merge PR #1 da Phase 0.
- `e2c35af3232d01adec75e273601fb644b06476ed` — 04:24:11 — merge PR #2 da Phase 1.
- `e20c985acced53428209208e27382c2173f631eb` — 04:24:35 — merge PR #3 da Phase 2.
- `b040ef4c30fd6d5d65daf42fe5bf55d407d79ea9` — 04:38:22 — `Fix ticket timeline author attribution` — author aninhado.
- `50d9cf7e877731bc8ade744289573354db167af6` — 04:42:04 — merge PR #4.
- `b788876b4cb244a3953b801adbaee97ab01518c5` — 04:50:45 — `Exclude internal notes from last team response` — nota interna fora de `lastTeamResponse`.
- `56f0a22de755c49fd014ede77f77a99e4bdbc70a` — 04:51:52 — merge PR #5.
- `9a02c29f33202cf6d129678892d4a85deb1fc385` — 05:00:42 — `Classify timeline actors from original metadata` — atores por metadados.
- `32bcb035f250a2a170f62be19921852d25dc26e7` — 05:01:44 — merge PR #6.
- `341bd4253701dfaa7b9faaa78869d2399dac10ec` — 05:22:48 — `Add ticket summary and issue classification tools` — resumo/classificação.
- `bab9c41f0303f78c210f278df80c34400dc2b734` — 05:27:50 — merge PR #7.
- `6fa6de8079c145ffd3bc857e5d112297035c40eb` — 05:43:04 — `Expose analysis tool input schemas` — schemas de análise.
- `9ec1c16060f8fcc7e520666d3a36175d4c65ed24` — 05:45:52 — merge PR #8.
- `a18ff77f2503dae71e2bb7b80bdf986ab04062f2` — 06:02:56 — `Refine Phase 3 semantic analysis` — refinamento semântico.
- `f2faecd3e9f25a9eaaf4b650f598b57361db4bab` — 06:03:43 — merge PR #9.
- `bb596bb09a7932ae4692fb0ab404136eab576184` — 06:34:57 — `Implement deterministic Phase 3A analysis` — análise factual determinística.
- `93b41632129f611041065ac44e75894f490e6d79` — 06:35:42 — merge PR #10.
- `38b47dba71c107a6437f18e8cea16b7ffb7725be` — 06:57:10 — `Fix content search for individual ticket responses` — busca por ticket individual.
- `ee0f36b251685fbab456b39f98db2402999d9f9e` — 06:57:50 — merge PR #11.
- `87f573e4354388882e2fb6a2325f126f9eda0898` — 07:02:10 — `Correct content match origins` — `matchedIn`.
- `5e98e46c1a12badd20bec84d48ebfd6f24c17aef` — 07:02:55 — merge PR #12 e tags de hotfix.
- `a6ee84b73fa8a2e832c1100d2e5e63585ee4a2ed` — 19:27:44 — `Externalize Phase 3A semantic catalog` — catálogo YAML/JSON.
- `a4103bd26a0681e98d2fedf92882d18025cc3b44` — 19:28:57 — merge PR #13.
- `4f136d8e934e76947bc45ed8de7b83d64063424b` — 19:52:49 — `Fix Phase 3A parser and contextual matching` — hotfix contextual.
- `fe9ea6d33d5293166de6e12e22307f8ac99e7cdf` — 19:54:02 — merge do hotfix Phase 3A.

### 2026-09-14 e 2026-09-15 — compatibilidade OAuth e limpeza

- `ae2b5827ecdc735ed27ec934d5c24bf45bfbd76a` — 2026-09-14 17:01:07 — `Fix ChatGPT MCP OAuth compatibility`.
- `0ea35522c481c1d80d94903da0b287a8bda80b30` — 17:13:41 — `Accept ChatGPT loopback OAuth callback`.
- `5a8fa929e2a4afdae0e4ef743206889c3a1f2352` — 2026-09-15 13:54:56 — `Extend OAuth access token validity to 30 days`.
- `d1ae0e77e5200e03c5ef094adf5bf1aabacec46d` — 14:20:02 — `Correct OAuth token route content`.
- `2773b03d935e5efc9be53eb8499deb7528df1447` — 14:34:51 — merge PR #15 do OAuth.
- `3f2c3d72125b4aab4115a76de3e9d69d5ae9faba` — 14:47:07 — `Extend OAuth access token validity to 30 days` na branch `sites/main`.
- `dae3d5f48c641fb2e4c835802ec3566c134f9701` — 19:45:34 — `Remove obsolete Movidesk plugin package`.
- `5cfd52cfe30a01816e9cacb3e7b5173703fc37a8` — 20:00:35 — merge de `origin/main` em limpeza.
- `9f5d045b4c69719ffe2228d4de85e3072fc016f7` — 20:03:30 — `Clean generated artifacts from repository`.
- `25103a91b666f82b103b16007eea8042085b80d5` — 20:04:48 — merge da limpeza.
- `51c0c7f0e95767dd2523223a0761e1301d675b3b` — 20:09:34 — `Ignore generated repository artifacts`.
- `012316659e5b23a95bd5d536c927686dea841a65` — 20:10:31 — merge das regras de ignore.

### 2026-09-15 — Phase 3B, similaridade e ranking

- `f7dd7484bfbe161d86be9e2b01fa81a13c1de48e` — 20:18:57 — `Implement Phase 3B similar ticket search`; base da Phase 3B.
- `b69d067a22187b917ddda0f6899f0065a6c87fde` — 20:20:56 — merge PR #18.
- `cc890a4d42553f5ef5fe23eeeb5755887d72ba7b` — 20:41:28 — `Fix similar ticket ID query and pagination metadata`.
- `2521b6e50fd2ce01c4141010b2fc544441b3b0cc` — 20:42:18 — merge PR #19.
- `a9f01193eabe2411c30a8165f4af6bbbc79fd05a` — 20:48:52 — `Fix ID-based similar ticket matching`.
- `08205e72170cac51c9bc087771901c5791d9fee0` — 20:49:40 — merge PR #20.
- `ab326392089e1b1cf96a1424e286c9da953849ef` — 20:56:53 — `Improve similar ticket relevance ranking`.
- `8beba206512681b926357de80120df219485f771` — 20:59:15 — merge PR #21.
- `776d7fa91c514704d10331ba709ecb7d862add40` — 21:08:07 — `Harden similarity tokenization and single-word search`.
- `d395eda8318c4becad0873bcab925fa1f70bd8fa` — 21:08:58 — merge PR #22.
- `eac2816b52a1bbb37bc7b30c170125076bfa98ad` — 21:22:18 — `Refine similar search errors and token filtering`.
- `69e37ada751a8e47022b670c627ba26379c6664d` — 21:23:04 — merge PR #23.
- `0d93577a475cfc64f8546f33727bc9dafe49f335` — 22:02:53 — `Add field provenance to similar ticket signals`.
- `e27d53dc6a6763b289aa2a387502941d74f801ee` — 22:03:40 — merge PR #24.
- `086f4f51fc61b7c479024a8ea53e59eb2901c745` — 22:16:54 — `Clean action noise and classify similarity signals`.
- `5ca2019e23da51974a980a73889c5edf4e5beaa1` — 22:17:42 — merge PR #25.
- `84cb7117e570a0ee626bde3db60e7b38947860e2` — 22:23:38 — `Classify and clean action noise in similarity`.
- `1b650d7ca519343ba64fc4062f9d48a82cb81c3f` — 22:24:25 — merge PR #26.
- `b58ce65e5ec60150e4d3ac9f36d5be1fa3467e7f` — 22:32:33 — `Implement complete similarity action classification`.
- `928133275f364b5640599cbc7029c8f9bd148b7e` — 22:33:20 — merge PR #27.

### 2026-09-16 — recorrência, catálogo, documentação e hotfix final

- `0013a2fe9b4d3ad93867f438cbf73e86b96dd4fe` — 00:31:20 — `Filter generic dialogue from technical action signals`.
- `4693f7bdeb252f30c49165ce5564f35c2609380b` — 00:32:07 — merge PR #28.
- `5008da69b44afe65dbbb7a6378c75e4105efa540` — 00:43:52 — `Implement recurrent issue detection`.
- `c7d3def7956bc203dbc5e474fc00716de0665e48` — 00:44:42 — merge PR #29.
- `c43fd955dfe5e50cf25d77cfa871737d10bb8de3` — 01:15:06 — `Centralize semantic catalog policy`.
- `834db9c6bccd5ad230d8c3c196804fb865ce6f6e` — 01:15:54 — merge PR #30.
- `871be7f5da7f6a597462828a183e17c7465e8663` — 01:27:44 — `Refine semantic noise and confidence rules`.
- `e624c645c691cde01936b31ce4a6dcb877949305` — 01:28:31 — merge PR #31.
- `5385d39345d8119dc56a9f63178da8fcaca5f372` — 01:34:24 — `Prevent recurrent issue detection timeouts`.
- `541cae5087b23db4f87dc56d852d91150910176e` — 01:35:12 — merge PR #32.
- `0b1c2058a1a1c9d492bae48dd5dc6115c9ff1199` — 01:50:50 — `Expand recurrent issue explainability`.
- `098f2bd1fb67566132f13f54e3c22bb815a3d2c6` — 01:51:38 — merge PR #33.
- `806c6cdf193139c28909df85b614e2b2aabedf96` — 01:55:51 — `Update MCP documentation and tool instructions`.
- `31adf336a53b6b505e2c12b86bf5f2a587890ad5` — 01:56:46 — merge PR #34 na `main`; base da publicação Sites versão 65.
- `5748c2f393564b6c51e01bf28e050f7a03d80d82` — 06:52:05 — `Fix recurrent issue trend consistency`; head atual da branch `codex/phase3b-similarity`, PR #35 aberta e merge não confirmado.

## Auditoria de estado por marco

| Marco | Evidência local/remota | Estado registrado |
|---|---|---|
| Código da ferramenta de recorrência | commits `5008da6`, `5385d39`, `0b1c205`, `5748c2f` | Confirmado |
| Catálogo semântico centralizado | commit `c43fd95`, merge #30 | Confirmado |
| Documentação MCP atualizada | commit `806c6cd`, merge #34 | Confirmado |
| Site versão 65 | commit `31adf33`, versão 65 | Confirmado para essa versão |
| Correção de tendência | commit `5748c2f` | Confirmada na branch; não confirmada na `main` |
| PR #35 | PR aberta com head `5748c2f` | Confirmado aberta; merge não confirmado |
| Deploy posterior a `5748c2f` | não há confirmação registrada | Não verificado |
| Manifesto real do conector após PR #35 | não há resposta `tools/list` registrada | Não verificado |

## Como interpretar este dossiê

- Horário de commit é horário autoral do Git, não necessariamente horário do teste manual ou do deploy.
- Mensagem de merge identifica integração no Git, mas não prova que o Sites recebeu aquela revisão.
- Versão Sites identifica o artefato publicado, mas não prova que o usuário reconectou o MCP ou recebeu manifesto novo.
- Avaliação do usuário é evidência de comportamento observado no cliente; não substitui teste unitário nem confirmação de código.
- Ausência de registro significa “não verificado”, nunca “não aconteceu”.

## Inventário retroativo das fontes fornecidas pelo usuário

Estas fontes foram mencionadas na conversa e devem ser tratadas como evidência contextual, não como arquivos automaticamente autorizados para alteração:

- `D:\Downloads\analise_movidesk_validacoes_correcoes.md` — diagnóstico inicial e validações/correções.
- `D:\Downloads\projeto_mcp_movidesk_avancado_atualizado.md` — proposta de arquitetura e fases.
- `C:\Users\mrg78\.codex\attachments\13b3c80b-a563-46dc-9624-67fbb1783677\pasted-text.txt` — correção de `description` em actions.
- `C:\Users\mrg78\.codex\attachments\d8a6290e-f622-4df0-a60f-042c2055826b\pasted-text.txt` — ajuste adicional do endpoint de ticket content.
- `C:\Users\mrg78\.codex\attachments\99212563-de75-4ea0-b837-fc1c13b86b0b\pasted-text.txt` — reteste parcial da timeline e `lastTeamResponse`.
- `C:\Users\mrg78\.codex\attachments\9129a2b6-81a0-493a-955f-bd5b0363a6ab\pasted-text.txt` — refinamento semântico de timeline, resumo e classificação.
- `C:\Users\mrg78\.codex\attachments\6922db3a-c8ce-484e-9d5e-d17f4f610dde\pasted-text.txt` — objetivo de transformação da Phase 3A.
- `C:\Users\mrg78\.codex\attachments\25c10194-563d-4e34-a1a3-7cbfdd7c67d2\pasted-text.txt` — evolução do catálogo semântico YAML.
- `C:\Users\mrg78\.codex\attachments\d9810112-4508-4454-a8a3-5a617ac3d41a\pasted-text.txt` — avaliações do hotfix 3A.
- `C:\Users\mrg78\.codex\attachments\e09f7bec-cc7f-4bb8-862d-29304db29f05\pasted-text.txt` — segunda rodada de correções da Phase 3A.
- `C:\Users\mrg78\.codex\attachments\391cf941-0055-4dad-96c7-7aebef6c0a7e\pasted-text.txt` — reteste ampliado de similaridade.
- `C:\Users\mrg78\Documents\Codex\2026-09-15\da-u\outputs\direcionamento-ajustes-tickets-similares.md` — direcionamento de ranking e ruído.
- `D:\Downloads\movidesk_semantic_models_1.1.yaml` — proposta de catálogo semântico revisado.
- `C:\Users\mrg78\AppData\Local\Temp\codex-clipboard-0f5d909d-93a3-445c-ac7d-a35a0ad0adbe.png` — screenshot de estado do Git e limpeza de plugin.

Regra: se uma dessas fontes não estiver disponível no workspace atual, seu conteúdo só pode ser usado na medida em que foi efetivamente fornecido na conversa; não presumir que o arquivo continua acessível.

## Ledger de versões do Sites

As versões abaixo foram registradas durante a conversa e vinculadas aos SHAs conhecidos:

- **Versão 61** — `834db9c6...` — merge da centralização do catálogo semântico (PR #30).
- **Versão 62** — `e624c645...` — merge do refinamento de ruído/confiança (PR #31).
- **Versão 63** — `541cae508...` — merge da correção de timeout de recorrências (PR #32).
- **Versão 64** — `098f2bd1...` — merge da explicabilidade de recorrências (PR #33).
- **Versão 65** — `31adf336...` — merge da documentação MCP (PR #34), última publicação confirmada anterior ao commit `5748c2f`.
- **Versão posterior ao commit `5748c2f`** — não confirmada; não declarar publicada até existir registro Sites com SHA correspondente.

## Ledger de PRs e integração

- PRs #1–#3 integraram as Phases 0, 1 e 2 em sequência.
- PR #4 corrigiu atribuição de autor na timeline.
- PR #5 excluiu notas internas de `lastTeamResponse`.
- PR #6 classificou atores por metadados originais.
- PR #7 introduziu resumo e classificação.
- PR #8 expôs schemas de entrada das ferramentas analíticas.
- PR #9 refinou semântica da Phase 3.
- PR #10 implementou análise factual determinística da Phase 3A.
- PR #11 corrigiu busca de conteúdo para ticket individual.
- PR #12 corrigiu a origem de `matchedIn`.
- PR #13 externalizou o catálogo semântico.
- Hotfix posterior corrigiu parser/contexto da Phase 3A.
- PR #15 estendeu validade do token OAuth; também houve commit correspondente em `sites/main`.
- PR #18 iniciou a Phase 3B de similaridade.
- PRs #19–#28 corrigiram, em incrementos, ID, paginação, ranking, tokenização, erros, proveniência e ruído de ações.
- PR #29 implementou recorrências.
- PR #30 centralizou a política semântica.
- PR #31 refinou ruído semântico e confiança.
- PR #32 corrigiu timeouts de recorrência.
- PR #33 ampliou explicabilidade de recorrências.
- PR #34 atualizou documentação e instruções MCP.
- PR #35 contém a correção final da tendência, mas seu merge ainda não foi confirmado neste registro.

## Snapshot do repositório na última auditoria

- Raiz: `D:\Google Drive\Documents\ChatGPT\MCP Movidesk`.
- Branch local: `codex/phase3b-similarity`.
- HEAD local/remoto da branch: `5748c2f393564b6c51e01bf28e050f7a03d80d82`.
- `origin/main`: `31adf336a53b6b505e2c12b86bf5f2a587890ad5`.
- `master` local aponta para uma revisão antiga (`a4103bd`) e está atrás de `origin/main`.
- `sites/main`: `3f2c3d72125b4aab4115a76de3e9d69d5ae9faba`.
- Mudanças pré-existentes não pertencentes ao hotfix: páginas de UI/OAuth, `pnpm-workspace.yaml`, `source-bundle`, `public/beta-logo.svg` e `app/integration-status.ts` quando presentes no working tree.
- `AGENTS.md` e `DOSSIER.md` foram criados/expandidos localmente e ainda precisam de commit próprio, caso o usuário autorize.

## Lacunas verificadas nesta revisão

1. Não há timestamp confiável de cada mensagem do usuário; só há ordem conversacional.
2. O merge de PR #35 não foi confirmado na API/CLI do GitHub.
3. Não há versão Sites confirmada para o commit `5748c2f`.
4. Não há resposta `tools/list` do conector real posterior à versão 65.
5. Não há evidência de que o ChatGPT tenha atualizado o manifesto depois de uma reconexão recente.
6. Os arquivos externos listados acima não foram automaticamente reprocessados nesta auditoria; os fatos foram reconstruídos do conteúdo disponível na conversa e do Git.
7. A presença de alterações de UI no working tree não foi atribuída a uma fase funcional sem evidência de commit/PR.

## Próximo pacote de evidências recomendado

Quando o usuário autorizar a próxima integração, coletar e registrar em uma única entrada:

- `git rev-parse HEAD` e `git rev-parse origin/main`;
- `git status --short` antes do commit;
- SHA completo do commit e do merge;
- URL/estado da PR;
- comando e saída resumida dos testes;
- comando e saída do build;
- validação do catálogo;
- versão Sites salva e SHA da fonte;
- deployment ID, estado terminal e URL;
- manifesto MCP obtido por `tools/list` ou equivalente;
- teste funcional pós-deploy de `movidesk_detect_recurrent_issues`;
- rollback disponível e revisão anterior.

## Cruzamento commit → decisões dos prompts

Esta seção expande cada commit do ledger anterior com a decisão do usuário que o motivou ou, quando não há correspondência textual segura, identifica explicitamente a ausência de decisão direta. `Direta` significa que o prompt pediu aquele resultado; `Contextual` significa que o commit implementa uma regra estabelecida em conjunto; `Sem decisão explícita` significa que o commit existe no Git, mas o prompt correspondente não foi localizado no histórico disponível.

### Fundação OAuth, Site e superfícies de integração

- `0e19146` — **Direta:** criar o proxy OAuth PKCE como base protegida do projeto.
- `212be99` — **Contextual:** permitir callbacks necessários ao fluxo de autenticação usado pelo Codex/ChatGPT.
- `d47b537` — **Contextual:** corrigir discovery OAuth e manter identificação visual coerente.
- `104c96f` — **Contextual:** melhorar a experiência visual sem alterar o contrato de autenticação.
- `df0a4f5` — **Contextual:** administrar usuários autorizados para limitar acesso ao Movidesk.
- `cbfbaaf` — **Contextual:** permitir revogação controlada por usuário mestre.
- `b608bd8` — **Contextual:** endurecer administração e alinhar metadados OAuth.
- `f011d62` — **Direta:** separar cliente OAuth de GPT Action e cliente OAuth de MCP, pois as superfícies não são equivalentes.
- `049c877` — **Direta:** documentar configuração da GPT Action e seus parâmetros.
- `8588281` — **Direta:** documentar configuração do MCP e seu fluxo PKCE.
- `08fa7ae` — **Direta:** usar rota dedicada para configuração do MCP, sem misturar a página da Action.
- `4e00481` — **Direta:** dar às GPT Actions novas formas de pesquisa equivalentes às capacidades desejadas no MCP.
- `1c00e11` — **Contextual:** manter a página de instruções utilizável apesar do conteúdo extenso.
- `03dab4b` — **Contextual:** impedir que schemas longos quebrem a interface de configuração.
- `6719038` — **Contextual:** remover rolagem duplicada sem alterar instruções ou contrato.
- `f0d1723` — **Direta:** atualizar documentação do MCP depois das mudanças de conexão.
- `8d5f60a` — **Sem decisão explícita:** merge técnico de origem Sites/Cloud; não foi localizado prompt específico para esse merge.
- `90b1d7d` — **Direta:** documentar ferramentas MCP, filtros e forma de utilização.

### Proxy, datas e consulta básica

- `16010fa` — **Contextual:** integrar correções do proxy sem mudar o escopo somente leitura.
- `b510267` — **Contextual:** corrigir consultas e recursos do proxy, preservando acesso autorizado.
- `8c9865f` — **Direta:** deixar claro que o endpoint MCP exige `/mcp/` com barra final.
- `2a98fbf` — **Direta:** aceitar formatos brasileiros de data porque os testes usavam datas locais.
- `3e874d8` — **Direta:** fornecer `$select` adequado para listagens OData.
- `7c1ba3c` — **Contextual:** atualizar URLs publicadas sem confundir raiz OAuth com endpoint MCP.
- `f6258c6` — **Contextual:** atualizar a tela de autorização mantendo PKCE e escopo de leitura.
- `523c241` — **Direta:** usar literais de data UTC compatíveis com Movidesk.
- `e05bb18` — **Direta:** consultar ticket por identificador direto, sem converter indevidamente para protocolo.
- `4af1353` — **Direta:** manter filtros de data usando literais UTC documentados.
- `e6f2968` — **Direta:** executar MCP dentro do proxy OAuth para evitar hop desnecessário.
- `bdaf499` — **Contextual:** suportar fallback de discovery necessário ao cliente ChatGPT.

### Conteúdo, Actions e fases iniciais

- `da9943a` — **Direta:** criar `movidesk_search_ticket_content` e normalizar resultados de coleção.
- `cf0036b` — **Direta:** criar a capacidade equivalente de busca de conteúdo na GPT Action.
- `c801dc8` — **Direta:** encapsular `$select` internamente porque o schema não expunha esse detalhe ao chamador.
- `c8e13d8` — **Direta:** pesquisar também ações/interações, não apenas assunto e descrição inicial.
- `41e1505` — **Direta:** iniciar Phase 0 com testes de caracterização para proteger ferramentas estáveis.
- `1523811` — **Direta:** iniciar Phase 1 com camada de análise limitada e determinística.
- `3003855` — **Direta:** iniciar Phase 2 com ferramenta de timeline, preservando o ticket original.
- `a76352b` — **Direta:** mesclar Phase 0 após revisão e testes.
- `e2c35af` — **Direta:** mesclar Phase 1 após revisão e testes.
- `e20c985` — **Direta:** mesclar Phase 2 após revisão e testes.

### Timeline, resumo e classificação

- `b040ef4` — **Direta:** corrigir `action.createdBy` para não retornar `[object Object]`.
- `50d9cf7` — **Direta:** mesclar a correção de atribuição de autor.
- `b788876` — **Direta:** excluir notas internas `type=1` de `lastTeamResponse`.
- `56f0a22` — **Direta:** mesclar a correção de resposta pública da equipe.
- `9a02c29` — **Direta:** classificar atores usando metadados originais, sem depender somente de `origin`.
- `32bcb03` — **Direta:** mesclar a classificação de atores.
- `341bd42` — **Direta:** criar resumo e classificação factuais como ferramentas adicionais.
- `bab9c41` — **Direta:** mesclar resumo e classificação.
- `6fa6de8` — **Direta:** expor `ticket_id` e `protocol` no schema MCP, mantendo XOR no runtime.
- `9ec1c16` — **Direta:** mesclar o ajuste dos schemas sem alterar a lógica interna.
- `a18ff77` — **Direta:** refinar semântica, evidências, hipóteses e confiança sem inferir causa raiz.
- `f2faecd` — **Direta:** mesclar o refinamento semântico.
- `bb596bb` — **Direta:** transformar Phase 3A em análise factual determinística.
- `93b4163` — **Direta:** mesclar a implementação factual da Phase 3A.

### Busca de conteúdo e `matchedIn`

- `38b47db` — **Direta:** corrigir busca de conteúdo em ticket individual, preservando outras ferramentas.
- `ee0f36b` — **Direta:** mesclar essa correção para teste.
- `87f573e` — **Direta:** fazer `matchedIn` refletir a origem real entre `subject`, `initialDescription` e `interactions`.
- `5e98e46` — **Direta:** mesclar e marcar o hotfix de origem de match.

### Catálogo semântico e hotfixes 3A

- `a6ee84b` — **Direta:** externalizar o catálogo semântico em YAML com snapshot JSON.
- `a4103bd` — **Direta:** mesclar a centralização do catálogo.
- `4f136d8` — **Direta:** corrigir parser/contexto da Phase 3A sem tocar no restante validado.
- `fe9ea6d` — **Direta:** mesclar o hotfix contextual.
- `ae2b582` — **Contextual:** corrigir compatibilidade OAuth observada no uso do MCP.
- `0ea3552` — **Contextual:** aceitar callback loopback do ChatGPT.
- `5a8fa92` — **Direta:** ampliar validade do token OAuth, sem confundir isso com publicação do MCP.
- `d1ae0e7` — **Contextual:** corrigir conteúdo da rota de token OAuth.
- `2773b03` — **Direta:** mesclar o ajuste OAuth.
- `3f2c3d7` — **Contextual:** refletir no Sites a alteração de validade do OAuth.
- `dae3d5f` — **Direta:** remover plugin Movidesk obsoleto conforme decisão explícita do usuário.
- `5cfd52c` — **Contextual:** ressincronizar limpeza com `origin/main`.
- `9f5d045` — **Direta:** limpar artefatos gerados do repositório sem remover trabalho válido.
- `25103a9` — **Direta:** mesclar a limpeza.
- `51c0c7f` — **Direta:** adicionar regras para ignorar artefatos gerados.
- `0123166` — **Direta:** mesclar as regras de ignore.

### Phase 3B — similaridade

- `f7dd748` — **Direta:** iniciar Phase 3B com `find_similar_tickets`.
- `b69d067` — **Direta:** mesclar a primeira versão da similaridade.
- `cc890a4` — **Direta:** corrigir query por ID e preservar metadados de paginação após o HTTP 414.
- `2521b6e` — **Direta:** mesclar a correção de ID/paginação.
- `a9f0119` — **Direta:** fazer o caminho `ticket_id` usar o conteúdo do ticket como referência real.
- `08205e7` — **Direta:** mesclar a correção do matching por ID.
- `ab32639` — **Direta:** melhorar ranking, removendo influência excessiva de termos institucionais.
- `8beba20` — **Direta:** mesclar a melhoria de relevância.
- `776d7fa` — **Direta:** corrigir tokenização e busca por palavra única como `máquina` e `erro`.
- `d395eda` — **Direta:** mesclar a correção de tokenização.
- `eac2816` — **Direta:** tratar erros upstream e filtrar tokens inválidos.
- `69e37ad` — **Direta:** mesclar o tratamento de erros e filtros.
- `0d93577` — **Direta:** incluir campo de origem dos sinais em `signalDetails`.
- `e27d53d` — **Direta:** mesclar a explicabilidade de sinais.
- `086f4f5` — **Direta:** limpar ruído de ações e classificar sinais antes de ponderar.
- `5ca2019` — **Direta:** mesclar a limpeza inicial de actions.
- `84cb711` — **Direta:** separar ações técnicas, operacionais e ruído.
- `1b650d7` — **Direta:** mesclar essa separação.
- `b58ce65` — **Direta:** completar a classificação semântica de ações, incluindo disclaimers, contatos e diálogo genérico.
- `9281332` — **Direta:** mesclar a classificação completa.
- `0013a2f` — **Direta:** filtrar pronomes, nomes e respostas genéricas de sinais técnicos.
- `4693f7b` — **Direta:** mesclar o filtro de diálogo genérico.

### Phase 3C — recorrências

- `5008da6` — **Direta:** implementar `movidesk_detect_recurrent_issues` após levantamento dos últimos 100 tickets.
- `c7d3def` — **Direta:** mesclar a primeira implementação de recorrências.
- `c43fd95` — **Direta:** centralizar política semântica em catálogo, sem listas espalhadas no código.
- `834db9c` — **Direta:** mesclar a centralização semântica.
- `871be7f` — **Direta:** refinar stopwords, boilerplate contextual e confiança baseada em evidências independentes.
- `e624c64` — **Direta:** mesclar o hotfix semântico.
- `5385d39` — **Direta:** corrigir timeout com limite de candidatos e concorrência controlada.
- `541cae5` — **Direta:** mesclar a correção de timeout.
- `0b1c205` — **Direta:** ampliar explicabilidade com tendência, distribuição, dimensões e qualidade de amostra.
- `098f2bd` — **Direta:** mesclar a explicabilidade.
- `806c6cd` — **Direta:** atualizar README e instruções de uso de todas as ferramentas.
- `31adf33` — **Direta:** mesclar documentação na `main`; publicação Sites versão 65 foi registrada depois.
- `5748c2f` — **Direta:** corrigir direção de tendência a partir de `deltaPercentage`, preservar contrato, excluir falhas de enriquecimento de grupos e adicionar testes completos; PR #35 foi aberta, mas merge/deploy não foi confirmado.

## Decisões que ainda não viraram commit

- **Direta:** criar e manter `AGENTS.md` como instrução obrigatória do repositório.
- **Direta:** criar e ampliar `DOSSIER.md` como dossiê histórico e operacional.
- **Direta:** registrar uma linha por prompt e agora relacionar cada commit às decisões.
- **Não publicado:** o pedido de commit/PR/deploy da documentação ainda não foi autorizado nesta rodada.
- **Não verificado:** o merge da PR #35 continua pendente no registro.

## Pacote de contexto externo para LLM

Esta seção é uma visão compacta e autossuficiente para uma LLM que não recebeu a conversa original. Ela não substitui as evidências detalhadas acima, mas reduz o risco de interpretar o projeto como um MCP genérico.

### O que este projeto é

Um MCP de leitura para Movidesk, hospedado em Sites, protegido por OAuth/PKCE, com ferramentas de consulta e análise de tickets. O projeto não é um sistema de edição de tickets, não é apenas um OAuth proxy e não é apenas uma GPT Action. O mesmo domínio pode servir várias superfícies, porém cada uma possui contrato próprio.

### O que este projeto não deve fazer

- não alterar tickets, comentários, status, responsáveis ou dados do Movidesk;
- não publicar uma ferramenta sem confirmar manifesto, endpoint e versão;
- não tratar a raiz OAuth como endpoint MCP;
- não afirmar que push, PR ou release equivalem a deploy;
- não introduzir listas semânticas locais quando a regra pertence ao catálogo;
- não considerar texto administrativo, nota interna ou metadado institucional como evidência do problema;
- não retornar amostras truncadas como se fossem o universo completo;
- não expor tokens, PII, URLs assinadas ou transcripts sensíveis.

### Estado operacional conhecido na última auditoria

| Item | Estado | Evidência/limitação |
|---|---|---|
| Código local | `codex/phase3b-similarity`, HEAD `5748c2f...` | snapshot registrado; confirmar antes de agir |
| `origin/main` | `31adf33...` | pode estar atrás da branch funcional |
| Site | versão 65 baseada em `31adf33` | nenhum deploy posterior confirmado |
| PR #35 | aberta para recorrência/tendência | merge e deploy não confirmados |
| MCP | endpoint `/mcp/` | manifesto/conexão devem ser revalidados após publicação |
| Documentação | `AGENTS.md` e `DOSSIER.md` locais | ainda não presumir commit/deploy |

### Grafo de dependências funcional

```text
Movidesk OData
   -> consulta/paginação/data/identificador
   -> timeline factual
      -> resumo e classificação
      -> busca de conteúdo
      -> similaridade
      -> recorrências
Catálogo YAML -> validação -> snapshot JSON -> filtros/aliases/sinais/políticas
OAuth/PKCE -> acesso de leitura -> MCP/REST -> manifesto/cliente -> smoke test
```

Uma alteração em uma seta não deve ser presumida como alteração em todas as outras. Por exemplo, mudar OAuth não atualiza automaticamente o manifesto; mudar o catálogo não autoriza mudar a semântica de todas as ferramentas sem testes.

### Mapa de decisão por ferramenta

| Ferramenta | Pergunta que responde | Evidência mínima | Falha que não pode reaparecer |
|---|---|---|---|
| `get_ticket` | qual é o ticket solicitado? | ID/protocolo e 404 estruturado | converter ID incorretamente ou tocar contrato estável |
| `search_tickets` | quais tickets atendem filtros? | datas, filtros e paginação | misturar data local/UTC ou perder filtros |
| `list_open_tickets` | quais tickets estão abertos? | envelope `results` válido | `structuredContent` incompatível |
| `search_ticket_content` | onde o termo aparece? | `matchedIn`, contexto e ações | exigir `$select` ao caller ou marcar ação como descrição |
| `get_ticket_timeline` | como a história ocorreu? | ordem, autor, origem e atribuição | nota interna virar resposta pública |
| `summarize_ticket` | o que é fato, ação, pendência e hipótese? | evidências e confiança | inferir causa raiz sem base |
| `classify_ticket_issue` | qual problema é mais compatível? | categoria oficial e evidências | confiança alta por metadado genérico |
| `find_similar_tickets` | quais tickets são semelhantes? | referência, ranking e sinais | 414, `object`, ruído ou ticket de origem |
| `detect_recurrent_issues` | quais padrões se repetem? | grupos, tendência e amostra | timeout, tendência contraditória ou grupo inventado |

### Máquina de estados de entrega

```text
pedido
  -> escopo validado
  -> reprodução/caracterização
  -> implementação em branch
  -> testes locais
  -> diff revisado
  -> commit
  -> push
  -> PR aberta
  -> merge na branch-alvo
  -> build/deploy Sites
  -> manifesto/conexão reconectados
  -> smoke test publicado
```

Cada seta exige evidência própria. Se o fluxo parar, o estado anterior continua válido e o próximo deve ser declarado `não verificado`, nunca inferido.

### Critérios para aceitar uma mudança

Uma mudança é aceitável somente quando: (a) a causa do defeito está caracterizada; (b) o diff está dentro do escopo; (c) os invariantes protegidos continuam passando; (d) novos casos de regressão estão cobertos; (e) a saída mantém o contrato; (f) erros técnicos continuam distinguíveis de resultado vazio; (g) a documentação informa limitações; e (h) publicação, se solicitada, foi confirmada por evidência direta.

### Checklist de encerramento de uma fase

- objetivo e decisão registrados;
- branch e baseline identificados;
- ferramentas impactadas e protegidas listadas;
- testes de sucesso, vazio, erro, paginação e limites executados;
- catálogo semântico validado quando aplicável;
- build concluído ou limitação explicada;
- PR, merge e deploy separados no ledger;
- manifesto e smoke test pós-publicação confirmados;
- rollback identificado;
- pendências preservadas no dossiê.

## Índice de manutenção do contexto

Atualizar o dossiê em três momentos distintos:

1. **Planejamento:** adicionar a decisão, escopo, risco e critério de aceite.
2. **Implementação:** adicionar commit, testes, arquivos alterados e arquivos protegidos.
3. **Entrega:** adicionar PR, merge, versão Sites, SHA publicado, manifesto, smoke test e limitações.

Se uma etapa não ocorreu, registrar explicitamente “não ocorreu” ou “não verificado”. Nunca apagar uma entrada antiga para fazer o histórico parecer linear; corrigir com uma nova entrada que a torna obsoleta ou atualiza seu estado.

## Catálogo detalhado de autotestes e execuções

### Princípio de evidência

Os testes deste repositório são predominantemente unitários, contratuais e de caracterização. Eles verificam funções, registro de ferramentas, schemas, envelopes e regras semânticas com fixtures controlados. Não substituem o smoke test no MCP publicado, a reconexão do plugin, a verificação do manifesto, a consulta autorizada ao Movidesk nem a confirmação do deployment no Sites.

### Inventário por arquivo

#### `tests/mcp-tools.characterization.test.ts`

Protege o registro das ferramentas e os contratos das consultas e análises. Inclui: recorrência (tendências, filtros, paginação, truncamento, enriquecimento parcial e vazio), similaridade por conteúdo/ID/keyword, ausência de transcript em query, erros estruturados, ranking, remoção de metadados institucionais, ausência de `object`, classificação de actions, timeline aditiva, busca de tickets, ticket individual, listagem aberta, busca de conteúdo e pessoas/serviços.

#### `tests/movidesk-analysis.test.ts`

Protege o limite de chamadas da sessão analítica: cache de consultas idênticas, janela de requisições sem paralelismo indevido e indicação de análise parcial quando a janela é limitada.

#### `tests/movidesk-timeline.test.ts`

Protege extração de `createdBy`, atribuição de cliente/equipe, nota interna `type=1`, última resposta pública, ausência de resposta pública, regressões de tickets reais, ordenação, `sourceIndex`, campos de ação, anexos, status fechado, ID interno, protocolo longo e 404 controlado.

#### `tests/movidesk-insights.test.ts`

Protege separação entre fatos, ações, pendências, evidências e hipóteses; classificação explicável sem substituir categoria oficial; baixa confiança para histórico vazio/incompleto; schema XOR de `ticket_id`/`protocol`; remoção de pergunta respondida; evidência técnica; Phase 3A com papéis de chat, markup escapado, bot, categorias contextuais e caso factual do ticket 6246.

#### `tests/semantic-catalog.test.ts`

Protege o carregamento do snapshot JSON como conjunto imutável e rejeita metadados obrigatórios ausentes. É a barreira entre catálogo semântico inválido e regras de runtime.

#### `tests/oauth-clients.test.ts`

Protege que GPT Action aceite Authorization Code sem PKCE, que MCP exija PKCE S256 e que clientes, scopes e redirects desconhecidos sejam rejeitados.

#### `tests/rendered-html.test.mjs`

Protege contratos textuais/estruturais das páginas e rotas: página protegida, metadados OAuth, REST read-only, filtros limitados, documentação de Action e MCP, identificadores diretos, datas UTC, execução MCP dentro do proxy e ausência de log de credenciais. Não é teste visual de navegador.

#### `source-bundle/tests/*`

São testes do pacote/source-bundle auxiliar (`auth`, cliente Movidesk e discovery). Não devem ser confundidos automaticamente com a suíte raiz; executá-los somente quando o source-bundle estiver no escopo ou quando o comando do pacote for explicitamente solicitado.

### Comandos históricos e futuros

Comando de análise/contrato usado historicamente:

```text
node_modules/.bin/tsx.cmd --test tests/semantic-catalog.test.ts tests/mcp-tools.characterization.test.ts tests/movidesk-analysis.test.ts tests/movidesk-timeline.test.ts tests/movidesk-insights.test.ts
```

Comandos adicionais para uma verificação completa:

```text
node_modules/.bin/tsx.cmd --test tests/oauth-clients.test.ts
node_modules/.bin/tsx.cmd --test tests/rendered-html.test.mjs
node_modules/.bin/vinext.cmd build
node scripts/validate-semantic-catalog.mjs
```

Comando recomendado antes de PR/merge:

```text
node_modules/.bin/tsx.cmd --test tests/semantic-catalog.test.ts tests/mcp-tools.characterization.test.ts tests/movidesk-analysis.test.ts tests/movidesk-timeline.test.ts tests/movidesk-insights.test.ts tests/oauth-clients.test.ts tests/rendered-html.test.mjs
node_modules/.bin/vinext.cmd build
node scripts/validate-semantic-catalog.mjs
```

O script `npm test` executa `npm run build` e apenas `tests/rendered-html.test.mjs`; portanto, por si só, não substitui a suíte MCP/semântica. O script `npm run validate:semantic-catalog` é o equivalente nomeado para a validação do catálogo. Registrar qual forma foi usada, porque “npm test verde” e “suíte completa verde” não significam a mesma coisa.

### Resultado local mais recente desta atualização documental

Foi executado o comando combinado com os sete arquivos de teste. Resultado: **65 testes, 64 passados, 1 falho**, duração aproximada de 2,1 segundos. O único erro foi `the proxy renders its branded access page`, porque a asserção procura `Acesso seguro|conector`, enquanto `app/page.tsx` atualmente contém a UI autenticada “Suas integrações. Em um só MCP.”. Os demais 64 testes passaram. Essa falha deve permanecer visível até o teste ser alinhado à decisão de UI ou a UI voltar ao contrato anterior; não deve ser mascarada.

### Execução futura por tipo de mudança

| Mudança | Testes mínimos | Testes adicionais |
|---|---|---|
| ferramenta MCP | caracterização + análise afetada | suíte completa, build |
| timeline | timeline + caracterização | insights, suíte completa |
| resumo/classificação | insights + análise | caracterização, catálogo |
| similaridade | caracterização | catálogo, análise, suíte completa |
| recorrência | caracterização | análise, catálogo, suíte completa |
| catálogo YAML/JSON | semantic-catalog | insights, similaridade/recorrência |
| OAuth | oauth-clients | rendered-html, build, smoke publicado |
| UI/README/instruções | rendered-html | build; smoke se endpoint/schema mudou |
| publicação/deploy | suíte relevante local | manifesto, reconexão, smoke MCP e versão Sites |

### Protocolo de smoke test publicado

Após o merge e o deploy, a sequência histórica e recomendada é: confirmar versão/SHA do Site; reconectar ou reautorizar o plugin; consultar o manifesto; conferir schema; executar uma leitura mínima; executar a ferramenta alterada com caso positivo; repetir com vazio/paginação/erro; executar ao menos uma ferramenta protegida. Registrar apenas dados sanitizados. Uma chamada pendente/timeout deve ser reportada com duração aproximada, ausência de resposta, parâmetros não sensíveis e camada em que parou.

### Limites conhecidos dos autotestes

- fixtures não provam cobertura de toda a base Movidesk;
- teste de keyword não prova o caminho por `ticket_id`;
- teste local não prova versão publicada;
- manifesto de uma conexão antiga não prova o código atual;
- retry que recupera 502 prova resiliência observada, não disponibilidade permanente;
- teste sem PII não prova que todos os logs externos estejam sanitizados;
- uma alteração documental pode revelar teste de UI obsoleto sem representar regressão de runtime.

## Revisão operacional — PR #38 e fidelidade do `source-bundle` (2026-10-19)

A PR #38 propõe converter o gitlink `source-bundle` em arquivos comuns do repositório. A comparação revelou que o gitlink do `main` apontava para o commit `5c789e553424d0938649e7433fcb94c11de78ae1`, enquanto a primeira cópia da PR correspondia ao commit anterior `67d07224d9d69934a2e9d9bfe1cbf08033fde61f`. Esses estados diferem em cinco arquivos: `server/index.ts`, `src/movidesk-client.ts`, `src/server.ts`, `src/tools/index.ts` e `tests/movidesk-client.test.ts`.

Para evitar substituir o estado referenciado pelo gitlink por uma revisão anterior, esses cinco arquivos foram atualizados na branch da PR #38 com o conteúdo exato do commit `5c789e5`. Os demais arquivos rastreados da PR foram preservados, incluindo `dist/server/index.js` na versão que pertence ao commit fixado. A alteração local não commitada existente nesse arquivo foi mantida no workspace e ficou fora da PR; dependências instaladas, diretórios de staging e arquivos locais não rastreados também não foram adicionados. A PR permanece aberta, portanto a conversão ainda não está em `main` nem foi mesclada.

A PR #39 contém `AGENTS.md` e este dossiê, e tem como base a branch `codex/vendor-source-bundle` (head da PR #38). Para manter essa dependência coerente, o fluxo é mesclar primeiro a #39 na branch da #38 e, em seguida, mesclar a #38 em `main`. Também é possível retargetar a #39 para `main` depois da #38, mas isso não é necessário para a ordem atual.

A correção da PR não integra `source-bundle` ao runtime do Site: o Site consolidado continua implementando sua própria rota MCP no Worker. Não houve merge ou deploy nesta revisão.

## Verificação arquitetural — `source-bundle` e MCP do Site (2026-10-19)

### Conclusão

O `source-bundle` contém um servidor MCP independente e mais antigo. O Site Beta MCP consolidado implementa a rota MCP em seu próprio Worker e não importa o pacote `source-bundle`. Portanto, o pacote não é a implementação usada pelo código do Site consolidado. A evidência sustenta classificá-lo como legado/duplicado para esse Site, mas não prova que nenhum serviço externo ainda execute uma cópia dele.

### Evidências

- Na fonte do Site publicada na versão 70 (`e25f25d057de902e9ae79aa68a27b79e9d38b582`), `worker/index.ts` chama `handleMcp` para as requisições; `worker/mcp.ts` trata `POST /mcp`, cria o `McpServer` e registra as ferramentas do Site por `registerMovideskTools`; as definições estão em `worker/mcp-tools.ts`.
- O deployment Sites da versão 70 terminou com status `succeeded` em 2026-10-20. O metadado de deployment retornou `has_mcp: false`, ou seja, a plataforma Sites não declara um MCP nativo para esse projeto. Isso não remove a implementação personalizada presente no Worker.
- `source-bundle/server/index.ts` instancia outro servidor, versão `1.0.0`, e `source-bundle/src/tools/index.ts` registra o conjunto de ferramentas desse pacote. O código da aplicação e do Worker do Site não o referencia; o `package.json` raiz tem sua própria dependência do SDK MCP e seu próprio build Vinext.
- A versão publicada ainda tinha o gitlink do submódulo no checkout de origem. Isso registra a presença do pacote no repositório, mas não é uma importação pelo runtime consolidado.

### Limites e decisão pendente

- Não foi possível executar uma chamada HTTP direta de smoke test ao endpoint publicado nesta verificação. A confirmação é da implementação no código-fonte da versão publicada e do estado do deployment, não de uma sessão MCP ativa nem da lista de ferramentas entregue ao cliente.
- Não foi verificado se `source-bundle` está implantado como serviço autônomo fora do Site. Não remover nem desligar eventual serviço externo sem localizar o deployment correspondente.
- A conclusão sobre não ser dependência do Site consolidado não equivale, por si só, à autorização para apagar o diretório/submódulo do repositório. Uma remoção deve ser tratada como mudança Git separada e considerar consumidores externos.
