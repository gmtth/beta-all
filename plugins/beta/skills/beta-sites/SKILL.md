---
name: beta-sites
description: Criar ou ajustar um clone web autônomo, visual e funcional do sistema CENCIHUB a partir do DOSSIE_CONTEXTO_MODELAGEM.md, regras de negócio confirmadas, HTML/CSS fornecidos e, opcionalmente, arquivos HAR. Usar quando o usuário pedir @beta-sites, um site-clone do CENCIHUB, a materialização navegável de uma modelagem/regra em telas, ou a atualização desse clone após mudança de regra ou referência visual. Não integrar com backend, API, banco, autenticação ou ambiente real do CENCIHUB.
---

# Beta SIT

## Objetivo

Materializar o entendimento funcional vigente do CENCIHUB em um clone web isolado, executável e navegável, preservando a aparência e o comportamento demonstrados pelas fontes fornecidas.

Não transformar a Skill em gerador de produto novo, redesign, arquitetura do sistema real ou integração com ambientes reais.

## Fontes aceitas

Usar, conforme disponíveis:

1. `DOSSIE_CONTEXTO_MODELAGEM.md` como registro operacional do entendimento vigente;
2. decisões explícitas do usuário na conversa;
3. listagens de regras de negócio fornecidas pelo usuário;
4. HTML e CSS do sistema como evidência de estrutura e aparência;
5. HAR somente como evidência auxiliar de recursos, requisições, respostas e estados observáveis;
6. dados fictícios fornecidos ou criados pelo usuário para exercitar os fluxos.

Ler [references/fontes-e-fidelidade.md](references/fontes-e-fidelidade.md) antes de interpretar conflito, lacuna, HTML/CSS ou HAR.

## Precedência e contexto próprio

Aplicar esta ordem quando houver conflito entre fontes:

1. decisão explícita mais recente do usuário;
2. `DOSSIE_CONTEXTO_MODELAGEM.md` vigente;
3. regras funcionais confirmadas;
4. HTML/CSS e demais referências visuais;
5. HAR, somente como evidência auxiliar;
6. dados fictícios usados para demonstração.

Manter, no projeto do clone, um arquivo próprio chamado `BETA_SITES_CONTEXTO.md`. Esse arquivo é memória de implementação e deve ser lido antes de alterar o clone e atualizado após cada mudança material. Registrar nele, de forma curta e rastreável:

- telas, rotas e componentes já implementados;
- comportamentos preservados e regressões evitadas;
- decisões de implementação visível e sua fonte;
- referências visuais utilizadas;
- lacunas, divergências e validações pendentes;
- data ou prompt de origem quando isso ajudar a identificar a decisão.

O contexto próprio não substitui o Dossiê, não cria regra de negócio e não vence uma nova decisão explícita do usuário. Ele também não congela o produto: uma nova tela ou fluxo deve ser criado quando solicitado, aproveitando o que já existe e preservando somente os comportamentos anteriores que não foram substituídos.

## Fluxo obrigatório

Executar na ordem abaixo.

### 1. Consolidar o escopo vigente

- Ler o `DOSSIE_CONTEXTO_MODELAGEM.md` disponível.
- Considerar como implementável somente conteúdo vigente destinado a `MODELAGEM`.
- Não promover `CONTEXTO — NÃO PUBLICAR`, `FORA DO ESCOPO`, conteúdo `Substituído` ou `Histórico` a comportamento do site.
- Tratar conteúdo `Pendente` ou `Divergente` como não decidido.
- Aplicar a decisão explícita mais recente do usuário quando ela substituir entendimento anterior.
- Preservar regras já confirmadas que não tenham sido substituídas.

### 2. Mapear o comportamento a reproduzir

Para cada fluxo aplicável, identificar somente o que estiver sustentado pelas fontes:

- ponto de entrada;
- tela e estado inicial;
- dados apresentados;
- ações disponíveis;
- validações;
- mensagens;
- confirmação;
- cancelamento;
- fechamento;
- erro;
- retorno;
- próxima tela ou resultado;
- estados vazios, desabilitados, carregando, sucesso e falha quando definidos;
- permissões somente quando houver regra explícita;
- efeitos sobre os dados locais do clone.

Não inventar gatilho, mensagem, permissão, cálculo, validação, navegação ou resultado.

### 3. Reconstruir a referência visual

Quando houver HTML/CSS fornecido:

- preservar estrutura, classes, dimensões, espaçamentos, tipografia, cores, ícones, tabelas, filtros, botões, modais, toasts e demais padrões observáveis;
- reutilizar o código e os estilos fornecidos quando isso aumentar a fidelidade;
- não modernizar, simplificar, redesenhar ou substituir componentes por preferência;
- não tratar HTML/CSS como prova de regra funcional que eles não expressem;
- não afirmar equivalência visual exata para elementos sem referência suficiente.

