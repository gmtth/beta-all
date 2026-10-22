# Plano histórico de consolidação do monorepo

Este documento preserva integralmente o plano que orientou a consolidação de `gmtth/beta-all`, incluindo fases, critérios, decisões e gatilhos originais. A consolidação foi executada; consulte [`source-inventory.md`](source-inventory.md) e [`document-reconciliation.md`](document-reconciliation.md) para o estado e as evidências atuais. Este snapshot é histórico: não repita etapas nem trate antigas aprovações como autorização para novas alterações, arquivamentos ou publicações.
## Planejamento de consolidação em `gmtth/beta-all` como repositório único de trabalho

### Objetivo e limites

- Criar `gmtth/beta-all` como **único repositório de trabalho**, contendo os arquivos-fonte necessários do plugin e skills, MCP/OAuth/runtime do Sites, migrações e documentação Supabase, decisões e dossiers consolidados.
- `beta-all` será um monorepo organizado por componente, com históricos de origem preservados quando tecnicamente viável. Não usar submódulos como dependência de trabalho nem deixar conteúdo ativo apenas como links/ponteiros para os repositórios antigos.
- Os repositórios antigos serão fontes de importação e preservação histórica. Depois de importar e validar tudo, o plano é arquivá-los e torná-los privados, de modo que o trabalho cotidiano siga apenas em `beta-all`.
- Não apagar nem sobrescrever as origens durante a importação. Mantê-las intactas até verificar o monorepo e os fluxos de build/publicação; arquivá-las e alterar visibilidade somente na etapa final, após validar impactos e confirmar a migração.
- O repositório `gmtth/beta-all` foi verificado como privado e vazio no inventário anterior. Revalidar estado, branches e commits remotos antes de inicializar; ele será o único repositório ativo após a migração.
- O usuário autorizou iniciar a consolidação em 2026-10-20. O repositório destino já foi clonado após reautenticação e continua privado. Importar de cópias remotas atuais, mantendo os checkouts e repositórios de origem intactos.

### Mapa de repositórios e responsabilidades

- `gmtth/movidesk-mcp-oauth`: origem do serviço MCP/OAuth e runtime do Sites; importar código e documentos úteis para a área MCP do monorepo.
- `gmtth/plugin-beta`: origem do plugin, manifesto, skills, referências e configuração MCP; importar seus arquivos para a área de plugin no monorepo.
- `gmtth/suite-beta`: agregador legado já arquivado; auditar submódulos, documentação e artefatos para recuperar material que não esteja preservado em outro lugar. Incluir no inventário os repositórios de skills/componentes referenciados ali; não importar cegamente cópias antigas.
- `gmtth/beta-all`: destino único de trabalho, contendo código-fonte ativo e documentação, não apenas arquitetura.
- `source-bundle` observado como gitlink no MCP: confirmar origem remota, conteúdo e função. O monorepo deve ficar autossuficiente; importar código necessário e remover dependências de checkout/remoto antigo após validar o substituto.
- O plugin atualmente aponta para o endpoint MCP publicado. Atualizar configuração e fluxos de build para que o plugin continue instalável e o MCP/Sites publicável a partir dos diretórios do monorepo, registrando compatibilidade entre versões.

### Snapshot de execução da consolidação (2026-10-20)

