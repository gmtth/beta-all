# Operação com o conector Figma

## Princípio

Usar o conector como meio de inspeção ou edição visual. Não tratá-lo como autoridade de regra funcional superior às decisões vigentes.

## Inspeção

Quando houver somente URL de arquivo sem node específico:

- usar `Figma.get_metadata` sem `nodeId` para listar páginas, quando suportado;
- não inventar `nodeId`.

Quando houver node identificado:

- usar `Figma.get_metadata` para obter visão estrutural quando necessário;
- usar `Figma.get_screenshot` para validação visual;
- aumentar `maxDimension` somente quando a inspeção exigir detalhe fino.

Não considerar uma revisão visual concluída sem screenshot quando a solicitação envolver fidelidade ou consistência visual.

## URL e identificação

Extrair `fileKey` e `nodeId` da URL quando presentes.

Não passar `nodeId` vazio ou inventado.

Quando uma operação exigir node específico e a referência fornecida não permitir identificá-lo, solicitar ao usuário a URL da view/node correspondente.

## Escrita

Usar escrita somente quando o usuário solicitar explicitamente criar, alterar, corrigir ou sincronizar Figma.

Antes de chamar `Figma.use_figma`:

1. carregar a orientação `figma-use` disponibilizada pelo conector;
2. confirmar o arquivo e o escopo;
3. limitar a alteração às views/componentes necessários;
4. preservar o restante do arquivo;
5. executar a alteração;
6. gerar screenshot do resultado;
7. revisar visualmente antes de declarar conclusão.

Não alterar regra funcional para tornar o layout conveniente.

## Design-to-code

`Figma.get_design_context` pertence principalmente a fluxos de design-to-code e exige orientação específica do conector.

Não usar esse caminho nesta Skill por padrão.

Quando o usuário pedir implementação em código, devolver o ponto para a orquestração adequada em vez de misturar design visual com arquitetura/código.

## Segurança operacional

Não:

- editar arquivo por iniciativa própria;
- alterar tela fora do escopo;
- apagar componente não solicitado;
- criar design system paralelo;
- assumir que um componente visual define comportamento funcional;
- declarar fidelidade sem inspeção do resultado.
