# Plano de compatibilidade entre o plugin Beta e ChatGPT Sites

**Estado:** proposta para investigação e validação; nenhuma alteração de implementação ou publicação autorizada por este documento.
**Atualizado:** 2026-10-21
**Escopo:** avaliar se, e como, o plugin Beta e suas skills podem trabalhar com um plugin hospedado por ChatGPT Sites.

## Objetivo

Definir uma rota verificável para disponibilizar no ChatGPT as ferramentas MCP do projeto Beta por meio do fluxo de plugin hospedado em um Site, preservando as skills, a autenticação individual dos analistas, os escopos e os controles do backend.

Este plano é independente dos dossiers de Sites e plugin. Ele não autoriza editar, publicar ou mudar permissões no Site de produção. A primeira etapa é descoberta e teste isolado.

## Três peças que não devem ser confundidas

1. **Plugin Beta do Codex:** pacote em `plugins/beta/`, com manifesto `.codex-plugin/plugin.json`, 20 skills e `.mcp.json` que declara o endpoint remoto Movidesk/MCP. As skills fornecem instruções, roteamento e procedimentos; o manifesto também aponta para o pacote de skills e a configuração MCP.
2. **MCP/OAuth do projeto:** servidor HTTP implementado em `mcp/movidesk/`, atualmente servido no endpoint `/mcp/`. Ele registra ferramentas, esquemas de entrada, esquemas de segurança e aplica autorização no servidor.
3. **Plugin associado a um Site:** a documentação oficial descreve um fluxo em que se adiciona um servidor MCP ao Site e o proprietário publica o Site; o ChatGPT então apresenta um cartão de plugin para instalar e conectar. Esse objeto e seu ciclo de publicação são distintos do manifesto do plugin Beta no marketplace.

Uma quarta capacidade também existe: **Sites que usam apps conectados pelos visitantes** para compor a experiência web do próprio Site. Isso não é automaticamente o mesmo que expor ferramentas MCP numa conversa através de um plugin.

## Inventário atual e evidências

| Área | O que o projeto já tem | O que isso comprova | O que ainda não comprova |
|---|---|---|---|
| Plugin Beta | Manifesto `suite-beta` versão `1.0.4`, interface Beta, capacidades declaradas Read/Search/Analyze e caminhos para skills e `.mcp.json`. | Existe um pacote de plugin do Codex com identidade e recursos locais declarados. | Que o pacote possa ser importado ou convertido diretamente em plugin hospedado por Sites. |
| Skills | 20 diretórios ativos: `beta` como orquestradora e módulos `beta-anl-*`/`beta-mod-*`; as skills têm instruções e metadados próprios. | A experiência Beta tem uma camada de orientação e especialização modular. | Que Sites execute essas skills, respeite chamadas de subskill ou compartilhe seu roteamento. Isso depende do runtime do plugin destino. |
| Conexão MCP no pacote | `plugins/beta/.mcp.json` aponta para `https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/`. | O plugin do Codex declara um servidor MCP remoto. | Que Sites associe esse endpoint ao plugin nativo gerado, ou que todos os clientes suportem essa configuração. |
| Servidor MCP | `mcp/movidesk/worker/mcp.ts` registra as ferramentas Movidesk e conhecimento; há esquemas OAuth e verificações de autorização no servidor. | O backend tem uma implementação MCP/OAuth própria e regras server-side. | Que o MCP publicado seja reconhecido como o servidor nativo do projeto Site. O dossier registra que o deployment do Sites informou `has_mcp: false`; a implementação personalizada `/mcp/` continuou separada. |
| Autenticação | OAuth individual por conta, papéis e escopos como `movidesk:read`, `knowledge:read` e escrita explicitamente limitada. | A autorização pode ser verificada no backend por usuário e escopo. | Que o fluxo de conexão do plugin de Sites reutilize a conexão atual sem uma segunda autorização ou sem diferenças de cliente/metadata. |
| Distribuição atual | Marketplace GitHub `Beta` aponta a `plugins/beta/`; cada analista instala/sincroniza o pacote e conecta sua própria conta MCP. | Há um fluxo de distribuição do pacote no workspace. | Que esse marketplace e o catálogo de plugins associados ao Site sejam o mesmo mecanismo ou sincronizem versões entre si. |
| Apps conectados em Sites | A tela do projeto mostra uma aba Plugins, mas o screenshot fornecido mostrou falha ao carregar os plugins atuais. | Apenas que o painel tentou listar plugins e apresentou erro naquele momento. | Se a aba gerencia apps usados dentro da página Site, plugins MCP hospedados ou ambos; o erro não revela o estado real do catálogo. |

