# Inspeção e consistência visual

## Inspeção

Antes de revisar ou alterar:

1. localizar o arquivo;
2. localizar a página;
3. identificar a view exata;
4. identificar views relacionadas;
5. analisar telas aprovadas que sirvam de referência;
6. identificar componentes e padrões recorrentes.

Registrar os nomes exatos das views relevantes.

## Comparação funcional

Verificar:

| Ponto | Pergunta |
|---|---|
| Regra | Existe comportamento confirmado sem representação visual? |
| Tela | Existe elemento visual sem sustentação funcional? |
| Mensagem | O texto diverge do entendimento vigente? |
| Campo | Há campo faltante ou excedente? |
| Ação | Existe ação sem representação ou sem regra confirmada? |
| Permissão | A interface reflete a regra já confirmada? |
| Erro | O estado necessário está representado? |
| Retorno | A navegação visual corresponde ao fluxo definido? |

Não resolver conflito funcional neste módulo.

## Padrões visuais

Comparar com referências aprovadas:

- identidade;
- tipografia;
- peso;
- cores;
- ícones;
- alturas;
- alinhamentos;
- espaçamentos;
- larguras;
- tabelas;
- paginação;
- truncamento;
- tooltips;
- modais;
- toasts;
- tags.

## Padrões recorrentes

Aplicar somente quando corroborados pelo sistema real ou pela modelagem vigente:

- texto longo em uma linha;
- reticências para truncamento;
- tooltip com conteúdo completo;
- evitar rolagem horizontal;
- não aumentar altura da linha;
- usar nomes exatos;
- não adicionar título ausente do padrão real;
- não criar menu paralelo;
- não criar componente desconectado do sistema.

Esses itens orientam consistência visual e não criam regra funcional por si mesmos.

## Estados

Revisar somente os estados aplicáveis:

- carregamento;
- vazio;
- erro;
- sucesso;
- bloqueado;
- desabilitado;
- obrigatório;
- sem permissão;
- processamento;
- falha parcial.

## Validação visual

Antes de concluir:

- gerar ou obter screenshot atual;
- conferir alinhamento;
- conferir ícones;
- conferir textos;
- conferir cores;
- conferir tags;
- conferir tooltips;
- conferir campos obrigatórios;
- conferir cortes;
- conferir sobreposições;
- confirmar que não houve alteração fora do escopo.

## Saída visual

Retornar:

- views;
- divergências;
- componentes reutilizáveis;
- estados ausentes;
- ajustes necessários;
- impactos funcionais identificados;
- status da validação visual.
