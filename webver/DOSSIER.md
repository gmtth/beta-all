# Dossier dos pacotes Beta para ChatGPT na web

**Atualizado:** 2026-11-27
**Componente:** [`webver/`](./)
**Fonte can�nica das skills:** [`plugins/beta/`](../plugins/beta/)

## Resumo e escopo

Este componente mant�m duas distribui��es para o ChatGPT na web: `Beta-Web.zip`, com as skills e workflows Beta, e `Beta-MCP.zip`, que referencia o app MCP registrado. A fonte can�nica das skills � `plugins/beta/`. As instru��es de atualiza��o e os limites est�o em [`AGENTS.md`](./AGENTS.md).

## Estado atual e limites da evid�ncia

Inspe��o dos pacotes em 2026-11-27, no checkout de prepara��o baseado na `main` `6cf44098e9516c4ad2801a88038ff1b0d2028639`:

- `Beta-Web.zip`: nome t�cnico `suite-beta-web`, nome exibido `Beta Web`, vers�o `1.0.18` (copiada da fonte can�nica). Cont�m 132 arquivos; n�o cont�m `.mcp.json` nem `mcpServers`. SHA-256: `1A3A2ECF5B080C16CB411D2507A062FD7C9412DF4B75DAFA78A43092D70416D0`.
- `Beta-MCP.zip`: nome exibido `Beta MCP`, vers�o `1.0.1`; preserva o identificador t�cnico e o app ID j� registrados no `.app.json`. SHA-256: `1E4C9E1ACD816D2FF23A8039187647C507A367C9E785B913FC463B8C4FF29072`.
- O host can�nico de Produ��o da skill Beta Web agora � `https://beta-mcp.thngrns.chatgpt.site/mcp/`. `Beta-MCP.zip` n�o cont�m a URL do endpoint; n�o precisou ser alterado.
- Os pacotes foram inspecionados e os manifestos conferidos. Isso n�o comprova instala��o, conex�o OAuth nem funcionamento no ChatGPT na web.
- O plugin/app `Beta MCP` n�o pode ser tecnicamente tornado �cham�vel somente pela Beta� por um campo nesses manifestos. Plugins instalados podem ser usados automaticamente quando relevantes e chamados diretamente por men��o. OAuth e pol�ticas do app controlam acesso e a��es, mas n�o identificam se a chamada foi originada pela skill `beta`. Portanto, o pacote n�o declara nem garante esse bloqueio.

## Decis�es vigentes

- Os nomes de arquivo e exibidos s�o `Beta-Web.zip` / `Beta Web` e `Beta-MCP.zip` / `Beta MCP`.
- `Beta-Web.zip` mant�m a vers�o da fonte e difere do plugin can�nico somente pela remo��o de `.mcp.json`, remo��o de `mcpServers` e as duas mudan�as de identidade autorizadas.
- `Beta-MCP.zip` mant�m o app ID e o identificador t�cnico para preservar o v�nculo com o app provisionado; a revis�o da altera��o de nome exibido levou sua vers�o do pacote a `1.0.1`.
- A restri��o de invoca��o exclusiva pela Beta permanece um requisito n�o atendido por configura��o de pacote. Para garanti-la ser� necess�rio um mecanismo de plataforma ou uma decis�o de arquitetura/servidor; n�o inventar um campo de manifesto.
- O ZIP `Beta-Web` foi reconstru�do e validado neste checkout; isso n�o instala o pacote, sincroniza o marketplace ou comprova conex�o OAuth/funcionamento no cliente web. O marketplace configurado aponta para `plugins/beta/`, n�o para `webver/`; n�o h� mecanismo automatizado de publica��o deste ZIP ao ChatGPT Web documentado neste componente.

## Componentes, depend�ncias e fontes de verdade

| Tema | Fonte de verdade |
|---|---|
| Skills, conte�do e vers�o can�nica | [`plugins/beta/`](../plugins/beta/) e [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) |
| Regras para os pacotes Web | [`webver/AGENTS.md`](./AGENTS.md) |
| App, OAuth e ferramentas MCP | [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md), [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md) e o app registrado pelo ID preservado em `Beta-MCP.zip` |
| Estado, hashes e limites dos pacotes | Este dossier |

## Hist�rico verific�vel

