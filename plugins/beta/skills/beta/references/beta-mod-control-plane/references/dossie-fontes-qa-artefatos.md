# Dossiê, fontes, QA e Artefatos

## Fontes antes do Dossiê

Quando existir conflito potencial de evidências:

1. usar `@beta-mod-fontes`;
2. determinar autoridade e vigência;
3. classificar complementaridade, substituição ou divergência;
4. somente então atualizar o Dossiê.

`@beta-mod-dossie` registra o resultado; não faz desempate autônomo entre fontes concorrentes.

## Estados e destinos

Estados válidos:
- Confirmada;
- Pendente;
- Divergente;
- Substituída;
- Histórica.

Destinos válidos:
- MODELAGEM;
- CONTEXTO — NÃO PUBLICAR;
- FORA DO ESCOPO.

Estado e destino são dimensões independentes.

Uma pendência pode pertencer à MODELAGEM ou apenas ao contexto, conforme seu papel na entrega.

## Atualização do Dossiê

Nova informação relevante deve:
- ser comparada com o entendimento vigente;
- substituir somente o que foi realmente substituído;
- manter divergência quando não houver decisão;
- atualizar impactos;
- persistir no mesmo `DOSSIE_CONTEXTO_MODELAGEM.md`.

Nunca reconstruir Dossiê por memória quando o arquivo vigente estiver disponível.

## QA iterativo

QA não é relatório decorativo.

Quando um achado material puder ser resolvido:
- identificar a Skill temática;
- reconsultar;
- consolidar;
- persistir;
- filtrar;
- rodar QA novamente.

Se o problema depender de decisão do usuário, manter Pendente ou Divergente e perguntar apenas quando o impacto funcional exigir.

## Artefatos

Artefatos recebe conteúdo funcional já consolidado.

Não enviar histórico bruto para Artefatos decidir vigência.

Ordem normal:
1. consolidar;
2. atualizar Dossiê;
3. aplicar filtro;
4. executar QA;
5. acionar Artefatos;
6. validar fidelidade da materialização;
7. entregar Dossiê separado quando a entrega final exigir.

Exceção:
chamada direta de `@beta-mod-artefatos` com conteúdo explicitamente final/aprovado para mera materialização.

## Falhas de dependência

Quando uma Skill ou fonte obrigatória não estiver disponível:
- registrar a limitação;
- não simular execução;
- avaliar se a resposta ainda é segura;
- manter estado Pendente/Divergente quando necessário;
- informar ao usuário se a limitação afetar a entrega.
