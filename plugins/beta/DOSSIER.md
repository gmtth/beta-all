# Dossier do plugin Beta

**Atualizado:** 2026-10-20  
**Componente ativo:** `plugins/beta/`  
**Fonte importada:** `gmtth/plugin-beta`, branch `main`, commit `f63afd20d346cd666c2f2b7908683be76eb16ea5` (registrado em `docs/migration/SOURCE_IMPORTS.tsv`).

## Limite desta reconstrução

Este dossier foi criado retroativamente após a consolidação. Baseia-se no snapshot de código e documentos importados, no manifesto do plugin, na matriz de roteamento e nos repositórios históricos de skills preservados em `legacy/source-archives/`. Não foi encontrada uma exportação integral das conversas históricas do plugin nem um dossier retroativo anterior. Portanto, fatos de implementação são descritos como observáveis no snapshot; motivações ou datas de decisões só são afirmadas quando há registro explícito. Este arquivo não é transcrição de conversas.

## Resumo canônico atual

O plugin, identificado no manifesto como `suite-beta` e com versão `1.2.0` no snapshot importado, reúne a família Beta ANL e Beta MOD em uma experiência com uma skill principal, `beta`, que atua como control plane e roteia para módulos especializados. O manifesto ativa a pasta `skills/` e configura `.mcp.json`; a integração declarada com o MCP é somente leitura.

O plugin deve permanecer editável e publicável de forma independente dentro do monorepo. As regras normativas estão em [`AGENTS.md`](./AGENTS.md) e nas skills correspondentes; este dossier registra o mapa, fatos e estado, sem substituir instruções especializadas.

## Arquitetura observada

- **Entrada/orquestração:** `skills/beta/` escolhe um modo primário ANL ou MOD, aciona somente módulos necessários, fecha handoffs e consolida a resposta.
- **Módulos ANL:** dúvidas funcionais, regras de negócio, triagem de incidentes, QA (testes e resultados), geração de cards e Movidesk.
- **Módulos MOD:** regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA e artefatos.
- **Capacidades adicionais:** `beta-anl-clickupchecklist` para sincronização estreita de checklist existente no ClickUp; `beta-mod-sites` para materialização de clone web isolado.
- **Protocolo transversal:** evidências, classificação de certeza, vigência, handoffs e limites de publicação em `skills/beta/references/protocolo-evidencias-e-handoffs.md`.
- **Referências compartilhadas:** Knowledge Master, integridade e materiais de apoio em `references/`; arquivos `origem-*.md` preservam rastreabilidade e não são reescritos como instruções novas.
- **Contrato e verificações:** `tests/beta-routing-cases.json` e scripts de validação verificam cobertura/estrutura de roteamento; a lista atual de subskills e comandos fica em `AGENTS.md`.
- **MCP declarado:** `.mcp.json` aponta para `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`. O endpoint termina em `/mcp/`; o runtime e seu estado publicado são documentados no dossier MCP e em `docs/components/sites.md`.

## Diretriz de nomenclatura das skills

Registrada em 2026-10-20 a pedido do usuário. A convenção normativa está em [`AGENTS.md`](./AGENTS.md), seção “Padrão de nomenclatura”. Somente a orquestradora usa o identificador técnico `beta` e o nome exibido `Beta`. As demais usam identificadores técnicos no padrão `beta-anl-identificação` para análise ou `beta-mod-identificação` para modelagem; quando associadas a uma ferramenta, o nome da ferramenta vem primeiro na identificação técnica e também no nome exibido. Nomes exibidos das skills especializadas devem ser curtos, explicativos, sem `Beta`/`ANL`/`MOD` como prefixo e sem travessão, preferencialmente com duas palavras e no máximo três quando a clareza exigir.

A migração coordenada foi aprovada e aplicada em 2026-10-20. Os identificadores técnicos abaixo são os vigentes; a primeira coluna preserva os identificadores anteriores para rastreabilidade. Foram atualizados nomes de pastas, frontmatter, roteamento, handoffs, referências, fixtures, validadores e documentação. Os nomes exibidos das 19 skills especializadas foram encurtados; a orquestradora permanece `Beta`.

