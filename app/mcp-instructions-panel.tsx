"use client";

import { useState } from "react";

const mcpConfig = `{
  "serverUrl": "https://movidesk-mcp-server.matheusgregoviski.chatgpt.site/mcp",
  "oauth": {
    "authorizationServer": "https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site",
    "scope": "movidesk:read",
    "pkce": "S256"
  }
}`;

const items = [
  { label: "Endpoint MCP", value: "https://movidesk-mcp-server.matheusgregoviski.chatgpt.site/mcp" },
  { label: "OAuth discovery", value: "https://movidesk-oauth-proxy-pkce.matheusgregoviski.chatgpt.site/.well-known/oauth-authorization-server" },
  { label: "Client ID", value: "movidesk-mcp-app" },
  { label: "Scope", value: "movidesk:read" },
  { label: "PKCE", value: "S256 obrigatório" },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return <div className="copy-field"><label>{label}</label><div className="copy-row"><code>{value}</code><button type="button" onClick={copy}>{copied ? "Copiado" : "Copiar"}</button></div></div>;
}

export default function McpInstructionsPanel() {
  const [copiedConfig, setCopiedConfig] = useState(false);
  async function copyConfig() {
    await navigator.clipboard.writeText(mcpConfig);
    setCopiedConfig(true);
    window.setTimeout(() => setCopiedConfig(false), 1600);
  }
  return <div className="instructions-content">
    <section className="instruction-block"><div className="section-kicker">01 / ENDPOINT</div><h2>Conecte o servidor MCP</h2><p>Use o endpoint público abaixo ao adicionar um novo conector no ChatGPT. O caminho <strong>/mcp</strong> é obrigatório.</p><div className="copy-grid">{items.map((item) => <CopyField key={item.label} {...item} />)}</div></section>
    <section className="instruction-block"><div className="section-kicker">02 / AUTORIZAÇÃO</div><h2>OAuth protegido por PKCE</h2><p>O cliente MCP usa Authorization Code com <strong>PKCE S256 obrigatório</strong>. O ChatGPT deve iniciar a descoberta OAuth pelo servidor de autorização; não use as URLs da GPT Action nesta configuração.</p><div className="notice"><span>✓</span><div><strong>Cliente separado da GPT Action</strong><small>Este fluxo usa o Client ID movidesk-mcp-app e mantém a exigência de code_challenge S256.</small></div></div></section>
    <section className="instruction-block"><div className="section-kicker">03 / CONFIGURAÇÃO</div><div className="schema-heading"><div><h2>Bloco de referência</h2><p>Use este bloco como referência para validar a configuração do conector.</p></div><button className="schema-copy" type="button" onClick={copyConfig}>{copiedConfig ? "Configuração copiada" : "Copiar configuração"}</button></div><pre className="schema-box config-box"><code>{mcpConfig}</code></pre></section>
    <section className="instruction-block"><div className="section-kicker">04 / TESTE</div><h2>Teste rápido</h2><p>Depois de conectar e autorizar, peça ao ChatGPT:</p><div className="prompt-example">“Liste os recursos disponíveis no Movidesk.”</div><p className="hint">Se a autorização falhar sem PKCE, o comportamento está correto: o cliente MCP não deve funcionar sem code_challenge S256.</p></section>
  </div>;
}
