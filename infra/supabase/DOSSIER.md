# Dossier do Supabase da Beta

Atualizado em 2026-10-22. Este documento registra o estado conhecido e as evidências disponíveis. O `README.md` contém o resumo operacional; regras de runtime e segurança também estão em `mcp/movidesk/AGENTS.md`.

## Resumo canônico

- Finalidade: base compartilhada de conhecimento para quatro analistas, consultada pelo MCP da Beta.
- Tecnologia escolhida: Supabase PostgreSQL com `pgvector`; Workers acessa a Data API/PostgREST por HTTPS.
- Projeto confirmado: `https://ywqoanfqcbcdecmkguze.supabase.co`.
- Schema criado: `beta`; tabelas observadas: `source_system`, `source_record` e `record_chunk`.
- Fontes iniciais observadas na tabela: Movidesk, ClickUp e Documentos administrativos.
- Inspeção SQL do catálogo recebida em 2026-10-20: RLS estava habilitado em `source_system`, `source_record` e `record_chunk`, sem políticas. Naquele momento havia ACLs DML amplas; a migration `20261020130000` as revogou, e a lista de fontes continuou funcional segundo teste informado pelo usuário. A Data API continua exposta como configuração separada.
- A extensão `vector` está instalada, mas não há coluna vetorial, índice vetorial, função/RPC ou trigger no catálogo observado. A busca atual é lexical: `record_chunk.search_vector` é `tsvector` gerado e usa índice GIN. Há quatro índices no total, incluindo o índice de relacionamento de chunks e índices de classificação/tipo-status.
- MCP: existe a ferramenta `knowledge_list_sources`, protegida por `knowledge:read`, que lista no máximo dez fontes. Em 2026-10-20, o usuário confirmou que a chamada publicada retornou as três fontes cadastradas, validando esse caminho de leitura.
- Inspeção do Sites em 2026-10-20: projeto `Beta MCP`, versão 73, deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`, revisão de variáveis 13. `SUPABASE_URL` e `SUPABASE_SECRET_KEY` aparecem no inventário. O usuário confirmou a rotação da chave e atualização da variável; valor mascarado. A listagem MCP funcionou após o hardening.
- O usuário registrou o baseline `20261020120000` e aplicou o hardening `20261020130000`; screenshot da lista de migrações mostra ambos em Local e Remote. Prévia informou apenas o hardening pendente e a consulta MCP posterior retornou as três fontes.
- Migration `20261020140000_enable_movidesk_knowledge_ingestion.sql` e rollback restrito foram preparados e, conforme screenshot compartilhado pelo usuário em 2026-10-20, a migration foi aplicada remotamente com sucesso. Runtime foi publicado no Sites como versão 74; reautorização dos analistas e registro de chamado continuam pendentes.

## Registro retroativo e qualidade da evidência

Este dossier foi reconstruído em 2026-10-20 a partir do contexto registrado nos documentos ativos da consolidação, do código em `mcp/movidesk/` e do estado de infraestrutura relatado pelo usuário durante a configuração. O resultado SQL do catálogo e a listagem end-to-end via MCP foram fornecidos pelo usuário; o primeiro informa DDL/grants sem dados operacionais e a segunda valida somente a listagem de fontes, não a busca de conteúdo.

Não foram incluídos tokens ou chaves. Uma chave Supabase secreta foi colada anteriormente na conversa e deve ser tratada como comprometida; usar uma chave nova, configurada somente no ambiente protegido do servidor. O valor antigo não deve ser recuperado nem reproduzido.

## Decisões e limites

- O Supabase guarda a cópia indexada para consultas rápidas. Movidesk e ClickUp são fontes de ingestão/rastreabilidade, não dependências síncronas para cada consulta cotidiana.
- OAuth identifica o analista e autoriza capacidades no backend. A chave de serviço Supabase não identifica analistas; não confiar em papéis, e-mails ou IDs fornecidos pelo modelo.
- Como a credencial `service_role` ignora RLS, aplicar autorização, classificação dos documentos, limites e seleção explícita de campos no backend antes de encaminhar contexto ao modelo.
- Separar registros-fonte, trechos de busca e histórico de conversas. Conversas e hipóteses não viram conhecimento confirmado automaticamente.
- Busca final deve combinar lexical e vetorial, aceitar sintomas e contexto de máquinas sem depender de códigos de erro, reranquear evidências e devolver referências às fontes.
- Gravação/atualização de conhecimento exige capacidade separada, validação e trilha de auditoria; `knowledge:read` não a autoriza.

## Prontidão por etapa

| Etapa | Estado | Evidência / condição para concluir |
|---|---|---|
| Projeto Supabase e extensão `vector` | Confirmados pelo catálogo recebido | Extensão instalada; recurso vetorial ainda não está usado nas tabelas |
| Schema e catálogo inicial | Confirmados por catálogo e leitura MCP | DDL/grants recebidos e `knowledge_list_sources` retornou as três fontes; busca de conteúdo não testada |
| RLS, grants e exposição Data API | RLS/grants confirmados pelo catálogo; hardening aplicado conforme histórico CLI compartilhado | `service_role` lê o catálogo sem DML direto; exposição Data API continua configuração separada |
| Migração de baseline | Registrada como aplicada no histórico remoto pelo usuário | Não executou DDL no banco existente; baseline não contém dados |
| Hardening de grants no projeto atual | Aplicado pelo usuário; listagem MCP validada depois | `knowledge_list_sources` retorna as três fontes |
| RPC de ingestão de ticket | Implementada e migration aplicada remotamente pelo usuário em 2026-10-20 | RPC upsert transacional e tabela de auditoria; sem grants DML diretos nas tabelas. Runtime MCP versão 74 publicado; chamada autenticada ainda não testada |
| Credencial do runtime | Leitura atual validada via MCP; usuário confirmou rotação e atualização; valor mascarado | Evidência limitada a `knowledge_list_sources`; nunca no Git/plugin/browser |
| Consulta de catálogo pelo MCP publicado | Passou conforme resultado informado pelo usuário | Após reconectar, `knowledge_list_sources` retornou Movidesk, ClickUp e Documentos administrativos. Isso confirma autorização e leitura via MCP/Sites/Supabase para essa chamada, não a busca de conteúdo |
| Ingestão do chamado piloto | Confirmada em 2026-10-22 | A ferramenta publicada confirmou 14 trechos; consulta SQL do usuário encontrou `external_id = 5835`, `record_type = ticket`, título `[TESTE] CENCI - DATA PRÓXIMA ENTREGA` e 14 chunks. Busca lexical nos trechos confirmou vetores preenchidos e correspondências para vencimento, entrega/quantidade, Perfil-GHE e Thyssenkrupp. |
| Ingestão em lote ClickUp/documentos | Pendente | Definir sincronização incremental, idempotência, remoções/atualizações, retries e quarentena de falhas |
| Busca lexical de trechos | Implementação integrada pela PR #12 e runtime publicado no Sites v101 em 2026-10-22 | CLI confirmou até `20261022110000` em Local e Remote. RPC somente leitura filtra registros apagados e classificação `internal`/`shareable`, limita termos/resultados e devolve no máximo o melhor trecho por registro. MCP exige `knowledge:read`. PR #12 foi mesclada no commit `d18a374`; deployment `appgdep_6ad99a3ae2f081919bfa4a5524a74291` usa a fonte Sites `61589d2e660e5ce4394e417b08fd9a1e36515145`. `knowledge_list_sources` respondeu com três fontes; `knowledge_search` ainda não apareceu no catálogo desta sessão e não foi validada ponta a ponta. |
| Busca semântica/híbrida e contexto consolidado | Pendente | A tabela não possui coluna/índice de embedding e nenhum provedor/modelo foi escolhido. Definir governança do provedor e modelo, dimensão, custo, retenção e geração/reindexação antes de adicionar vetores e reranking. |
| Histórico/telemetria e governança | Pendente | Definir papéis, minimização, retenção, correção/exclusão, backup e recuperação |
| Produção | Não aprovada por este dossier | Revisar limites do plano, backup/restore, disponibilidade, segurança e monitoramento |

## Próximos passos

| Prioridade | Item | Estado / condição para conclusão |
|---|---|---|
| Alta | Reautorizar as contas MCP com os scopes necessários e testar a importação explícita do chamado piloto `20260702000000016`. | Requer runtime publicado com a migration de ingestão e o scope `knowledge:write`; conferir a resposta da ferramenta e os metadados do registro/trechos sem expor dados pessoais. |
| Alta | Validar `knowledge_search` com o chamado piloto em uma chamada real pelo MCP. | PR #12 integrada e runtime publicado no Sites v101; a ferramenta ainda não apareceu no catálogo MCP desta sessão. Confirmar reautorização/atualização do catálogo, executar a chamada autorizada e registrar evidência. |
| Alta | Definir provedor/modelo de embeddings e projetar a busca semântica/híbrida. | Decisão de provedor impacta dados operacionais enviados, segredo server-side, custo, dimensões, latência e reindexação; implementar somente depois de decisão documentada e revisão de classificação. |
| Média | Definir sincronização em lote para ClickUp e documentos administrativos. | Especificar atualização incremental, idempotência, remoções, retries, quarentena e auditoria antes de importar em massa. |
| Média | Fechar política operacional de retenção, backup e recuperação. | Testar exportação e restauração e rever limites/disponibilidade do plano antes de ampliar o piloto. |
| Média | Validar a RPC dos indicadores agregados do painel administrativo, se ainda necessária. | Migration `20261020150000_admin_knowledge_overview.sql` aplicada junto com a busca; validar RPC e painel end-to-end sem retornar conteúdo de tickets. |
| Alta | Validar o navegador administrativo do Supabase de ponta a ponta. | A migration `20261021160000_admin_database_browser.sql` foi aplicada pelo usuário e as RPCs/catalogo/prévias foram conferidos no SQL Editor em 2026-10-22. Falta integrar a branch no GitHub, publicar a versão correspondente somente após merge e validar a página e as rotas HTTP com uma conta master. |

## Busca lexical da base — implementação e migration (2026-10-22)

O usuário forneceu evidência de que `source_record.external_id = '5835'` identifica o chamado piloto e que ele tem 14 trechos; os 14 têm `search_vector` e as consultas SQL encontraram termos do caso. A investigação do catálogo encontrou RPC de ingestão, mas nenhuma RPC de busca. A PR #12 adicionou `beta.search_knowledge()` e a ferramenta MCP `knowledge_search` para fechar essa lacuna; a PR foi mesclada e o runtime correspondente foi publicado no Sites v101.

A RPC filtra fontes inativas, registros excluídos e classificações fora de `internal`/`shareable`, limita a 20 termos e a 10 registros por chamada, e devolve título, sistema, ID de origem, data e o melhor trecho por registro. O runtime valida `knowledge:read` antes da chamada e valida/limita a resposta do PostgREST. **Estado em 2026-10-22:** `supabase db push` aplicou `20261020150000_admin_knowledge_overview.sql`, `20261021160000_admin_database_browser.sql`, `20261022100000_add_knowledge_search.sql` e `20261022110000_rank_one_chunk_per_record.sql`; o histórico CLI posterior confirmou todas em Local e Remote. Uma consulta SQL somente leitura, sem conteúdo dos trechos, retornou o ticket piloto `external_id=5835` para “vencimento Perfil-GHE entrega quantidade”. PR #12 foi mesclada no commit `d18a374`; o runtime foi publicado no Sites v101 (deployment `appgdep_6ad99a3ae2f081919bfa4a5524a74291`, fonte Sites `61589d2e660e5ce4394e417b08fd9a1e36515145`). `knowledge_list_sources` respondeu com as três fontes, mas `knowledge_search` ainda não apareceu no catálogo desta sessão e não foi validada ponta a ponta pelo MCP. Busca vetorial/híbrida segue pendente porque não há coluna de embedding nem provedor/modelo selecionado.

Foram executados 28 testes focados do contrato MCP e do mapeamento RPC, incluindo a verificação de `knowledge:read` no `tools/list` serializado, além do build local. Uma consulta read-only à RPC no Supabase confirmou recuperação de `external_id=5835` e somente metadados; não carregou texto dos trechos. A chamada end-to-end pelo PostgREST através do runtime MCP ainda não foi validada.

Quando algum item for concluído, remova-o desta lista e registre a evidência em `## Prontidão por etapa` ou no histórico apropriado.

