# Classificação e formato de saída

## Classificação

### Bloqueio
Usar quando a modelagem não permite desenvolvimento seguro sem decisão adicional.

### Contradição
Usar quando duas partes vigentes exigem comportamentos incompatíveis.

### Ambiguidade relevante
Usar quando o texto permite mais de um comportamento plausível e isso altera o resultado funcional.

### Risco
Usar quando a modelagem é executável, mas pode causar perda, duplicidade, exposição, regressão, alteração do registro errado, mistura entre empresas ou inconsistência histórica.

### Melhoria recomendada
Usar para clareza adicional que reduz dúvida, sem bloquear implementação. Manter lista curta.

## Estrutura de cada achado

| Campo | Conteúdo |
|---|---|
| Assunto | Trecho ou regra afetada |
| Problema | O que está inconsistente ou ausente |
| Impacto | Consequência funcional |
| Classificação | Uma das cinco categorias |
| Decisão necessária | Somente quando realmente necessária |
| Roteamento | Skill temática a reconsultar, quando aplicável |

## Formato final

Mostrar somente seções com conteúdo:

### Bloqueios
### Contradições
### Ambiguidades relevantes
### Riscos
### Melhorias recomendadas
### Conclusão

A conclusão deverá usar exatamente uma das opções:

- suficiente para desenvolvimento;
- suficiente com ressalvas;
- dependente de decisões.

## Regras de concisão

- Não listar variações do mesmo problema como achados separados.
- Não reescrever o documento inteiro.
- Não repetir problema já classificado em outra seção.
- Não transformar todo item pendente em bloqueio.
- Não sugerir solução técnica quando o problema é funcional.
