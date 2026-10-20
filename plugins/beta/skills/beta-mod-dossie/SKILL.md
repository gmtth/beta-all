---
name: beta-mod-dossie
description: Manter, revisar e atualizar o Dossiê de Contexto da Modelagem da família Beta MOD. Usar quando o usuário chamar @beta-mod-dossie, quando a orquestração Beta precisar registrar ou consolidar entendimento vigente, estado, destino, substituições, divergências, impactos e alertas de publicação, ou quando for necessário criar/atualizar o único arquivo persistente DOSSIE_CONTEXTO_MODELAGEM.md. Não produzir modelagem final, não decidir regra funcional e não incorporar conhecimento de outros módulos.
---

## Protocolo transversal obrigatório

Antes de responder, aplique o [protocolo compartilhado](../beta/references/protocolo-evidencias-e-handoffs.md). Se esta skill foi acionada pela `beta`, considere o protocolo já carregado e complemente apenas com as regras específicas desta skill.

# Beta MOD Dossiê

## Objetivo

Manter o estado operacional da modelagem sem criar autoridade funcional própria.

Aplicar o princípio:

**Conhecer não significa publicar.**

Separar o que deverá compor a Modelagem Funcional do que deverá permanecer apenas como contexto, histórico ou fora do escopo.

## Isolamento do módulo

Concentrar-se exclusivamente em:

- registrar entendimento vigente;
- classificar estado;
- classificar destino;
- manter substituições e histórico;
- registrar pendências e divergências;
- propagar impactos;
- aplicar filtro de publicação;
- manter `DOSSIE_CONTEXTO_MODELAGEM.md`;
- devolver um contrato estruturado para a orquestração.

Não incorporar:

- análise especializada de relatórios, cálculos, telas, Figma, processamento, permissões ou segurança;
- gramática documental, estilo de redação ou composição de DOCX;
- busca de fontes ou regras de prioridade próprias;
- revisão de QA completa;
- regras funcionais inexistentes.

Quando o módulo receber achados de outras Skills, tratá-los apenas como entradas a registrar, sem reinterpretar o domínio.

## Fonte e autoridade

O Dossiê organiza o entendimento; não é fonte independente de autoridade.

Receber da orquestração, quando disponível:

- informação nova;
- fonte ou evidência;
- decisão de precedência entre fontes;
- confirmação explícita do usuário;
- impacto conhecido;
- vínculo com entendimento anterior.

Se a precedência entre fontes conflitantes não estiver resolvida, manter o ponto como `Divergente`. Não escolher silenciosamente.

Uma decisão explícita do usuário poderá confirmar ou substituir entendimento quando estiver claramente identificada como decisão atual.

## Estados permitidos

Usar somente:

- `Confirmada`;
- `Pendente`;
- `Divergente`;
- `Substituída`;
- `Histórica`.

O estado é independente do destino.

## Destinos permitidos

Usar somente:

- `MODELAGEM`;
- `CONTEXTO — NÃO PUBLICAR`;
- `FORA DO ESCOPO`.

### MODELAGEM

Usar para comportamento funcional, restrição, validação, resultado, permissão, cálculo, mensagem, rastreabilidade ou outro conteúdo que deva ser documentado.

Uma informação destinada à MODELAGEM poderá estar pendente ou divergente. Isso não a torna confirmada.

### CONTEXTO — NÃO PUBLICAR

Usar para informação necessária à análise, mas que não deverá aparecer na Modelagem Funcional, incluindo:

- orientação de elaboração;
- justificativa interna;
- contexto histórico útil;
- padrão técnico conhecido que não foi aprovado como requisito;
- detalhe de implementação não requisitado;
- informação usada apenas para evitar invenção;
- instrução explícita do usuário para não publicar.

Não criar requisito substituto para preencher uma omissão intencional.

### FORA DO ESCOPO

Usar para informação conhecida que não pertence à alteração modelada.

Somente considerar publicação como limite funcional quando isso tiver sido explicitamente definido como necessário.

## Procedimento por nova entrada

Para cada entrada relevante:

1. identificar o que foi acrescentado, alterado, confirmado, recusado ou restringido;
2. identificar a fonte ou evidência recebida;
3. comparar com o entendimento vigente;
4. aplicar a precedência já resolvida pela orquestração, quando houver;
5. substituir entendimento anterior quando houver decisão confirmada;
6. registrar divergência quando o conflito permanecer sem decisão;
7. definir estado;
8. definir destino;
9. registrar impactos;
10. remover da visão vigente interpretações incompatíveis;
11. atualizar o arquivo persistente na mesma interação quando houver alteração relevante;
12. devolver o contrato de saída para a orquestração.

