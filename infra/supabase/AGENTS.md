# Instruções do componente Supabase

Leia primeiro o [`AGENTS.md` raiz](../../AGENTS.md) e o dossier raiz; depois este arquivo e [`DOSSIER.md`](./DOSSIER.md) antes de alterar schema, migrations, acesso, API ou a página administrativa de dados. O runtime MCP e suas rotas também obedecem a [`../../mcp/movidesk/AGENTS.md`](../../mcp/movidesk/AGENTS.md). A fonte de trabalho é o monorepo `beta-all`; snapshots em `legacy/` e `docs/migration/` são históricos.

## Segurança do banco

- Nunca colocar valores de chaves, tokens, connection strings ou dados reais de chamados em Git, browser, logs ou resposta ao modelo.
- O backend valida identidade OAuth, papel e scope. A chave `service_role` é server-side e ignora RLS; nunca usá-la como substituto de autorização.
- Preferir RPCs estreitas, seleção explícita de colunas, limites e sanitização. Não fornecer SQL genérico ao browser nem aceitar nome de tabela, coluna ou ordenação livre sem allowlist server-side.
- A busca e o navegador administrativo são somente leitura. Escritas na base de conhecimento continuam restritas às operações explícitas e auditadas já documentadas.

## Orientação para ações manuais no Supabase

- Sempre que uma tarefa exigir que o usuário altere algo no painel do Supabase — por exemplo, abrir/aplicar uma migration no SQL Editor, configurar secrets, ajustar Data API, grants ou RLS — guie-o passo a passo, com uma ação por vez. Não entregue uma lista longa de passos dependentes de uma vez.
- Antes da ação, informe o projeto/ambiente esperado, o arquivo ou configuração exatos, o escopo e o efeito previsto. Confirme que a operação não afeta outros projetos quando isso for relevante; nunca presumir que uma migration está limitada ao projeto correto sem conferir seu conteúdo e destino.
- Dê instruções concretas de navegação e de validação. Em alterações SQL, aponte para a migration versionada e seu rollback correspondente; peça para conferir o project ref antes de executar. Não peça ao usuário para colar ou compartilhar chaves, tokens, connection strings ou dados reais.
- Após cada etapa que dependa de uma ação do usuário, aguarde o resultado antes de orientar a próxima. Se houver erro, primeiro interprete o erro e determine se é seguro corrigir ou tentar novamente; não recomende execução repetida às cegas.
- Depois da alteração, oriente uma verificação somente leitura e atualize o estado no dossier com o que foi confirmado. Diferencie claramente instruções locais, alteração executada pelo usuário e comportamento validado em produção.

## Política de tabelas do navegador Supabase

O navegador planejado para `/admin/database` é uma interface master, somente leitura, com metadados de schema e prévias paginadas. A prévia de linhas de qualquer nova tabela é **negada por padrão**; os metadados estruturais podem ser listados sem expor seus dados. Para permitir linhas de uma tabela futura, revise este arquivo e o dossier Supabase na mesma mudança, com justificativa, campos exatos permitidos e classificação de sensibilidade.

| Tabela no schema `beta` | Schema/metadados | Prévia de linhas | Campos permitidos na prévia | Campos/dados excluídos |
|---|---|---|---|---|
| `source_system` | Sim | Sim | `id`, `code`, `name`, `active`, `created_at` | Nenhum outro campo sem revisão explícita |
| `source_record` | Sim | Sim, metadados somente | `id`, `source_system_id`, `external_id`, `record_type`, `status`, `classification`, `source_created_at`, `source_updated_at`, `imported_at`, `deleted_at` | `title`, `source_url`, `content_hash`, `attributes` e qualquer conteúdo livre/PII |
| `knowledge_ingest_audit` | Sim | Sim, metadados somente | `id`, `source_record_id`, `operation`, `chunk_count`, `created_at` | `actor_email`, `content_hash` e qualquer identidade direta ou conteúdo |
| `record_chunk` | Sim, estrutura somente | Não | Nenhum | Todas as linhas, `section_title`, `content`, `search_vector` e texto derivado de chamados |
| Tabelas de feedback/frustração/autodiagnóstico | Sim, quando criadas | Não na tabela genérica | Nenhum por padrão | Não exibir no navegador genérico `/admin/database`. No painel dedicado, master pode consultar eventos individuais/contexto permitido e agregados, incluindo ranking nominal e índice de linguagem ofensiva conforme decisão do usuário; autorização sempre server-side. Seguir [`feedback-and-self-diagnosis.md`](../../docs/architecture/feedback-and-self-diagnosis.md) |

### Regras para incluir tabelas futuras

Uma nova tabela só pode ter prévia de dados quando todas as condições forem satisfeitas:

1. O propósito, responsável, classificação e relações da tabela estão documentados.
2. Há uma allowlist explícita de colunas; `SELECT *` é proibido. Texto livre, PII, credenciais, conteúdo de tickets/conversas e material confidencial ficam excluídos por padrão.
3. A revisão confirma que uma prévia linha a linha é necessária. Dados de alto risco devem permanecer fora do navegador genérico e ser expostos, se necessário, por uma tela/relatório agregado dedicado.
4. A rota exige sessão master validada no servidor, consulta com paginação limitada e ordenação estável em coluna aprovada; não aceita SQL, filtros, nomes de relação ou identificadores arbitrários do cliente.
5. A resposta retorna somente colunas autorizadas, aplica sanitização e não revela mensagens brutas de erro. Testes cobrem autorização negada, limites, paginação e colunas proibidas.
6. O inventário desta tabela é atualizado aqui e em `infra/supabase/DOSSIER.md`; qualquer migration que a crie não a habilita implicitamente para visualização.

O navegador pode mostrar chaves estrangeiras e relações como metadados de schema, sem incluir automaticamente as tabelas relacionadas nem ampliar a prévia. D1 do Sites (`oauth_users`, `oauth_tokens`, `mcp_tool_events` e semelhantes) não é parte deste navegador Supabase e não deve ser confundido com o schema `beta`.

## Separação do painel de controle

- O painel de controle é a fonte única de métricas Supabase: disponibilidade/latência, contagens agregadas e atividade de ingestão. Se uma métrica útil estiver faltando, registre a inclusão no backlog Supabase e implemente-a no painel de controle, sem duplicá-la em `/admin/database`.
- `/admin/database` prioriza estrutura, chaves/índices/RLS e prévias paginadas das tabelas aprovadas. Pode indicar estado transitório da consulta e intervalo de linhas da página atual, mas não deve criar cartões de KPI, gráficos ou indicadores agregados concorrentes.
- Para facilitar diagnósticos, a página deve resumir os controles de acesso por camada: gate de sessão/papel/scopes no Site/MCP e grants/RLS no Supabase. Não misturar nem listar tabelas D1 nesta página, não duplicar a lista de usuários/tokens do painel de controle e não exibir credenciais, tokens ou expressões SQL de políticas. Explicar que o Worker usa `service_role` (que ignora RLS), então a validação master server-side é obrigatória.
- Manter `## Próximos passos` em [`DOSSIER.md`](./DOSSIER.md) atualizado; backlog não autoriza aplicar migration remota, publicar, commitar ou alterar permissões.
