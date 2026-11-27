# Dossier do plugin Beta

**Atualizado:** 2026-11-27

**Componente:** `plugins/beta/`

**Manifesto:** `suite-beta`, versão `1.0.17`

## Resumo e escopo

O plugin reúne a família Beta ANL e Beta MOD em uma experiência com a skill `beta` como entrada e orquestradora. Ela encaminha tarefas às skills especializadas, consolida respostas e mantém o comportamento transversal descrito em suas instruções.

Este dossier cobre o pacote do plugin, suas skills, referências, metadados, configuração MCP, roteamento e publicação pelo marketplace GitHub. O código e estado do runtime MCP/OAuth e da integração Supabase têm dossiers próprios em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md).

Este dossier foi reconstruído retroativamente após a consolidação. Baseia-se no snapshot importado, manifesto, matriz de roteamento e repositórios históricos preservados em `legacy/source-archives/` na árvore Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4`; a pasta foi removida da árvore ativa e continua recuperável pelo histórico. Não foi encontrada uma exportação integral das conversas históricas nem um dossier retroativo anterior. Fatos de implementação são descritos como observáveis nas fontes disponíveis; não é uma transcrição de conversas.

## Estado atual

- O pacote contém 21 skills: a orquestradora `beta` e 20 skills especializadas ANL/MOD.
- O manifesto `.codex-plugin/plugin.json` conserva a identidade `suite-beta` e está na versão local `1.0.17`. `interface.shortDescription` tem 29 caracteres e `interface.defaultPrompt` contém três opções.
- As referências de observabilidade e regressão foram alinhadas ao protocolo transversal e a uma fixture neutra externa. `beta` passou à revisão `"10"` e `beta-mod-artefatos` à `"4"`. A avaliação pré-merge registrou checks estruturais aprovados para três DOCX, mas não concluiu a inspeção visual; o impacto comportamental não foi demonstrado.
- O Knowledge Master vigente é [`CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`](./references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md). Ele resolve duas referências quebradas com anchors explícitos; o snapshot `v001` está preservado sem alteração. O relatório correspondente está em [`KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md`](./references/KNOWLEDGE_MASTER_INTEGRITY__2026-10-20__v002.md).
- `beta-anl-movidesk-relatorios` está na revisão `metadata.version` `"3"`; `beta-anl-movidesk` está na revisão `"7"`. `beta-mod-qa` e `beta-mod-sites` permanecem em `"2"`; `beta` está em `"10"`, `beta-mod-artefatos` em `"4"` e `beta-anl-qatestes` em `"4"`. As demais versões seguem os registros existentes; incrementos seguem [`AGENTS.md`](./AGENTS.md).
- Os metadados das skills incluem nomes técnicos e exibidos vigentes, descrições, prompts, política de invocação, cores e logos. As skills ClickUp Cards e ClickUp Checklist compartilham brand color `#754FF6` e os logos small/large, copiados para cada pasta para manter o pacote autossuficiente.
- `beta-anl-clickupchecklist` tem prompt padrão coerente com sua restrição de atualizar apenas o comentário mais recente “Checklist de testes” e com as informações necessárias da rodada.
- A integração configurada em `.mcp.json` aponta para `https://beta-mcp.thngrns.chatgpt.site/mcp/`. Consultas ao Movidesk permanecem somente leitura; a importação explicitamente solicitada de chamados para a base interna é uma escrita restrita e auditada, descrita na skill `beta-anl-movidesk`. Endpoint, publicação e migração são acompanhados pelo dossier MCP; a configuração local não prova conectividade end-to-end.
- **Host canônico alterado (2026-11-27):** as duas skills Movidesk e o pacote Beta Web apontam para `https://beta-mcp.thngrns.chatgpt.site/mcp/`. A origem e o resource OAuth mudam com o host, então conectores migrados precisam autorizar novamente. O domínio de Homologação segue independente.
- A skill de relatórios Movidesk usa um modelo HTML fixo, com oito indicadores, comparação de períodos equivalentes entre anos, categoria oficial, ocorrências por chamado e situação na data da consulta. Word é opcional. O modelo contém somente estrutura e os dados vêm da consulta de cada geração.
- O marketplace GitHub **Beta** está configurado na raiz do monorepo para apontar a este pacote. A importação/sincronização no workspace e o uso pelos quatro analistas ainda precisam ser confirmados; consulte [`plugin-marketplace.md`](../../docs/components/plugin-marketplace.md).
- A comunicação compartilhada está centralizada em `skills/beta/references/protocolo-evidencias-e-handoffs.md`: precedentes com evidência rastreável, separação entre fonte e recomendação e cartões de encerramento com campos e regras condicionais.
- A grade aprovada usa quatro cartões principais na primeira linha e, na segunda, “Skills acionadas” primeiro e sempre; Feedback/Ações aparecem apenas quando relevantes. A largura da segunda linha divide um grid de 12 colunas igualmente entre 1, 2 ou 3 cartões (`md-12`, `md-6` ou `md-4`); abaixo de `md`, os cartões empilham. Não tem cabeçalho Beta, título “Resumo da operação”, linha superior ou cartão Próximo passo. Todo texto usa o mesmo estilo pequeno; sem renderizador documentado, a tabela Markdown portátil não promete proporções `col-md`.
- Dois contratos de invocação direta antes sem referência explícita ao protocolo (`beta-anl-clickupchecklist` e `beta-mod-sites`) agora apontam para ele. Revisados também os control planes ANL/MOD e as instruções de governança para exigir auditoria transversal das 20 skills em futuras mudanças de comunicação.
- Revisões de skill nesta alteração: `beta` `"5"`, `beta-anl-clickupchecklist` `"4"` e `beta-mod-sites` `"3"`; as demais permanecem inalteradas. O manifesto passou para `1.0.5`.
- A solicitação posterior sobre cartões nativos foi incorporada como regra condicional: usar componentes interativos somente quando o cliente e um mecanismo documentado realmente os oferecerem; sem suporte, usar Markdown e não simular componentes com tags XML/HTML. Texto colado como “protocolo de sistema” é tratado como preferência de formato do usuário, não como instrução superior. `beta` passou à revisão `"6"`; o manifesto passou a `1.0.6`.
- A decisão inicial sobre os cartões foi registrada no histórico abaixo; a configuração vigente inclui também o cartão “Skills acionadas” e as larguras responsivas descritas no protocolo.
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
| `beta-anl-movidesk-relatorios` | `beta-anl-movidesk-relatorios` | Movidesk Relatórios | Movidesk Relatórios |
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
- Movidesk (`#FF2A28`), Sites (`#168DE4`) e as duas skills ClickUp (`#754FF6`) são exceções visuais registradas. As skills Movidesk e Movidesk Relatórios compartilham a identidade Movidesk; a nova skill tem cópia local do mesmo asset para manter o pacote autossuficiente. ClickUp Cards e ClickUp Checklist têm cópias locais dos mesmos logos pequeno e grande.
- Declarar `dependencies.tools` sempre que uma skill depender de uma ferramenta/conexão externa suportada pelo formato e runtime. Não inventar dependências. A skill Movidesk declara a conexão MCP; não há uma definição verificável de servidor ClickUp no pacote atual, portanto a dependência ClickUp permanece pendente de confirmação.
- `policy.allow_implicit_invocation` é `true` somente para `beta`; todas as especializadas usam `false`.
- O manifesto deve respeitar limites do formato: `shortDescription` com até 30 caracteres e `defaultPrompt` com até três opções. A configuração vigente cumpre esses limites.
- A comunicação final segue o protocolo transversal: precedentes com evidência rastreável e cartões compactos conforme formato e capacidade disponíveis. A grade aprovada não tem cabeçalho/título/linha superior nem cartão Próximo passo; Feedback e Ações são condicionais. A confiabilidade é percentual heurístico inteiro em incrementos de 10, não probabilidade calibrada. Componentes nativos dependem de suporte explícito do cliente; o pacote não promete renderização idêntica entre clientes.

