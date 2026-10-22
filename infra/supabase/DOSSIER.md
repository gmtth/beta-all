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
- Eventos contextuais de feedback/autodiagnóstico ficam separados da base de conhecimento e da telemetria D1. A política de produto v1 está definida: detalhes por 90 dias; agregados mensais com identidade analista por até 12 meses, sem ocultar grupos pequenos. Migration e rollback foram preparados localmente, sem aplicação remota. Produção aguarda contato organizacional e textos públicos validados. Ver [`../../docs/architecture/feedback-and-self-diagnosis.md`](../../docs/architecture/feedback-and-self-diagnosis.md).

## Prontidão por etapa

| Etapa | Estado | Evidência / condição para concluir |
|---|---|---|
| Projeto Supabase e extensão `vector` | Confirmados pelo catálogo recebido | Extensão instalada; recurso vetorial ainda não está usado nas tabelas |
| Schema e catálogo inicial | Confirmados por catálogo e leitura MCP | DDL/grants recebidos e `knowledge_list_sources` retornou as três fontes; busca de conteúdo não testada |
| RLS, grants e exposição Data API | RLS/grants confirmados pelo catálogo; hardening aplicado conforme histórico CLI compartilhado | `service_role` lê o catálogo sem DML direto; exposição Data API continua configuração separada |
| Migração de baseline | Registrada como aplicada no histórico remoto pelo usuário | Não executou DDL no banco existente; baseline não contém dados |
| Hardening de grants no projeto atual | Aplicado pelo usuário; listagem MCP validada depois | `knowledge_list_sources` retorna as três fontes |
| RPC de ingestão de ticket | Implementada localmente e migration aplicada remotamente pelo usuário em 2026-10-20 | RPC upsert transacional e tabela de auditoria; sem grants DML diretos nas tabelas. Runtime MCP versão 74 publicado; chamada autenticada ainda não testada |
| Credencial do runtime | Leitura atual validada via MCP; usuário confirmou rotação e atualização; valor mascarado | Evidência limitada a `knowledge_list_sources`; nunca no Git/plugin/browser |
| Consulta de catálogo pelo MCP publicado | Passou conforme resultado informado pelo usuário | Após reconectar, `knowledge_list_sources` retornou Movidesk, ClickUp e Documentos administrativos. Isso confirma autorização e leitura via MCP/Sites/Supabase para essa chamada, não a busca de conteúdo |
| Ingestão do chamado piloto | Código implementado localmente; execução pendente | Requer publicação runtime, reautorização `movidesk:read` + `knowledge:write` e pedido explícito; ticket `20260702000000016` ainda não foi lido/gravado |
| Ingestão em lote ClickUp/documentos | Pendente | Definir sincronização incremental, idempotência, remoções/atualizações, retries e quarentena de falhas |
| Diagnóstico híbrido e contexto consolidado | Pendente | Implementar busca, filtros de permissão, reranking, citações e avaliação com casos representativos |
| Histórico/telemetria e governança | Pendente | Definir papéis, minimização, retenção, correção/exclusão, backup e recuperação |
| Schema de feedback/frustração/autodiagnóstico | Migrations aplicadas no Supabase em 2026-10-22; sem eventos | Tabelas de detalhe, termos, clusters, auditoria e agregados estão criadas com RLS e sem grants diretos; RPCs estão limitadas ao `service_role`. A migration `20261022140000` criou o schema e a `20261022150000` agendou rollup/expiração horária e limpeza diária limitada aos dois jobs da Beta. `pg_cron` está ativo e ambos os jobs constam ativos. Não há execuções registradas ainda; captura permanece desligada. Build, chamadas funcionais, execução Cron, publicação e piloto continuam pendentes. |
| Produção | Não aprovada por este dossier | Revisar limites do plano, backup/restore, disponibilidade, segurança e monitoramento |

## Próximos passos

| Prioridade | Item | Estado / condição para conclusão |
|---|---|---|
| Alta | Reautorizar as contas MCP com os scopes necessários e testar a importação explícita do chamado piloto `20260702000000016`. | Requer runtime publicado com a migration de ingestão e o scope `knowledge:write`; conferir a resposta da ferramenta e os metadados do registro/trechos sem expor dados pessoais. |
| Alta | Implementar busca de trechos e busca lexical/vetorial híbrida com citações rastreáveis. | Definir filtros de classificação, limites, reranking e comportamento para ambiguidade; validar com casos anonimizados representativos. |
| Média | Definir sincronização em lote para ClickUp e documentos administrativos. | Especificar atualização incremental, idempotência, remoções, retries, quarentena e auditoria antes de importar em massa. |
| Média | Fechar política operacional de retenção, backup e recuperação. | Testar exportação e restauração e rever limites/disponibilidade do plano antes de ampliar o piloto. |
| Média | Aplicar a migration dos indicadores agregados do painel administrativo, se ainda necessária. | Confirmar o estado remoto antes de aplicar; validar RPC e painel end-to-end sem retornar conteúdo de tickets. |
| Alta | Validar a integração e concluir o piloto controlado de feedback/fricção/autodiagnóstico. | Nesta worktree, Worker, consentimento OAuth/termos, skill, API master-only e painel `/admin/feedback` estão implementados localmente; captura permanece desligada. Em 2026-10-22, aplicamos as migrations `20261022140000` e `20261022150000`; as onze versões locais coincidem com o histórico remoto. Confirmamos RLS nas seis tabelas, ausência de SELECT direto para `service_role`, permissão de execução da RPC de retenção e dois jobs Cron ativos, limitados à Beta. Ainda faltam execução bem-sucedida dos jobs, build/revisão visual, publicação e piloto. Só habilitar captura após aprovação do contato organizacional e dos textos públicos. |

