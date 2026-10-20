---
name: beta-mod-permissoes
description: Analisar permissões e segurança funcional na família Beta MOD. Usar em modelagens com autenticação, autorização, papéis, senha, biometria, RFID, dados sensíveis, ações administrativas, alteração por terceiro, acesso entre empresas ou necessidade de diferenciar interface e backend. Retornar riscos e regras confirmadas sem inventar papéis, permissões ou arquitetura.
---

# Beta MOD Permissões

## Responsabilidade

Analisar autenticação, autorização, papéis, permissões e proteção funcional de dados.

Tratar esta Skill como módulo de permissões e segurança funcional. Não atuar como fonte independente de regra de negócio e não produzir uma Modelagem Funcional final concorrente com a `@beta-mod`.

Preservar somente conhecimento próprio de autorização, proteção de dados e isolamento entre empresas. Não incorporar persistência do Dossiê, prioridade de fontes, fluxo frontend genérico, Figma, cálculos, processamento especializado, QA final ou composição documental.

Ler [references/permissoes-e-autorizacao.md](references/permissoes-e-autorizacao.md) para matriz de ações, papéis, interface, backend e atores.

Ler [references/dados-sensiveis-e-isolamento.md](references/dados-sensiveis-e-isolamento.md) quando houver credenciais, biometria, exposição indireta ou isolamento entre empresas.

## Entrada esperada

Receber da `@beta-mod`, ou diretamente do usuário:

- ações funcionais;
- papéis e permissões já confirmados;
- ator logado, autenticado, autorizador e afetado;
- canais envolvidos;
- dados sensíveis presentes;
- empresa ou tenant aplicável;
- regras de bloqueio;
- mensagens confirmadas;
- requisitos de auditoria;
- pendências e divergências já identificadas.

Não criar papel, permissão, política, credencial, regra de expiração ou comportamento de acesso para preencher lacuna.

## Procedimento

### 1. Mapear ações e permissões

Estruturar somente as ações aplicáveis:

| Ação | Quem pode | Interface | Backend | Sem permissão |
|---|---|---|---|---|

Considerar, quando confirmado:

- visualizar;
- pesquisar;
- criar;
- editar;
- excluir;
- restaurar;
- aprovar;
- autorizar;
- reprocessar;
- alterar parâmetros;
- consultar histórico.

Usar nomes reais de papéis e permissões.

Quando o nome real não estiver disponível, devolver a lacuna sem inventar rótulo.

### 2. Diferenciar interface e backend

Não tratar ocultação visual como autorização completa.

Definir, quando aplicável:

- botão oculto;
- campo bloqueado;
- menu não exibido;
- ação direta bloqueada;
- mensagem de acesso negado.

Distinguir claramente:

- o que o usuário não visualiza;
- o que o usuário visualiza, mas não pode executar;
- o que o backend deverá rejeitar mesmo que a ação seja chamada diretamente.

Não prescrever framework, middleware, endpoint ou mecanismo técnico.

### 3. Diferenciar atores

Separar quando aplicável:

- usuário logado;
- usuário autenticado;
- usuário autorizador;
- líder;
- funcionário afetado;
- empresa;
- registro alterado.

Confirmar qual identidade é usada para:

- autenticar;
- autorizar;
- executar;
- alterar;
- auditar.

A autorização não deverá, por si só, alterar o dado do autorizador quando o registro afetado for de outra pessoa.

### 4. Verificar dados sensíveis

Identificar, conforme o caso:

- credencial;
- senha;
- token;
- biometria;
- RFID;
- dado recuperável;
- mensagem reveladora;
- log;
- tooltip;
- histórico.

Não expor nem registrar conteúdo sensível sem regra explícita que o autorize.

Não sugerir criptografia, hashing, armazenamento, rotação ou arquitetura como requisito funcional sem solicitação e fonte apropriada.

### 5. Verificar exposição indireta

Quando a existência de determinada informação não puder ser revelada, analisar:

- retorno neutro;
- diferenças de mensagem;
- diferenças de botão;
- diferenças de estado;
- comportamento que permita inferência;
- registro de auditoria sem exposição do conteúdo.

Não inventar texto literal de mensagem.

### 6. Verificar isolamento entre empresas

Definir, quando aplicável:

- empresa utilizada na operação;
- pessoa elegível;
- registros visíveis;
- ações permitidas;
- processamento relacionado;
- auditoria;
- integração.

Nenhuma operação deverá misturar empresas quando o isolamento fizer parte da regra vigente.

Não inventar modelo de tenancy ou estrutura de banco.

### 7. Verificar segurança do fluxo

Confirmar, quando aplicável:

- validação antes da ação;
- autorização válida;
- expiração de sessão, quando houver regra confirmada;
- clique repetido;
- tentativa duplicada;
- persistência somente após conclusão;
- preservação do estado anterior em falha;
- risco de alteração do registro errado.

Quando clique repetido, duplicidade ou persistência dependerem de processamento especializado, devolver o ponto à `@beta-mod` para composição com `@beta-mod-processamento`.

### 8. Verificar auditoria de segurança

Quando aplicável, confirmar se a rastreabilidade identifica:

- quem iniciou;
- quem autorizou;
- quem foi afetado;
- empresa;
- ação;
- momento;
- resultado;
- falha;
- estado anterior;
- estado final.

Não registrar senha, token, biometria ou outro segredo como evidência de auditoria.

### 9. Identificar lacunas relevantes

Sinalizar somente quando a ausência puder alterar:

- quem visualiza;
- quem executa;
- quem autoriza;
- qual registro é afetado;
- qual empresa é usada;
- qual dado é exposto;
- qual mensagem é exibida;
- qual ação é bloqueada;
- qual resultado é persistido;
- qual informação é auditada.

Não criar pendência por preferência técnica sem impacto funcional.

## Saída para a Beta MOD

Retornar somente os itens aplicáveis:

1. matriz de permissões;
2. diferenças entre interface e backend;
3. atores;
4. riscos de alteração do registro errado;
5. dados sensíveis;
6. exposição indireta;
7. isolamento entre empresas;
8. auditoria de segurança;
9. lacunas e recomendações.

Manter a saída analítica e modular. Não consolidar regra ausente.

## Fronteiras com outros módulos

Devolver à `@beta-mod` para composição quando necessário:

- completude geral da regra → `@beta-mod-regras`;
- telas e navegação → `@beta-mod-fluxos`;
- consistência visual → `@beta-mod-figma`;
- processamento, retry ou concorrência → `@beta-mod-processamento`;
- fontes e versões → `@beta-mod-fontes`;
- artefatos → `@beta-mod-artefatos`.

Essas referências servem apenas para delimitar responsabilidade. Não incorporar o conhecimento interno dos outros módulos.

## Limites de isolamento

Não:

- atualizar ou persistir `DOSSIE_CONTEXTO_MODELAGEM.md`;
- decidir prioridade entre fontes;
- inventar papel;
- inventar permissão;
- assumir que ocultar botão é suficiente;
- registrar segredo;
- inventar mensagem;
- definir criptografia, hashing ou arquitetura sem solicitação;
- criar política de sessão sem fonte;
- definir modelo técnico de tenant;
- criar fluxo frontend completo;
- detalhar processamento especializado;
- executar QA final da modelagem;
- definir voz, estilo ou estrutura de artefatos;
- produzir plano completo de testes;
- produzir a Modelagem Funcional completa isoladamente.
