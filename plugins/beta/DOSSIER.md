# Dossier do plugin Beta

**Atualizado:** 2026-10-20

**Componente:** `plugins/beta/`

**Manifesto:** `suite-beta`, versão `1.0.4`

## Resumo e escopo

O plugin reúne a família Beta ANL e Beta MOD em uma experiência com a skill `beta` como entrada e orquestradora. Ela encaminha tarefas às skills especializadas, consolida respostas e mantém o comportamento transversal descrito em suas instruções.

Este dossier cobre o pacote do plugin, suas skills, referências, metadados, configuração MCP, roteamento e publicação pelo marketplace GitHub. O código e estado do runtime MCP/OAuth e da integração Supabase têm dossiers próprios em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md).

Este dossier foi reconstruído retroativamente após a consolidação. Baseia-se no snapshot importado, manifesto, matriz de roteamento e repositórios históricos preservados em `legacy/source-archives/`. Não foi encontrada uma exportação integral das conversas históricas nem um dossier retroativo anterior. Fatos de implementação são descritos como observáveis nas fontes disponíveis; não é uma transcrição de conversas.

## Estado atual

- O pacote contém 20 skills: a orquestradora `beta` e 19 skills especializadas ANL/MOD.
- O manifesto `.codex-plugin/plugin.json` conserva a identidade `suite-beta` e está na versão `1.0.4`. `interface.shortDescription` tem 29 caracteres e `interface.defaultPrompt` contém três opções.
- O Knowledge Master vigente é [`CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`](./references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md). Ele resolve duas referências quebradas com anchors explícitos; o snapshot `v001` está preservado sem alteração. O relatório correspondente está em [`KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md`](./references/KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md).
- Dezesseis skills estão na revisão `metadata.version` `"3"`; `beta-mod-qa` e `beta-mod-sites` permanecem em `"2"`; `beta` e `beta-anl-movidesk` passaram à revisão `"4"` para documentar a ingestão explícita. A contagem inicial foi `"1"`; os incrementos seguem a regra definida em [`AGENTS.md`](./AGENTS.md).
- Os metadados das skills incluem nomes técnicos e exibidos vigentes, descrições, prompts, política de invocação, cores e logos. As skills ClickUp Cards e ClickUp Checklist compartilham brand color `#754FF6` e os logos small/large, copiados para cada pasta para manter o pacote autossuficiente.
- `beta-anl-clickupchecklist` tem prompt padrão coerente com sua restrição de atualizar apenas o comentário mais recente “Checklist de testes” e com as informações necessárias da rodada.
- A integração configurada em `.mcp.json` aponta para `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`. Consultas ao Movidesk permanecem somente leitura; a importação explicitamente solicitada de chamados para a base interna é uma escrita restrita e auditada, descrita na skill `beta-anl-movidesk`. Endpoint, publicação e migração são acompanhados pelo dossier MCP; a configuração local não prova conectividade end-to-end.
- O marketplace GitHub **Beta** está configurado na raiz do monorepo para apontar a este pacote. A importação/sincronização no workspace e o uso pelos quatro analistas ainda precisam ser confirmados; consulte [`plugin-marketplace.md`](../../docs/components/plugin-marketplace.md).
- Os validadores `validate_beta_anl_skills.py` e `validate_beta_routing_cases.py` foram executados em 2026-10-20 após os ajustes de referências técnicas, snapshot, metadados e versionamento; ambos passaram sem erros (20 skills e 24 casos de roteamento).

## Decisões vigentes

### Nomenclatura técnica e exibida

A orquestradora é a única skill com identificador técnico `beta` e nome exibido `Beta`. As demais usam `beta-anl-identificação` para análise ou `beta-mod-identificação` para modelagem. Quando relacionadas a uma ferramenta, o nome da ferramenta aparece primeiro no identificador e no nome exibido. Nomes exibidos especializados são curtos, não começam por Beta/ANL/MOD e não usam travessão.

Dentro do pacote, referências internas usam sempre o identificador técnico: pasta, `name`, títulos de `SKILL.md`, roteamento, handoffs, exemplos de invocação, documentação e validações. O nome exibido de `agents/openai.yaml` fica reservado à interface e a textos voltados ao usuário quando a apresentação visual do nome for relevante. Assim, por exemplo, o título interno é `beta-anl-clickupchecklist`, enquanto o nome de interface é `ClickUp Checklist`.

A migração de nomes foi aplicada em 2026-10-20: pastas, frontmatter, roteamento, referências, fixtures, validadores e metadados foram atualizados. Esta tabela preserva o mapeamento anterior para consulta histórica.

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

### Metadados, identidade visual e dependências