## Navegador administrativo do banco — etapa 2 local (2026-10-21)

Implementadas duas RPCs estreitas na migration `20261021160000_admin_database_browser.sql`: catálogo do schema (colunas, chaves, índices, RLS/políticas por nome e comando, grants de roles selecionados e permissões de execução de RPCs) e prévia paginada com cursor por ID, limite máximo de 25 e campos explicitamente permitidos. `record_chunk` retorna somente metadados e não aceita prévia. Incluído rollback que remove somente as duas RPCs.

O runtime adiciona `/api/admin/database/schema` e `/api/admin/database/preview`. Ambas validam sessão ChatGPT e papel master no servidor antes de acessar Supabase; parâmetros de tabela/cursor/tamanho são allowlisted e respostas são validadas/sanitizadas. Erros retornam diagnósticos categorizados sem payload bruto. O RPC usa `service_role` server-side; a página deve explicar que esse papel ignora RLS, mantendo obrigatório o gate master. A migration `20261021160000_admin_database_browser.sql` foi aplicada pelo usuário antes da reconciliação do histórico em 2026-10-22; a consulta ao catálogo confirmou as duas funções. Nesta sessão, a migration foi registrada/aplicada novamente pelo CLI junto com as demais migrations pendentes; a lista remota confirma o histórico alinhado. Ainda não houve deploy nem teste ponta a ponta da página/rotas.

