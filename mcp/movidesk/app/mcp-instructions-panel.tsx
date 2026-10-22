"use client";

import { useState } from "react";

const mcpConfig = `{
  "serverUrl": "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/",
  "oauth": {
    "authorizationServer": "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site",
    "scope": "movidesk:read knowledge:read knowledge:write feedback:write offline_access",
    "pkce": "S256"
  }
}`;

const tools = [
  { name: "movidesk_get_ticket", title: "Consultar ticket", detail: "Consulta um ticket autorizado pelo identificador numérico.", input: "ticket_id numérico" },
  { name: "movidesk_get_ticket_timeline", title: "Obter linha do tempo", detail: "Ordena ações e interações, preserva metadados e identifica manifestações do cliente e respostas públicas da equipe.", input: "ticket_id ou protocol" },
  { name: "movidesk_summarize_ticket", title: "Resumir ticket", detail: "Separa fatos, ações, pendências, evidências e hipóteses sem inventar causas.", input: "ticket_id ou protocol" },
  { name: "movidesk_classify_ticket_issue", title: "Classificar problema", detail: "Classifica o problema com evidências e confiança sem substituir a categoria oficial.", input: "ticket_id ou protocol" },
  { name: "movidesk_search_tickets", title: "Pesquisar tickets", detail: "Pesquisa tickets com filtros, consulta por id e paginação.", input: "id, keyword, período, responsável, status, categoria, serviço, cliente e filtros OData" },
  { name: "movidesk_list_open_tickets", title: "Listar tickets abertos", detail: "Lista tickets não resolvidos em uma data e retorna results estruturado.", input: "created_date, filtro e paginação" },
  { name: "movidesk_search_ticket_content", title: "Pesquisar conteúdo", detail: "Pesquisa no assunto, descrição inicial e interações do ticket.", input: "keyword + escopo, paginação e case_sensitive" },
  { name: "movidesk_find_similar_tickets", title: "Encontrar semelhantes", detail: "Compara conteúdo e sinais estruturados com pontuação explicável.", input: "ticket_id ou keyword, filtros e paginação" },
  { name: "knowledge_list_sources", title: "Listar fontes da base", detail: "Lista as fontes de conhecimento compartilhadas disponíveis.", input: "sem parâmetros; requer knowledge:read" },
  { name: "knowledge_search", title: "Pesquisar na base de conhecimento", detail: "Pesquisa lexicalmente chamados e documentos já copiados para a base por sintomas, termos e contexto; não consulta as fontes originais ao vivo.", input: "query de 3 a 500 caracteres e até 10 resultados; requer knowledge:read" },
  { name: "knowledge_import_movidesk_ticket", title: "Adicionar chamado à base", detail: "Importa explicitamente um chamado para a base interna compartilhada e registra quem fez a inclusão.", input: "ticket_id; requer movidesk:read e knowledge:write" },
  { name: "beta_record_feedback", title: "Registrar feedback ou lacuna", detail: "Registra um sinal explícito ou uma limitação observada, sem transcript nem raciocínio interno; a captura pode estar desativada no ambiente.", input: "evento estruturado; requer feedback:write e aceite vigente dos termos" },
  { name: "movidesk_detect_recurrent_issues", title: "Detectar recorrências", detail: "Agrupa problemas com evidências por campo, tendência, status, urgência, clientes, concentração e qualidade da amostra.", input: "período, filtros, mínimo de ocorrências e paginação" },
  { name: "movidesk_search_people", title: "Pesquisar pessoas", detail: "Pesquisa pessoas autorizadas usando filtros e paginação.", input: "filtros compartilhados + active" },
  { name: "movidesk_list_services", title: "Listar serviços", detail: "Lista serviços autorizados usando filtros e paginação.", input: "filtros compartilhados + active" },
];

const sharedFilters = "id, filter, keyword, from_date, to_date, date_field, responsible_id, responsible_email, owner_team, status, base_status, urgency, category, service, client_id, include_past, select, expand, orderby, top e skip";

