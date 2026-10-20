# Fontes e fidelidade

## Prioridade

Aplicar, nesta ordem, quando houver conflito:

1. decisão explícita mais recente confirmada pelo usuário;
2. arquivo que o usuário declarar como fonte atual;
3. regra oficial mais recente aplicável;
4. referência visual aprovada fornecida pelo usuário;
5. documentos anteriores;
6. contexto histórico.

O `DOSSIE_CONTEXTO_MODELAGEM.md` organiza o entendimento vigente, mas não cria autoridade independente sobre as fontes.

## Papel de cada fonte

### Dossiê e regras de negócio

Usar para comportamento funcional. Implementar apenas conteúdo vigente destinado a `MODELAGEM`.

### HTML/CSS

Usar como evidência visual e estrutural. Preservar o que estiver observável. Não inferir regra de negócio ausente.

### HAR

Usar apenas para entender evidências técnicas observáveis que ajudem a reproduzir estados e sequências já sustentados pelas regras. Nunca usar endpoints reais nem reproduzir segredos.

### Conversa com o usuário

Usar respostas do usuário para fechar lacunas e substituir entendimentos anteriores quando a decisão for explícita.

## Conflitos

Quando duas fontes sustentarem comportamentos incompatíveis e não houver decisão posterior do usuário:

- não escolher uma silenciosamente;
- apontar a divergência;
- explicar qual comportamento/tela fica bloqueado;
- solicitar decisão.

Diferenças apenas cosméticas de redação não constituem conflito quando o significado funcional for inequivocamente o mesmo.

## Regra de fidelidade

Tratar “igual ao sistema” como objetivo de fidelidade às evidências disponíveis, não como autorização para completar lacunas por imaginação.

Se uma parte não possuir evidência suficiente:

- reproduzir apenas o que for conhecido;
- solicitar a referência necessária quando isso impedir fidelidade;
- não declarar equivalência exata para a parte não verificada.