| Identificador técnico anterior | Identificador técnico vigente | Nome exibido anterior | Nome exibido vigente |
|---|---|---|---|
| `beta` | `beta` | Beta | Beta |
| `beta-anl-duvidas-funcionais` | `beta-anl-duvidasfuncionais` | Beta ANL — Dúvidas funcionais | Dúvidas funcionais |
| `beta-anl-gerador-cards-clickup` | `beta-anl-clickupgeradorcards` | Beta ANL — Gerador de cards ClickUp | ClickUp Cards |
| `beta-anl-movidesk` | `beta-anl-movidesk` | Beta ANL — Movidesk | Movidesk |
| `beta-anl-qa-resultados` | `beta-anl-qaresultados` | Beta ANL — QA resultados | Resultados QA |
| `beta-anl-qa-testes` | `beta-anl-qatestes` | Beta ANL — QA testes funcionais | Testes funcionais |
| `beta-anl-regras-negocio` | `beta-anl-regrasnegocio` | Beta ANL — Regras de negócio | Regras de negócio |
| `beta-anl-triagem-incidentes` | `beta-anl-triagemincidentes` | Beta ANL — Triagem de incidentes | Triagem de incidentes |
| `beta-clk-checklist` | `beta-anl-clickupchecklist` | Beta CLK Checklist | ClickUp Checklist |
| `beta-mod-artefatos` | `beta-mod-artefatos` | Beta MOD — Artefatos | Artefatos |
| `beta-mod-dossie` | `beta-mod-dossie` | Beta MOD — Dossiê | Dossiê |
| `beta-mod-figma` | `beta-mod-figma` | Beta MOD — Figma | Figma |
| `beta-mod-fluxos` | `beta-mod-fluxos` | Beta MOD — Fluxos | Fluxos |
| `beta-mod-fontes` | `beta-mod-fontes` | Beta MOD — Fontes | Fontes |
| `beta-mod-permissoes` | `beta-mod-permissoes` | Beta MOD — Permissões | Permissões |
| `beta-mod-processamento` | `beta-mod-processamento` | Beta MOD — Processamento | Processamento |
| `beta-mod-qa` | `beta-mod-qa` | Beta MOD — QA | QA |
| `beta-mod-regras` | `beta-mod-regras` | Beta MOD — Regras | Regras |
| `beta-mod-relatorios` | `beta-mod-relatorios` | Beta MOD — Relatórios | Relatórios |
| `beta-sites` | `beta-mod-sites` | Beta SIT | Sites |

## Diretriz visual e completude dos metadados

Toda skill ativa deve preencher `display_name`, `short_description`, `icon_small`, `icon_large`, `brand_color`, `default_prompt` e `policy.allow_implicit_invocation` em `agents/openai.yaml`. Os campos `icon_small` e `icon_large` são os dois logos da interface; podem referenciar o mesmo arquivo ou arquivos distintos. Os assets precisam existir, estar versionados na pasta da skill e corresponder ao produto/família. A orquestradora é a única com `allow_implicit_invocation: true`; as especializadas usam `false`. Sempre declarar `dependencies.tools` quando a skill depender de uma ferramenta/conexão externa suportada pelo formato e runtime. Não criar dependências fictícias: quando a integração necessária não tiver configuração suportada e verificada, registrar essa limitação e manter a dependência pendente.

Defaults visuais observados para orientar a padronização, sem alterar os assets nesta decisão:

| Grupo/skill | Logo atual | Cor atual | Tratamento |
|---|---|---|---|
| ANL em geral | `./assets/fundo.png` | `#C11D26` | Reutilizar como padrão ANL |
| MOD em geral | `./assets/beta-mod.png` | `#E3DB0B` | Reutilizar como padrão MOD; conferir contraste em futuras alterações |
| Movidesk | `./assets/fundo.png` próprio da skill | `#FF2A28` | Exceção de produto aprovada, manter identidade própria |
| ClickUp Cards e ClickUp Checklist | `./assets/small-logo.png` e `./assets/large-logo.png` em cada pasta de skill | `#754FF6` | Identidade compartilhada das skills ClickUp |
| Sites | `./assets/beta-sit.png` | `#168DE4` | Exceção de produto aprovada, manter identidade própria |

Na migração, os 20 arquivos `agents/openai.yaml` foram revisados: os nomes exibidos foram atualizados conforme a tabela e `beta-anl-clickupchecklist` recebeu um `default_prompt` coerente com seu limite de escrita e pré-condições de autorização. As 20 skills mantêm `brand_color`, `icon_small` e `icon_large`; os assets não foram alterados. A skill Movidesk declara sua dependência MCP. A skill de checklist usa ferramentas do ClickUp, mas esta configuração não declara um servidor ClickUp verificável; não inventar `dependencies.tools` sem a conexão suportada identificada.

Em 2026-10-20, `beta-anl-clickupgeradorcards` passou a compartilhar a cor `#754FF6` e os logos do ClickUp Checklist. Os dois arquivos de logo foram copiados para a pasta da skill de cards para manter os assets autossuficientes e empacotáveis.

O manifesto de nível do plugin também tem `interface.brandColor`, `interface.composerIcon` e `interface.logo`. Em 2026-10-20, `interface.shortDescription` foi reduzida para “Análise e modelagem funcional” (29 caracteres) e `interface.defaultPrompt` passou a conter três opções, respeitando o formato de pacote. A terceira opção cobre checklist e card ClickUp; a primeira mantém um exemplo de consulta ao Movidesk.

