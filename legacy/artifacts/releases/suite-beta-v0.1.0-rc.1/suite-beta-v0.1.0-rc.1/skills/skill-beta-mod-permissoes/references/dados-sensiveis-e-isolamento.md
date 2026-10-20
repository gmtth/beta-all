# Dados sensíveis e isolamento

## Dados sensíveis

Verificar, quando aplicável:

- credenciais;
- senhas;
- tokens;
- biometria;
- RFID;
- dados recuperáveis;
- mensagens reveladoras;
- logs;
- tooltips;
- histórico.

Não registrar conteúdo sensível.

Não transformar proteção técnica em regra funcional sem fonte.

## Exposição indireta

Quando a simples existência de um dado não puder ser revelada, verificar se há inferência por:

- mensagem diferente;
- botão diferente;
- estado diferente;
- tooltip;
- histórico;
- retorno de erro;
- opção de ação;
- comportamento temporal observável, quando funcionalmente relevante.

Preferir retorno neutro somente quando essa regra estiver confirmada.

Não inventar mensagem literal.

## Isolamento entre empresas

Verificar:

| Ponto | Definição necessária |
|---|---|
| Empresa | Empresa usada na operação |
| Pessoa | Quem é elegível dentro da empresa |
| Registros | Quais registros podem ser vistos ou alterados |
| Ações | Quais ações são permitidas |
| Processamento | Se o processamento relacionado respeita o isolamento |
| Auditoria | Qual empresa deverá ser registrada |
| Integração | Qual contexto empresarial é utilizado |

Nenhuma operação poderá misturar empresas quando o isolamento fizer parte da regra vigente.

Não prescrever tenant ID, schema, banco ou mecanismo técnico.

## Segurança do fluxo

Verificar, conforme aplicável:

- validação anterior à ação;
- autorização válida;
- expiração de sessão confirmada;
- clique repetido;
- tentativa duplicada;
- persistência somente após conclusão;
- preservação do estado anterior;
- risco de alterar o registro errado.

## Auditoria

Quando aplicável, registrar funcionalmente:

- iniciador;
- autorizador;
- afetado;
- empresa;
- ação;
- momento;
- resultado;
- falha;
- estado anterior;
- estado final.

Nunca usar senha, token, biometria ou segredo como conteúdo de auditoria.
