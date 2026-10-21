"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_ACCESS_TOKEN_LIFETIME_MS, MAX_ACCESS_TOKEN_LIFETIME_MS, MIN_ACCESS_TOKEN_LIFETIME_MS } from "./oauth/token-lifetime";

type User = { email: string; role: string; active: number; created_at: number; scopes: string[]; activeTokenCount: number; latestTokenExpiry: number | null };
type ConnectionDiagnostic = "configuration_missing" | "invalid_url" | "available" | "invalid_credentials" | "schema_unavailable" | "rate_limited" | "api_error" | "request_rejected" | "timeout" | "network_error";
type KnowledgeDiagnostic = "available" | "configuration_missing" | "rpc_not_found" | "permission_denied" | "rate_limited" | "service_error" | "request_rejected" | "timeout" | "network_error" | "invalid_response";
type ToolMetrics = {
  window: { start: string; end: string; days: number };
  totalCalls: number;
  usageByTool: Array<{ toolName: string; calls: number; errors: number }>;
  recentErrors: Array<{ toolName: string; errorCode: string; occurredAt: string }>;
  errorsByDay: Array<{ date: string; count: number }>;
};
type Overview = {
  connection: { status: "online" | "offline"; configured: boolean; latencyMs: number | null; diagnostic: ConnectionDiagnostic };
  knowledge: { status: "available" | "unavailable"; diagnostic: KnowledgeDiagnostic; data: null | { sources: Array<{ id: string | null; code: string | null; name: string | null; active: boolean; recordCount: number; chunkCount: number }>; recordCount: number; chunkCount: number; recentImports: Array<{ ticketId: string | null; title: string | null; actorEmail: string | null; chunkCount: number; createdAt: string | null }> } };
};

const dateTime = (value: number | string | null) => value === null ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(typeof value === "number" ? new Date(value) : new Date(value));
const connectionDiagnostics: Record<ConnectionDiagnostic, string> = {
  configuration_missing: "Configuração do servidor ausente",
  invalid_url: "URL do Supabase inválida",
  available: "Data API do schema Beta acessível",
  invalid_credentials: "Credencial do servidor recusada",
  schema_unavailable: "Schema beta ou tabela sem acesso",
  rate_limited: "Supabase limitou as consultas",
  api_error: "Erro no serviço Supabase",
  request_rejected: "Consulta recusada pela Data API",
  timeout: "Tempo limite da Data API excedido",
  network_error: "Não foi possível alcançar a Data API",
};
const knowledgeDiagnostics: Record<KnowledgeDiagnostic, string> = {
  available: "RPC de métricas acessível",
  configuration_missing: "Faltam variáveis de conexão no servidor",
  rpc_not_found: "RPC ausente; aplique a migration 20261020150000",
  permission_denied: "Sem permissão para executar a RPC; revise o grant de service_role",
  rate_limited: "Supabase limitou a consulta das métricas",
  service_error: "Erro temporário no serviço Supabase",
  request_rejected: "Consulta da RPC recusada pelo Supabase",
  timeout: "Tempo limite da RPC excedido",
  network_error: "Não foi possível alcançar a RPC do Supabase",
  invalid_response: "Resposta inesperada da RPC de métricas",
};
const toolTitles: Record<string, string> = {
  movidesk_get_ticket: "Consultar chamado",
  movidesk_get_ticket_timeline: "Linha do tempo do chamado",
  movidesk_summarize_ticket: "Resumir chamado",
  movidesk_classify_ticket_issue: "Classificar problema",
  movidesk_search_tickets: "Pesquisar chamados",
  movidesk_list_open_tickets: "Listar chamados abertos",
  movidesk_search_ticket_content: "Pesquisar conteúdo",
  movidesk_find_similar_tickets: "Encontrar similares",
  movidesk_detect_recurrent_issues: "Detectar recorrências",
  movidesk_search_people: "Pesquisar pessoas",
  movidesk_list_services: "Listar serviços",
  knowledge_list_sources: "Listar fontes de conhecimento",
  knowledge_import_movidesk_ticket: "Importar chamado para a base",
};
const errorTitles: Record<string, string> = {
  tool_error: "A ferramenta retornou uma falha",
  authorization: "Autorização ausente ou insuficiente",
  validation: "Entrada inválida",
  timeout: "Tempo limite excedido",
  upstream_4xx: "Serviço externo recusou a solicitação",
  upstream_5xx: "Serviço externo indisponível",
  handler_exception: "Falha durante a execução",
};
const toolTitle = (name: string) => toolTitles[name] ?? name;
const shortDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(new Date(`${value}T12:00:00Z`));

