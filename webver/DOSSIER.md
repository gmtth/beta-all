# Dossier dos pacotes Beta para ChatGPT na web

**Atualizado:** 2026-11-25
**Componente:** [`webver/`](./)
**Fonte canônica das skills:** [`plugins/beta/`](../plugins/beta/)

## Resumo e escopo

Este componente mantém duas distribuições para o ChatGPT na web: `Beta-Web.zip`, com as skills e workflows Beta, e `Beta-MCP.zip`, que referencia o app MCP registrado. A fonte canônica das skills é `plugins/beta/`. As instruções de atualização e os limites estão em [`AGENTS.md`](./AGENTS.md).

## Estado atual e limites da evidência

Inspeção dos pacotes locais em 2026-11-18:

- `Beta-Web.zip`: nome técnico `suite-beta-web`, nome exibido `Beta Web`, versão `1.0.15` (copiada da fonte canônica). Não contém `.mcp.json` nem `mcpServers`. SHA-256: `3DB8BB0644E87E316231CBC8290294E89D7F923A4596D68D8E80CD57080C92DB`.
- `Beta-MCP.zip`: nome exibido `Beta MCP`, versão `1.0.1`; preserva o identificador técnico e o app ID já registrados no `.app.json`. SHA-256: `1E4C9E1ACD816D2FF23A8039187647C507A367C9E785B913FC463B8C4FF29072`.
- Os pacotes foram inspecionados e os manifestos conferidos. Isso não comprova instalação, conexão OAuth nem funcionamento no ChatGPT na web.
- O plugin/app `Beta MCP` não pode ser tecnicamente tornado “chamável somente pela Beta” por um campo nesses manifestos. Plugins instalados podem ser usados automaticamente quando relevantes e chamados diretamente por menção. OAuth e políticas do app controlam acesso e ações, mas não identificam se a chamada foi originada pela skill `beta`. Portanto, o pacote não declara nem garante esse bloqueio.

## Decisões vigentes

- Os nomes de arquivo e exibidos são `Beta-Web.zip` / `Beta Web` e `Beta-MCP.zip` / `Beta MCP`.
- `Beta-Web.zip` mantém a versão da fonte e difere do plugin canônico somente pela remoção de `.mcp.json`, remoção de `mcpServers` e as duas mudanças de identidade autorizadas.
- `Beta-MCP.zip` mantém o app ID e o identificador técnico para preservar o vínculo com o app provisionado; a revisão da alteração de nome exibido levou sua versão do pacote a `1.0.1`.
- A restrição de invocação exclusiva pela Beta permanece um requisito não atendido por configuração de pacote. Para garanti-la será necessário um mecanismo de plataforma ou uma decisão de arquitetura/servidor; não inventar um campo de manifesto.
- Nenhum pacote foi instalado, publicado ou conectado durante esta alteração.

## Componentes, dependências e fontes de verdade

| Tema | Fonte de verdade |
|---|---|
| Skills, conteúdo e versão canônica | [`plugins/beta/`](../plugins/beta/) e [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) |
| Regras para os pacotes Web | [`webver/AGENTS.md`](./AGENTS.md) |
| App, OAuth e ferramentas MCP | [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md), [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md) e o app registrado pelo ID preservado em `Beta-MCP.zip` |
| Estado, hashes e limites dos pacotes | Este dossier |

## Histórico verificável

- **2026-10-28 — pacotes iniciais:** a PR #53 adicionou `Beta-Skills-Web.zip` e `Beta-MCP-Web.zip` (`8b671f5eb1fa5c7944c436fe750a5e66fb81ad92`). O primeiro era derivado do plugin de skills; o segundo mapeava o app MCP já registrado.
- **2026-11-17 — padronização documental:** `webver/AGENTS.md` e este dossier foram padronizados e `webver/` foi incluído no roteamento raiz. A PR #54 registra essa etapa.
- **2026-11-18 — renomeação dos pacotes:** por solicitação do usuário, os arquivos passaram a `Beta-Web.zip` e `Beta-MCP.zip`, com nomes exibidos `Beta Web` e `Beta MCP`. O pacote de skills mantém `1.0.12` da fonte; o pacote MCP passou de `1.0.0` a `1.0.1`. No MCP foi preservado o app ID/identificador técnico. A estrutura dos dois ZIPs e a integridade dos manifestos foram verificadas; nenhum arquivo fora de `webver/` foi alterado nesta etapa.

- **2026-11-25 — sincronização com a fonte:** Beta Web atualizado para 1.0.15 a partir da main integrada pela PR #55. Validados 127 arquivos, conteúdo da fonte e apenas as diferenças de manifesto e MCP autorizadas. Beta MCP preserva o vínculo com o app anterior.

## Próximos passos

| Item | Prioridade | Evidência/contexto | Condição de conclusão |
|---|---|---|---|
| Validar a instalação e conexão de `Beta Web` e `Beta MCP` no ChatGPT na web. | Média | ZIPs inspecionados, mas não instalados ou testados no ambiente-alvo. | Cada pacote foi instalado/testado e a versão, conexão e limitações estão documentadas. |
| Definir como cumprir a restrição “somente a Beta pode acionar o MCP”. | Alta | O pacote permite uso automático e menção direta; seus manifestos não oferecem restrição por skill chamadora. | Identificar suporte de plataforma ou aprovar desenho de controle server-side/distribuição; validar comportamento sem depender só de instruções ao modelo. |

## Fontes consultadas

- [`AGENTS.md` raiz](../AGENTS.md), [`DOSSIER.md` raiz](../DOSSIER.md), [`webver/AGENTS.md`](./AGENTS.md).
- [`plugins/beta/AGENTS.md`](../plugins/beta/AGENTS.md), [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) e manifesto da fonte.
- [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md) e [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md).
- [Packaging de plugins](https://developers.openai.com/plugins/build/plugins), [Skills](https://developers.openai.com/plugins/concepts/skills) e [Plugins no ChatGPT](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).
