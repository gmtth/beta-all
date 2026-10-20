# Dossier do Supabase da Beta

Atualizado em 2026-10-20. Este documento registra o estado conhecido e as evidências disponíveis. O `README.md` contém o resumo operacional; regras de runtime e segurança também estão em `mcp/movidesk/AGENTS.md`.

## Resumo canônico

- Finalidade: base compartilhada de conhecimento para quatro analistas, consultada pelo MCP da Beta.
- Tecnologia escolhida: Supabase PostgreSQL com `pgvector`; Workers acessa a Data API/PostgREST por HTTPS.
- Projeto confirmado: `https://ywqoanfqcbcdecmkguze.supabase.co`.
- Schema criado: `beta`; tabelas observadas: `source_system`, `source_record` e `record_chunk`.
- Fontes iniciais observadas na tabela: Movidesk, ClickUp e Documentos administrativos.
- Inspeção SQL do catálogo recebida em 2026-10-20: RLS está habilitado em `source_system`, `source_record` e `record_chunk`, sem políticas; o schema concede `USAGE` a `service_role`, não a `anon`/`authenticated`; `service_role` e também `anon`/`authenticated` possuem ACLs DML nas tabelas. Sem `USAGE` no schema, os papéis `anon`/`authenticated` não devem acessá-las pela Data API. As ACLs amplas devem ser reduzidas antes de ampliar o acesso. Exposição na Data API é configuração separada e não foi inspecionada pela consulta SQL.
- A extensão `vector` está instalada, mas não há coluna vetorial, índice vetorial, função/RPC ou trigger no catálogo observado. A busca atual é lexical: `record_chunk.search_vector` é `tsvector` gerado e usa índice GIN. Há quatro índices no total, incluindo o índice de relacionamento de chunks e índices de classificação/tipo-status.
- MCP: existe a ferramenta `knowledge_list_sources`, protegida por `knowledge:read`, que lista no máximo dez fontes. O catálogo já foi testado pelo SQL Editor; o retorno end-to-end pelo MCP/Sites ainda precisa ser confirmado no ambiente publicado.
- Inspeção atual do Sites em 2026-10-20: projeto `Beta MCP`, versão 73, deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`, revisão de variáveis 13. `SUPABASE_URL` e `SUPABASE_SECRET_KEY` aparecem no inventário. O usuário confirmou que substituiu a chave exposta e atualizou a variável; o Sites mascara valores secretos, então não foi possível verificar seu valor. A chamada do MCP ainda precisa confirmar a conectividade efetiva.
- Migrações em `migrations/`: nenhuma. O DDL integral ainda não foi obtido e revisado.

## Registro retroativo e qualidade da evidência

Este dossier foi reconstruído em 2026-10-20 a partir do contexto registrado nos documentos ativos da consolidação, do código em `mcp/movidesk/` e do estado de infraestrutura relatado pelo usuário durante a configuração. As capturas de tela confirmam etapas isoladas da configuração, e o resultado SQL registrado confirma três fontes; nenhum desses itens equivale a um export reproduzível do banco ou a uma chamada MCP de produção.

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
| Schema e catálogo inicial | Observados | Teste SQL manual mostrou três fontes; não prova API/MCP |
| RLS, grants e exposição Data API | RLS/grants confirmados por catálogo; Data API reportada como exposta | Rever ACLs amplas de tabela, criar política de acesso deliberada se papéis diretos forem usados; confirmar a configuração Data API separadamente |
| Migrações versionadas | Pendente | Converter o catálogo revisado em migração reproduzível; incluir apenas objetos e privilégios deliberados |
| Credencial do runtime | Usuário confirmou rotação e atualização da variável; valor mascarado | Confirmar a conectividade pela chamada end-to-end; nunca no Git/plugin/browser |
| Consulta de catálogo pelo MCP publicado | Bloqueada por escopo/identidade OAuth | Chamada de `knowledge_list_sources` chegou ao MCP, mas a autorização server-side recusou o token (sem escopo, expirado ou usuário sem permissão ativa); nenhuma fonte retornada. Reautorizar e repetir |
| Ingestão Movidesk/ClickUp/documentos | Pendente | Definir sincronização incremental, idempotência, remoções/atualizações, retries e quarentena de falhas |
| Diagnóstico híbrido e contexto consolidado | Pendente | Implementar busca, filtros de permissão, reranking, citações e avaliação com casos representativos |
| Histórico/telemetria e governança | Pendente | Definir papéis, minimização, retenção, correção/exclusão, backup e recuperação |
| Produção | Não aprovada por este dossier | Revisar limites do plano, backup/restore, disponibilidade, segurança e monitoramento |

## Próxima sequência recomendada

1. Revisar o resultado do catálogo SQL recebido em 2026-10-20; não contém linhas operacionais, apenas definições e permissões.
2. Corrigir primeiro os grants desnecessários para `anon`/`authenticated`; decidir o modelo de privilégio do runtime, que hoje usa `service_role` com acesso amplo e bypass de RLS.
3. Versionar o estado atual como migração reproduzível após revisão manual; não inventar policies, funções de busca ou suporte vetorial que não existem.
4. Reautorizar a conexão MCP para emitir token com `knowledge:read`; confirmar na tela OAuth o escopo e a conta e repetir `knowledge_list_sources`. Depois disso, o teste validará a conectividade MCP/Supabase.
5. Só então avançar para ingestão idempotente, busca híbrida (lexical existente + vetorial ainda a implementar) e regras de acesso; não tratar o teste de catálogo como prova da busca diagnóstica.
6. Definir política de retenção/backup e critérios do piloto antes de armazenar dados reais de chamados.

## Fontes internas

- [`README.md`](./README.md) — resumo e orientação operacional.
- [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) — estado do contrato MCP/OAuth e integração.
- [`docs/architecture/arquitetura-base-compartilhada-beta.md`](../../docs/architecture/arquitetura-base-compartilhada-beta.md) — requisitos e direção arquitetural.
- [`AGENTS.md`](../../AGENTS.md) — regras transversais de segurança e roteamento documental.