const items = [
  { label: "Endpoint MCP", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/mcp/" },
  { label: "OAuth discovery", value: "https://movidesk-oauth-proxy-pkce.thngrns.chatgpt.site/.well-known/oauth-authorization-server" },
  { label: "Client ID", value: "movidesk-mcp-app" },
  { label: "Escopos disponíveis", value: "movidesk:read knowledge:read knowledge:write feedback:write offline_access" },
  { label: "PKCE", value: "S256 obrigatório" },
];

function CopyField({ label, value }: { label: string; value: string }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
    window.setTimeout(() => setCopyStatus("idle"), 2400);
  }
  return <div className="copy-field"><label>{label}</label><div className="copy-row"><code title={value}>{value}</code><button type="button" aria-label={`Copiar ${label}`} onClick={copy}>{copyStatus === "copied" ? "Copiado" : copyStatus === "error" ? "Tente novamente" : "Copiar"}</button></div><span className="copy-status" role="status" aria-live="polite">{copyStatus === "error" ? "A cópia foi bloqueada. Selecione o valor para copiá-lo manualmente." : copyStatus === "copied" ? `${label} copiado.` : ""}</span></div>;
}

export default function McpInstructionsPanel() {
  const [configCopyStatus, setConfigCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copyConfig() {
    try {
      await navigator.clipboard.writeText(mcpConfig);
      setConfigCopyStatus("copied");
    } catch {
      setConfigCopyStatus("error");
    }
    window.setTimeout(() => setConfigCopyStatus("idle"), 2400);
  }
  return <div className="instructions-content mcp-instructions">
    <section className="instruction-block mcp-connection"><div className="section-kicker">CONECTOR MCP</div><h1>Conectar a Beta ao ChatGPT</h1><p>No ChatGPT, adicione um servidor MCP personalizado e informe o endpoint abaixo. Depois, escolha OAuth e conclua a autorização. O ChatGPT usa a descoberta do servidor para localizar as ferramentas disponíveis.</p><div className="copy-grid">{items.map((item) => <CopyField key={item.label} {...item} />)}</div><div className="notice"><span aria-hidden="true">✓</span><div><strong>Endpoint de conexão</strong><small>O endereço recomendado termina em <code>/mcp/</code>. O servidor também aceita a rota sem a barra final.</small></div></div></section>
    <section className="instruction-block"><div className="section-kicker">AUTORIZAÇÃO</div><h2>OAuth com PKCE S256</h2><p>Este conector usa Authorization Code com <strong>PKCE S256 obrigatório</strong>. O OAuth é separado do cliente GPT Action. O escopo concedido depende das permissões habilitadas para sua conta; <code>knowledge:write</code> é necessário apenas para importar chamados. <code>offline_access</code> permite renovar a sessão.</p></section>
    <section className="instruction-block"><div className="section-kicker">FERRAMENTAS</div><h2>O que a Beta pode fazer</h2><p>Consultas ao Movidesk são somente leitura. No Supabase, a Beta pode pesquisar a cópia indexada, importar chamados quando autorizado e registrar feedback quando essa permissão estiver habilitada. Nenhuma ferramenta altera o ticket original.</p><details className="mcp-tool-disclosure"><summary>Ver {tools.length} ferramentas e permissões</summary><div className="tool-list">{tools.map((tool) => <div className="tool-row" key={tool.name}><div><strong>{tool.title}</strong><code>{tool.name}</code><small>{tool.detail}</small></div><span>{tool.input}</span></div>)}</div></details><p className="hint">Filtros compartilhados de tickets: <code>{sharedFilters}</code>.</p></section>
    <section className="instruction-block"><div className="section-kicker">REFERÊNCIA TÉCNICA</div><div className="schema-heading"><div><h2>Parâmetros do conector</h2><p>Resumo informativo; não é um arquivo para importar no ChatGPT.</p></div><button className="schema-copy" type="button" aria-label="Copiar parâmetros do conector" onClick={copyConfig}>{configCopyStatus === "copied" ? "Copiado" : configCopyStatus === "error" ? "Tente novamente" : "Copiar"}</button></div><span className="copy-status mcp-config-copy-status" role="status" aria-live="polite">{configCopyStatus === "error" ? "A cópia foi bloqueada; tente novamente neste navegador." : configCopyStatus === "copied" ? "Parâmetros copiados." : ""}</span><details className="mcp-config-disclosure"><summary>Visualizar parâmetros</summary><pre className="schema-box config-box"><code>{mcpConfig}</code></pre></details></section>
    <section className="instruction-block"><div className="section-kicker">TESTE</div><h2>Confirme a conexão</h2><p>Depois de autorizar, aguarde a descoberta de ferramentas no ChatGPT e teste uma consulta somente leitura, por exemplo:</p><div className="prompt-example">“Consulte o ticket 12345 e resuma os fatos, as ações registradas e as pendências.”</div><p className="hint">Se as ferramentas não aparecerem, confira o resultado da descoberta OAuth, a autorização e o escopo exigido pela ferramenta.</p></section>
  </div>;
}