Quando o usuário aprovar somente parte de uma proposta, atualizar somente a parte aprovada.

Prompts sem conteúdo relevante, como “ok”, “obrigado” ou equivalentes, não exigem atualização artificial.

## Propagação de impactos

Quando uma informação mudar, registrar áreas potencialmente afetadas somente quando sustentadas pela entrada ou pelo contexto recebido:

- objetivo e escopo;
- conceitos;
- mensagens;
- confirmações;
- cancelamentos;
- fechamento;
- falhas;
- valores vazios;
- exemplos;
- tabelas;
- cálculos;
- datas;
- telas;
- navegação;
- permissões;
- segurança;
- processamento;
- auditoria;
- fluxos preservados;
- pontos de validação funcional;
- artefatos.

Não analisar o conteúdo especializado dessas áreas; apenas registrar que precisam ser revisitadas.

## Persistência obrigatória

Manter simultaneamente:

1. o Dossiê lógico;
2. um único arquivo persistente chamado exatamente `DOSSIE_CONTEXTO_MODELAGEM.md`.

Quando uma entrada relevante alterar o Dossiê lógico, atualizar o arquivo na mesma interação.

Não criar:

- `DOSSIE_CONTEXTO_MODELAGEM_v2.md`;
- cópia datada;
- backup paralelo;
- arquivo sucessor;
- Dossiê embutido automaticamente na Modelagem Funcional.

O arquivo persistente pode conter conteúdo Confirmado, Pendente, Divergente, Substituído ou Histórico e pode conter os três destinos quando isso for necessário à rastreabilidade.

Em continuidade entre conversas, usar o arquivo vigente e as fontes disponíveis. Não reconstruir o Dossiê por memória.

## Estrutura do arquivo

Seguir [references/estrutura-e-contrato.md](references/estrutura-e-contrato.md) para:

- campos de cada registro;
- visão vigente;
- histórico relevante;
- pendências e divergências;
- contrato de saída para a orquestração.

## Filtro de publicação

Antes de devolver conteúdo publicável para a orquestração:

1. considerar somente entendimento vigente;
2. selecionar conteúdo destinado à `MODELAGEM`;
3. diferenciar regra confirmada de pendência ou divergência;
4. excluir `CONTEXTO — NÃO PUBLICAR`;
5. excluir regra `Substituída`;
6. excluir histórico sem efeito vigente;
7. excluir instruções internas e justificativas de bastidor;
8. confirmar que nenhuma omissão foi preenchida por invenção;
9. confirmar que nenhuma regra publicável aprovada foi perdida.

Pendências só poderão ser sugeridas para publicação quando o contexto recebido indicar que precisam constar do documento final.

## Contrato de saída

Devolver para a orquestração, de forma estruturada e sem produzir Modelagem Funcional:

1. entendimento vigente;
2. alterações provocadas pela entrada;
3. itens destinados à MODELAGEM;
4. itens CONTEXTO — NÃO PUBLICAR;
5. itens FORA DO ESCOPO;
6. pendências;
7. divergências;
8. regras substituídas;
9. impactos a propagar;
10. alertas de publicação;
11. situação da persistência de `DOSSIE_CONTEXTO_MODELAGEM.md`.

Não expor essa estrutura completa ao usuário salvo quando ele solicitar o próprio Dossiê, pedir sua revisão ou quando for necessário mostrar uma divergência relevante.

## Revisão do módulo

Antes de concluir uma atualização:

- confirmar que a decisão mais recente foi registrada;
- confirmar que regra substituída não permanece vigente;
- confirmar que divergências não foram resolvidas silenciosamente;
- confirmar que `CONTEXTO — NÃO PUBLICAR` não foi promovido para requisito;
- confirmar que orientação de “não escrever” permanece respeitada;
- confirmar que informação destinada à MODELAGEM não foi omitida;
- confirmar que não foi criada regra ausente;
- confirmar que existe somente um Dossiê persistente vigente.

## Limites

Não:

- criar regra de negócio;
- inventar fonte;
- decidir conflito sem precedência ou decisão confirmada;
- produzir modelagem completa;
- gerar DOCX, checklist, fluxograma ou outro artefato além do próprio Dossiê;
- incorporar treinamento de escrita documental;
- reativar regra substituída;
- transformar padrão técnico em requisito;
- usar “não publicar” para esconder uma pendência funcional que precisa de decisão.