- **2026-10-28 � pacotes iniciais:** a PR #53 adicionou `Beta-Skills-Web.zip` e `Beta-MCP-Web.zip` (`8b671f5eb1fa5c7944c436fe750a5e66fb81ad92`). O primeiro era derivado do plugin de skills; o segundo mapeava o app MCP j� registrado.
- **2026-11-17 � padroniza��o documental:** `webver/AGENTS.md` e este dossier foram padronizados e `webver/` foi inclu�do no roteamento raiz. A PR #54 registra essa etapa.
- **2026-11-18 � renomea��o dos pacotes:** por solicita��o do usu�rio, os arquivos passaram a `Beta-Web.zip` e `Beta-MCP.zip`, com nomes exibidos `Beta Web` e `Beta MCP`. O pacote de skills mant�m `1.0.12` da fonte; o pacote MCP passou de `1.0.0` a `1.0.1`. No MCP foi preservado o app ID/identificador t�cnico. A estrutura dos dois ZIPs e a integridade dos manifestos foram verificadas; nenhum arquivo fora de `webver/` foi alterado nesta etapa.

- **2026-11-25 � sincroniza��o com a fonte:** Beta Web atualizado para 1.0.15 a partir da main integrada pela PR #55. Validados 127 arquivos, conte�do da fonte e apenas as diferen�as de manifesto e MCP autorizadas. Beta MCP preserva o v�nculo com o app anterior.
- **2026-11-27 � novo dom�nio can�nico:** Sites confirmou `https://beta-mcp.thngrns.chatgpt.site` como URL atual do mesmo projeto de Produ��o. Naquele estado, `Beta-Web.zip` foi reconstru�do da fonte `plugins/beta/` v1.0.17; 129 arquivos foram conferidos byte a byte, com somente remo��o de `.mcp.json`, remo��o de `mcpServers` e as duas mudan�as de identidade. SHA-256 `6C15111ECD2B29839BBED1C4C7EDF3671CE5C130201AF7E9EF4CAE03FBAC1864`. `Beta-MCP.zip` permaneceu inalterado porque n�o carrega o endpoint.
- **2026-11-27 � atualiza��o para a fonte v1.0.18:** reconstru�do `Beta-Web.zip` da `plugins/beta/` no commit `6cf44098e9516c4ad2801a88038ff1b0d2028639`. Foram comparados os 132 arquivos do pacote: 131 s�o byte a byte iguais � fonte; o manifesto conserva todos os campos, exceto as duas mudan�as de identidade e a remo��o de `mcpServers`; `.mcp.json` foi removido. A valida��o da lista, conte�do e manifesto passou. SHA-256 do ZIP: `1A3A2ECF5B080C16CB411D2507A062FD7C9412DF4B75DAFA78A43092D70416D0`. `Beta-MCP.zip` permaneceu inalterado. Esta atualiza��o do reposit�rio, por si s�, n�o publica o ZIP no cliente ChatGPT Web.

## Pr�ximos passos

| Item | Prioridade | Evid�ncia/contexto | Condi��o de conclus�o |
|---|---|---|---|
| Validar a instala��o e conex�o de `Beta Web` e `Beta MCP` no ChatGPT na web. | M�dia | ZIPs inspecionados, mas n�o instalados ou testados no ambiente-alvo. | Cada pacote foi instalado/testado e a vers�o, conex�o e limita��es est�o documentadas. |
| Definir como cumprir a restri��o �somente a Beta pode acionar o MCP�. | Alta | O pacote permite uso autom�tico e men��o direta; seus manifestos n�o oferecem restri��o por skill chamadora. | Identificar suporte de plataforma ou aprovar desenho de controle server-side/distribui��o; validar comportamento sem depender s� de instru��es ao modelo. |

## Fontes consultadas

- [`AGENTS.md` raiz](../AGENTS.md), [`DOSSIER.md` raiz](../DOSSIER.md), [`webver/AGENTS.md`](./AGENTS.md).
- [`plugins/beta/AGENTS.md`](../plugins/beta/AGENTS.md), [`plugins/beta/DOSSIER.md`](../plugins/beta/DOSSIER.md) e manifesto da fonte.
- [`mcp/movidesk/AGENTS.md`](../mcp/movidesk/AGENTS.md) e [`mcp/movidesk/DOSSIER.md`](../mcp/movidesk/DOSSIER.md).
- [Packaging de plugins](https://developers.openai.com/plugins/build/plugins), [Skills](https://developers.openai.com/plugins/concepts/skills) e [Plugins no ChatGPT](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt).

## Governan�a transversal (2026-11-27)

Somente o agente Revisor pode mesclar PRs do monorepo e publicar o Site MCP em Produ��o, ap�s revis�o independente. Este componente pode preparar e validar os pacotes web; push n�o autoriza merge nem deploy de Produ��o. Fonte normativa: [`../AGENTS.md`](../AGENTS.md) e [`../revisor/AGENTS.md`](../revisor/AGENTS.md). Nenhum pacote foi publicado nesta atualiza��o documental.