| Grupo/skill | Logo vigente | Cor | Diretriz |
|---|---|---|---|
| ANL em geral | `./assets/fundo.png` | `#C11D26` | Reutilizar como padrão ANL. |
| MOD em geral | `./assets/beta-mod.png` | `#E3DB0B` | Reutilizar como padrão MOD; conferir contraste em futuras alterações. |
| Movidesk | `./assets/fundo.png` na pasta da skill | `#FF2A28` | Exceção de produto aprovada. |
| Movidesk Relatórios | `./assets/fundo.png` na pasta da skill, cópia do asset Movidesk | `#FF2A28` | Reutiliza a identidade Movidesk aprovada. |
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
| `skills/beta-anl-*/` | Dúvidas funcionais, regras, triagem, QA, ClickUp, consultas Movidesk e relatórios executivos Movidesk |
| `skills/beta-mod-*/` | Modelagem de regras, dossiê, fontes, fluxos, permissões, processamento, relatórios, Figma, QA, artefatos e Sites |
| `references/` | Knowledge Master, integridade e apoio compartilhado |
| `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md` | Snapshot vigente, com links internos resolvidos; `v001` preservado |
| `tests/beta-routing-cases.json` | Casos de contrato e cobertura de roteamento |
| `scripts/` | Validadores estruturais e de cobertura das skills/roteamento |
| `.codex-plugin/plugin.json` | Manifesto e metadados do pacote |
| `.mcp.json` | Servidor MCP declarado para o plugin |
| `../../.agents/plugins/marketplace.json` | Registro do marketplace Beta no monorepo |

