# MCP Movidesk

Servidor MCP para consulta/análise factual somente leitura no Movidesk e inclusão explícita de cópia de chamados na base interna Supabase, protegido por OAuth 2.0 Authorization Code com PKCE S256.

## Conexões MCP

Cadastre Produção e Homologação como dois servidores/conectores MCP independentes no ChatGPT. O código e as ferramentas são iguais; cada instância tem URL, OAuth, tokens, permissões e D1 próprios.

| Ambiente | Endpoint MCP | Discovery OAuth |
|---|---|---|
| Produção | `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/` | `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/.well-known/oauth-authorization-server` |
| Homologação | `https://beta-mcp-homolog.thngrns.chatgpt.site/mcp/` | `https://beta-mcp-homolog.thngrns.chatgpt.site/.well-known/oauth-authorization-server` |

Homologação é a mesma aplicação em projeto Sites separado, usada para validar alterações antes de integrá-las à `main`. Alterações prontas são publicadas primeiro em Homologação. Um pedido explícito de merge no GitHub inclui, após a PR entrar na `main`, a sincronização e publicação desse mesmo estado em Produção.

Configuração compartilhada do cliente MCP: Client ID `movidesk-mcp-app`; PKCE `S256` obrigatório. Scopes: `movidesk:read` para Movidesk, `knowledge:read` para listar fontes e `knowledge:write` para inclusão explícita de chamados na base. As permissões são pré-cadastradas por e-mail no painel de controle; a tela OAuth informa à pessoa o acesso daquele e-mail e não permite solicitar uma lista de scopes. A autorização de um scope não deve bloquear os demais que estejam liberados. Se um scope for habilitado no painel mas ainda não constar no token, é necessária uma nova autorização para atualizar o token. A ferramenta de inclusão exige `movidesk:read` + `knowledge:write`.

Os Sites têm configuração de runtime independente. Segredos não são copiados entre ambientes nem versionados; Homologação requer seus próprios `MOVIDESK_TOKEN`, `SUPABASE_URL` e `SUPABASE_SECRET_KEY` para executar todas as ferramentas. O binding D1 `DB` e as contas/tokens OAuth são separados.

Mantenha a barra final em `/mcp/`. O servidor não altera tickets, status, responsáveis ou comentários no Movidesk.

## Ferramentas

### Consulta e busca

- `movidesk_get_ticket`: consulta um ticket por `ticket_id` numérico.
- `movidesk_search_tickets`: busca por `id`, `keyword`, período, `date_field`, equipe, status, categoria, serviço, cliente, responsável, urgência e filtros OData. Aceita `top` e `skip`.
- `movidesk_list_open_tickets`: lista tickets não resolvidos para `created_date`, com filtro, ordenação e paginação.
- `movidesk_search_ticket_content`: pesquisa `keyword` no assunto, descrição inicial e ações/interações. Use escopo temporal ou outro filtro. `matchedIn` distingue `subject`, `initialDescription` e `interactions`.
- `movidesk_search_people`: pesquisa pessoas autorizadas. Para nome, prefira `filter` OData, como `contains(businessName, 'Gedore')`.
- `movidesk_list_services`: lista serviços autorizados; informe `id`, `category`, `status`, `owner_team` ou `filter`.

### Base de conhecimento

- `knowledge_list_sources`: lista até dez fontes cadastradas no schema `beta` do Supabase. Exige o scope `knowledge:read`; não consulta o conteúdo dos documentos.
- `knowledge_import_movidesk_ticket`: importa/atualiza um chamado explicitamente indicado pelo analista, preserva ID e proveniência, remove padrões detectáveis de dados pessoais e grava trechos lexicais. Exige `movidesk:read` + `knowledge:write`; gravação é feita por RPC transacional com auditoria, sem privilégios DML diretos nas tabelas.

### Análise de um ticket

- `movidesk_get_ticket_timeline`: organiza ações em eventos cronológicos, preservando `sourceIndex`, autor, origem, tipo, status, anexos, `firstClientManifestation`, `lastTeamResponse` e `terminalStatus`. Aceita exatamente um entre `ticket_id` e `protocol`.
- `movidesk_summarize_ticket`: retorna relato, ações concluídas, pendências abertas, evidências, hipóteses explícitas, confiança e histórico incompleto. Aceita `ticket_id` ou `protocol`.
- `movidesk_classify_ticket_issue`: classifica o problema por sinais explícitos e contexto causal, preservando `officialCategory`. Não infere causa raiz. Aceita `ticket_id` ou `protocol`.