**Verificação registrada à época:** seis testes focados (quatro novos e dois existentes) passaram; `npm run build` passou e incluiu as duas rotas; `git diff --check` passou. Isso valida o contrato e o empacotamento, não a execução PostgreSQL/PostgREST. A aplicação/reconciliação posterior da migration e o teste local atual estão documentados acima.

## Navegador administrativo do banco — interface da etapa 3 (2026-10-22)

A nova rota master-only `/admin/database` exibe seletor das quatro tabelas aprovadas, metadados estruturais, constraints/relações, índices, estado RLS e nomes/comandos das políticas, grants de schema/tabela e roles autorizados a executar RPCs. Oferece prévia paginada para `source_system`, `source_record` e `knowledge_ingest_audit`; `record_chunk` permite consultar estrutura, sem carregar linhas. Inclui resumo dos gates de acesso do Site/MCP e do papel Supabase `service_role`, sem replicar usuários/tokens nem criar métricas. Um link “Banco de dados” aparece na home apenas para masters.

**Verificação local:** build reconhece `/admin/database` e ambas as rotas; seis testes focados passaram; `git diff --check` passou. A suíte de renderização também foi executada: 15 passaram e 1 falhou pela asserção preexistente de texto antigo na home (`Conecte o ChatGPT às ferramentas da sua equipe`), incompatível com o conteúdo atual já documentado; esta etapa não alterou essa asserção.