- Cada skill deve preencher `display_name`, `short_description`, `icon_small`, `icon_large`, `brand_color`, `default_prompt` e `policy.allow_implicit_invocation` em `agents/openai.yaml`.
- Manter os dois logos preenchidos com assets existentes e versionados dentro da pasta da skill. Skills ANL e MOD reutilizam os logos e cores canônicos de suas famílias, salvo exceções aprovadas.
- Movidesk (`#FF2A28`), Sites (`#168DE4`) e as duas skills ClickUp (`#754FF6`) são exceções visuais registradas. ClickUp Cards e ClickUp Checklist têm cópias locais dos mesmos logos pequeno e grande.
- Declarar `dependencies.tools` sempre que uma skill depender de uma ferramenta/conexão externa suportada pelo formato e runtime. Não inventar dependências. A skill Movidesk declara a conexão MCP; não há uma definição verificável de servidor ClickUp no pacote atual, portanto a dependência ClickUp permanece pendente de confirmação.
- `policy.allow_implicit_invocation` é `true` somente para `beta`; todas as especializadas usam `false`.
- O manifesto deve respeitar limites do formato: `shortDescription` com até 30 caracteres e `defaultPrompt` com até três opções. A configuração vigente cumpre esses limites.

| Grupo/skill | Logo vigente | Cor | Diretriz |
|---|---|---|---|
| ANL em geral | `./assets/fundo.png` | `#C11D26` | Reutilizar como padrão ANL. |
| MOD em geral | `./assets/beta-mod.png` | `#E3DB0B` | Reutilizar como padrão MOD; conferir contraste em futuras alterações. |
| Movidesk | `./assets/fundo.png` na pasta da skill | `#FF2A28` | Exceção de produto aprovada. |
| ClickUp Cards e ClickUp Checklist | `./assets/small-logo.png` e `./assets/large-logo.png` em cada pasta | `#754FF6` | Identidade compartilhada ClickUp, mantida autossuficiente em cada skill. |
| Sites | `./assets/beta-sit.png` | `#168DE4` | Exceção de produto aprovada. |

### Comportamento e proteção

- Selecionar uma intenção e um modo primário; não acionar ANL e MOD em paralelo sem necessidade.
- Preservar autoridade das skills. Não converter ticket, hipótese ou precedente isolado em regra, requisito ou causa confirmada.
- Fazer handoff apenas quando outra skill puder fornecer evidência ou decisão necessária e devolver uma síntese consolidada.
- Distinguir regra confirmada, fato operacional, precedente, padrão, hipótese e lacuna.
- Respeitar limites de segurança e publicação do MCP. `beta-mod-sites` trabalha em clone isolado e não se conecta ao backend real do CENCIHUB.
- Tratar arquivos `references/origem-*.md` como fontes de rastreabilidade; não reescrevê-los como novas instruções.

## Mapa dos componentes

| Caminho | Responsabilidade |
|---|---|
| `skills/beta/` | Entrada, control plane, roteamento e protocolo transversal |
| `skills/beta-anl-*/` | Dúvidas funcionais, regras, triagem, QA, ClickUp e Movidesk |
| `skills/beta-mod-*/` | Modelagem de regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA, artefatos e Sites |
| `references/` | Knowledge Master, integridade e apoio compartilhado |
| `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md` | Snapshot vigente, com links internos resolvidos; `v001` preservado |
| `tests/beta-routing-cases.json` | Casos de contrato e cobertura de roteamento |
| `scripts/` | Validadores estruturais e de cobertura das skills/roteamento |
| `.codex-plugin/plugin.json` | Manifesto e metadados do pacote |
| `.mcp.json` | Servidor MCP declarado para o plugin |
| `../../.agents/plugins/marketplace.json` | Registro do marketplace Beta no monorepo |

O protocolo transversal de evidências, certeza, vigência, handoffs e publicação está em `skills/beta/references/protocolo-evidencias-e-handoffs.md`. A skill `beta` encaminha para módulos especializados e mantém a resposta final; os contratos locais de cada módulo permanecem em seu `SKILL.md` e referências.

As especialidades ANL cobrem dúvidas funcionais, regras de negócio, triagem de incidentes, QA de testes e resultados, geração de cards ClickUp, checklist ClickUp e consulta Movidesk. As especialidades MOD cobrem regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA e artefatos. As antigas orquestradoras `beta-anl-router` e `beta-mod` não fazem parte do diretório ativo; seus contratos foram incorporados à skill `beta`, e cópias de auditoria são mantidas fora do pacote ativo.

## Histórico de mudanças

