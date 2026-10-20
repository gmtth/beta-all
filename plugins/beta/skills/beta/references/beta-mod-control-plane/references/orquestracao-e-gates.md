# Orquestração e gates

## Visão de control plane

A Beta MOD deverá transformar entradas heterogêneas em um único estado funcional vigente.

A orquestração possui quatro responsabilidades inseparáveis:

1. descobrir quais análises são necessárias;
2. coordenar dependências entre especialidades;
3. consolidar e persistir o estado operacional da modelagem;
4. impedir publicação antes de passar pelos gates.

## Gate 1 — Entrada e materialidade

Classificar a entrada:

- funcional relevante;
- fonte/evidência;
- revisão;
- artefato;
- confirmação simples sem conteúdo funcional.

Se não houver conteúdo funcional relevante, não atualizar artificialmente o Dossiê.

## Gate 2 — Fontes e vigência

Usar quando houver mais de uma evidência, versão ou possível conflito.

Executar `@beta-mod-fontes` antes do Dossiê.

Resultado obrigatório:
- fonte vigente;
- fontes complementares;
- conteúdo substituído;
- divergência aberta;
- limitação de acesso, quando houver.

Nenhuma divergência material poderá ser resolvida por inferência.

## Gate 3 — Análise funcional

Executar sempre:
- `@beta-mod-regras`;
- `@beta-mod-dossie`.

Executar as Skills temáticas aplicáveis.

Fechar dependências cruzadas antes de chamar um assunto de consolidado.

## Gate 4 — Consolidação

Produzir uma única interpretação funcional.

Todo ponto material deve possuir estado conhecido e, quando aplicável, destino.

Não manter achado final com rótulo de roteamento.

## Gate 5 — Persistência e impacto

Atualizar Dossiê lógico.

Quando houver alteração relevante, atualizar `DOSSIE_CONTEXTO_MODELAGEM.md` na mesma interação.

Propagar impactos para regras, mensagens, telas, cálculos, permissões, processamento, exemplos e demais pontos afetados.

## Gate 6 — Publicação

Aplicar o filtro do Dossiê.

Publicar somente entendimento vigente destinado à MODELAGEM.

Não publicar:
- CONTEXTO — NÃO PUBLICAR;
- Substituído;
- histórico sem efeito vigente;
- pendência interna sem necessidade de publicação;
- decisão técnica não requisitada.

## Gate 7 — QA

Executar `@beta-mod-qa`.

Se QA encontrar achado material que as fontes existentes permitam resolver:
- reabrir a Skill temática;
- reconsolidar;
- atualizar Dossiê se necessário;
- reaplicar filtro;
- executar QA novamente.

O gate termina quando:
- a modelagem estiver suficiente para desenvolvimento;
- ou restarem apenas ressalvas/decisões explicitamente conhecidas.

## Gate 8 — Artefato

Executar `@beta-mod-artefatos` somente após os gates funcionais.

A materialização não poderá alterar significado.

Quando houver DOCX, a Skill genérica `docx` pode atuar como camada técnica sem autoridade funcional.

## Gate 9 — Entrega e observabilidade

Entregar:
- resposta/modelagem única;
- Dossiê separado quando solicitado ou quando a política de artefato final exigir;
- resumo de execução observável.

Não expor cadeia de pensamento.