- `gmtth/beta-all` está privado, não arquivado, branch padrão `main`, HEAD `b8d882a`; push concluído. O clone limpo em `Beta/beta-all-final2` está sincronizado, sem gitlinks, e os 400 itens de quatro manifestos SHA-256 conferem byte a byte.
- `gmtth/movidesk-mcp-oauth` foi importado de `main` em `271dbdd8`; `gmtth/plugin-beta`, de `main` em `f63afd20`; `gmtth/suite-beta`, de `main` em `ad32de45`. A importação usou Git subtree, sem submódulos ativos.
- A branch remota `feat/supabase-knowledge-read-scope` foi preservada integralmente em `legacy/source-archives/mcp-feature-supabase-scope/` no commit `7b63eb62`; ela divergiu do `main` e está 28 commits atrás. A implementação atual de `knowledge:read` e `knowledge_list_sources` já existe no MCP canônico. Não aplicar a branch antiga inteira; comparar itens específicos antes de portar.
- O checkout MCP local em `codex/phase3b-similarity` (`392c2f8`) e seu diff não commitado permanecem intactos no workspace de origem; o branch, patch e seis arquivos não rastreados foram preservados em `legacy/` para reconciliação, sem aplicar o estado antigo sobre o `main` remoto.
- Todos os 14 repositórios do `.gitmodules` do `suite-beta`, além de `legacy-movimcp`, `skill-clickup-checklist` e `skill-clickup-sprint-export`, têm cópia/história em `legacy/source-archives/`. Os dois repositórios ClickUp não foram ativados no plugin.
- O Site `Beta MCP` está ativo na versão Sites 73 (deployment `appgdep_6ad73a9f28388191bb62480b2b452ec5`), com fonte `5c26eac6`. A origem Cloudflare Artifact é separada do GitHub; os snapshots locais e o antigo projeto Sites foram preservados em `legacy/`. Nenhum Site foi republicado.
- Snapshot de validação da importação (2026-10-20): plugin (`validate_beta_anl_skills.py` e `validate_beta_routing_cases.py`), catálogo semântico e build MCP passaram; a suíte MCP teve 71/72 casos aprovados devido à expectativa antiga de `tests/rendered-html.test.mjs`. Essa expectativa foi alinhada e a suíte passou na revisão OAuth de 2026-10-21; veja o registro atual em `mcp/movidesk/DOSSIER.md`. `npm ci` reportou 35 vulnerabilidades naquela execução; nenhuma correção automática foi aplicada, e o estado atual da árvore não foi reavaliado neste ciclo.
- Quatro manifestos de hashes de artefatos/snapshots foram conferidos. A árvore atual não tem gitlinks e a busca por padrões comuns de credenciais no conteúdo e na história retornou zero correspondências; isso não substitui uma auditoria exaustiva de segredos.
- O catálogo Supabase foi obtido em 2026-10-20. Baseline de schema e migration incremental de grants estão preparados em `infra/supabase/migrations/`, ainda não aplicados; revisar o fluxo para registrar baseline e rollback antes de qualquer alteração no projeto existente.
- Corte operacional realizado após a validação: `gmtth/plugin-beta` foi tornado privado e arquivado; `gmtth/movidesk-mcp-oauth`, `gmtth/skill-clickup-checklist` e `gmtth/skill-clickup-sprint-export` foram arquivados e já são privados. `gmtth/beta-all` segue privado e ativo. Repositórios de skills já arquivados e o antigo `suite-beta` permanecem preservados conforme inventário.
- O MCP preserva em `legacy/` o `main`, a branch `feat/supabase-knowledge-read-scope` e o estado local exclusivo. Outras branches remotas antigas permanecem no repositório de origem arquivado, que conserva seus refs para recuperação; não são dependências do fluxo de trabalho diário.

### Arquitetura da cópia de conhecimento (requisito para a consolidação)