| Data/marco | Alteração ou evidência | Fonte e limite |
|---|---|---|
| Importação inicial | O plugin `gmtth/plugin-beta`, branch `main`, commit `f63afd20d346cd666c2f2b7908683be76eb16ea5`, foi consolidado em `plugins/beta/`; proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. | Snapshot importado e inventários. |
| Reconstrução do dossier | Este registro foi criado a partir do código, instruções, manifestos e arquivos históricos; não existe transcrição integral das conversas. | `legacy/source-archives/` e documentação de migração. |
| 2026-10-20, nomenclatura | Identificadores técnicos de oito skills e nomes exibidos das 19 especializadas foram padronizados. Nomes anteriores estão preservados na tabela de decisões para rastreabilidade. | Pastas, `SKILL.md`, roteamento, referências, fixtures e metadados ativos. |
| 2026-10-20, revisão de `SKILL.md` | Revisados os 20 frontmatters, os links relativos e os identificadores citados. Títulos internos foram alinhados aos nomes exibidos e, nesta revisão, corrigidos para os identificadores técnicos; invocação/exemplo do ClickUp Checklist também foi atualizado após encontrar referências antigas. | Todos os `skills/*/SKILL.md`; identificadores sem diretório de skill ativo são nomes de referências/control planes ou menções históricas. |
| 2026-10-20, versionamento inicial | Inicializada a contagem do pacote em `1.0.0` e das 20 skills em `"1"`; futuras alterações incrementam o patch do pacote e somente as skills afetadas. | `.codex-plugin/plugin.json`, `skills/*/SKILL.md` e regra em `AGENTS.md`. |
| 2026-10-20, referência técnica e versão | Decidido que conteúdo interno referencia skills por identificador técnico, reservando `display_name` para interface e comunicação voltada ao usuário. Títulos dos 20 `SKILL.md` foram alinhados às pastas/identificadores; todas as skills passaram à revisão `"2"` e o manifesto a `1.0.1`. | Regra em `AGENTS.md`, todos os `skills/*/SKILL.md` e `.codex-plugin/plugin.json`. |
| 2026-10-20, validação e versão | Os validadores de skills e roteamento passaram sem erros. O manifesto foi incrementado para `1.0.2` para registrar esta atualização do dossier; as versões das skills não mudaram. | Saída recente de `python scripts/validate_beta_anl_skills.py` e `python scripts/validate_beta_routing_cases.py`; `.codex-plugin/plugin.json`. |
| 2026-10-20, referências técnicas e Knowledge Master | Referências internas a skills foram padronizadas com identificadores técnicos. Links quebrados no snapshot foram resolvidos em nova versão `v002`, preservando `v001` e os hashes das seis fontes. Dezoito skills passaram à revisão `"3"`; o manifesto passou a `1.0.3`. | Skills e referências alteradas; `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`; relatório de integridade correspondente. |
| 2026-10-20, metadados | O prompt padrão de ClickUp Checklist foi preenchido; o manifesto foi ajustado para descrição de 29 caracteres e três prompts; ClickUp Cards recebeu os logos e a cor de ClickUp Checklist. | `.codex-plugin/plugin.json`, arquivos `agents/openai.yaml` e assets nas duas skills ClickUp. |
| 2026-10-20, importação explícita de conhecimento | A skill Beta agora permite importar chamados ao Supabase somente após pedido explícito, sem alterar o Movidesk. `beta` e `beta-anl-movidesk` passaram à revisão `"4"`; o manifesto passou a `1.0.4`. | Skills, instruções MCP do Sites e documentação operacional; implementação/publicação continuam no estado do dossier MCP. |
| Integração MCP | `.mcp.json` configura o endpoint documentado do Sites/MCP, mas isso não comprova conectividade ou publicação end-to-end. | `.mcp.json`, `docs/components/sites.md` e `mcp/movidesk/DOSSIER.md`. |

Não há evidência suficiente para atribuir data ou motivação a toda a evolução anterior do plugin. Para casos históricos específicos, consultar o arquivo de origem e o repositório preservado; não deduzir intenção apenas a partir de uma alteração de código.

## Próximos passos

| Item | Estado | Condição para concluir |
|---|---|---|
| Sincronização/importação do marketplace Beta no workspace | Pendente de confirmação | Configurar/confirmar o marketplace e verificar a disponibilidade da skill para os analistas. |
| Dependência declarativa ClickUp | Pendente de verificação do formato/runtime | Identificar e validar a conexão ClickUp suportada; então declarar `dependencies.tools` sem inventar endpoints ou IDs. |
| Importação MCP/Supabase em produção | Runtime publicado na versão 74; ainda pendente de uso autenticado | Reautorizar scopes no cliente MCP e confirmar a importação do ticket piloto; não inferir sucesso da configuração local. |
| Busca diagnóstica completa | Pendente em MCP/base | Ingestão, busca híbrida, filtros de classificação, reranking, citações e avaliação permanecem etapas separadas. |

Ao confirmar a conclusão de um item, retire-o desta lista e registre a evidência no histórico. A implementação de OAuth e a migration/runtime atuais são acompanhadas em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md#próximos-passos) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md#próximos-passos).

## Fontes de verdade

1. Pedido explícito atual do usuário e regras globais do monorepo em [`../../AGENTS.md`](../../AGENTS.md).
2. Regras específicas deste componente em [`AGENTS.md`](./AGENTS.md).
3. Contratos ativos em `skills/*/SKILL.md`, referências e `tests/beta-routing-cases.json`.
4. Este dossier para estado, decisões registradas, histórico e pendências.
5. Inventários, snapshots e materiais em `legacy/` para proveniência, não como instruções vigentes sem reconciliação.

Para identidade e comportamento de publicação do Sites/MCP, consultar [`../../docs/components/sites.md`](../../docs/components/sites.md) e [`../../mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md). Para regras e estado do conhecimento Supabase, consultar [`../../infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md). Em conflito, preservar a evidência, identificar escopo/data e aplicar a precedência explícita; não apagar divergências silenciosamente.
