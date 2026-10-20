"use client";

import { useState } from "react";

const schema = `openapi: 3.1.0
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
  /api/ticket-content:
    get:
      operationId: searchTicketContent
      summary: Pesquisar conteúdo dos tickets
      description: Pesquisa uma palavra ou expressão no assunto, descrição inicial e interações dos tickets. Exige keyword e ao menos um filtro de escopo.
      security:
        - MovideskOAuth:
            - movidesk:read
      parameters:
        - name: keyword
          in: query
          required: true
          description: Palavra ou expressão a localizar no conteúdo textual do ticket.
          schema: { type: string, minLength: 1, maxLength: 200 }
        - name: from_date
          in: query
          required: false
          description: Data inicial inclusiva no formato YYYY-MM-DD ou DD/MM/AAAA.
          schema: { type: string }
        - name: to_date
          in: query
          required: false
          description: Data final inclusiva no formato YYYY-MM-DD ou DD/MM/AAAA.
          schema: { type: string }
        - name: date_field
          in: query
          required: false
          description: Campo de data usado no período.
          schema: { type: string, enum: [createdDate, lastUpdate, resolvedIn, closedIn], default: createdDate }
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
          description: Status-base do ticket.
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
          description: Código do cliente.
          schema: { type: string }
        - name: responsible_id
          in: query
          required: false
          description: Código do responsável.
          schema: { type: string }
        - name: responsible_email
          in: query
          required: false
          description: E-mail do responsável.
          schema: { type: string, format: email }
        - name: filter
          in: query
          required: false
          description: Expressão OData avançada.
          schema: { type: string }
        - name: case_sensitive
          in: query
          required: false
          description: Diferencia maiúsculas e minúsculas; falso por padrão.
          schema: { type: boolean, default: false }
        - name: top
          in: query
          required: false
          description: Quantidade de candidatos por página, de 1 a 20.
          schema: { type: integer, minimum: 1, maximum: 20, default: 20 }
        - name: skip
          in: query
          required: false
          description: Quantidade de candidatos a ignorar.
          schema: { type: integer, minimum: 0, maximum: 10000, default: 0 }
      responses:
        "200":
          description: Resultados encontrados no conteúdo dos tickets.
          content:
            application/json:
              schema:
                type: object
                required: [keyword, results, total]
                properties:
                  keyword: { type: string }
                  results:
                    type: array
                    items:
                      type: object
                      additionalProperties: true
                  total: { type: integer }
        "400":
          description: Keyword, escopo ou parâmetros inválidos.
        "401":
          description: Token ausente ou inválido.
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
            movidesk:read: Consultar tickets (somente leitura).`;

const items = [
  { label: "URL base", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site" },
  { label: "Authorization URL", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/authorize" },
  { label: "Token URL", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/oauth/token" },
  { label: "Client ID", value: "movidesk-gpt-action" },
  { label: "Scope", value: "movidesk:read" },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <div className="copy-field">
    <label>{label}</label>
    <div className="copy-row"><code>{value}</code><button type="button" onClick={copy}>{copied ? "Copiado" : "Copiar"}</button></div>
  </div>;
}

export default function ActionInstructionsPanel() {
  const [copiedSchema, setCopiedSchema] = useState(false);
  async function copySchema() {
    await navigator.clipboard.writeText(schema);
    setCopiedSchema(true);
    window.setTimeout(() => setCopiedSchema(false), 1600);
  }
  return <div className="instructions-content">
    <section className="instruction-block"><div className="section-kicker">01 / CREDENCIAIS</div><h2>Configure o GPT Action</h2><p>Use estes valores na autenticação OAuth 2.0 da Action. O fluxo da Action funciona sem PKCE; não preencha um client secret, a menos que ele tenha sido configurado separadamente no servidor.</p><div className="copy-grid">{items.map((item) => <CopyField key={item.label} {...item} />)}</div></section>
    <section className="instruction-block"><div className="section-kicker">02 / REDIRECT</div><h2>Callback gerado pelo GPT</h2><p>Selecione <strong>OAuth</strong> e o fluxo <strong>Authorization Code</strong> no editor da Action. Deixe o ChatGPT gerar o redirect URI oficial; não invente nem reutilize o callback do MCP.</p><div className="notice"><span>✓</span><div><strong>Não copie um redirect URI fixo daqui.</strong><small>O endereço oficial contém o identificador da sua Action e é fornecido pelo próprio ChatGPT durante a configuração.</small></div></div></section>
    <section className="instruction-block"><div className="section-kicker">03 / OPENAPI SCHEMA</div><div className="schema-heading"><div><h2>Schema pronto para colar</h2><p>Copie o documento inteiro e cole no campo Schema da Action. O schema inclui pesquisa resumida e pesquisa no conteúdo dos tickets.</p></div><button className="schema-copy" type="button" onClick={copySchema}>{copiedSchema ? "Schema copiado" : "Copiar schema"}</button></div><pre className="schema-box"><code>{schema}</code></pre></section>
    <section className="instruction-block"><div className="section-kicker">04 / TESTE</div><h2>Pesquisas que já funcionam</h2><p>Depois de salvar e autorizar, peça ao GPT coisas como:</p><div className="prompt-example">“Pesquise Vetorial no conteúdo dos tickets criados entre 2026-08-01 e 2026-08-16.”</div><p className="hint">A API continua somente leitura: aceita apenas operações GET e nunca cria, edita ou exclui tickets.</p></section>
  </div>;
}