O protocolo transversal de evidências, certeza, vigência, handoffs e publicação está em `skills/beta/references/protocolo-evidencias-e-handoffs.md`. A skill `beta` encaminha para módulos especializados e mantém a resposta final; os contratos locais de cada módulo permanecem em seu `SKILL.md` e referências.

As especialidades ANL cobrem dúvidas funcionais, regras de negócio, triagem de incidentes, QA de testes e resultados, geração de cards ClickUp, checklist ClickUp, consulta Movidesk e relatórios executivos Movidesk. As especialidades MOD cobrem regras, dossiê, fontes, fluxos, permissões, processamento, modelagem de relatórios, Figma, QA e artefatos. As antigas orquestradoras `beta-anl-router` e `beta-mod` não fazem parte do diretório ativo; seus contratos foram incorporados à skill `beta`, e cópias de auditoria são mantidas fora do pacote ativo.

## Contratos de responsabilidade das skills

O contrato entre as skills tem duas camadas. A skill `beta` é a única orquestradora: escolhe a especialidade necessária, coordena handoffs e mantém o protocolo transversal e a resposta consolidada. Cada skill especializada tem um domínio delimitado e devolve seu resultado à `beta`; não passa a decidir regras gerais nem a assumir o papel de outra especialidade. A descrição abaixo é um mapa de navegação e prevenção de regressões. O `SKILL.md` de cada linha continua sendo a fonte normativa para procedimento, formato, autorização e limites completos.

| Identificador técnico | Função própria | Fronteira que deve ser preservada |
|---|---|---|
| `beta-anl-duvidasfuncionais` | Responder dúvidas sobre o CENCIHUB de forma curta, funcional e didática. | Não inventar telas, campos ou fluxos, nem transformar dúvida simples em investigação extensa. |
| `beta-anl-regrasnegocio` | Explicar regras funcionais confirmadas, condições, dependências, exceções e efeitos. | Não derivar regra geral somente de ticket ou de bug histórico. |
| `beta-anl-triagemincidentes` | Isolar sintomas, escopo, reprodução, impacto e evidências ao triar incidentes. | Não fechar causa sem evidência, prometer correção ou tratar precedente como diagnóstico atual. |
| `beta-anl-qatestes` | Criar checklists funcionais, smoke tests e cobertura de regressão proporcional ao risco. | Não inventar requisito, depender de implementação interna ou assumir a organização dos resultados da execução. |
| `beta-anl-qaresultados` | Organizar resultados observados, problemas, evidências e estados da rodada de QA. | Não inventar sucesso, reescrever o checklist nem criar card automaticamente; publicação segue o gate de aprovação da própria skill. |
| `beta-anl-clickupgeradorcards` | Criar, consolidar e revisar cards ClickUp com contexto funcional e rastreabilidade para desenvolvimento. | Não assumir o contrato de checklist nem converter hipótese ou histórico em causa/regra confirmada. |
| `beta-anl-clickupchecklist` | Atualizar apenas o comentário-alvo “Checklist de testes” no ClickUp, segundo o contrato de rodada informado. | Não criar checklist nem alterar tarefa, comentário ou conteúdo fora do alvo autorizado; seguir os gates de seleção, confirmação e validação da skill. |
| `beta-anl-movidesk` | Consultar e sintetizar chamados reais; importar chamados selecionados para a base interna somente mediante pedido explícito. | Consultas não alteram chamados. Importação não muda a origem e não transforma correspondência textual em prova de causa. |
| `beta-anl-movidesk-relatorios` | Consultar Movidesk e gerar relatórios executivos em HTML no formato padrão; primeiro relatório compara três meses completos e acumulado anual. | Não altera tickets nem classifica por texto livre sem taxonomia confirmada; não afirma total completo quando paginação ou fonte estiverem incompletas. |
| `beta-mod-fontes` | Identificar, recuperar, priorizar e comparar fontes, versões, recência e divergências. | Atua em leitura; não decide regra funcional, não persiste Dossiê e não produz modelagem final. |
| `beta-mod-regras` | Verificar completude e rastreabilidade de regras, gatilhos, ações, validações, resultados e estados. | Não cria autoridade de regra nem consolida a Modelagem Funcional final. |
| `beta-mod-fluxos` | Organizar sequências de telas, navegação, interações e estados de interface. | Não inventa telas/regras nem substitui análise de regra, revisão visual no Figma ou modelagem final. |
| `beta-mod-figma` | Inspecionar e comparar a representação visual no Figma, componentes e estados de interface. | É módulo visual; não define regra funcional nem produz modelagem final concorrente. |
| `beta-mod-permissoes` | Analisar autenticação, autorização, papéis, dados sensíveis e isolamento entre empresas. | Não inventa papéis, permissões ou arquitetura; devolve riscos e regras confirmadas para composição pela `beta`. |
| `beta-mod-processamento` | Analisar ciclo de vida funcional, estados, transições, duplicidade, precedência, reprocessamento, falhas e concorrência. | Não inventa tecnologia nem regra; não assume relatórios, permissões especializadas ou modelagem final. |
| `beta-mod-relatorios` | Estruturar relatórios, indicadores, previsões e cálculos de modo reproduzível. | Não inventa fórmulas ou regras e não incorpora processamento ou modelagem final fora desse domínio. |
| `beta-mod-dossie` | Manter o Dossiê de Contexto da Modelagem, distinguindo o que é modelagem, contexto e fora de escopo. | Não cria regra, resolve conflito sem decisão, produz modelagem final ou gera artefatos além do Dossiê. |
| `beta-mod-qa` | Fazer a revisão crítica final de modelagem consolidada, priorizando riscos materiais de implementação, dados e homologação. | Não cria regra, não resolve divergência sem decisão, não reescreve o documento nem produz plano completo de testes. |
| `beta-mod-artefatos` | Materializar conteúdo funcional consolidado em documentos e outros artefatos finais. | Não altera entendimento funcional nem resolve regra/fonte; recebe conteúdo aprovado/consolidado e mantém a responsabilidade documental. |
| `beta-mod-sites` | Materializar um clone web autônomo do CENCIHUB a partir de contexto e regras aprovados. | Permanece isolada; não se conecta ao backend, API, banco, autenticação ou ambiente real. |

