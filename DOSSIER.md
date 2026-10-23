# Dossier da Beta — índice executivo e histórico transversal

Atualizado em 2026-10-22. Este dossier é a fonte de contexto compartilhado entre componentes: resume o objetivo do produto, decisões transversais, marcos de integração e pendências que atravessam mais de uma área. Estado técnico detalhado e histórico operacional pertencem aos dossiers canônicos listados abaixo.

## Objetivo e escopo do produto

A Beta apoia quatro analistas no diagnóstico de problemas de máquinas, erros do programa e processos administrativos aprovados. Movidesk é a fonte histórica prioritária, ClickUp é complementar e documentos administrativos fornecem procedimentos aprovados. A resposta deve citar evidências, distinguir fato de hipótese e pedir esclarecimentos quando faltar contexto. Conteúdo não vira conhecimento confirmado sem revisão humana.

## Componentes e fontes canônicas

| Componente | Fonte canônica | Responsabilidade neste dossier |
|---|---|---|
| Plugin e skills | [`plugins/beta/DOSSIER.md`](plugins/beta/DOSSIER.md) | Estado do pacote, roteamento, marketplace e uso das skills |
| MCP/OAuth e runtime Sites | [`mcp/movidesk/DOSSIER.md`](mcp/movidesk/DOSSIER.md) | Ferramentas, contratos, autorização, testes e estado de publicação MCP |
| Schema, API e migrations Supabase | [`infra/supabase/DOSSIER.md`](infra/supabase/DOSSIER.md) | Banco, acesso, migrations, busca indexada e prontidão Supabase |
| Revisão de PRs/branches | [`revisor/DOSSIER.md`](revisor/DOSSIER.md) | Cobertura e achados do revisor |
| Arquitetura e publicação Sites | [`docs/architecture/arquitetura-base-compartilhada-beta.md`](docs/architecture/arquitetura-base-compartilhada-beta.md) e [`docs/components/sites.md`](docs/components/sites.md) | Relações entre componentes e procedimento de publicação |
| Migração e proveniência | [`docs/migration/source-inventory.md`](docs/migration/source-inventory.md) e [`docs/migration/document-reconciliation.md`](docs/migration/document-reconciliation.md) | Origens, commits importados, snapshots e reconciliação documental |

Use este dossier para estado e decisões que afetam mais de um componente. Quando um tópico tiver uma fonte especializada, esta página mantém somente o resumo necessário para entender dependências e aponta para o registro completo.
## Estado compartilhado

Referência: 2026-10-22. `beta-all` é a fonte de trabalho ativa; plugin, MCP/Sites e Supabase têm fontes canônicas no monorepo. A busca lexical e a ingestão já atravessam MCP e Supabase, mas a conclusão de cada capacidade depende de etapas próprias de código, migration, publicação e smoke. Este índice não substitui a leitura de estado atual nem afirma que componentes estão sincronizados só porque uma etapa anterior foi concluída; as dependências abertas estão resumidas em `## Próximos passos` e comprovadas nos dossiers especializados.

## Decisões transversais vigentes

- `gmtth/beta-all` é o repositório único de trabalho. Componentes têm diretórios e ciclos de validação/publicação próprios; os repositórios antigos são proveniência, não destinos de desenvolvimento.
- Identidade OAuth representa a conta autorizada. Permissões são cadastradas por e-mail no painel administrativo; a tela OAuth informa os escopos concedidos e não solicita que a pessoa monte uma lista. A ausência de um escopo não deve impedir o uso dos demais escopos habilitados. Contratos completos no dossier MCP.
- Credenciais de serviço Movidesk/Supabase ficam no servidor e não substituem autorização OAuth por usuário. A classificação e o acesso precisam ser validados no backend antes do contexto chegar ao modelo.
- A busca cotidiana usa a cópia sincronizada no Supabase; chamadas às fontes externas alimentam sincronização/ingestão e não são requisito para toda consulta. A busca e a ingestão têm capacidades distintas e limites próprios.
- Telemetria operacional MCP fica no D1 do Sites. Feedback contextual e sinais de frustração/autodiagnóstico ficam no Supabase, com minimização, retenção e controles separados. Não guardar transcrições completas nem raciocínio privado.
- “Commitado”, “enviado”, “PR aberta”, “mesclado”, “publicado” e “disponível ao cliente” são estados diferentes. O fluxo normativo e os critérios de evidência estão no [`AGENTS.md`](AGENTS.md); detalhes de Sites ficam no documento operacional acima.

## Marcos transversais e proveniência

- **Consolidação do monorepo (2026-10-20):** fontes e histórico foram importados para os caminhos canônicos, sem submódulos ativos; a proveniência e os checksums estão no [inventário](docs/migration/source-inventory.md), e a comparação documental está na [reconciliação](docs/migration/document-reconciliation.md). Os checkouts e repositórios antigos foram preservados conforme registrado ali.
- **Governança documental (2026-10-22):** regras atuais estão nos AGENTS; fatos, decisões e evidências ficam nos dossiers. O padrão comum está em [`AGENTS.md`](AGENTS.md#padrão-comum-dos-dossiers). Este dossier raiz é executivo/transversal; cronologias e diagnósticos de um componente ficam na fonte especializada.
- **Limites entre componentes:** detalhes históricos de OAuth, Site, telemetria, migrations, ingestões, marketplace e revisões permanecem nos seus dossiers canônicos. Snapshots em `legacy/` e `docs/migration/source-documents/` são evidência de origem e não indicam estado atual.

## Próximos passos

| Item transversal | Estado e dependência | Fonte de acompanhamento |
|---|---|---|
| Busca diagnóstica híbrida | A busca lexical no Supabase está ativa; busca vetorial depende de escolher provedor/modelo e fechar dimensões, custo, classificação e reindexação antes da implementação. A integração runtime/avaliação segue vinculada ao MCP. | [`Supabase — próximos passos`](infra/supabase/DOSSIER.md#próximos-passos), [`MCP — próximos passos`](mcp/movidesk/DOSSIER.md#próximos-passos) |
| Ingestão de chamados extensos | A migration de limite ampliado foi aplicada e o registro da PR #31 documenta a publicação no Sites v107, a importação do protocolo `20260918000000203` em 54 trechos e a conferência das interações inicial/final. Essa validação histórica não foi repetida nesta reconciliação; o Site atualmente registrado está na v112. | [`Supabase — ingestão e evidências`](infra/supabase/DOSSIER.md#ingestão-longa-e-amostra-sem-reimportação-2026-10-22), [`Histórico do Site`](docs/components/sites.md#histórico-de-publicações-do-site) |
| Piloto de feedback/autodiagnóstico | A estrutura Supabase e a UI foram publicadas; captura continua desligada. Ativação depende de jobs verificados, validação autenticada, revisão dos textos e contato organizacional. | [`Supabase — próximos passos`](infra/supabase/DOSSIER.md#próximos-passos), [`MCP — próximos passos`](mcp/movidesk/DOSSIER.md#próximos-passos) |

Pendências exclusivas de plugin, MCP, Supabase ou revisão não são copiadas para esta tabela; consulte o backlog do componente correspondente.

## Fontes e limites de evidência

O estado registrado aqui foi reconciliado com os dossiers especializados e documentos de migração em 2026-10-22. Os marcos acima resumem os registros canônicos; para SHAs, migrations, testes, deployments e ressalvas, siga os links de cada fonte. Relatos do usuário continuam identificados como tais nos dossiers quando não houve verificação independente.