- A consulta normal de diagnóstico deve ocorrer na cópia local sincronizada e indexada no Supabase, para responder com baixa latência sem depender de uma chamada online ao Movidesk/ClickUp a cada pergunta. Os MCPs de origem são usados pelo pipeline de ingestão, sincronização incremental e reconciliação, não como caminho obrigatório de busca em tempo de resposta.
- Manter o registro de origem e o conteúdo de busca em camadas relacionadas: fonte/sistema, registro canônico (ID externo, URL, datas, estado, permissões, metadados) e trechos de texto indexáveis com referência ao registro e à versão do conteúdo. Preservar proveniência e permitir atualização idempotente por ID externo.
- Pipeline proposto: coletar → validar acesso/classificação → normalizar campos e HTML/anexos suportados → remover/mascarar dados desnecessários → deduplicar e detectar atualização → classificar tipo/entidade → dividir em trechos sem perder contexto → gerar embeddings → atualizar índice lexical e vetorial → registrar resultado/erros e cursor de sincronização.
- Indexar texto completo útil para diagnóstico (relato, sintomas, ambiente, investigação, causa, solução e resultado), sem depender de código de erro. Guardar campos estruturados para fabricante/modelo da máquina, sistema operacional, versão, componente, local, categoria, datas, status, solução confirmada, confiança e classificação de acesso, quando disponíveis.
- Busca deve combinar recuperação lexical (Postgres FTS/trigramas, identificadores e termos exatos) e semântica (`pgvector`), aplicar filtros de autorização e metadados antes de compor o contexto, deduplicar/combinar candidatos e reranquear por similaridade técnica, evidência da solução, validação, compatibilidade e atualidade. Restringir número/tamanho de resultados e devolver citações rastreáveis.
- Para cada diagnóstico, distinguir precedentes semelhantes de solução comprovada. Mostrar fonte, ticket/card, data e grau de confiança autorizado; não transformar recorrência ou embedding próximo em causa confirmada. Quando os dados não discriminarem hipóteses, solicitar ao analista detalhes adicionais e refazer a busca.
- Contexto analítico consolidado (padrões, causas e soluções recorrentes) deve ser uma camada derivada e versionada, com links para registros de evidência e revisão humana. Não substituir os registros-fonte nem aprender automaticamente como verdade a partir de conversas sem validação.
- Planejar reindexação por versão do modelo de embedding, tratamento de registros apagados/arquivados na origem, atualização incremental, retry/backoff, monitoramento de atraso/falhas, exportação/backup e avaliação com um conjunto representativo de diagnósticos reais anonimizados.
- Separar a base de conhecimento dos eventos de conversa e telemetria diagnóstica. O histórico pode guardar assunto, usuário autenticado, perguntas de esclarecimento, IDs das evidências consultadas, resultado útil/feedback, lacuna de conhecimento, latência e falhas, com retenção e minimização de dados definidas. Não persistir raciocínio interno privado.
- Métricas operacionais das chamadas às ferramentas MCP do Sites (uso, sucesso e categorias seguras de erro) pertencem ao banco D1 do próprio Sites. Não consultar nem gravar Supabase para esses gráficos; manter essa telemetria separada dos dados de conhecimento e do histórico de conversas.
- Não começar a ingestão em massa antes de fechar escopo de dados, classificação de acesso, política de retenção, limites de anexos, tamanho/estratégia de chunk, modelo/dimensões de embedding e mecanismo de atualização. Registrar essas escolhas em `docs/architecture/knowledge-base.md` e decisões versionadas.

### Hierarquia planejada para `beta-all`

```text
beta-all/                              # único clone/repos de trabalho após a migração
├── AGENTS.md                         # coordenação; remete às instruções de cada componente
├── README.md                         # visão geral, mapa e como iniciar/atualizar
├── DOSSIER.md                        # índice de estado e decisões entre componentes
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md         # relações entre plugin, MCP, Sites e Supabase
│   │   └── knowledge-base.md         # ingestão, indexação, busca e contexto
│   ├── decisions/                    # ADRs com data, estado, evidência e impacto
│   ├── components/                    # mapas e links, sem cópias de implementação
│   │   ├── plugin-and-skills.md       # manifesto, skills e ciclo de publicação
│   │   ├── mcp-movidesk.md            # OAuth, ferramentas e contrato MCP
│   │   ├── supabase.md                # schema/API, RLS, migrações e acesso
│   │   └── sites.md                   # publicação, runtime, versões e rollback
│   ├── migration/
│   │   ├── inventory.md               # fontes, commits, classificação e destino
│   │   ├── document-reconciliation.md # comparação de dossiers/agents e decisões
│   │   └── source-documents/          # snapshots identificados de docs locais sem Git
│   ├── operations/                    # procedimentos compartilhados
│   └── history/                       # histórico curado, sem segredos
├── mcp/
│   └── movidesk/                     # MCP/OAuth/runtime importados
├── plugins/
│   └── beta/                         # plugin completo, incluindo skills e assets
├── infra/
│   └── supabase/
│       ├── README.md                  # projeto, Data API, ambientes e limites
│       └── migrations/               # SQL versionado, sem credenciais/dados reais
└── legacy/                            # fontes antigas e recuperação, sem papel ativo
    ├── README.md                     # proveniência e regras para recuperar conteúdo
    ├── suite-beta/                    # agregador histórico sem submódulos ativos
    ├── source-archives/               # repositórios antigos importados com Git subtree
    ├── local-snapshots/                # patch e conteúdo local MCP ainda não reconciliado
    └── artifacts/releases/            # ZIPs/pacotes originais e manifesto SHA-256
```