### Regra para mudanças nas skills

Antes de qualquer alteração em `SKILL.md`, `agents/openai.yaml`, assets de skill ou comportamento de roteamento diretamente ligado a uma skill, o usuário deve receber um plano exato: skills e arquivos afetados, trechos/metadados que mudarão, comportamento pretendido, impacto positivo esperado, impacto negativo ou regressões possíveis, dependências e validações/versionamento. A edição só começa após aprovação explícita desse plano. Sem aprovação, a atividade permanece em análise/proposta. Mudanças apenas neste dossier ou no AGENT podem documentar o contrato, mas não autorizam alterações implícitas nas skills.

Mudanças comportamentais e de redação devem ser generalizáveis para todo o domínio e fluxo da skill. Não inserir chamados, cards, documentos operacionais, casos concretos ou exemplos nas instruções das skills, nem direcionar regras a um erro ou artefato isolado. Um caso individual pode motivar investigação, mas só pode fundamentar uma regra geral após abstração e justificativa. Necessidades específicas permanecem na conversa ou no artefato correspondente, não na skill.

## Histórico de mudanças

| Data/marco | Alteração ou evidência | Fonte e limite |
|---|---|---|
| Importação inicial | O plugin `gmtth/plugin-beta`, branch `main`, commit `f63afd20d346cd666c2f2b7908683be76eb16ea5`, foi consolidado em `plugins/beta/`; proveniência em `docs/migration/SOURCE_IMPORTS.tsv`. | Snapshot importado e inventários. |
| Reconstrução do dossier | Este registro foi criado a partir do código, instruções, manifestos e arquivos históricos; não existe transcrição integral das conversas. | Histórico Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` e documentação de migração. |
| 2026-10-20, nomenclatura | Identificadores técnicos de oito skills e nomes exibidos das 19 especializadas foram padronizados. Nomes anteriores estão preservados na tabela de decisões para rastreabilidade. | Pastas, `SKILL.md`, roteamento, referências, fixtures e metadados ativos. |
| 2026-10-20, revisão de `SKILL.md` | Revisados os 20 frontmatters, os links relativos e os identificadores citados. Títulos internos foram alinhados aos nomes exibidos e, nesta revisão, corrigidos para os identificadores técnicos; invocação/exemplo do ClickUp Checklist também foi atualizado após encontrar referências antigas. | Todos os `skills/*/SKILL.md`; identificadores sem diretório de skill ativo são nomes de referências/control planes ou menções históricas. |
| 2026-10-20, versionamento inicial | Inicializada a contagem do pacote em `1.0.0` e das 20 skills em `"1"`; futuras alterações incrementam o patch do pacote e somente as skills afetadas. | `.codex-plugin/plugin.json`, `skills/*/SKILL.md` e regra em `AGENTS.md`. |
| 2026-10-20, referência técnica e versão | Decidido que conteúdo interno referencia skills por identificador técnico, reservando `display_name` para interface e comunicação voltada ao usuário. Títulos dos 20 `SKILL.md` foram alinhados às pastas/identificadores; todas as skills passaram à revisão `"2"` e o manifesto a `1.0.1`. | Regra em `AGENTS.md`, todos os `skills/*/SKILL.md` e `.codex-plugin/plugin.json`. |
| 2026-10-20, validação e versão | Os validadores de skills e roteamento passaram sem erros. O manifesto foi incrementado para `1.0.2` para registrar esta atualização do dossier; as versões das skills não mudaram. | Saída recente de `python scripts/validate_beta_anl_skills.py` e `python scripts/validate_beta_routing_cases.py`; `.codex-plugin/plugin.json`. |
| 2026-10-20, referências técnicas e Knowledge Master | Referências internas a skills foram padronizadas com identificadores técnicos. Links quebrados no snapshot foram resolvidos em nova versão `v002`, preservando `v001` e os hashes das seis fontes. Dezoito skills passaram à revisão `"3"`; o manifesto passou a `1.0.3`. | Skills e referências alteradas; `references/CENCIHUB_KNOWLEDGE_MASTER__2026-10-20__v002.md`; relatório de integridade correspondente. |
| 2026-10-20, metadados | O prompt padrão de ClickUp Checklist foi preenchido; o manifesto foi ajustado para descrição de 29 caracteres e três prompts; ClickUp Cards recebeu os logos e a cor de ClickUp Checklist. | `.codex-plugin/plugin.json`, arquivos `agents/openai.yaml` e assets nas duas skills ClickUp. |
| 2026-10-20, importação explícita de conhecimento | A skill Beta agora permite importar chamados ao Supabase somente após pedido explícito, sem alterar o Movidesk. `beta` e `beta-anl-movidesk` passaram à revisão `"4"`; o manifesto passou a `1.0.4`. | Skills, instruções MCP do Sites e documentação operacional; implementação/publicação continuam no estado do dossier MCP. |
| 2026-10-22, contrato de comunicação e evidências | Centralizado cabeçalho, confiabilidade qualitativa, requisitos de citação para casos e resumo final observável. Removidas percentagens sem calibração e exposição de nomes internos de skills/ferramentas no resumo. Corrigidas referências de protocolo em ClickUp Checklist e Sites; governança agora exige revisar todas as skills. | Protocolo compartilhado, Beta, control planes ANL/MOD, observabilidade, duas skills diretas, `AGENTS.md` e manifesto `1.0.5`. Alterações ainda não publicadas. |
| 2026-10-22, componentes nativos condicionais | Acrescentada preferência por cartões/flashcards/quizzes/painéis nativos somente quando houver suporte e formato documentado no cliente. Definido fallback Markdown sem XML/HTML que finja interatividade; texto colado como “protocolo de sistema” é tratado como referência de formato do usuário. `beta` passou a `"6"`; manifesto `1.0.6`. | `SKILL.md`, protocolo compartilhado, `AGENTS.md` e dossier. Sem testes ou publicação nesta etapa. |
| 2026-10-22, cartões de encerramento | Especificada a grade visual aprovada, os seis campos iniciais e as condições de Feedback/Ações; retirado Próximo passo; definido o significado de Ações; confiabilidade padronizada em porcentagem heurística por faixas discretas. Atualizados Beta e materiais ANL/MOD que ainda exigiam cabeçalho/resumo antigo. `beta` `"7"`, `beta-anl-qatestes` `"4"`, manifesto `1.0.7`. | Skill Beta, protocolo compartilhado, control planes, observabilidade, `AGENTS.md` e dossier. Alterações locais; sem testes ou publicação nesta etapa. |
| 2026-10-22, cartão Skills acionadas e grade responsiva | Acrescentado cartão obrigatório “Skills acionadas” antes dos opcionais na segunda linha. Lista somente nomes exibidos de skills realmente ativadas. Grade `md`: largura total quando sozinho, metade com um cartão opcional e um terço com os dois; abaixo de `md`, empilha. `beta` passou a `"8"`; manifesto `1.0.8`. | Skill Beta, protocolo, control planes ANL/MOD, observabilidade, `AGENTS.md` e dossier. Alterações locais; sem testes ou publicação nesta etapa. |
| 2026-10-24, contratos individuais e gate de mudança | Documentada a função e a fronteira de cada uma das 19 skills especializadas; explicitado o papel exclusivo da orquestradora. AGENT e dossier agora exigem plano concreto de mudança com efeitos positivos/negativos e aprovação explícita antes de editar fontes, metadados, assets ou roteamento direto de uma skill. Nenhum `SKILL.md` foi alterado; manifesto incrementado para `1.0.9`. | Matriz baseada nas descrições, seções de responsabilidade, objetivos e limites dos 20 `SKILL.md`; `plugins/beta/AGENTS.md` e este dossier. Versões individuais de skills mantidas. |
| 2026-10-24, neutralidade a casos isolados | Exigido que mudanças de comportamento e redação das skills expressem regras generalizáveis; proíbe-se incluir chamados, cards, documentos, casos concretos ou exemplos nas instruções, ou codificar comportamento com base em um caso isolado. Necessidades específicas permanecem na conversa ou no artefato. Nenhum `SKILL.md` foi alterado; manifesto incrementado para `1.0.10`. | `plugins/beta/AGENTS.md` e decisão solicitada pelo usuário. Versões individuais de skills mantidas. |
| 2026-10-25, diretrizes de escrita e avaliação | Acrescentadas recomendações para fronteira e descrição da skill, instruções concisas com divulgação progressiva, separação entre skill e MCP, dependências confirmadas e avaliação com critérios observáveis. A diretriz de neutralidade Beta prevalece: nenhum exemplo ou caso concreto deve ser incluído nos arquivos de instrução; testes podem usar cenários sintéticos neutros fora deles. Nenhuma skill foi alterada; manifesto incrementado para `1.0.11`. | `plugins/beta/AGENTS.md`; guia oficial [Build skills](https://developers.openai.com/plugins/build/skills), artigo [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra) e [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills). |
| 2026-10-25, modularização e avaliação futura | Refinada a diretriz para apresentar, conforme o caso, opções de dividir uma skill por fluxos distintos ou usar referências/scripts, avaliando custos e benefícios em vez de impor estrutura. Registradas como próximos passos a revisão estrutural das skills e a avaliação de instruções rígidas, autonomia e custo de contexto do `AGENTS.md`, condicionadas à adoção mais ampla e evidências com GPT-6 Astra. Nenhuma skill foi alterada; manifesto incrementado para `1.0.12`. | `plugins/beta/AGENTS.md`; decisão do usuário baseada no artigo oficial [Rethinking skills and prompts for GPT-6 Astra](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra). |
| 2026-10-25, auditoria estrutural e de exemplos (PR #52) | No snapshot então avaliado, foram revisadas 20 skills; a auditoria registrou um `SKILL.md` com 751 linhas, 13 descrições acima de 300 caracteres e 75 ocorrências textuais de “exemplo(s)” em 29 arquivos Markdown (39 em 13 skills e 36 em referências/control planes). As ocorrências tinham funções diferentes; a contagem é histórica, não um inventário atualizado após a inclusão de `beta-anl-movidesk-relatorios`. | Auditoria registrada na branch original da [PR #52](https://github.com/gmtth/beta-all/pull/52), commits `c1d97a7` a `bf9842b`; não implica que exemplos restantes sejam defeitos. |
| 2026-10-25, priorização e proposta de limpeza (PR #52) | Priorizada a remoção do formato obsoleto de observabilidade e a transferência dos três arquétipos neutros de regressão para uma fixture externa às instruções carregadas pela skill. Reescrever outras menções, criar scripts adicionais e mover procedimentos longos ficaram opcionais (P4), sem benefício comprovado. | Proposta registrada na branch da PR #52; as mudanças efetivamente aceitas para integração e seus limites estão descritos no registro de 2026-11-26. |
| 2026-11-18, relatórios executivos Movidesk | Criada `beta-anl-movidesk-relatorios` com identidade visual Movidesk, dependência MCP declarada, roteamento próprio e contrato para HTML padronizado. A primeira versão define três meses-calendário completos e acumulado anual; a classificação depende de taxonomia confirmada e paginação completa. `beta-anl-movidesk` passou a `"5"` para delimitar relatórios executivos; a skill nova inicia em `"1"`; manifesto passou a `1.0.13`. | `skills/beta-anl-movidesk-relatorios/`, roteamento Beta, matriz/validador de cobertura, `beta-anl-movidesk/SKILL.md` e manifesto. Um relatório teste permanece como próximo passo para ajustar apresentação e validar mapeamento. |
| 2026-11-25, primeiro relatório teste Movidesk | Consultados os períodos do acumulado anual e dos três meses completos recentes com paginação até a página seguinte vazia; registros deduplicados e saída HTML agregada gerada fora do repositório. O agrupamento provisório usa os prefixos da categoria oficial e ainda aguarda validação do usuário. Nenhum dado individual de chamado foi incluído no artefato. Manifesto passou a `1.0.14` por esta atualização documental. | Rascunho HTML fora do pacote, skill de relatórios e este dossier. Revisão do padrão visual e confirmação do mapeamento de categorias permanecem pendentes. |
| 2026-11-25, modelo final de relatórios Movidesk | Fixada a apresentação HTML e o contrato de agregados. Acrescentados comparativo anual, ocorrências, situação e saída opcional em Word com gráficos editáveis quando pedidos. | Modelo e renderizador da skill. Rascunhos operacionais e artefatos de teste ficam fora do repositório. |
| 2026-11-26, reconciliação da PR #52 | Na branch proposta para integração, a referência de observabilidade passa a deferir a apresentação ao protocolo transversal e preserva a regra de não registrar ou expor conteúdo privado/intermediário; os três arquétipos continuam cobertos por fixture externa, com uma amostra obrigatória por arquétipo para mudanças estruturais; `beta` passa de `"9"` para `"10"` e `beta-mod-artefatos` de `"3"` para `"4"`; o manifesto passa de `1.0.15` para `1.0.16`. A avaliação pré-merge registra verificações estruturais dos DOCX, sem afirmar aprovação visual ou ganho comportamental. | Diff reconciliado da PR #52 contra `main` em `be910a2`; a branch original permanecia divergente. O relatório de avaliação foi sanitizado para não reter identificadores ou trechos de chamados. |
| Integração MCP | `.mcp.json` configura o endpoint documentado do Sites/MCP, mas isso não comprova conectividade ou publicação end-to-end. | `.mcp.json`, `docs/components/sites.md` e `mcp/movidesk/DOSSIER.md`. |
| 2026-10-24, avaliação de respostas finais da Beta | Revisão manual do transcript fornecido pelo usuário para as 11 perguntas do conjunto v1: 8 respostas adequadas e 3 parciais; nenhuma atribuiu causa ao equipamento atual. A pergunta 1 não acionou a busca nem citou precedentes; a pergunta 8 usou um caso relacionado, mas deixou de citar o precedente mais direto `20260911000000140`, confirmado em uma busca de leitura na base; no controle negativo (#11), a Beta não atribuiu causa, mas não pediu os dados discriminantes e afirmou que “offline” significa que a máquina não comunica, o que excede o que o status do painel demonstra. | Transcript fornecido pelo usuário; revisão comparativa ao conjunto `infra/supabase/evaluations/knowledge-search-v1.md`; consultas de leitura confirmaram os chamados `20260806000000070` e `20260911000000140`. A rodada avalia respostas finais, não latência nem qualidade estatística do ranking. |

Não há evidência suficiente para atribuir data ou motivação a toda a evolução anterior do plugin. Para casos históricos específicos, consultar o arquivo de origem e o repositório preservado; não deduzir intenção apenas a partir de uma alteração de código.

## Próximos passos

Os itens estão ordenados por prioridade. **P1**: resolver divergências de diretriz, validar comportamento ou esclarecer efeitos externos antes de alterações. **P2**: melhorar organização e completar integrações depois dos bloqueios P1. **P3**: revisar quando houver adoção e evidências suficientes. **P4**: melhorias opcionais de benefício incerto, que só devem avançar com evidência ou necessidade concreta.

| Prioridade | Item | Estado | Condição para concluir |
|---|---|---|---|
| P1 | Repetir amostra funcional da Beta após integração | Pendente | Reutilizar a pergunta e registrar versão da skill/modelo, resultados da busca e fontes citadas; comparar evidências, abstenção causal, perguntas de esclarecimento e campos do encerramento com o relatório pré-merge. Não atribuir diferença à mudança se a base de dados também mudar. |
| P1 | Concluir a validação visual dos arquétipos de Artefatos | Pendente; inspeção visual não verificada | Renderizar os três DOCX temporários com um renderizador permitido e inspecionar todas as páginas. Não declarar a regressão visual aprovada enquanto os PNGs não forem inspecionados. |
| P1 | Revisar descrições de ativação no frontmatter | Pendente; auditoria original cobriu 20 skills | Em 26/11, foram conferidas as 21 descrições: 13 continuam acima de 300 caracteres — `beta-anl-clickupchecklist`, `beta-anl-qaresultados`, `beta-mod-artefatos`, `beta-mod-dossie`, `beta-mod-figma`, `beta-mod-fluxos`, `beta-mod-fontes`, `beta-mod-permissoes`, `beta-mod-processamento`, `beta-mod-qa`, `beta-mod-regras`, `beta-mod-relatorios` e `beta-mod-sites`. `beta-anl-movidesk-relatorios` tem 181 caracteres. Propor mudanças com riscos de subativação/sobre-ativação e validar roteamento antes de editar. |
| P1 | Avaliar fronteira de leitura e escrita em `beta-anl-movidesk` | Pendente | Comparar consulta/síntese, uso direto das Actions e importação persistente para Supabase. Verificar se referências são suficientes ou se a importação merece skill independente por gatilho, escopo OAuth, confirmação e risco de escrita. Não duplicar MCP nem alterar autorização sem plano aprovado. |
| P1 | Revisar fronteira e handoffs do ciclo de QA | Pendente | Comparar `beta-anl-qatestes`, `beta-anl-qaresultados` e `beta-anl-clickupchecklist`: criação de testes, publicação, interpretação da execução, comentário de resultados e atualização de checklist. Considerar mudanças somente se reduzirem ambiguidade sem misturar contratos. |
| P1 | Retestar pontos parciais da avaliação de respostas | Pendente após os ajustes de plugin/skills | Reexecutar as perguntas 1, 8 e 11: confirmar busca/citação no caso 1; seleção do precedente direto registrado na avaliação no caso 8; e abstenção que não interprete status offline como causa, solicitando dados discriminantes no caso 11. Depois, ampliar a amostra para diagnóstico interativo e cobertura além dos 11 casos. |
| P1 | Busca diagnóstica completa | Pendente em MCP/base | Ingestão, busca híbrida, filtros de classificação, reranking, citações e avaliação permanecem etapas separadas. |
| P1 | Importação MCP/Supabase em produção | Runtime publicado na versão 74; ainda pendente de uso autenticado | Reautorizar scopes no cliente MCP e confirmar a importação do ticket piloto; não inferir sucesso da configuração local. |
| P1 | Acompanhar comparabilidade da taxonomia no relatório Movidesk | A classificação histórica pode mudar | Validar os grupos com os dados de cada consulta, explicitar divergências entre períodos e registrar novas regras somente com evidência. |
| P2 | Avaliar decomposição de `beta-anl-clickupgeradorcards` | Pendente | Revisar os 12 tipos de demanda e o fluxo comum do arquivo de 751 linhas. Comparar uma skill com referências específicas versus separação de fluxos com gatilhos, ferramentas, permissões ou critérios de sucesso distintos. Preservar o limite com checklist e resultados QA. |
| P2 | Mapear oportunidades de `references/` e scripts | Pendente | Revisar skills extensas e as que concentram procedimento no `SKILL.md`, incluindo `beta-anl-qaresultados`, `beta-anl-qatestes`, `beta-anl-movidesk`, `beta-anl-clickupgeradorcards` e `beta-mod-artefatos`. Mover conteúdo apenas se reduzir contexto sem esconder instruções; scripts apenas para processamento determinístico/repetitivo. |
| P2 | Sincronização/importação do marketplace Beta no workspace | Pendente de confirmação | Configurar/confirmar o marketplace e verificar a disponibilidade da skill para os analistas. |
| P2 | Dependência declarativa ClickUp | Pendente de verificação do formato/runtime | Identificar e validar a conexão ClickUp suportada; então declarar `dependencies.tools` sem inventar endpoints ou IDs. |
| P2 | Avaliar exemplos de diagnóstico com contrato de evidências | Pendente | Usar amostras anonimizadas; verificar fonte/trecho para cada afirmação e evitar percentuais não calibrados. |
| P3 | Revisar custo de contexto das instruções permanentes | Pendente | Avaliar se o `AGENTS.md` direciona para documentos contextuais sem exigir leituras amplas em tarefas pequenas; preservar requisitos até revisão documentada e aprovada. |
| P3 | Avaliar concisão, rigidez e autonomia diante do GPT-6 Astra | Adiado até adoção mais ampla | Quando houver adoção e evidência suficientes, comparar instruções, critérios de conclusão e limites de autonomia. Manter contratos atuais até revisão aprovada. |
| P4 | Reescrever menções restantes a exemplos como regras gerais | Opcional; sem ganho demonstrado | Avaliar cada ocorrência pela função; não presumir benefício nem remover esclarecimentos úteis sem evidência. |
| P4 | Avaliar scripts para validações determinísticas | Opcional; benefício incerto | Considerar scripts somente quando houver regra mecânica estável, entradas definidas e repetição que justifique a manutenção. |
| P4 | Mover procedimentos longos para referências | Opcional; benefício incerto | Mover somente quando a consulta sob demanda reduzir contexto sem ocultar etapas necessárias; referências também podem ser carregadas pela skill. |

Ao confirmar a conclusão de um item, retire-o desta lista e registre a evidência no histórico. A implementação de OAuth e a migration/runtime atuais são acompanhadas em [`mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md#próximos-passos) e [`infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md#próximos-passos).

## Fontes de verdade

1. Pedido explícito atual do usuário e regras globais do monorepo em [`../../AGENTS.md`](../../AGENTS.md).
2. Regras específicas deste componente em [`AGENTS.md`](./AGENTS.md).
3. Contratos ativos em `skills/*/SKILL.md`, referências e `tests/beta-routing-cases.json`.
4. Este dossier para estado, decisões registradas, histórico e pendências.
5. Inventários, snapshots em `docs/migration/` e árvore Git até `fd7c090bb25b7b9086de9ebea38a1680df6bddb4` para proveniência, não como instruções vigentes sem reconciliação.

Para identidade e comportamento de publicação do Sites/MCP, consultar [`../../docs/components/sites.md`](../../docs/components/sites.md) e [`../../mcp/movidesk/DOSSIER.md`](../../mcp/movidesk/DOSSIER.md). Para regras e estado do conhecimento Supabase, consultar [`../../infra/supabase/DOSSIER.md`](../../infra/supabase/DOSSIER.md). Em conflito, preservar a evidência, identificar escopo/data e aplicar a precedência explícita; não apagar divergências silenciosamente.

## Governança transversal (2026-11-27)

Somente o agente Revisor pode mesclar PRs do monorepo e publicar o Site MCP em Produção, após revisão independente. O pacote pode ser preparado, validado e enviado em sua branch/PR; push não autoriza merge nem Produção. A regra normativa fica em [`../../AGENTS.md`](../../AGENTS.md) e [`../../revisor/AGENTS.md`](../../revisor/AGENTS.md). Nenhum pacote foi publicado como parte desta atualização documental.
