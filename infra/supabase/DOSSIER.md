# Dossier do Supabase da Beta

Atualizado em 2026-10-20. Este documento registra o estado conhecido e as evidências disponíveis. O `README.md` contém o resumo operacional; regras de runtime e segurança também estão em `mcp/movidesk/AGENTS.md`.

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
| RPC de ingestão de ticket | Implementada localmente e migration aplicada remotamente pelo usuário em 2026-10-20 | RPC upsert transacional e tabela de auditoria; sem grants DML diretos nas tabelas. Runtime MCP versão 74 publicado; chamada autenticada ainda não testada |
| Credencial do runtime | Leitura atual validada via MCP; usuário confirmou rotação e atualização; valor mascarado | Evidência limitada a `knowledge_list_sources`; nunca no Git/plugin/browser |
| Consulta de catálogo pelo MCP publicado | Passou conforme resultado informado pelo usuário | Após reconectar, `knowledge_list_sources` retornou Movidesk, ClickUp e Documentos administrativos. Isso confirma autorização e leitura via MCP/Sites/Supabase para essa chamada, não a busca de conteúdo |
| Ingestão do chamado piloto | Código implementado localmente; execução pendente | Requer publicação runtime, reautorização `movidesk:read` + `knowledge:write` e pedido explícito; ticket `20260702000000016` ainda não foi lido/gravado |
| Ingestão em lote ClickUp/documentos | Pendente | Definir sincronização incremental, idempotência, remoções/atualizações, retries e quarentena de falhas |
| Diagnóstico híbrido e contexto consolidado | Pendente | Implementar busca, filtros de permissão, reranking, citações e avaliação com casos representativos |
| Histórico/telemetria e governança | Pendente | Definir papéis, minimização, retenção, correção/exclusão, backup e recuperação |
| Produção | Não aprovada por este dossier | Revisar limites do plano, backup/restore, disponibilidade, segurança e monitoramento |

## Próxima sequência recomendada

1. Reautorizar a conexão MCP de cada analista com `movidesk:read`, `knowledge:read` e `knowledge:write`.
2. Confirmar a ferramenta de importação e testar a importação explícita do ticket piloto.
3. Implementar busca de trechos, depois busca vetorial/híbrida e citações.
4. Definir política de importação em lote, retenção, backup e recuperação antes de expandir o piloto.

## Painel administrativo e refinamento da conexão (2026-10-20)

- A integração de status foi alinhada a `SUPABASE_SECRET_KEY` e ao endpoint real `beta.source_system`, com verificação HTTPS, medição de latência e retorno sem credenciais ou erros brutos.
- O painel master local em `mcp/movidesk/app/admin/users` reúne disponibilidade da Data API, latência, contagens de fontes/registros/trechos, importações recentes e escopos em tokens ativos por analista. Os endpoints permanecem protegidos por autenticação ChatGPT e papel master.
- A migration `20261020150000_admin_knowledge_overview.sql` cria uma RPC de leitura agregada, limitada a dez importações recentes e sem conteúdo de chamados/trechos. Execução concedida apenas a `service_role`; rollback remove somente a função.
- **Estado:** implementação, migration e documentação preparadas localmente em 2026-10-20. A migration não foi aplicada remotamente e a nova versão do Sites/runtime não foi publicada nem validada end-to-end.

## Fontes internas

- [`README.md`](./README.md) — resumo e orientação operacional.
- [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) — estado do contrato MCP/OAuth e integração.
- [`docs/architecture/arquitetura-base-compartilhada-beta.md`](../../docs/architecture/arquitetura-base-compartilhada-beta.md) — requisitos e direção arquitetural.
- [`AGENTS.md`](../../AGENTS.md) — regras transversais de segurança e roteamento documental.