## Princípios comportamentais registrados

- Selecionar uma intenção e um modo primário; não executar ANL e MOD em paralelo por padrão.
- Preservar a autoridade e especificidade das skills. O control plane roteia e consolida; não deve duplicar instruções locais nem “promover” ticket, hipótese ou precedente a regra confirmada.
- Fazer handoff somente quando outra skill puder fornecer evidência ou decisão necessária, e retornar com uma síntese única.
- Distinguir regra confirmada, fato operacional, precedente, padrão, hipótese e lacuna; manter incertezas visíveis.
- Respeitar os limites de segurança e publicação de cada skill e do MCP. A skill `beta-mod-sites` opera em clone isolado e não se conecta ao backend real.

## Registro histórico reconstruído

| Marco ou evidência | O que se pode afirmar | Fonte / limite |
|---|---|---|
| Componentes precursores | Repositórios separados de skills ANL/MOD, Sites e Movidesk foram preservados como históricos; sua importação não os torna ativos automaticamente | `docs/migration/source-inventory.md`, `SOURCE_IMPORTS.tsv` e `legacy/source-archives/` |
| Consolidação do plugin | O plugin `gmtth/plugin-beta` foi importado em `plugins/beta/` no commit listado acima; o agregador `suite-beta` e skills independentes foram guardados em `legacy/` | Inventário de migração e manifestos SHA-256; não implica que cada skill histórica faça parte do plugin ativo |
| Orquestrador atual | A skill `beta` é a entrada automática e as 19 subskills especializadas são explicitamente roteáveis segundo as instruções e a matriz do snapshot | `plugins/beta/AGENTS.md`, `skills/beta/SKILL.md`, `tests/beta-routing-cases.json` |
| Integração MCP | O plugin aponta para o endpoint Sites/MCP documentado; isso configura o cliente, mas não comprova publicação ou conectividade end-to-end | `.mcp.json`, `docs/components/sites.md` e estado publicado registrado no dossier MCP |
| Validação da consolidação | Os validadores do plugin foram registrados como aprovados em 2026-10-20 durante a consolidação | `AGENTS.md` raiz; o estado deve ser revalidado após mudanças posteriores |

Não há material suficiente para atribuir cronologia ou motivo detalhado a toda evolução do plugin. Para recuperar um caso histórico específico, consulte as histórias preservadas em `legacy/source-archives/` ou os exports disponíveis; não deduza intenção apenas de uma mudança de código.

## Fontes de verdade e precedência

1. Pedido explícito atual do usuário e regras globais do monorepo.
2. `plugins/beta/AGENTS.md` para regras do componente.
3. Skills, referências e testes ativos para contratos específicos.
4. Este dossier para estado, evidências e histórico resumido.
5. Inventários, snapshots e históricos de `legacy/` para proveniência e comparação, nunca como instruções atuais sem reconciliação.

Em divergências, preserve as evidências e marque o ponto como divergente até resolver por fonte vigente. Não sincronize o mesmo texto indiscriminadamente entre todas as skills e dossiers.

## Pendências e critérios de prontidão

- Nomenclatura técnica e nomes exibidos aplicados em 2026-10-20; a tabela acima conserva a correspondência anterior → vigente.
- O marketplace GitHub se chama **Beta** e está definido em `.agents/plugins/marketplace.json` na raiz do monorepo, apontando para este pacote em `plugins/beta/`. A configuração/importação no workspace ainda não foi realizada; o procedimento e as limitações de superfície estão em [`plugin-marketplace.md`](../../docs/components/plugin-marketplace.md).
- Manter a matriz e os testes de roteamento alinhados quando skills forem renomeadas, adicionadas ou removidas.
- Ao mudar integração MCP, validar o contrato do plugin, o escopo OAuth, o endpoint/deployment e o comportamento publicado separadamente.
- Ao mudar regra transversal, atualizar o protocolo compartilhado e os testes; manter as regras próprias em cada skill.
- A conexão Supabase/`knowledge:read` não torna o plugin uma busca diagnóstica completa: ingestão, busca híbrida, filtros de classificação e resposta citada são dependências do MCP/base e permanecem estados separados.
- Revalidar empacotamento e validadores antes de uma nova publicação do plugin.

## Como atualizar este dossier

Registre alterações duráveis com data, arquivos/commit como evidência, estado (confirmado, pendente, divergente ou histórico) e impacto em outros componentes. Atualize o dossier raiz somente quando houver efeito compartilhado. Mantenha esta reconstrução como tal; não acrescente fatos de conversa que não estejam acessíveis ou corroborados.