### Análise comparativa

- `movidesk_find_similar_tickets`: encontra tickets semelhantes por `ticket_id` ou `keyword`, usando assunto, descrição, ações técnicas e sinais estruturados. Retorna `similarityScore`, `confidence`, `matchedSignals` e `signalDetails`; exclui a referência.
- `movidesk_detect_recurrent_issues`: agrupa problemas recorrentes em uma janela temporal. Retorna termos, evidências por campo, tendência mensal e direção, status, urgência, categoria, serviço, equipe, clientes distintos, concentração por cliente, exemplos e metadados da amostra. Não afirma causa raiz.

## Regras de uso

- Consultas permanecem somente leitura. A única escrita é a inclusão/atualização explícita de um chamado na base; não altera o ticket no Movidesk.
- Informe escopo temporal em buscas amplas; o detector de recorrências usa o ano corrente por padrão.
- `ticket_id` e `protocol` são alternativas: não envie ambos nas ferramentas de análise.
- `top` e `skip` controlam paginação; em análises agrupadas, `total` representa grupos, não tickets brutos.
- Ausência de correspondência retorna lista vazia. Falhas de autenticação, validação e indisponibilidade são diferenciadas.
- `config/movidesk_semantic_models.yaml` define normalização, aliases, exclusões, desambiguações, pesos e regras de segurança. O snapshot JSON é carregado pelo runtime.

## Configuração da base de conhecimento

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SECRET_KEY`: segredo server-side do Supabase. Nunca o exponha ao cliente, no Git ou em logs. A chave secreta pode ignorar RLS; o backend valida o scope OAuth e a conta ativa antes da consulta. Restrinja os privilégios da chave/tabela ao mínimo necessário.

Verificação de produção em 2026-11-18: o inventário do Site `Beta MCP` lista `SUPABASE_URL` e `SUPABASE_SECRET_KEY`; a chave é segredo e seu valor é mascarado. Uma chamada autenticada `knowledge_list_sources` retornou as três fontes cadastradas (Movidesk, ClickUp e Documentos administrativos). Isso confirma a leitura do catálogo por essa ferramenta neste momento; não valida a busca de conteúdo nem operações de escrita. Nunca exponha nem registre o valor da chave.

## Desenvolvimento local

Requisito: Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
npm run build
npm run validate:semantic-catalog
node_modules/.bin/tsx.cmd --test tests/semantic-catalog.test.ts tests/mcp-tools.characterization.test.ts tests/movidesk-analysis.test.ts tests/movidesk-timeline.test.ts tests/movidesk-insights.test.ts tests/rendered-html.test.mjs tests/oauth-clients.test.ts tests/knowledge-tools.test.ts tests/supabase-knowledge.test.ts
```

## Publicação pelo monorepo

O GitHub (`beta-all`) e o repositório-fonte gerenciado pelo Sites são separados. Depois de abrir um checkout limpo com o helper oficial do Sites, volte à raiz do monorepo e rode:

```bash
npm run sites:sync -- "<checkout_path>" --dry-run
npm run sites:sync -- "<checkout_path>"
```

O sincronizador valida se o checkout Git pertence ao mesmo projeto Sites, sincroniza somente os caminhos de runtime/build e remove obsoletos dentro deles. Preserva `.openai/hosting.json`, Git, arquivos locais ignorados/não rastreados e documentos, testes e históricos existentes no checkout. Depois, o helper oficial executa o build, faz commit/push e empacota; a versão ainda precisa ser salva e implantada pelas ferramentas Sites. O sincronizador não lê nem armazena tokens.

Alterações no catálogo devem atualizar o YAML e o snapshot JSON correspondente, mantendo `schema_version` e `ruleset_version`. Toda regra nova deve ter caso positivo e, quando aplicável, caso negativo.

## Estado do projeto

- Phases 0, 1, 2 e 3A: concluídas.
- Phase 3B: busca semelhante e detecção de recorrências.
- Phase 3C: explicabilidade, evidências rastreáveis, tendências e qualidade da amostra.

As ferramentas analíticas são determinísticas e conservadoras: fatos explícitos têm prioridade, textos administrativos são filtrados e nenhuma causa raiz é inventada.