- Esta hierarquia foi revisada para um monorepo de verdade: runtime/Sites em `mcp/movidesk`; plugin e skills em `plugins/beta`; migrações e documentação Supabase em `infra/supabase` e `docs/`.
- Não criar cópias concorrentes de Sites ou skills. Importar cada implementação uma única vez para seu diretório canônico; documentar build/deploy e publicar a partir desses caminhos no monorepo.
- `infra/supabase/migrations` guarda apenas migrações SQL reproduzíveis, revisadas e sem credenciais/dados reais. Migrações do banco OAuth/runtime que pertencem ao MCP continuam no repositório MCP; não misturar os ciclos de banco.
- A pasta `legacy/` recebe apenas conteúdo não ativo necessário para auditoria e recuperação. Snapshots de projetos preservam arquivos e história por `git subtree`; não devem conter gitlinks/submódulos ativos. Arquivos compactados locais ficam em `legacy/artifacts/releases/` com origem, data e hash. Não apagar as origens locais como parte da importação.
- Não criar scripts na primeira versão. Depois de observar tarefas repetidas e definir comportamento seguro, scripts de bootstrap/verificação podem ser adicionados com escopo explícito; nenhum script deve publicar, apagar ou migrar dados implicitamente.
- Documentos locais sem histórico Git (incluindo os documentos atuais do workspace Beta) recebem snapshot identificado por origem/data/hash em `docs/migration/source-documents/` antes de qualquer síntese. Os originais locais e remotos permanecem intactos.
- Antes de colocar snapshots no Git, verificar se contêm credenciais, dados pessoais ou conteúdo operacional restrito. Segredos não entram no agregador; se forem encontrados, registrar a ocorrência sem revelar o valor e escolher um meio restrito de preservação/rotação.
- Ajustar a hierarquia somente com justificativa concreta descoberta durante o inventário. Não acrescentar cópias completas de código-fonte aos diretórios de documentação.

### Modelo de integração e fluxo de trabalho

- O trabalho diário de plugin, skills, MCP, API Supabase e Sites ocorre no repositório `beta-all`, em diretórios canônicos, usando worktree e branch exclusivas por conversa. Revisões podem delimitar um componente por pasta, mas commits e issues pertencem ao monorepo.
- Durante a importação, preservar autoria e histórico: avaliar `git subtree` ou importação com prefixo, com refs/tags/commits de origem documentados. Se a história integral conflitar ou for impraticável, guardar refs, patches ou exports verificáveis e registrar o limite; nunca descartar histórico silenciosamente.
- Registrar matriz de compatibilidade entre plugin/skills, MCP, endpoint Sites, scopes e schema/API Supabase. Builds, testes e publicações devem apontar aos diretórios do monorepo e continuar isolados por componente.
- Não deixar workflows, automações ou instruções de contribuição apontando aos repositórios antigos como destino de desenvolvimento. Manter seus URLs somente como proveniência/arquivo.
- Na primeira versão, não depender de scripts. Se forem introduzidos depois, limitar a bootstrap e verificação segura; nunca esconder deploys ou mutações remotas em comandos inesperados.


