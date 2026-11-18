# Pacotes Beta para ChatGPT na web

## Execução dentro do monorepositório

Este diretório contém os arquivos de distribuição da Beta destinados ao ChatGPT na web. Leia primeiro o [`AGENTS.md`](../AGENTS.md) e [`DOSSIER.md`](../DOSSIER.md) da raiz, depois este arquivo e o [`DOSSIER.md`](./DOSSIER.md). A fonte canônica das skills continua em [`plugins/beta/`](../plugins/beta/); os pacotes daqui são artefatos separados, com instruções de instalação próprias.

## Escopo e limites

- `Beta-Skills-Web.zip` é o pacote de skills para uso no ChatGPT na web. Deve ser atualizado a partir do plugin canônico somente conforme o procedimento abaixo.
- `Beta-MCP-Web.zip` é um pacote distinto de integração MCP para ChatGPT na web. **Não editar nem reconstruir esse ZIP** sem uma nova decisão explícita e revisão de seu contrato.
- A instalação dos pacotes web é separada da instalação do plugin de Codex. Não presumir que instalar um deles configure o outro, conecte OAuth ou valide o runtime.
- Não publicar, instalar em workspace de usuários, alterar permissões ou modificar o runtime hospedado como efeito desta atualização de arquivos.

## Procedimento autorizado para `Beta-Skills-Web.zip`

Ao atualizar o ZIP, use a versão mais recente de `plugins/beta/` e mantenha o nome `Beta-Skills-Web.zip`:

1. Crie uma cópia temporária isolada do pacote canônico; não altere `plugins/beta/` para produzir a variante web.
2. Remova da cópia `.mcp.json`.
3. Em `.codex-plugin/plugin.json`, remova a propriedade `mcpServers` que referencia `.mcp.json` (a instrução histórica chamava esse manifesto de `plugins.json`).
4. No mesmo manifesto da cópia, altere `name` de `suite-beta` para `suite-beta-skills-web` e `interface.displayName` de `Beta` para `Beta Skills Web`.
5. Não altere nenhum outro arquivo do plugin na cópia. Compacte a cópia preservando a estrutura interna do pacote e substitua somente `Beta-Skills-Web.zip`.
6. Confira o conteúdo do ZIP e o diff da cópia contra `plugins/beta/`: as únicas diferenças permitidas são a remoção de `.mcp.json`, a remoção da propriedade `mcpServers` e as duas mudanças de identidade acima. Não altere outros campos do manifesto, incluindo `version`. Registre as versões de origem e do pacote, o hash SHA-256 e a validação no dossier.

Não atualizar o ZIP se a estrutura, o manifesto ou os campos de origem tiverem mudado de modo que torne estas transformações ambíguas. Nesse caso, documente a divergência e proponha a revisão do procedimento antes de empacotar.

## Versionamento e manutenção documental

- O procedimento não autoriza mudar o campo `version`; copie-o da fonte canônica em `plugins/beta/`. Se a versão antiga do ZIP divergir, substitua-a pela versão da fonte ao reconstruir.
- Toda mudança neste componente deve manter este AGENT e [`DOSSIER.md`](./DOSSIER.md) coerentes. O dossier registra estado, evidência, histórico e próximos passos; este arquivo define regras de trabalho.
- O pacote `Beta-MCP-Web.zip` permanece fora do procedimento de atualização acima.
