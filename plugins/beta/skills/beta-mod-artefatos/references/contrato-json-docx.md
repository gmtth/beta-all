# Contrato JSON do gerador DOCX

## Uso

Executar:

```bash
python scripts/build_modelagem_docx.py entrada.json saida.docx
```

O JSON contém somente conteúdo já consolidado. O script formata; não interpreta regra.

## Estrutura mínima

```json
{
  "metadata": {
    "solicitante": "Nome",
    "sistema": "CenciHUB",
    "data": "DD/MM/AAAA",
    "tipo_dev": "Melhoria",
    "titulo": "Título da modelagem",
    "breve_descritivo": "Resumo funcional"
  },
  "layout": {
    "archetype": "general",
    "show_document_label": true,
    "document_label": "MODELAGEM"
  },
  "content": []
}
```

`archetype` aceita:

- `general`;
- `processing`;
- `frontend`;
- `report`;
- `simple`.


## Blocos

### Heading

```json
{"type":"heading","level":1,"text":"REGRAS COMUNS"}
```

Nível 1: seção principal.

Nível 2: subtítulo.

Nível 3: subtítulo numerado ou auxiliar, visualmente discreto.

Não usar nível para inventar hierarquia funcional.

### Paragraph

```json
{"type":"paragraph","text":"O sistema deverá..."}
```

Com segmentos:

```json
{
  "type":"paragraph",
  "segments":[
    {"text":"Campo: ","bold":true},
    {"text":"valor confirmado"}
  ]
}
```

Segmentos aceitam `bold`, `italic` e `color` apenas quando a informação exigir.

### Bullets

```json
{"type":"bullets","items":["Regra A.","Regra B."]}
```

### Numbered

```json
{"type":"numbered","items":["Primeiro comportamento.","Segundo comportamento."]}
```

### Table

```json
{
  "type":"table",
  "headers":["Campo","Formato","Informação"],
  "rows":[
    ["Campo A","Texto","Descrição"]
  ],
  "widths":[0.23,0.24,0.53],
  "align":["left","left","left"]
}
```

`widths` deverá somar aproximadamente `1.0`.

Alinhamentos aceitos: `left`, `center`, `right`.

### Equation

```json
{"type":"equation","text":"Indicador = Numerador / Denominador"}
```

O gerador não avalia a fórmula.

### Message

```json
{"type":"message","text":"Mensagem literal confirmada."}
```

### View reference

```json
{"type":"view_reference","label":"Arquivo","name":"Login"}
```

ou:

```json
{"type":"view_reference","label":"Referência de imagem","name":"VIEW_EXATA"}
```

### Image

```json
{
  "type":"image",
  "path":"./imagem.png",
  "width_cm":12.5,
  "align":"left",
  "alt":"Descrição objetiva"
}
```

`path` relativo é resolvido a partir do JSON.

Quando `width_cm` for omitido, o gerador limita a imagem à largura útil.

### Page break

```json
{"type":"page_break"}
```

Usar somente quando houver necessidade real.

## Metadata opcional

Se o artefato não for uma Modelagem Funcional com cabeçalho, omitir `metadata` e usar `layout.include_metadata=false`.

Não criar valores de metadados ausentes.

## Exemplo neutro

```json
{
  "metadata":{
    "solicitante":"Pessoa",
    "sistema":"CenciHUB",
    "data":"01/01/2030",
    "tipo_dev":"Melhoria",
    "titulo":"Exemplo",
    "breve_descritivo":"Demonstrar a composição documental."
  },
  "layout":{
    "archetype":"general",
    "show_document_label":true
  },
  "content":[
    {"type":"heading","level":1,"text":"CENÁRIO ATUAL E OBJETIVO"},
    {"type":"paragraph","text":"O sistema deverá apresentar o comportamento consolidado para o cenário descrito."},
    {"type":"heading","level":2,"text":"Regras aplicáveis"},
    {"type":"bullets","items":["A primeira regra deverá permanecer verificável.","A segunda regra não deverá alterar a primeira."]},
    {
      "type":"table",
      "headers":["Campo","Regra"],
      "rows":[["Exemplo","Descrição consolidada."]],
      "widths":[0.32,0.68]
    }
  ]
}
```
