"use client";

import { useCallback, useEffect, useState } from "react";

type User = { email: string; role: string; active: number; created_at: number; scopes: string[]; activeTokenCount: number; latestTokenExpiry: number | null };
type ConnectionDiagnostic = "configuration_missing" | "invalid_url" | "available" | "invalid_credentials" | "schema_unavailable" | "rate_limited" | "api_error" | "request_rejected" | "timeout" | "network_error";
type KnowledgeDiagnostic = "available" | "configuration_missing" | "rpc_not_found" | "permission_denied" | "rate_limited" | "service_error" | "request_rejected" | "timeout" | "network_error" | "invalid_response";
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

export default function UserAdminPanel() {
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [userResponse, overviewResponse] = await Promise.all([fetch("/api/admin/users", { cache: "no-store" }), fetch("/api/admin/overview", { cache: "no-store" })]);
    if (userResponse.ok) setUsers(await userResponse.json());
    if (overviewResponse.ok) setOverview(await overviewResponse.json());
    setLoading(false);
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Não foi possível cadastrar."); return; }
    setEmail(""); setMessage("Acesso liberado. A pessoa deverá autorizar as permissões no ChatGPT."); await load();
  }

  async function remove(target: User) {
    if (!window.confirm(`Remover o acesso de ${target.email}?`)) return;
    setBusy(target.email); setMessage("");
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: target.email }) });
    const data = await response.json(); setBusy("");
    if (!response.ok) { setMessage(data.error ?? "Não foi possível remover."); return; }
    setMessage("Acesso removido."); await load();
  }

  const knowledge = overview?.knowledge.data;
  return <div className="admin-content">
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

    <section className="admin-section" aria-labelledby="team-title">
      <div className="section-title"><div><span className="panel-heading">PERMISSÕES</span><h2 id="team-title">Equipe Beta</h2></div></div>
      <p className="section-description">O acesso é validado pelo servidor. Cada pessoa precisa autorizar sua própria conta; os escopos abaixo vêm dos tokens ativos.</p>
      <form onSubmit={submit} className="user-form"><div className="input-wrap"><span>+</span><input aria-label="E-mail do suporte" type="email" placeholder="analista@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div><button type="submit">Liberar acesso</button></form>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <div className="user-list"><div className="table-heading"><div><strong>Contas autorizadas</strong><span>{users.length} {users.length === 1 ? "pessoa" : "pessoas"}</span></div><span className="table-label">PAPEL / ESCOPOS / AÇÃO</span></div><div className="user-table">{users.map((item) => <div className="user-row" key={item.email}><span className="table-avatar">{item.email.slice(0, 1).toUpperCase()}</span><div className="user-info"><strong>{item.email}</strong><span>{item.role === "master" ? "Administrador master" : "Analista"} · {item.activeTokenCount} token(s) ativo(s) · expira {dateTime(item.latestTokenExpiry)}</span><span className="scope-list">{item.scopes.length ? item.scopes.join(" · ") : "Sem autorização ativa"}</span></div><span className={`role-badge ${item.role === "master" ? "role-master" : "role-support"}`}>{item.role === "master" ? "MASTER" : "ANALISTA"}</span><button className="remove-button" type="button" onClick={() => void remove(item)} disabled={busy === item.email} aria-label={`Remover ${item.email}`}>{busy === item.email ? "…" : "Remover"}</button></div>)}{users.length === 0 ? <div className="empty-state">Nenhuma pessoa autorizada.</div> : null}</div></div>
    </section>
  </div>;
}