Quando faltar referência visual necessária para reproduzir uma tela de forma fiel, solicitar ao usuário a referência ausente em vez de inventar um padrão novo.

### 4. Tratar HAR apenas como fonte auxiliar

Quando houver HAR:

- analisar apenas o necessário para compreender comportamento observável do clone;
- ignorar e não reproduzir cookies, tokens, credenciais, cabeçalhos secretos, identificadores de sessão ou dados pessoais desnecessários;
- nunca efetuar chamadas aos endpoints encontrados;
- nunca usar o HAR para conectar o clone ao sistema real;
- não converter formato de request/response em regra de negócio sem confirmação funcional;
- usar respostas observadas somente para entender estados, formatos ou sequências já compatíveis com as regras confirmadas.

### 5. Resolver lacunas materiais

Perguntar ao usuário somente quando a ausência puder alterar:

- comportamento;
- dado;
- cálculo;
- permissão;
- mensagem;
- processamento;
- resultado;
- navegação ou representação visual necessária para a fidelidade solicitada.

Agrupar dúvidas relacionadas e indicar objetivamente o impacto de cada uma.

Não interromper por preferência técnica que possa ser resolvida localmente sem alterar o comportamento visível.

Quando uma lacuna identificada puder alterar a implementação solicitada, pedir ativamente ao usuário a decisão necessária. Não apenas listar a lacuna no final. Agrupar perguntas relacionadas, explicar o impacto de cada uma e, quando possível, apresentar alternativas objetivas. Continuar as partes seguras e independentes enquanto aguarda a decisão.

### 6. Implementar o clone isolado

- Produzir uma aplicação web executável e navegável.
- Manter toda execução independente do sistema real.
- Não integrar com backend, API, banco de dados, autenticação, serviços, repositórios ou ambientes do CENCIHUB.
- Usar somente dados fictícios fornecidos/criados pelo usuário ou dados locais estritamente necessários para demonstrar uma regra já confirmada.
- Não transformar massa de demonstração em regra de negócio.
- Implementar estado local apenas na medida necessária para que o fluxo confirmado funcione dentro do clone.
- Preservar a stack e os arquivos fornecidos quando houver uma base existente.
- Quando não houver base técnica, escolher a solução local mais simples que permita executar o clone no ambiente disponível, sem criar dependências externas desnecessárias.
- Não adicionar telas, ações ou recursos “úteis” que não tenham fonte.
- Para uma nova tela ou fluxo solicitado, estender a aplicação existente mesmo que a tela ainda não esteja descrita no `BETA_SITES_CONTEXTO.md`; usar o contexto para preservar o que já funciona, não para impedir evolução.
- Não apagar ou substituir uma tela existente somente porque ela não participa da nova solicitação.

### 7. Validar antes de concluir

Ler e aplicar [references/validacao.md](references/validacao.md).

Validar, no mínimo:

- cada regra implementada contra sua fonte;
- cada ação visível contra um resultado conhecido;
- confirmação, cancelamento, fechamento e erro quando aplicáveis;
- estados e mensagens previstos;
- navegação de ida e retorno;
- ausência de integração real;
- ausência de segredos provenientes de HAR;
- ausência de conteúdo `CONTEXTO — NÃO PUBLICAR` transformado em funcionalidade;
- fidelidade visual contra HTML/CSS fornecidos.
- aplicação iniciada com sucesso;
- rotas principais acessíveis diretamente e após refresh;
- console sem erros relevantes;
- ausência de chamadas externas, integração real ou segredos;
- rastreabilidade mínima `fonte → tela/ação → regra → resultado esperado → evidência`;
- atualização do `BETA_SITES_CONTEXTO.md` com o que foi implementado, preservado e ainda pendente.

Não declarar o clone “exatamente igual” quando existirem partes sem evidência visual ou funcional suficiente. Informar somente as lacunas que realmente afetarem a validação.

## Atualizações do clone

Quando o usuário alterar regra, Dossiê, HTML, CSS ou outra fonte:

1. identificar o que foi substituído;
2. localizar todos os fluxos e telas impactados;
3. remover o comportamento anterior incompatível;
4. aplicar somente o novo entendimento confirmado;
5. preservar áreas não afetadas;
6. repetir a validação das áreas impactadas.

Não manter comportamento antigo por compatibilidade quando a regra tiver sido explicitamente substituída.

## Saída

Entregar o clone executável nos arquivos adequados ao ambiente usado.

Não gerar automaticamente:

- documentação funcional paralela;
- manual de usuário;
- arquitetura do CENCIHUB;
- plano completo de testes;
- integração real;
- credenciais ou configuração de ambiente real.

Quando houver bloqueio por falta de regra ou referência necessária, entregar o que estiver seguro e listar apenas as decisões que impedem concluir a parte restante.

Informar também:

- arquivos ou telas alterados;
- comando usado para executar o clone;
- fluxos e estados validados;
- limitações conhecidas;
- integrações deliberadamente não realizadas.
