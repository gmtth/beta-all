# Marketplace GitHub do plugin Beta

**Atualizado:** 2026-10-20

## Fonte única

O repositório privado [`gmtth/beta-all`](https://github.com/gmtth/beta-all) é a fonte do marketplace e do plugin. O catálogo em [`.agents/plugins/marketplace.json`](../../.agents/plugins/marketplace.json) publica o pacote local `plugins/beta/`, que inclui as skills e a configuração MCP. Alterações devem ser feitas no monorepo e sincronizadas pelo marketplace; não manter cópias independentes do plugin para cada analista.

## Importação inicial pelo administrador

Um administrador do workspace ChatGPT deve:

1. Ter uma conta GitHub com leitura contínua do repositório privado `gmtth/beta-all`.
2. Abrir **Admin Console → Plugins → Add → Import marketplace**.
3. Informar **Source:** `https://github.com/gmtth/beta-all`.
4. Deixar **Path** vazio, pois `.agents/plugins/marketplace.json` está na raiz.
5. Informar **Branch:** `main` para receber alterações futuras.
6. Autorizar a conexão GitHub e revisar o resultado da importação.
7. Ajustar a política de instalação e os papéis que podem usar o plugin.

O marketplace sincroniza do GitHub automaticamente em ciclos diários. Para aplicar uma atualização sem esperar, o administrador abre **Admin Console → Plugins → Marketplaces → Beta → Sync now**. A sincronização atualiza o pacote do plugin; ela não conecta a conta GitHub dos analistas, não concede acesso ao MCP e não realiza a autorização OAuth individual.

## Autenticação e acesso dos analistas

Cada analista ainda precisa ter acesso ao plugin segundo a política do workspace e autorizar o conector Beta/MCP com sua própria conta ChatGPT. A sincronização do GitHub publica os arquivos compartilhados; não compartilha tokens OAuth, credenciais de Movidesk ou chaves Supabase. Essas permissões continuam sob controle do workspace e do backend.

## Disponibilidade por cliente

O pacote ativo declara um servidor MCP em `plugins/beta/.mcp.json`. A documentação atual do ChatGPT diz que plugins importados que declaram servidores em `mcp.json` ou `.mcp.json` podem ser marcados como **Desktop only**, inclusive quando apontam para um endpoint HTTPS remoto. Portanto, o marketplace centraliza e atualiza o plugin, mas esta configuração não garante que ele apareça no ChatGPT web. Não remover nem trocar o MCP como atalho: para uso web, primeiro validar uma integração baseada em app/MCP já registrada e disponível no workspace, preservando a autenticação OAuth por analista.

## Fluxo de atualização

1. Alterar e revisar a fonte canônica em `plugins/beta/`.
2. Atualizar sua versão em `.codex-plugin/plugin.json` quando a mudança exigir uma nova versão do pacote.
3. Validar o plugin conforme [`plugins/beta/AGENTS.md`](../../plugins/beta/AGENTS.md), revisar o diff e enviar a alteração para `main`.
4. Aguardar a sincronização automática ou solicitar **Sync now** no workspace.
5. Conferir o relatório de sincronização e testar o plugin em cada cliente suportado, incluindo OAuth/MCP individual.

O marketplace só importa commits que chegaram ao GitHub. A sincronização pode adicionar e atualizar plugins, mas remover uma entrada do catálogo não apaga a cópia já importada no workspace.

## Limites ainda não validados

- A importação e o uso compartilhado dependem de um workspace ChatGPT elegível e de um administrador com acesso à área Plugins.
- O estado das contas dos quatro analistas no mesmo workspace não foi confirmado neste documento.
- Não foi feita importação no workspace nem teste de sincronização; isso exige atuação do administrador na interface do ChatGPT e autorização GitHub.
- A execução no ChatGPT web permanece incerta por causa da configuração MCP declarada; testar após a importação antes de prometer suporte web.

## Referências oficiais

- [Importar e sincronizar marketplaces do GitHub](https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github)
- [Gerenciamento de plugins no workspace](https://learn.chatgpt.com/docs/enterprise/plugin-management)
