import{d as e,f as t,m as n}from"../../index.js";var r=n(e(),1),i=t(),a=`openapi: 3.1.0
info:
  title: Movidesk GPT Action
  version: 1.0.0
  description: Consulta somente leitura de tickets do Movidesk.
servers:
  - url: https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site
paths:
  /api/tickets:
    get:
      operationId: searchTickets
      summary: Pesquisar tickets
      description: Pesquisa tickets do Movidesk por ID, período, texto, responsável e filtros operacionais. Operação somente leitura.
      security:
        - MovideskOAuth:
            - movidesk:read
      parameters:
        - name: id
          in: query
          required: false
          description: ID numérico do ticket. Use este parâmetro para uma consulta individual.
          schema:
            type: integer
            format: int64
        - name: keyword
          in: query
          required: false
          description: Palavra ou expressão no assunto ou categoria.
          schema: { type: string }
        - name: from_date
          in: query
          required: false
          description: Data inicial inclusiva no formato YYYY-MM-DD ou ISO 8601.
          schema: { type: string }
        - name: to_date
          in: query
          required: false
          description: Data final inclusiva no formato YYYY-MM-DD ou ISO 8601.
          schema: { type: string }
        - name: date_field
          in: query
          required: false
          description: Campo de data usado no período.
          schema: { type: string, enum: [createdDate, lastUpdate, resolvedIn, closedIn], default: createdDate }
        - name: responsible_id
          in: query
          required: false
          description: Código de referência do responsável.
          schema: { type: string }
        - name: responsible_email
          in: query
          required: false
          description: E-mail do responsável.
          schema: { type: string, format: email }
        - name: owner_team
          in: query
          required: false
          description: Equipe responsável.
          schema: { type: string }
        - name: status
          in: query
          required: false
          description: Status do ticket.
          schema: { type: string }
        - name: base_status
          in: query
          required: false
          description: Status-base do ticket, como New, InAttention, Resolved ou Closed.
          schema: { type: string }
        - name: urgency
          in: query
          required: false
          description: Urgência do ticket.
          schema: { type: string }
        - name: category
          in: query
          required: false
          description: Categoria do ticket.
          schema: { type: string }
        - name: service
          in: query
          required: false
          description: Serviço de primeiro nível.
          schema: { type: string }
        - name: client_id
          in: query
          required: false
          description: Código de referência do cliente relacionado.
          schema: { type: string }
        - name: include_past
          in: query
          required: false
          description: Inclui tickets com atualização anterior a 90 dias.
          schema: { type: boolean, default: false }
        - name: filter
          in: query
          required: false
          description: Expressão OData avançada para filtros específicos do Movidesk.
          schema: { type: string }
        - name: select
          in: query
          required: false
          description: Campos a retornar, separados por vírgula.
          schema: { type: string }
        - name: expand
          in: query
          required: false
          description: Coleções relacionadas a expandir, como owner,clients ou actions.
          schema: { type: string }
        - name: orderby
          in: query
          required: false
          description: Ordenação OData, por exemplo createdDate desc.
          schema: { type: string }
        - name: top
          in: query
          required: false
          description: Quantidade de resultados por página, de 1 a 100.
          schema: { type: integer, minimum: 1, maximum: 100, default: 25 }
        - name: skip
          in: query
          required: false
          description: Quantidade de resultados a ignorar para paginação.
          schema: { type: integer, minimum: 0, maximum: 10000, default: 0 }
      responses:
        "200":
          description: Ticket encontrado.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Ticket"
        "401":
          description: Token ausente ou inválido.
        "400":
          description: Filtros ou parâmetros inválidos.
        "404":
          description: Ticket não encontrado quando uma consulta por ID foi feita.
components:
  schemas:
    Ticket:
      type: object
      additionalProperties: true
      properties:
        id:
          type: integer
        subject:
          type: string
        status:
          type: string
        requester:
          type: string
        priority:
          type: string
        createdDate:
          type: string
        lastUpdate:
          type: string
  securitySchemes:
    MovideskOAuth:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/authorize
          tokenUrl: https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/token
          scopes:
            movidesk:read: Consultar tickets (somente leitura).`,o=[{label:`URL base`,value:`https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site`},{label:`Authorization URL`,value:`https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/authorize`},{label:`Token URL`,value:`https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/token`},{label:`Client ID`,value:`movidesk-gpt-action`},{label:`Scope`,value:`movidesk:read`}];function s({label:e,value:t}){let[n,a]=(0,r.useState)(!1);async function o(){await navigator.clipboard.writeText(t),a(!0),window.setTimeout(()=>a(!1),1600)}return(0,i.jsxs)(`div`,{className:`copy-field`,children:[(0,i.jsx)(`label`,{children:e}),(0,i.jsxs)(`div`,{className:`copy-row`,children:[(0,i.jsx)(`code`,{children:t}),(0,i.jsx)(`button`,{type:`button`,onClick:o,children:n?`Copiado`:`Copiar`})]})]})}function c(){let[e,t]=(0,r.useState)(!1);async function n(){await navigator.clipboard.writeText(a),t(!0),window.setTimeout(()=>t(!1),1600)}return(0,i.jsxs)(`div`,{className:`instructions-content`,children:[(0,i.jsxs)(`section`,{className:`instruction-block`,children:[(0,i.jsx)(`div`,{className:`section-kicker`,children:`01 / CREDENCIAIS`}),(0,i.jsx)(`h2`,{children:`Configure o GPT Action`}),(0,i.jsx)(`p`,{children:`Use estes valores na autenticação OAuth 2.0 da Action. O fluxo da Action funciona sem PKCE; não preencha um client secret, a menos que ele tenha sido configurado separadamente no servidor.`}),(0,i.jsx)(`div`,{className:`copy-grid`,children:o.map(e=>(0,i.jsx)(s,{...e},e.label))})]}),(0,i.jsxs)(`section`,{className:`instruction-block`,children:[(0,i.jsx)(`div`,{className:`section-kicker`,children:`02 / REDIRECT`}),(0,i.jsx)(`h2`,{children:`Callback gerado pelo GPT`}),(0,i.jsxs)(`p`,{children:[`Selecione `,(0,i.jsx)(`strong`,{children:`OAuth`}),` e o fluxo `,(0,i.jsx)(`strong`,{children:`Authorization Code`}),` no editor da Action. Deixe o ChatGPT gerar o redirect URI oficial; não invente nem reutilize o callback do MCP.`]}),(0,i.jsxs)(`div`,{className:`notice`,children:[(0,i.jsx)(`span`,{children:`✓`}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`strong`,{children:`Não copie um redirect URI fixo daqui.`}),(0,i.jsx)(`small`,{children:`O endereço oficial contém o identificador da sua Action e é fornecido pelo próprio ChatGPT durante a configuração.`})]})]})]}),(0,i.jsxs)(`section`,{className:`instruction-block`,children:[(0,i.jsx)(`div`,{className:`section-kicker`,children:`03 / OPENAPI SCHEMA`}),(0,i.jsxs)(`div`,{className:`schema-heading`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`h2`,{children:`Schema pronto para colar`}),(0,i.jsx)(`p`,{children:`Copie o documento inteiro e cole no campo Schema da Action. A resposta de sucesso é uma lista de tickets.`})]}),(0,i.jsx)(`button`,{className:`schema-copy`,type:`button`,onClick:n,children:e?`Schema copiado`:`Copiar schema`})]}),(0,i.jsx)(`pre`,{className:`schema-box`,children:(0,i.jsx)(`code`,{children:a})})]}),(0,i.jsxs)(`section`,{className:`instruction-block`,children:[(0,i.jsx)(`div`,{className:`section-kicker`,children:`04 / TESTE`}),(0,i.jsx)(`h2`,{children:`Pesquisas que já funcionam`}),(0,i.jsx)(`p`,{children:`Depois de salvar e autorizar, peça ao GPT coisas como:`}),(0,i.jsx)(`div`,{className:`prompt-example`,children:`“Liste os tickets abertos desde 2026-08-01, do responsável maria@empresa.com, contendo a palavra VPN, 50 por página.”`}),(0,i.jsxs)(`p`,{className:`hint`,children:[`A API continua somente leitura: aceita apenas `,(0,i.jsx)(`code`,{children:`GET /api/tickets`}),` e nunca cria, edita ou exclui tickets.`]})]})]})}export{c as default};