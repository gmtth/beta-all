# Estrutura e contrato do Beta MOD Dossiê

## Campos de registro

Manter, quando aplicável:

| Campo | Definição |
|---|---|
| Assunto | Tema funcional ou orientação tratada |
| Entendimento vigente | Regra, contexto ou decisão atualmente válida |
| Fonte ou evidência | Conversa, documento, card, comentário, reunião, print, Figma, exemplo ou outra evidência recebida |
| Estado | Confirmada, Pendente, Divergente, Substituída ou Histórica |
| Destino | MODELAGEM, CONTEXTO — NÃO PUBLICAR ou FORA DO ESCOPO |
| Impacto | Comportamento, dado, cálculo, permissão, mensagem, processamento, resultado ou elaboração |
| Substitui | Entendimento anterior, quando houver |
| Áreas afetadas | Seções, fluxos, exemplos, telas, cálculos, permissões, auditoria ou artefatos impactados |
| Observação de publicação | Restrição necessária para impedir vazamento ou omissão |

Não transformar cada frase da conversa em uma linha. Registrar somente informação relevante para preservar entendimento, decisão, restrição, divergência ou rastreabilidade.

## Organização recomendada do arquivo

Usar uma estrutura legível e estável:

```markdown
# DOSSIÊ DE CONTEXTO DA MODELAGEM

## Assunto
[tema corrente]

## Entendimento consolidado
[tabela com os campos aplicáveis]

## Pendências vigentes
[itens pendentes ainda relevantes]

## Divergências vigentes
[conflitos não resolvidos]

## Histórico e substituições relevantes
[itens substituídos/históricos somente quando necessários para rastreabilidade]
```

Não forçar seções vazias. Manter a organização atual do arquivo existente quando ela já cumprir o contrato.

## Visão vigente

A visão vigente deve:

- considerar somente itens ainda efetivos;
- apontar substituição quando uma decisão posterior invalidar outra;
- manter divergência aberta até decisão;
- não misturar histórico com regra atual.

## Regras de substituição

Quando entendimento B substituir A:

- marcar A como `Substituída` quando for necessário preservar rastreabilidade;
- registrar B como vigente;
- indicar `Substitui: A`;
- retirar A de qualquer visão que represente comportamento atual;
- propagar os impactos de A para revisão.

## Divergências

Quando duas fontes permanecerem funcionalmente incompatíveis:

- manter ambas identificáveis;
- marcar o assunto como `Divergente`;
- registrar o impacto da decisão pendente;
- não escolher uma versão;
- não transformar o conflito em regra publicável confirmada.

## Contrato de saída para a orquestração

Responder internamente com esta ordem lógica:

```text
entendimento_vigente
alteracoes_da_entrada
modelagem
contexto_nao_publicar
fora_do_escopo
pendencias
divergencias
substituidas
impactos_a_propagar
alertas_de_publicacao
persistencia
```

O conteúdo pode ser textual; não exigir JSON.

A saída deve ser suficiente para que a orquestração consolide o assunto sem precisar reler o histórico bruto, mas não deve incorporar análise especializada pertencente a outros módulos.
