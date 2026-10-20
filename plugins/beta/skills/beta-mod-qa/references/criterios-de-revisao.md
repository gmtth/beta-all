# Critérios de revisão funcional

## Princípio

Revisar somente o que possa alterar implementação, comportamento, integridade de dados, segurança funcional ou homologação.

Não transformar revisão crítica em caça a detalhes editoriais.

## Coesão

Verificar:

- conceito com nomes conflitantes;
- regra vigente coexistindo com regra substituída;
- tabela divergente do texto;
- exemplo incompatível;
- mensagem incompatível;
- representação visual funcionalmente divergente.

## Gatilhos e resultados

Verificar:

| Ponto | Pergunta |
|---|---|
| Ação | Existe resultado definido? |
| Mensagem | Existe gatilho? |
| Confirmar | Existe consequência? |
| Cancelar | Existe consequência? |
| Fechar | Existe regra? |
| Falha | Existe tratamento? |
| Continuidade | A operação original continua ou bloqueia? |

## Valores e ausência

Verificar quando relevante:

- vazio;
- zero;
- nulo;
- N/A;
- divisão por zero;
- ausência de histórico;
- ausência de valor;
- ausência de turno;
- ausência de registro.

## Dados

Verificar:

- registro afetado;
- pessoa afetada;
- produto;
- vínculo;
- empresa;
- origem;
- efeito retroativo;
- duplicidade;
- histórico.

## Processamento

Verificar:

- falha parcial;
- sucessos preservados;
- retry;
- concorrência;
- evento novo durante processamento;
- sucesso antes da persistência;
- nova tentativa sem duplicidade.

## Permissões e segurança

Verificar:

- interface;
- backend;
- papéis reais;
- dado sensível;
- autorizador;
- isolamento entre empresas.

## Rastreabilidade

Verificar:

- motivo;
- responsável;
- afetado;
- origem;
- canal;
- data;
- estado anterior;
- estado final;
- salvar sem alteração.

## Interface

Verificar:

- regra essencial somente no print;
- botão sem comportamento;
- tooltip com impacto funcional;
- retorno;
- filtros;
- paginação;
- rolagem;
- obrigatoriedade;
- estados de erro.

## Relatórios

Verificar:

- granularidade;
- duplicidade;
- período;
- fórmula;
- unidade;
- arredondamento;
- zero;
- N/A;
- exemplo;
- exportação;
- situação.

## Vigência e publicação

Antes de apontar defeito:

- considerar somente regra vigente;
- ignorar conteúdo CONTEXTO — NÃO PUBLICAR;
- ignorar regra substituída;
- não usar histórico como regra atual;
- não exigir publicação de pendência interna sem necessidade;
- não preencher omissão por invenção.

## Critério de materialidade

Registrar achado somente quando puder:

- permitir duas implementações funcionais diferentes;
- causar falha funcional;
- causar perda, duplicidade ou exposição;
- dificultar homologação real;
- contradizer decisão vigente.

Diferença cosmética, preferência editorial ou possibilidade remota não deverá ser listada.
