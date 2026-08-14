"use client";

import { useState } from "react";

const schema = `openapi: 3.1.0
info:
  title: Movidesk GPT Action
  version: 1.0.0
  description: Consulta somente leitura de tickets do Movidesk.
servers:
  - url: https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site
paths:
  /api/tickets:
    get:
      operationId: getTicket
      summary: Consultar um ticket
      description: Retorna um ticket do Movidesk pelo ID. Operação somente leitura.
      security:
        - MovideskOAuth:
            - movidesk:read
      parameters:
        - name: id
          in: query
          required: true
          description: ID numérico do ticket.
          schema:
            type: integer
            format: int64
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
        "404":
          description: Ticket não encontrado.
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
          authorizationUrl: https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site/oauth/authorize
          tokenUrl: https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site/oauth/token
          scopes:
            movidesk:read: Consultar tickets (somente leitura).`;

const items = [
  { label: "URL base", value: "https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site" },
  { label: "Authorization URL", value: "https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site/oauth/authorize" },
  { label: "Token URL", value: "https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site/oauth/token" },
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
    <section className="instruction-block"><div className="section-kicker">03 / OPENAPI SCHEMA</div><div className="schema-heading"><div><h2>Schema pronto para colar</h2><p>Copie o documento inteiro e cole no campo Schema da Action. A resposta de sucesso é uma lista de tickets.</p></div><button className="schema-copy" type="button" onClick={copySchema}>{copiedSchema ? "Schema copiado" : "Copiar schema"}</button></div><pre className="schema-box"><code>{schema}</code></pre></section>
    <section className="instruction-block"><div className="section-kicker">04 / TESTE</div><h2>Teste rápido</h2><p>Depois de salvar, autorize o acesso e peça ao GPT:</p><div className="prompt-example">“Consulte o ticket 12345 no Movidesk.”</div><p className="hint">A API aceita apenas <code>GET /api/tickets?id=...</code>. Criação, edição e exclusão de tickets não estão disponíveis.</p></section>
  </div>;
}