### Evidências de fonte

- Código/estado local: `plugins/beta/.codex-plugin/plugin.json`, `plugins/beta/.mcp.json`, `plugins/beta/AGENTS.md`, `plugins/beta/DOSSIER.md`, `mcp/movidesk/worker/mcp.ts` e `mcp/movidesk/DOSSIER.md`.
- Dossier do Sites: `mcp/movidesk/DOSSIER.md` registra a resposta `has_mcp: false` para o deployment examinado, distinguindo-a do endpoint MCP personalizado no Worker. Revalidar a situação da plataforma e do deployment antes de qualquer conclusão operacional.
- Documentação oficial de [hospedagem de plugin com ChatGPT Sites](https://help.openai.com/en/articles/20001547-hosting-a-plugin-with-chatgpt-sites) descreve: adicionar MCP ao Site, testar, publicar pelo proprietário, instalar o cartão e completar conexão individual. A documentação também diferencia acesso ao Site, acesso ao plugin e conexão com serviços externos.
- Documentação oficial de [criação e uso de ChatGPT Sites](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites) descreve apps conectados usados pela página do Site e o fluxo separado de Site que hospeda um MCP para fornecer ferramentas em conversa.

## Perguntas que precisam de resposta antes de implementar

### A. Qual integração a aba “Plugins” está mostrando?

- A aba atual permite conectar um app/plugin para ser consumido pela própria página Site, criar/gerenciar um plugin associado ao Site, ou exibe os dois fluxos?
- O botão “Adicionar” aceita plugins MCP externos já existentes ou inicia a criação de ferramentas no Site?
- O erro “Não foi possível carregar os plugins atuais do site” é um erro de listagem, falta de permissão, indisponibilidade ou ausência de itens? Repetir a consulta e registrar o diagnóstico sem inferir o catálogo pelo screenshot.
- Há alguma API/ação suportada que exponha `has_mcp`, servidores MCP e ferramentas do projeto publicado? Qual é a fonte de verdade para saber se o Site tem plugin associado?

### B. Como o endpoint atual pode entrar no fluxo nativo?

- Sites permite associar o endpoint HTTPS externo `/mcp/` já existente, ou exige que o servidor MCP seja criado/gerado dentro do Site?
- Se o Site hospedar/gerar um servidor, ele pode encaminhar ferramentas para o Worker atual, preservando as regras e os contratos, ou duplicaria lógica no runtime Site?
- Quais transportes e versões de MCP o plugin hospedado aceita? Confirmar Streamable HTTP, URL/caminho, comportamento de `tools/list`/`tools/call` e limites operacionais.
- Existe um manifesto/configuração de tools editável no Site e como mudanças nele se relacionam à versão publicada, ao cartão de plugin e ao cache dos clientes?
- É possível preservar um único backend de ferramentas para evitar duas versões divergentes da lógica Movidesk e do acesso ao Supabase?

### C. Como identidade e OAuth serão mantidos?

- O plugin gerado aceita o servidor de autorização OAuth atual e seus endpoints de descoberta/metadados, PKCE, escopos e desafio de reconexão?
- A conexão individual do plugin encaminha o mesmo bearer token que o Worker valida hoje? Identidade, papel e escopos continuam derivados do token no servidor?
- Cada analista precisa instalar e conectar o plugin gerado separadamente? Como isso se combina com instalação/importação do marketplace atual?
- A reconexão depois de expiração/revogação continua nativa no cliente? Testar refresh automático, `invalid_token`, `insufficient_scope` e repetição da ferramenta.
- Há diferenças entre autenticação do visitante do Site e autenticação do usuário do plugin em conversa? Não assumir que compartilhar ou abrir o Site transfira conexão ou permissões.
- Os quatro analistas estão no mesmo workspace elegível? A documentação atual informa requisitos e permissões de workspace para criar/compartilhar plugin; confirmar plano, políticas, permissões de criação/uso e modelo de compartilhamento efetivamente disponível para a equipe.

### D. Quais responsabilidades cabem ao plugin, às skills e ao MCP?

- Quais metadados de ferramenta (nome, descrição, parâmetros, saída, segurança, indicação somente leitura) são publicados ao cliente?
- O runtime do plugin hospedado suporta skills reutilizáveis, ou apenas ferramentas MCP? Se suportar apenas MCP, as regras necessárias devem virar descrições de ferramenta/contratos do servidor, enquanto as skills permanecem no pacote Codex.
- O plugin precisa invocar `beta`/skills especializadas? Se não houver mecanismo suportado para isso, não simular dependências de skill no Site.
- Como o cliente escolhe entre ferramentas com nomes/descrições semelhantes vindas do plugin atual e do plugin hospedado? Como evitar duplicidade e chamadas ao endpoint errado?
- Quais ações são de leitura e quais escrevem conhecimento? A importação de conhecimento é explícita, com escopo e auditoria; nenhuma criação/alteração do Movidesk deve ser exposta por acidente.
- O plugin gerado permite ferramentas externas sem replicar páginas/dados no Site? Como se mantém o princípio de não expor chaves Supabase, tokens ou credenciais ao navegador, Site ou modelo?

## Matriz de compatibilidade a preencher

| Capacidade | Situação inicial | Verificação necessária | Critério para considerar compatível |
|---|---|---|---|
| Manifesto de plugin | Existe manifesto Codex; plugin de Site é objeto separado. | Inspecionar o cartão e as ferramentas que Sites associa após publicar um MCP. | Não depender de conversão implícita; versões e fontes canônicas identificadas. |
| Skills e roteamento | 20 skills empacotadas no plugin Codex. | Confirmar suporte do runtime Sites/plugin às instruções, chamadas e dependências. | Cada comportamento necessário funciona no destino ou tem adaptação documentada sem perder controles. |
| Catálogo de ferramentas | MCP atual registra ferramentas Movidesk/knowledge. | Comparar `tools/list`, schemas e segurança no cliente gerado. | Ferramentas pretendidas aparecem com nomes, descrições, schemas e escopos corretos. |
| Transporte | Endpoint HTTP remoto existe no código/publicação atual. | Confirmar compatibilidade do transporte exigido pelo plugin hospedado. | `tools/list` e `tools/call` funcionam no endpoint associado, sem proxy/rota ambígua. |
| OAuth | Backend tem OAuth, escopos e validação por principal. | Testar descoberta, PKCE, scopes, refresh, reconexão e autorização insuficiente no cliente destino. | Cada usuário é autenticado individualmente e o backend aplica papel/escopo em todas as chamadas. |
| Compartilhamento | Marketplace GitHub já centraliza plugin Codex; Site e plugin têm permissões próprias. | Confirmar disponibilidade e política de compartilhamento para o workspace. | Um analista autorizado consegue obter acesso ao Site e ao plugin, instalar ambos quando aplicável e completar sua conexão. |
| Publicação/versionamento | GitHub/marketplace e Sites têm ciclos distintos. | Descobrir quais artefatos mudam após publish e como atualizar plugin existente. | Um release tem registro de versão/SHA do código, publicação, tools visíveis e procedimento de rollback. |
| Segurança e escrita | Server-side OAuth e controles existentes; algumas ferramentas têm escrita restrita. | Auditar todos os tools expostos no cartão gerado. | Least privilege, scopes corretos, dados sensíveis minimizados e nenhuma escrita não intencional. |
| Telemetria/feedback | Backend possui telemetria operacional separada; proposta de autodiagnóstico está em plano próprio. | Garantir que plugin/site não capture chain-of-thought ou transcrição além do necessário. | Eventos registrados conforme política do projeto, sem tokens/segredos, com retenção e finalidade definidas. |

## Caminhos possíveis depois da descoberta

1. **Manter os dois fluxos separados:** plugin Beta/skills pelo marketplace e MCP/OAuth como conexão independente. Escolher se o suporte é suficiente, sem alegar integração nativa Sites.
2. **Associar o MCP atual ao plugin hospedado por Sites:** preferível se Sites aceitar endpoint MCP externo e preservar OAuth atual. Deve manter um backend canônico e evitar cópia de ferramentas.
3. **Adicionar MCP nativo no Site com encaminhamento ao Worker:** considerar se a plataforma não aceitar endpoint diretamente, mas oferecer um modo suportado de encaminhamento. Validar autenticação e limites antes de implementar.
4. **Gerar tools dentro do Site:** último caminho se for requisito da plataforma. Só avançar com estratégia para compartilhar contratos e evitar duplicar autorização, regras de negócio e integração com Supabase/Movidesk.
5. **Usar apps conectados só na experiência web do Site:** manter isso como integração de página, sem confundir com o plugin que atende a conversa.

Não decidir entre esses caminhos até responder às perguntas A–D usando o painel/API e uma prova controlada.

## Plano de trabalho

O trabalho de implementação fica dividido em etapas com diagnósticos explícitos. Ao final de cada etapa, comparar o resultado observado com o critério e apresentar o diagnóstico antes de iniciar a etapa seguinte. Se um critério falhar, corrigir ou revisar a decisão daquela etapa e repetir seu diagnóstico; não avançar carregando uma falha como se fosse aprovada.

### Etapa 0 — registrar e aprovar este plano

- Revisar este documento com o usuário e ajustar escopo, riscos, critérios e caminho preferido.
- Não alterar o pacote, o OAuth, o Site ou os tools de produção nesta etapa.
- **Diagnóstico:** confirmar que o plano está versionado em um commit próprio e que o working tree contém apenas alterações preexistentes claramente separadas.
- **Ponto de aprovação:** o usuário aprova o plano e autoriza começar a descoberta técnica. Esse aceite não autoriza publicar nem modificar produção.

### Etapa 1 — descoberta sem mutações

- Conferir novamente o plugin Beta importado, o seu `.mcp.json`, as skills declaradas e os clientes em que o pacote está disponível.
- Consultar o estado atual do Site e do cartão associado usando ferramenta/API suportada; identificar se o erro no painel é transitório e se existe plugin gerado.
- Confirmar permissões do workspace e significado dos controles Plugins/Adicionar no contexto do Site.
- Obter da plataforma a lista de protocolos, OAuth, requisitos de publicação e compartilhamento para plugin hospedado.
- Registrar fontes e respostas na matriz de compatibilidade; não mudar o Site ou o plugin de produção.
- **Diagnóstico:** evidência direta do estado do plugin e do Site, diferença entre app conectado e plugin de conversa, e respostas às perguntas A–D. Marcar cada item como confirmado, incompatível ou ainda desconhecido.
- **Ponto de aprovação:** escolher o caminho de integração. Se a plataforma não permitir associar o MCP externo ou o OAuth atual, parar e apresentar alternativas antes de prototipar.

### Etapa 2 — contrato técnico

- Mapear uma ferramenta de leitura representativa (por exemplo, busca limitada de chamados) do registro MCP até a chamada no plugin hospedado.
- Comparar nomes, descrição, schema de entrada/saída, `securitySchemes`, scopes, annotations e formato de erro.
- Desenhar o caminho de identidade: instalação → OAuth/PKCE → bearer token → validação do usuário/papel/escopo no Worker → chamada externa autorizada.
- Confirmar se as skills são consumidas pelo runtime destino. Separar instruções portáveis de chamadas de ferramenta; preservar skills como fonte de comportamento do plugin Codex se não forem executadas por Sites.
- Definir estratégia de versão única e rollback entre GitHub, Site e plugin gerado.
- **Diagnóstico:** apresentar uma tabela de mapeamento entre ferramentas/skills atuais e o destino, incluindo lacunas, duplicações e mudanças propostas. Não converter ou reescrever as 20 skills antes de saber quais runtimes as executam.
- **Ponto de aprovação:** o usuário revisa e aprova o desenho mínimo, o conjunto inicial de ferramentas e os arquivos que poderão ser alterados.

### Etapa 3 — protótipo isolado

- Usar um Site de teste ou versão privada de teste, com dados sintéticos e sem ações de escrita em Movidesk/Supabase.
- Criar/publicar o plugin de teste somente após a descoberta confirmar um caminho suportado e o dono/operador autorizar publicação de teste.
- Instalar como conta de teste separada, concluir conexão e chamar uma ferramenta apenas de leitura.
- Comparar identidade, scopes, resultado e erros com o MCP atual; verificar que respostas não contêm segredo, dados de outra pessoa ou conteúdo não autorizado.
- **Diagnóstico:** apresentar resultado observado das chamadas, diferenças de autenticação, logs sanitizados e comportamento no cartão/plugin. Se for necessário criar um Site privado de teste, pedir aprovação específica antes de qualquer publicação ou convite.
- **Ponto de aprovação:** somente após o usuário aprovar o diagnóstico pode-se adaptar os contratos ou preparar uma integração de equipe. Produção segue intocada.

### Etapa 4 — regressão e decisão de adoção

- Testar usuário autorizado, usuário sem escopo, conta inativa, token expirado, token revogado, refresh/reconexão e serviço externo indisponível.
- Testar ferramentas de leitura representativas do Movidesk e da base; testar ferramenta de escrita restrita somente com fixture/ambiente próprio e confirmação específica.
- Confirmar que não há tool duplicado/confuso quando plugin atual e novo estão instalados juntos; decidir qual pacote os analistas devem usar.
- Confirmar no painel a lista de ferramentas e versões; publicar para a equipe somente depois de todos os critérios de aceite passarem.
- **Diagnóstico:** entregar matriz final de critérios aprovada/reprovada, resultado dos smokes por ferramenta e plano de rollback. Falha bloqueia adoção, mesmo que o plugin apareça instalável.
- **Ponto de aprovação:** o usuário decide se autoriza distribuir/publicar para os analistas. A publicação é um passo separado e não fica autorizada pelo aceite deste plano.

## Alterações previstas, condicionadas às confirmações

Estas são hipóteses de trabalho para orientar a revisão, não mudanças já aprovadas:

1. Se o plugin gerado por Sites puder apontar ao MCP externo, manter `mcp/movidesk/` como backend único e associar o endpoint por configuração suportada, evitando duplicar tools e regras.
2. Se houver suporte real a skills no runtime de destino, definir quais instruções podem ser compartilhadas e como versioná-las. Se não houver, manter skills no plugin Codex e evitar uma conversão que finja paridade.
3. Se houver divergência de cliente OAuth, adaptar metadata/registro do cliente sem reduzir validações de usuário, papel ou escopo no Worker; não criar identidade confiada enviada pelo modelo.
4. Se houver conflito de catálogo ou chamadas duplicadas, escolher um caminho padrão para os analistas e documentar convivência/transição antes de disponibilizar o segundo plugin.
5. Atualizar manifestos, descrições, schemas ou documentação somente quando o diagnóstico provar que o campo é necessário e o usuário aprovar o diff dessa etapa.

## Controle de commits durante o plano

- O commit preparatório contém somente este Markdown e documenta o plano antes da implementação.
- Não agrupar alterações preexistentes do monorepo com esse commit. No snapshot inicial, há outras mudanças locais em `AGENTS.md`, dossiers e documentos Supabase, além de diretórios não rastreados como `node_modules/` e `infra/supabase/.temp/`; elas não são parte deste plano e não devem ser incluídas sem inspeção e autorização próprias.
- Cada etapa aprovada deve produzir commits pequenos e revisáveis dos arquivos diretamente relacionados, com diagnóstico antes do próximo passo.
- Fazer push para GitHub e publicar no Sites só quando solicitado separadamente; commit local do plano não sincroniza GitHub nem Sites.

## Critérios de aceite

- O plugin associado ao Site existe e seu conjunto de ferramentas pode ser inspecionado; não inferir existência apenas do endpoint `/mcp/`.
- Cada ferramenta visível tem contrato e escopo deliberados e corresponde ao backend canônico.
- Cada analista usa sua própria conexão; o backend valida token, usuário, estado, papel e escopos a cada chamada.
- Refresh/reconexão funcionam no cliente alvo ou a limitação e alternativa de uso ficam explícitas.
- Skills necessárias são executadas pelo runtime, ou ficam declaradas como recurso exclusivo do pacote Codex; não há dependência fictícia entre os dois runtimes.
- Instalação/compartilhamento respeitam as permissões do workspace e o acesso ao Site; publicação e atualização do plugin são reproduzíveis e rastreáveis.
- Os smokes passam com dados de teste, sem escritas acidentais, vazamento de segredos ou mistura de contas.
- Existe uma decisão registrada sobre qual será a experiência padrão para os quatro analistas e como voltar ao fluxo existente.

## Checklist de handoff para a conversa de plugin/skills

1. Ler este plano, `plugins/beta/AGENTS.md`, `plugins/beta/DOSSIER.md` e `docs/components/plugin-marketplace.md`.
2. Inspecionar o pacote Codex e as 20 skills; classificar cada comportamento como instrução, ferramenta MCP, app conectado, ou operação do Site.
3. Consultar a documentação/plataforma Sites atual e o estado real do projeto; esclarecer a falha da lista de Plugins.
4. Responder às perguntas A–D e preencher a matriz, citando evidências concretas.
5. Propor mudanças no plugin/skills separadamente da integração do Site. Não reescrever skills para um runtime que ainda não confirmou suporte.
6. Apresentar um desenho mínimo de protótipo e seus riscos antes de qualquer alteração ou publicação.
7. Não modificar o dossier Sites por causa deste plano. Só atualizar dossiers quando houver decisão de arquitetura ou implementação concluída, e após instrução/escopo apropriado.

## Limites do que foi feito

Este arquivo registra planejamento e inventário de fontes existentes. Não inspecionou nem alterou o catálogo do workspace em tempo real, não verificou o cartão gerado para o Site atual, não criou MCP nativo, não editou as skills, não mudou OAuth e não publicou Site ou plugin. Os fatos operacionais acima devem ser revalidados pela conversa responsável antes de iniciar a implementação.