### Modelagem local de feedback/autodiagnóstico (2026-10-22)

- A migration `20261022140000_feedback_diagnostics_schema.sql` cria eventos detalhados, palavras ofensivas associadas, clusters sugeridos/revisáveis, auditoria de revisão, métricas mensais por analista e contagens mensais por termo ofensivo. Inclui RPCs de gravação idempotente, listagem paginada de grupos, eventos e termos, resumo agregado e revisão de evento/cluster. Identidade autenticada permanece nas agregações para sustentar o ranking pedido; agregados não são anônimos. A versão foi numerada depois da sequência remota, que já contém `expand_recent_imports` como `20261022130000`. Foi aplicada em 2026-10-22; ainda não há eventos reais.
- Eventos detalhados recebem expiração de 90 dias. A RPC `aggregate_and_expire_feedback_events()` transfere apenas dimensões/contagens para agregados antes de apagar contexto e termos originais, mantendo agregados dentro da janela máxima de 12 meses. A rotina também remove auditoria expirada.
- Todas as tabelas têm RLS habilitado, sem policies ou grants diretos, inclusive para `service_role`; as dez RPCs desta migration são executáveis apenas por `service_role`. Autorização OAuth/role continua obrigatória no Worker antes de chamar leitura/revisão; só o Worker validado pode passar a identidade para a gravação.
- O rollback `rollback/20261022140000_drop_feedback_diagnostics_schema.sql` é destrutivo e remove todos os dados desse domínio. As tabelas estão vazias na aplicação; não executar esse rollback sem autorização e backup apropriado.
- O Worker adicionado nesta worktree chama a RPC de gravação somente após OAuth válido com `feedback:write`; a API master-only permite corrigir campos contextuais sem preservar o valor anterior, apagar um evento individual e apagar o histórico identificado completo de um analista, inclusive agregados mensais e termos ofensivos. Clusters que envolvam outros analistas são removidos e os eventos restantes ficam desagrupados. A captura MCP permanece desligada por `FEEDBACK_CAPTURE_ENABLED`.
- Nesta worktree, o aceite versionado dos Termos de Uso é persistido no D1 do Sites junto do fluxo OAuth e exigido pelo middleware antes das ferramentas protegidas; não é armazenado no Supabase. Isso não altera a separação entre métricas operacionais D1 e eventos contextuais Supabase.
- As RPCs de classificação/agrupamento automatizado, atribuição de evento a cluster e correção/mesclagem de clusters permanecem para os passos seguintes. A migration `20261022150000_schedule_feedback_retention.sql` criou um job horário para chamar `aggregate_and_expire_feedback_events()` e outro job para remover somente o histórico dos jobs da Beta com mais de sete dias. Ambos constam ativos em `cron.job`, mas ainda não têm execução registrada. O rollback `rollback/20261022150000_unschedule_feedback_retention.sql` remove apenas os jobs da Beta, sem desativar o módulo compartilhado. Até uma execução bem-sucedida, a remoção física/rollup não foi confirmada operacionalmente.

Quando algum item for concluído, remova-o desta lista e registre a evidência em `## Prontidão por etapa` ou no histórico apropriado.

## Painel administrativo e refinamento da conexão (2026-10-20)

- A integração de status foi alinhada a `SUPABASE_SECRET_KEY` e ao endpoint real `beta.source_system`, com verificação HTTPS, medição de latência e retorno sem credenciais ou erros brutos.
- O painel master local em `mcp/movidesk/app/admin/users` reúne disponibilidade da Data API, latência, contagens de fontes/registros/trechos, importações recentes e escopos em tokens ativos por analista. Os endpoints permanecem protegidos por autenticação ChatGPT e papel master.
- A migration `20261020150000_admin_knowledge_overview.sql` cria uma RPC de leitura agregada, limitada a dez importações recentes e sem conteúdo de chamados/trechos. Execução concedida apenas a `service_role`; rollback remove somente a função.
- **Estado:** painel/runtime publicados como Site versão 75 em 2026-10-20. A migration `20261020150000_admin_knowledge_overview.sql` permanece somente local, não aplicada remotamente; os indicadores agregados dependem dela. A conexão e os indicadores não foram revalidados end-to-end após o deploy.

## Fontes internas

- [`README.md`](./README.md) — resumo e orientação operacional.
- [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) — estado do contrato MCP/OAuth e integração.
- [`docs/architecture/arquitetura-base-compartilhada-beta.md`](../../docs/architecture/arquitetura-base-compartilhada-beta.md) — requisitos e direção arquitetural.
- [`AGENTS.md`](../../AGENTS.md) — regras transversais de segurança e roteamento documental.
