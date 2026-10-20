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
