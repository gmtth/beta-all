# Pacotes Beta para ChatGPT na web

Merge de PRs do monorepo e publicação do Site MCP em Produção são exclusivos do agente Revisor, após revisão independente. Este componente pode preparar e validar seus pacotes, mas não mescla PRs nem publica o Site MCP de Produção; push não autoriza essas ações. Siga [`../AGENTS.md`](../AGENTS.md) e [`../revisor/AGENTS.md`](../revisor/AGENTS.md).

## Execução dentro do monorepositório

Este diretório contém os pacotes da Beta destinados ao ChatGPT na web. Leia primeiro o [`AGENTS.md`](../AGENTS.md) e [`DOSSIER.md`](../DOSSIER.md) da raiz, depois este arquivo e o [`DOSSIER.md`](./DOSSIER.md). As skills têm fonte canônica em [`plugins/beta/`](../plugins/beta/); os pacotes web são distribuições separadas e suas alterações devem ficar dentro de `webver/`.

## Escopo e limites

- `Beta-Web.zip` distribui as skills Beta para ChatGPT na web.
- `Beta-MCP.zip` contém a integração/app MCP da Beta, identificada pelo app registrado no `.app.json`.
- A instalação web é separada da instalação do plugin de Codex; instalar um pacote não comprova conexão, autorização ou funcionamento.
- Mudanças solicitadas para esses pacotes devem alterar somente arquivos dentro de `webver/`. Não modificar a fonte `plugins/beta/`, o runtime `mcp/movidesk/`, o Site publicado ou permissões.
- O formato de pacote atual não oferece um campo para impedir que uma pessoa invoque diretamente o plugin/app MCP. Metadados podem descrever o uso pretendido, mas não impõem que somente a skill `beta` consiga acioná-lo. Não declarar essa restrição como tecnicamente garantida.

## Atualização de `Beta-Web.zip`

Reconstrua a partir da versão mais recente de `plugins/beta/`, mantenha o nome `Beta-Web.zip` e faça uma cópia temporária isolada:

1. Remova da cópia `.mcp.json`.
2. Em `.codex-plugin/plugin.json`, remova `mcpServers`.
3. Altere `name` de `suite-beta` para `suite-beta-web` e `interface.displayName` de `Beta` para `Beta Web`.
4. Copie `version` da fonte sem incrementá-la. Não altere nenhum outro arquivo ou campo.
5. Confira a lista de arquivos e compare os bytes com a fonte; as diferenças permitidas são somente a remoção de `.mcp.json`, a remoção de `mcpServers` e as duas mudanças de identidade.
6. Registre a versão da fonte, SHA-256 e resultado da validação neste dossier.

## Atualização de `Beta-MCP.zip`

- Mantenha o app ID registrado em `.app.json`, a chave de mapeamento do app e o identificador técnico `name`; eles formam a ligação com o app provisionado.
- O nome exibido é `Beta MCP`. Ao alterar o pacote, incremente o patch SemVer no manifesto `.codex-plugin/plugin.json` em exatamente um, sem alterar o app ID ou qualquer recurso do runtime.
- Preserve a estrutura e os demais arquivos. Registre a versão e o SHA-256 neste dossier.
- A aplicação pode restringir as ferramentas por OAuth e políticas de acesso do app, mas o pacote não identifica se a chamada veio da skill Beta. Uma restrição exclusiva à Beta exige suporte explícito da plataforma ou controle adicional no servidor; essa mudança não está autorizada neste componente.

## Versionamento e manutenção documental

- Use os dois nomes de arquivo e nomes exibidos definidos neste documento.
- Atualize este AGENT e [`DOSSIER.md`](./DOSSIER.md) junto com cada mudança dos pacotes.
- Não alterar ou remover itens de `webver/` fora do escopo pedido; para renomear pacotes, atualize os links e registros deste diretório.
