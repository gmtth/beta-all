# MCP Movidesk

Servidor MCP somente leitura para consulta e análise factual de tickets do Movidesk, protegido por OAuth 2.0 Authorization Code com PKCE S256.

## Conexão

- Endpoint MCP: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`
- Discovery OAuth: `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/.well-known/oauth-authorization-server`
- Client ID: `movidesk-mcp-app`
- Scopes: `movidesk:read` para Movidesk e `knowledge:read` para listar fontes da base compartilhada.
Para habilitar `knowledge_list_sources`, o cliente MCP precisa solicitar `knowledge:read`; tokens já emitidos precisam ser reautorizados para conceder esse acesso.
- PKCE: `S256` obrigatório

Mantenha a barra final em `/mcp/`. O servidor não grava tickets, altera status, atribui responsáveis ou publica comentários.

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

### Análise de um ticket

- `movidesk_get_ticket_timeline`: organiza ações em eventos cronológicos, preservando `sourceIndex`, autor, origem, tipo, status, anexos, `firstClientManifestation`, `lastTeamResponse` e `terminalStatus`. Aceita exatamente um entre `ticket_id` e `protocol`.
- `movidesk_summarize_ticket`: retorna relato, ações concluídas, pendências abertas, evidências, hipóteses explícitas, confiança e histórico incompleto. Aceita `ticket_id` ou `protocol`.
- `movidesk_classify_ticket_issue`: classifica o problema por sinais explícitos e contexto causal, preservando `officialCategory`. Não infere causa raiz. Aceita `ticket_id` ou `protocol`.

### Análise comparativa

- `movidesk_find_similar_tickets`: encontra tickets semelhantes por `ticket_id` ou `keyword`, usando assunto, descrição, ações técnicas e sinais estruturados. Retorna `similarityScore`, `confidence`, `matchedSignals` e `signalDetails`; exclui a referência.
- `movidesk_detect_recurrent_issues`: agrupa problemas recorrentes em uma janela temporal. Retorna termos, evidências por campo, tendência mensal e direção, status, urgência, categoria, serviço, equipe, clientes distintos, concentração por cliente, exemplos e metadados da amostra. Não afirma causa raiz.

## Regras de uso

- Todas as operações são somente leitura.
- Informe escopo temporal em buscas amplas; o detector de recorrências usa o ano corrente por padrão.
- `ticket_id` e `protocol` são alternativas: não envie ambos nas ferramentas de análise.
- `top` e `skip` controlam paginação; em análises agrupadas, `total` representa grupos, não tickets brutos.
- Ausência de correspondência retorna lista vazia. Falhas de autenticação, validação e indisponibilidade são diferenciadas.
- `config/movidesk_semantic_models.yaml` define normalização, aliases, exclusões, desambiguações, pesos e regras de segurança. O snapshot JSON é carregado pelo runtime.

## Configuração da base de conhecimento

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SECRET_KEY`: segredo server-side do Supabase. Nunca o exponha ao cliente, no Git ou em logs. A chave secreta pode ignorar RLS; o backend valida o scope OAuth e a conta ativa antes da consulta. Restrinja os privilégios da chave/tabela ao mínimo necessário.

Essas variáveis ainda precisam ser configuradas e verificadas no ambiente Sites para habilitar a consulta.

## Desenvolvimento local

Requisito: Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
npm run build
npm run validate:semantic-catalog
node_modules/.bin/tsx.cmd --test tests/semantic-catalog.test.ts tests/mcp-tools.characterization.test.ts tests/movidesk-analysis.test.ts tests/movidesk-timeline.test.ts tests/movidesk-insights.test.ts tests/rendered-html.test.mjs tests/oauth-clients.test.ts tests/knowledge-tools.test.ts tests/supabase-knowledge.test.ts
```

Alterações no catálogo devem atualizar o YAML e o snapshot JSON correspondente, mantendo `schema_version` e `ruleset_version`. Toda regra nova deve ter caso positivo e, quando aplicável, caso negativo.

## Estado do projeto

- Phases 0, 1, 2 e 3A: concluídas.
- Phase 3B: busca semelhante e detecção de recorrências.
- Phase 3C: explicabilidade, evidências rastreáveis, tendências e qualidade da amostra.

As ferramentas analíticas são determinísticas e conservadoras: fatos explícitos têm prioridade, textos administrativos são filtrados e nenhuma causa raiz é inventada.
