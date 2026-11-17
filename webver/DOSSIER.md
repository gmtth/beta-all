# Dossier dos pacotes Beta para ChatGPT na web

**Atualizado:** 2026-11-17
**Componente:** [`webver/`](./)
**Fonte canônica das skills:** [`plugins/beta/`](../plugins/beta/)

## Resumo e escopo

Este componente guarda pacotes destinados à instalação separada da Beta no ChatGPT na web. A fonte das skills é o plugin canônico em `plugins/beta/`; os ZIPs web são distribuições derivadas ou integrações específicas e não substituem a fonte. As regras de atualização estão em [`AGENTS.md`](./AGENTS.md).

## Estado atual e limites da evidência

Inspeção local do `origin/main` em 2026-11-17, commit `5fbd16cc35a82fc663a2d8931c208ffa22186e76`:

- `Beta-Skills-Web.zip` existe e contém o manifesto `.codex-plugin/plugin.json` com `name: suite-beta-skills-web`, `interface.displayName: Beta Skills Web` e versão `1.0.13`. O ZIP não contém `.mcp.json`. SHA-256 observado: `F9A8F757A65C16C2DF19CAEECB8622070687ABFF401FB05ED98EEB5F0C08F73C`.
- A fonte canônica local em `plugins/beta/.codex-plugin/plugin.json` está em `suite-beta`, versão `1.0.12`, e sua configuração MCP fica em `.mcp.json`. A variante web de skills tem, portanto, identidade e versão de pacote diferentes da fonte observada. O processo de incremento da versão da variante ainda não está documentado ou validado; a regra deste componente passa a tratar a versão da fonte como referência e preserva a transformação descrita no AGENT.
- `Beta-MCP-Web.zip` é outro pacote e tem estrutura `.app.json` + `.codex-plugin/plugin.json`, com identidade `Beta MCP Web` e referência a um app. Seu SHA-256 observado: `822EC15E7570127D959D043E6B6177F7BEA947F1281731A40B4936072B39913E`. Não foi editado nem validado em runtime.
- Os nomes e estruturas dos pacotes indicam superfícies distintas: um distribui skills; o outro declara integração MCP/app. A inspeção dos ZIPs não comprova que qualquer pacote esteja instalado, conectando ao OAuth ou funcionando para os quatro analistas.

## Decisões vigentes

- `plugins/beta/` é a fonte canônica das skills; `webver/` contém pacotes para instalação separada no ChatGPT na web.
- `Beta-Skills-Web.zip` pode ser reconstruído somente pelo procedimento restrito em [`AGENTS.md`](./AGENTS.md), com as transformações autorizadas e sem alterações adicionais ao conteúdo do plugin. O ZIP atual tem versão `1.0.13` enquanto a fonte local observada está em `1.0.12`; como o procedimento proíbe alterações extras ao manifesto, a reconstrução fica pendente até essa divergência ser decidida.
- `Beta-MCP-Web.zip` não deve ser editado ou reconstruído.
- A presença de um pacote no Git não comprova instalação, autorização, conexão MCP/OAuth nem disponibilidade aos analistas.

## Componentes, dependências e fontes de verdade

| Tema | Fonte de verdade |
|---|---|
| Conteúdo e versão canônica das skills | [`plugins/beta/`](../plugins/beta/) e [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) |
| Regras para reconstruir o ZIP de skills web | [`webver/AGENTS.md`](./AGENTS.md) |
| Configuração e operação do runtime MCP | [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md), [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md) e [`docs/components/sites.md`](../docs/components/sites.md) |
| Estado destes pacotes e lacunas | Este dossier |

## Histórico verificável

- **Origem do pacote Skills Web:** o histórico Git contém o merge da PR #53 (`8b671f5eb1fa5c7944c436fe750a5e66fb81ad92`, 2026-10-28), que adicionou os dois ZIPs. A instrução inicial de `webver/AGENTS.md` registrava a transformação permitida para o ZIP de skills e pedia que o diretório fosse roteado e documentado no padrão comum. O commit antecessor `e14961b` adicionou o AGENT inicial.
- **2026-11-17 — padronização documental:** criado este dossier e reescrito o AGENT para formalizar a regra existente; `AGENTS.md` e o índice executivo raiz agora encaminham para o componente. Nenhum ZIP foi alterado nesta mudança.

## Próximos passos

| Item | Prioridade | Evidência/contexto | Condição de conclusão |
|---|---|---|---|
| Decidir como reconciliar a versão `1.0.13` do ZIP de skills com a versão `1.0.12` da fonte. | Média | O procedimento restringe as mudanças ao manifesto MCP e às duas identidades, mas o ZIP atual tem versão diferente; não foi reconstruído. | Decisão registrada; procedimento atualizado se necessário e pacote reproduzido com apenas as diferenças autorizadas. |
| Validar separadamente a instalação e a conexão dos pacotes Skills Web e MCP Web no ChatGPT na web. | Média | Inspeção dos ZIPs não comprova suporte, instalação, consentimento OAuth nem operação. | Cada pacote tem resultado observável documentado no ambiente-alvo, com limites e versão identificados. |
| Recalcular e registrar o SHA-256 completo de `Beta-MCP-Web.zip` se for necessário usar ou revisar esse pacote. | Baixa | O valor completo não foi preservado na inspeção atual. | Hash íntegro registrado sem modificar o ZIP. |

## Fontes consultadas

- [`AGENTS.md` raiz](../AGENTS.md) e [`DOSSIER.md` raiz](../DOSSIER.md).
- [`plugins/beta/AGENTS.md`](../plugins/beta/AGENTS.md), [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) e manifesto do plugin canônico.
- [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md), [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md) e [`docs/components/sites.md`](../docs/components/sites.md).
- `webver/Beta-Skills-Web.zip`, `webver/Beta-MCP-Web.zip`, `webver/AGENTS.md` e histórico Git das PRs #51/#53.