**Validação Supabase remota (2026-10-22):** o usuário aplicou a migration no projeto de ref `ywqoanfqcbcdecmkguze`. O catálogo confirmou as quatro tabelas aprovadas, sem ausências, todas com RLS habilitado; `record_chunk` está com prévia desabilitada. As duas RPCs existem com `SECURITY DEFINER` e `EXECUTE` apenas para `service_role`. `source_system` retornou três fontes; `source_record` e `knowledge_ingest_audit` retornaram zero linhas; chamada de prévia para `record_chunk` foi recusada com `unsupported table key`, como esperado. Posteriormente, o histórico CLI confirmou `20261021160000` também em Remote, após reconciliação. A verificação real das rotas HTTP/página continua pendente: não houve deploy desta branch nem chamada end-to-end via Site.

## Painel administrativo e refinamento da conexão (2026-10-20)

- A integração de status foi alinhada a `SUPABASE_SECRET_KEY` e ao endpoint real `beta.source_system`, com verificação HTTPS, medição de latência e retorno sem credenciais ou erros brutos.
- O painel master local em `mcp/movidesk/app/admin/users` reúne disponibilidade da Data API, latência, contagens de fontes/registros/trechos, importações recentes e escopos em tokens ativos por analista. Os endpoints permanecem protegidos por autenticação ChatGPT e papel master.
- A migration `20261020150000_admin_knowledge_overview.sql` cria uma RPC de leitura agregada, limitada a dez importações recentes e sem conteúdo de chamados/trechos. Execução concedida apenas a `service_role`; rollback remove somente a função.
- **Estado registrado à época:** painel/runtime publicados como Site versão 75 em 2026-10-20. Naquele registro a migration `20261020150000_admin_knowledge_overview.sql` estava pendente. Ela foi aplicada em 2026-10-22 junto com a busca; a conexão e os indicadores do painel ainda não foram revalidados end-to-end após o deploy.

## Fontes internas

- [`README.md`](./README.md) — resumo e orientação operacional.
- [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) — estado do contrato MCP/OAuth e integração.
- [`docs/architecture/arquitetura-base-compartilhada-beta.md`](../../docs/architecture/arquitetura-base-compartilhada-beta.md) — requisitos e direção arquitetural.
- [`AGENTS.md`](../../AGENTS.md) — regras transversais de segurança e roteamento documental.