export default function UserAdminPanel() {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [toolMetricsResponse, setToolMetricsResponse] = useState<{ status: "available" | "unavailable"; data: ToolMetrics | null } | null>(null);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const [tokenLifetimeDraft, setTokenLifetimeDraft] = useState(String(DEFAULT_ACCESS_TOKEN_LIFETIME_MS));
  const [savingTokenLifetime, setSavingTokenLifetime] = useState(false);
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);

  const notify = useCallback((message: string, tone: "success" | "error") => setToast({ message, tone }), []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), toast.tone === "error" ? 6500 : 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([fetch("/api/admin/users", { cache: "no-store" }), fetch("/api/admin/overview", { cache: "no-store" }), fetch("/api/admin/tool-metrics", { cache: "no-store" }), fetch("/api/admin/token-lifetime", { cache: "no-store" })]);
      const [userResult, overviewResult, metricsResult, tokenLifetimeResult] = results;
      if (userResult.status === "fulfilled" && userResult.value.ok) setUsers(await userResult.value.json());
      if (overviewResult.status === "fulfilled" && overviewResult.value.ok) setOverview(await overviewResult.value.json());
      if (metricsResult.status === "fulfilled" && metricsResult.value.ok) setToolMetricsResponse(await metricsResult.value.json());
      else setToolMetricsResponse({ status: "unavailable", data: null });
      if (tokenLifetimeResult.status === "fulfilled" && tokenLifetimeResult.value.ok) {
        const settings = await tokenLifetimeResult.value.json() as { accessTokenLifetimeMs?: number };
        if (Number.isSafeInteger(settings.accessTokenLifetimeMs)) setTokenLifetimeDraft(String(settings.accessTokenLifetimeMs));
      } else {
        notify("Não foi possível carregar a configuração de expiração.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [notify]);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setToast(null);
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) { notify(data.error ?? "Não foi possível cadastrar.", "error"); return; }
      setEmail(""); notify("Acesso liberado. A pessoa deverá autorizar as permissões no ChatGPT.", "success"); await load();
    } catch {
      notify("Não foi possível cadastrar. Tente novamente.", "error");
    }
  }

  async function remove(target: User) {
    if (!window.confirm(`Remover o acesso de ${target.email}?`)) return;
    setBusy(target.email); setToast(null);
    try {
      const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: target.email }) });
      const data = await response.json();
      if (!response.ok) { notify(data.error ?? "Não foi possível remover.", "error"); return; }
      notify("Acesso removido.", "success"); await load();
    } catch {
      notify("Não foi possível remover. Tente novamente.", "error");
    } finally {
      setBusy("");
    }
  }

  async function logout(target: User) {
    if (!window.confirm(`Deslogar ${target.email}? Todos os access tokens, refresh tokens e autorizações pendentes serão invalidados. A conta continuará autorizada e precisará conectar novamente.`)) return;
    setBusy(target.email); setToast(null);
    try {
      const response = await fetch("/api/admin/users/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: target.email }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) { notify(data.error ?? "Não foi possível deslogar a conta.", "error"); return; }
      notify(`Sessões de ${target.email} encerradas. A conta deverá se autenticar novamente.`, "success");
      await load();
    } catch {
      notify("Não foi possível deslogar a conta. Tente novamente.", "error");
    } finally {
      setBusy("");
    }
  }

  async function saveTokenLifetime(event: React.FormEvent) {
    event.preventDefault(); setToast(null);
    const accessTokenLifetimeMs = Number(tokenLifetimeDraft);
    if (!Number.isSafeInteger(accessTokenLifetimeMs) || accessTokenLifetimeMs < MIN_ACCESS_TOKEN_LIFETIME_MS || accessTokenLifetimeMs > MAX_ACCESS_TOKEN_LIFETIME_MS) {
      notify(`Informe um inteiro entre ${MIN_ACCESS_TOKEN_LIFETIME_MS} e ${MAX_ACCESS_TOKEN_LIFETIME_MS} ms.`, "error");
      return;
    }
    setSavingTokenLifetime(true);
    try {
      const response = await fetch("/api/admin/token-lifetime", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accessTokenLifetimeMs }) });
      const data = await response.json() as { accessTokenLifetimeMs?: number; error?: string };
      if (!response.ok) { notify(data.error ?? "Não foi possível salvar a expiração.", "error"); return; }
      setTokenLifetimeDraft(String(data.accessTokenLifetimeMs ?? accessTokenLifetimeMs));
      notify("Validade salva. Será aplicada aos próximos access tokens emitidos.", "success");
    } catch {
      notify("Não foi possível salvar a configuração. Tente novamente.", "error");
    } finally {
      setSavingTokenLifetime(false);
    }
  }

  const knowledge = overview?.knowledge.data;
  const toolMetrics = toolMetricsResponse?.data;
  const maxToolCalls = Math.max(1, ...(toolMetrics?.usageByTool.map((item) => item.calls) ?? []));
  const maxDailyErrors = Math.max(1, ...(toolMetrics?.errorsByDay.map((item) => item.count) ?? []));
  return <div className="admin-content">
    {toast ? <div className={`toast toast-${toast.tone}`} role={toast.tone === "error" ? "alert" : "status"} aria-atomic="true">
      <span className="toast-icon" aria-hidden="true">{toast.tone === "success" ? "✓" : "!"}</span>
      <p className="toast-message">{toast.message}</p>
      <button className="toast-dismiss" type="button" onClick={() => setToast(null)} aria-label="Fechar aviso">×</button>
    </div> : null}
    <section className="admin-section" aria-labelledby="connection-title">
      <div className="section-title"><div><span className="panel-heading">CONEXÃO E CONHECIMENTO</span><h2 id="connection-title">Supabase</h2></div><button className="refresh-button" type="button" onClick={() => void load()} disabled={loading}>{loading ? "Atualizando…" : "Atualizar painel"}</button></div>
      <div className="connection-card">
        <span className={`connection-indicator ${overview?.connection.status === "online" ? "is-online" : "is-offline"}`} />
        <div className="connection-copy"><strong>{!overview ? "Verificando conexão" : overview.connection.status === "online" ? "Conexão disponível" : "Conexão indisponível"}</strong><span>{overview ? connectionDiagnostics[overview.connection.diagnostic] : "Consultando Data API do schema Beta"}</span></div>
        <span className="connection-latency">{overview?.connection.latencyMs === null || !overview ? "—" : `${overview.connection.latencyMs} ms`}</span>
      </div>
      {overview ? <div className="diagnostic-row"><span>Diagnóstico dos indicadores</span><strong className={overview.knowledge.status === "available" ? "diagnostic-ok" : "diagnostic-attention"}>{knowledgeDiagnostics[overview.knowledge.diagnostic]}</strong></div> : null}
      {knowledge ? <>
        <div className="metric-grid"><div className="metric-card"><span>FONTES ATIVAS</span><strong>{knowledge.sources.filter((source) => source.active).length}</strong></div><div className="metric-card"><span>REGISTROS INDEXADOS</span><strong>{knowledge.recordCount.toLocaleString("pt-BR")}</strong></div><div className="metric-card"><span>TRECHOS INDEXADOS</span><strong>{knowledge.chunkCount.toLocaleString("pt-BR")}</strong></div></div>
        <div className="admin-data-grid">
          <section className="data-card"><h3>Fontes cadastradas</h3>{knowledge.sources.length ? knowledge.sources.map((source) => <div className="source-row" key={source.id ?? source.code}><div><strong>{source.name ?? source.code ?? "Fonte"}</strong><span>{source.active ? "Ativa" : "Inativa"}</span></div><span>{source.recordCount} registros · {source.chunkCount} trechos</span></div>) : <p className="quiet-message">Nenhuma fonte cadastrada.</p>}</section>
          <section className="data-card"><h3>Importações recentes</h3>{knowledge.recentImports.length ? knowledge.recentImports.map((item, index) => <div className="source-row import-row" key={`${item.ticketId}-${item.createdAt}-${index}`}><div><strong>{item.title ?? `Chamado ${item.ticketId ?? ""}`}</strong><span>Movidesk {item.ticketId ? `· ${item.ticketId}` : ""} · {item.chunkCount} trechos · por {item.actorEmail ?? "analista"}</span></div><span>{dateTime(item.createdAt)}</span></div>) : <p className="quiet-message">Nenhuma importação registrada.</p>}</section>
        </div>
      </> : <p className="quiet-message">{overview?.knowledge.status === "unavailable" ? "Os indicadores ainda não estão disponíveis. Consulte o diagnóstico acima para identificar o próximo passo." : "Carregando indicadores do conhecimento…"}</p>}
    </section>

    <section className="admin-section" aria-labelledby="telemetry-title">
      <div className="section-title"><div><span className="panel-heading">ATIVIDADE DO MCP</span><h2 id="telemetry-title">Uso e erros</h2></div></div>
      <p className="section-description">Métricas das chamadas processadas pelo MCP neste Site, armazenadas no banco D1 do Sites.</p>
      {toolMetricsResponse?.status === "unavailable" ? <p className="quiet-message">As métricas do MCP estão indisponíveis no momento.</p> : !toolMetrics ? <p className="quiet-message">Carregando métricas do MCP…</p> : <div className="admin-data-grid telemetry-grid">
        <section className="data-card telemetry-card" aria-labelledby="tool-usage-title">
          <div className="telemetry-heading"><div><h3 id="tool-usage-title">Uso por ferramenta</h3><span>Chamadas nos últimos 30 dias</span></div><strong>{toolMetrics.totalCalls.toLocaleString("pt-BR")}</strong></div>
          {toolMetrics.usageByTool.length ? <div className="usage-chart" role="img" aria-label="Chamadas às ferramentas da Beta nos últimos 30 dias">
            {toolMetrics.usageByTool.map((item) => <div className="usage-bar-row" key={item.toolName} title={`${toolTitle(item.toolName)}: ${item.calls} chamadas, ${item.errors} erros`}>
              <span className="usage-tool-name">{toolTitle(item.toolName)}</span><span className="usage-bar-track"><span className="usage-bar-fill" style={{ width: `${Math.max(2, item.calls / maxToolCalls * 100)}%` }} /></span><strong>{item.calls.toLocaleString("pt-BR")}</strong><small>{item.errors} erros</small>
            </div>)}
          </div> : <p className="quiet-message">Ainda não há chamadas registradas neste período.</p>}
        </section>
        <section className="data-card telemetry-card" aria-labelledby="error-trend-title">
          <div className="telemetry-heading"><div><h3 id="error-trend-title">Erros no último mês</h3><span>Ocorrências por dia</span></div><strong>{toolMetrics.errorsByDay.reduce((sum, day) => sum + day.count, 0)}</strong></div>
          <div className="error-chart" role="img" aria-label="Gráfico diário de erros nos últimos 30 dias">
            {toolMetrics.errorsByDay.map((day) => <div className="error-chart-column" key={day.date} title={`${shortDate(day.date)}: ${day.count} ${day.count === 1 ? "erro" : "erros"}`}><span className="error-chart-bar" style={{ height: `${day.count ? Math.max(4, day.count / maxDailyErrors * 100) : 2}%` }} /><span className="sr-only">{shortDate(day.date)}: {day.count} erros</span></div>)}
          </div>
          <div className="chart-axis-labels"><span>{toolMetrics.errorsByDay[0] ? shortDate(toolMetrics.errorsByDay[0].date) : ""}</span><span>Hoje</span></div>
        </section>
        <section className="data-card telemetry-card recent-errors-card" aria-labelledby="recent-errors-title">
          <div className="telemetry-heading"><div><h3 id="recent-errors-title">Dez erros mais recentes</h3><span>Retenção de até 90 dias</span></div></div>
          {toolMetrics.recentErrors.length ? <div className="recent-error-list">{toolMetrics.recentErrors.map((item, index) => <div className="recent-error-row" key={`${item.occurredAt}-${item.toolName}-${index}`}><div><strong>{toolTitle(item.toolName)}</strong><span>{errorTitles[item.errorCode] ?? "Falha na ferramenta"}</span></div><time dateTime={item.occurredAt}>{dateTime(item.occurredAt)}</time></div>)}</div> : <p className="quiet-message">Nenhum erro registrado.</p>}
        </section>
      </div>}
    </section>

    <section className="admin-section" aria-labelledby="token-lifetime-title">
      <div className="section-title"><div><span className="panel-heading">SEGURANÇA DA SESSÃO</span><h2 id="token-lifetime-title">Expiração do access token</h2></div></div>
      <p className="section-description">Define a validade em milissegundos para access tokens novos e renovados. Tokens já emitidos mantêm a expiração atual; refresh tokens continuam com validade própria de até 90 dias.</p>
      <form onSubmit={saveTokenLifetime} className="user-form">
        <div className="input-wrap"><input aria-label="Validade do access token em milissegundos" type="number" min={MIN_ACCESS_TOKEN_LIFETIME_MS} max={MAX_ACCESS_TOKEN_LIFETIME_MS} step="1" value={tokenLifetimeDraft} onChange={(event) => setTokenLifetimeDraft(event.target.value)} required /><span aria-hidden="true">ms</span></div>
        <button type="submit" disabled={savingTokenLifetime}>{savingTokenLifetime ? "Salvando…" : "Salvar validade"}</button>
      </form>
      <p className="quiet-message">Limite permitido: {MIN_ACCESS_TOKEN_LIFETIME_MS.toLocaleString("pt-BR")} a {MAX_ACCESS_TOKEN_LIFETIME_MS.toLocaleString("pt-BR")} ms. O padrão é {DEFAULT_ACCESS_TOKEN_LIFETIME_MS.toLocaleString("pt-BR")} ms.</p>
    </section>

    <section className="admin-section" aria-labelledby="team-title">
      <div className="section-title"><div><span className="panel-heading">PERMISSÕES</span><h2 id="team-title">Equipe Beta</h2></div></div>
      <p className="section-description">O acesso é validado pelo servidor. Cada pessoa precisa autorizar sua própria conta; os escopos abaixo vêm dos tokens ativos.</p>
      <form onSubmit={submit} className="user-form"><div className="input-wrap"><span>+</span><input aria-label="E-mail do suporte" type="email" placeholder="analista@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button type="submit">Liberar acesso</button></form>
      <div className="user-list"><div className="table-heading"><div><strong>Contas autorizadas</strong><span>{users.length} {users.length === 1 ? "pessoa" : "pessoas"}</span></div><span className="table-label">PAPEL / ESCOPOS / AÇÃO</span></div><div className="user-table">{users.map((item) => <div className="user-row" key={item.email}><span className="table-avatar">{item.email.slice(0, 1).toUpperCase()}</span><div className="user-info"><strong>{item.email}</strong><span>{item.role === "master" ? "Administrador master" : "Analista"} · {item.activeTokenCount} token(s) ativo(s) · expira {dateTime(item.latestTokenExpiry)}</span><span className="scope-list">{item.scopes.length ? item.scopes.join(" · ") : "Sem autorização ativa"}</span></div><span className={`role-badge ${item.role === "master" ? "role-master" : "role-support"}`}>{item.role === "master" ? "MASTER" : "ANALISTA"}</span><div className="user-actions"><button className="logout-button" type="button" onClick={() => void logout(item)} disabled={busy === item.email} aria-label={`Deslogar ${item.email}`}>{busy === item.email ? "…" : "Deslogar"}</button><button className="remove-button" type="button" onClick={() => void remove(item)} disabled={busy === item.email} aria-label={`Remover ${item.email}`}>{busy === item.email ? "…" : "Remover"}</button></div></div>)}{users.length === 0 ? <div className="empty-state">Nenhuma pessoa autorizada.</div> : null}</div></div>
    </section>
  </div>;
}
