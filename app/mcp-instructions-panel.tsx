"use client";

import { useState } from "react";

const mcpConfig = `{
  "serverUrl": "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/",
  "oauth": {
    "authorizationServer": "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site",
    "scope": "movidesk:read",
    "pkce": "S256"
  }
}`;

const tools = [
  { name: "movidesk_get_ticket", title: "Consultar ticket", detail: "Consulta um ticket autorizado pelo identificador numérico.", input: "ticket_id" },
  { name: "movidesk_get_ticket_timeline", title: "Obter linha do tempo", detail: "Ordena ações e interações do ticket e identifica manifestações do cliente e respostas da equipe.", input: "ticket_id" },
  { name: "movidesk_summarize_ticket", title: "Resumir ticket", detail: "Separa fatos, ações, pendências, evidências e hipóteses sem inventar causas.", input: "ticket_id ou protocol" },
  { name: "movidesk_classify_ticket_issue", title: "Classificar problema", detail: "Classifica o problema com evidências e confiança sem substituir a categoria oficial.", input: "ticket_id ou protocol" },
  { name: "movidesk_search_tickets", title: "Pesquisar tickets", detail: "Pesquisa tickets com filtros, consulta por id e paginação.", input: "id, keyword, período, responsável, status, categoria, serviço, cliente e filtros OData" },
  { name: "movidesk_list_open_tickets", title: "Listar tickets abertos", detail: "Lista tickets não resolvidos em uma data e retorna results estruturado.", input: "created_date, filtro e paginação" },
  { name: "movidesk_search_ticket_content", title: "Pesquisar conteúdo", detail: "Pesquisa no assunto, descrição inicial e interações do ticket.", input: "keyword + escopo, paginação e case_sensitive" },
  { name: "movidesk_search_people", title: "Pesquisar pessoas", detail: "Pesquisa pessoas autorizadas usando filtros e paginação.", input: "filtros compartilhados + active" },
  { name: "movidesk_list_services", title: "Listar serviços", detail: "Lista serviços autorizados usando filtros e paginação.", input: "filtros compartilhados + active" },
];

const sharedFilters = "id, filter, keyword, from_date, to_date, date_field, responsible_id, responsible_email, owner_team, status, base_status, urgency, category, service, client_id, include_past, select, expand, orderby, top e skip";

const items = [
  { label: "Endpoint MCP (barra final obrigatória)", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/" },
  { label: "OAuth discovery", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/.well-known/oauth-authorization-server" },
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
    <section className="instruction-block"><div className="section-kicker">01 / ENDPOINT</div><h2>Conecte o servidor MCP</h2><p>Use o endpoint público abaixo ao adicionar um novo conector no ChatGPT. O caminho correto é <strong>POST /mcp/</strong>, com a barra final obrigatória.</p><div className="notice"><span>!</span><div><strong>Não remova a barra final</strong><small>Cadastre exatamente a URL terminada em <code>/mcp/</code>. Sem a barra final, o conector pode não descobrir as ferramentas disponíveis.</small></div></div><div className="copy-grid">{items.map((item) => <CopyField key={item.label} {...item} />)}</div></section>
    <section className="instruction-block"><div className="section-kicker">02 / AUTORIZAÇÃO</div><h2>OAuth protegido por PKCE</h2><p>O cliente MCP usa Authorization Code com <strong>PKCE S256 obrigatório</strong>. O ChatGPT deve iniciar a descoberta OAuth pelo servidor de autorização; não use as URLs da GPT Action nesta configuração.</p><div className="notice"><span>✓</span><div><strong>Cliente separado da GPT Action</strong><small>Este fluxo usa o Client ID movidesk-mcp-app e mantém a exigência de code_challenge S256.</small></div></div></section>
    <section className="instruction-block"><div className="section-kicker">03 / FERRAMENTAS</div><h2>Ferramentas disponíveis</h2><p>O servidor publica schemas JSON diretamente no MCP. Todas as operações são somente leitura e retornam conteúdo estruturado para o modelo.</p><div className="tool-list">{tools.map((tool) => <div className="tool-row" key={tool.name}><div><strong>{tool.title}</strong><code>{tool.name}</code><small>{tool.detail}</small></div><span>{tool.input}</span></div>)}</div><p className="hint">A busca de tickets aceita os filtros: <code>{sharedFilters}</code>.</p></section>
    <section className="instruction-block"><div className="section-kicker">04 / CONFIGURAÇÃO</div><div className="schema-heading"><div><h2>Bloco de referência</h2><p>Use este bloco como referência para validar a configuração do conector.</p></div><button className="schema-copy" type="button" onClick={copyConfig}>{copiedConfig ? "Configuração copiada" : "Copiar configuração"}</button></div><pre className="schema-box config-box"><code>{mcpConfig}</code></pre></section>
    <section className="instruction-block"><div className="section-kicker">05 / TESTE</div><h2>Teste rápido</h2><p>Depois de conectar e autorizar, peça ao ChatGPT:</p><div className="prompt-example">“Consulte o ticket 12345 e liste tickets abertos desde 2026-08-01 contendo VPN.”</div><p className="hint">Se a autorização falhar sem PKCE, o comportamento está correto: o cliente MCP não deve funcionar sem code_challenge S256.</p></section>
  </div>;
}
