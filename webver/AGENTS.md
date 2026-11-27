# Pacotes Beta para ChatGPT na web

Merge de PRs do monorepo e publica��o do Site MCP em Produ��o s�o exclusivos do agente Revisor, ap�s revis�o independente. Este componente pode preparar e validar seus pacotes, mas n�o mescla PRs nem publica o Site MCP de Produ��o; push n�o autoriza essas a��es. Siga [`../AGENTS.md`](../AGENTS.md) e [`../revisor/AGENTS.md`](../revisor/AGENTS.md).

## Execu��o dentro do monoreposit�rio

Este diret�rio cont�m os pacotes da Beta destinados ao ChatGPT na web. Leia primeiro o [`AGENTS.md`](../AGENTS.md) e [`DOSSIER.md`](../DOSSIER.md) da raiz, depois este arquivo e o [`DOSSIER.md`](./DOSSIER.md). As skills t�m fonte can�nica em [`plugins/beta/`](../plugins/beta/); os pacotes web s�o distribui��es separadas e suas altera��es devem ficar dentro de `webver/`.

## Escopo e limites

- `Beta-Web.zip` distribui as skills Beta para ChatGPT na web.
- `Beta-MCP.zip` cont�m a integra��o/app MCP da Beta, identificada pelo app registrado no `.app.json`.
- A instala��o web � separada da instala��o do plugin de Codex; instalar um pacote n�o comprova conex�o, autoriza��o ou funcionamento.
- Mudan�as solicitadas para esses pacotes devem alterar somente arquivos dentro de `webver/`. N�o modificar a fonte `plugins/beta/`, o runtime `mcp/movidesk/`, o Site publicado ou permiss�es.
- O formato de pacote atual n�o oferece um campo para impedir que uma pessoa invoque diretamente o plugin/app MCP. Metadados podem descrever o uso pretendido, mas n�o imp�em que somente a skill `beta` consiga acion�-lo. N�o declarar essa restri��o como tecnicamente garantida.

## Atualiza��o de `Beta-Web.zip`

Reconstrua a partir da vers�o mais recente de `plugins/beta/`, mantenha o nome `Beta-Web.zip` e fa�a uma c�pia tempor�ria isolada:

1. Remova da c�pia `.mcp.json`.
2. Em `.codex-plugin/plugin.json`, remova `mcpServers`.
3. Altere `name` de `suite-beta` para `suite-beta-web` e `interface.displayName` de `Beta` para `Beta Web`.
4. Copie `version` da fonte sem increment�-la. N�o altere nenhum outro arquivo ou campo.
5. Confira a lista de arquivos e compare os bytes com a fonte; as diferen�as permitidas s�o somente a remo��o de `.mcp.json`, a remo��o de `mcpServers` e as duas mudan�as de identidade.
6. Registre a vers�o da fonte, SHA-256 e resultado da valida��o neste dossier.

## Distribui��o e publica��o

- `Beta-Web.zip` � um artefato versionado no reposit�rio; reconstru�-lo ou mesclar a atualiza��o em `main` n�o instala o pacote nas contas ChatGPT nem comprova que ele est� dispon�vel no cliente web.
- O marketplace GitHub configurado no monorepo aponta para `plugins/beta/`, n�o para `webver/`. Siga [`../docs/components/plugin-marketplace.md`](../docs/components/plugin-marketplace.md) somente para sincronizar aquele plugin; n�o declare que essa sincroniza��o publicou `Beta-Web.zip`.
- N�o h� neste componente um mecanismo automatizado de upload/publica��o do ZIP para o ChatGPT Web. Se o usu�rio pedir publica��o, atualize e valide o artefato e sua distribui��o no GitHub conforme o fluxo de PR do monorepo; relate separadamente qualquer instala��o/sincroniza��o que dependa de a��o administrativa ou de um canal ainda n�o configurado.

## Atualiza��o de `Beta-MCP.zip`

- Mantenha o app ID registrado em `.app.json`, a chave de mapeamento do app e o identificador t�cnico `name`; eles formam a liga��o com o app provisionado.
- O nome exibido � `Beta MCP`. Ao alterar o pacote, incremente o patch SemVer no manifesto `.codex-plugin/plugin.json` em exatamente um, sem alterar o app ID ou qualquer recurso do runtime.
- Preserve a estrutura e os demais arquivos. Registre a vers�o e o SHA-256 neste dossier.
- A aplica��o pode restringir as ferramentas por OAuth e pol�ticas de acesso do app, mas o pacote n�o identifica se a chamada veio da skill Beta. Uma restri��o exclusiva � Beta exige suporte expl�cito da plataforma ou controle adicional no servidor; essa mudan�a n�o est� autorizada neste componente.

## Versionamento e manuten��o documental

- Use os dois nomes de arquivo e nomes exibidos definidos neste documento.
- Atualize este AGENT e [`DOSSIER.md`](./DOSSIER.md) junto com cada mudan�a dos pacotes.
- Em cada atualiza��o de `Beta-Web.zip`, registre tamb�m o SHA completo do commit fonte `plugins/beta/` para tornar a origem reproduz�vel.
- N�o alterar ou remover itens de `webver/` fora do escopo pedido; para renomear pacotes, atualize os links e registros deste diret�rio.
