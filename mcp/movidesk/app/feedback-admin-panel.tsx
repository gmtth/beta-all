"use client";

import { useCallback, useEffect, useState } from "react";

type Group = { group_id: string; cluster_id: string | null; category: string; label: string; summary: string; status: string; event_count: number; last_recorded_at: string };
type Profanity = { normalized_term: string; target: string; reason_category: string; actor_email: string | null; identified: boolean; event_count: number };
type Event = {
  event_id: string; event_type: string; category: string; signal_source: string; feedback_polarity: string | null;
  friction_level: number; frustration_evidence: string; actor_email: string | null;
  context: { goal_summary?: string; observed_outcome?: string; identified_gap?: string; evidence_refs?: string[] };
  declared_reason: string | null; reason_category: string | null; reason_inference: string | null;
  reason_confidence: number | null; review_status: string; recorded_at: string;
  profanity: Array<{ exact_term: string; target: string }>;
};
type Summary = {
  months: number;
  by_category: Array<{ category: string; count: number }>;
  by_friction_level: Array<{ level: number; count: number }>;
  by_signal_source: Array<{ source: string; count: number }>;
  by_analyst: Array<{ user_id: string; email: string; count: number }>;
  unidentified_count: number;
  profanity_occurrences: number;
};

const categoryLabels: Record<string, string> = {
  answer_quality: "Qualidade da resposta", missing_context: "Contexto insuficiente", knowledge_coverage: "Cobertura de conhecimento",
  tool_capability: "Capacidade da ferramenta", tool_execution_follow_through: "Execução da ferramenta", latency_experience: "Lentidão",
  connection_experience: "Conexão", result_relevance: "Relevância do resultado", other_review_required: "Outros (revisar)",
};
const sourceLabels: Record<string, string> = { explicit_user: "Feedback explícito", user_confirmed_inference: "Inferência confirmada pelo usuário", agent_self_report: "Autodiagnóstico da Beta", observed_task_outcome: "Resultado observado" };
const statusLabels: Record<string, string> = { new: "Pendente", suggested: "Sugerido pela IA", reviewed: "Em revisão", resolved: "Resolvido", dismissed: "Descartado", confirmed: "Confirmado", merged: "Agrupado" };
const formatDate = (value: string) => new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(response.status === 503 ? "Supabase indisponível ou ainda sem as RPCs necessárias." : "Não foi possível carregar os registros.");
  return (await response.json() as { data: T }).data;
}

export default function FeedbackAdminPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [profanity, setProfanity] = useState<Profanity[]>([]);
  const [events, setEvents] = useState<Record<string, Event[]>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(async (reset = true, startOffset = 0) => {
    setLoading(true); setError("");
    try {
      const nextOffset = reset ? 0 : startOffset;
      const [nextSummary, nextGroups, nextProfanity] = await Promise.all([
        getJson<Summary>("/api/admin/feedback?view=summary&months=1"),
        getJson<Group[]>(`/api/admin/feedback?view=groups&limit=25&offset=${nextOffset}`),
        getJson<Profanity[]>("/api/admin/feedback?view=profanity&months=1&limit=25&offset=0"),
      ]);
      setSummary(nextSummary);
      setGroups((current) => reset ? nextGroups : [...current, ...nextGroups]);
      setHasMore(nextGroups.length === 25);
      setOffset(nextOffset + nextGroups.length);
      setProfanity(nextProfanity);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao carregar o painel."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function toggleGroup(group: Group) {
    if (expanded === group.group_id) { setExpanded(null); return; }
    setExpanded(group.group_id);
    if (events[group.group_id]) return;
    try {
      const groupEvents = await getJson<Event[]>(`/api/admin/feedback?view=events&group_id=${group.group_id}&limit=25&offset=0`);
      setEvents((current) => ({ ...current, [group.group_id]: groupEvents }));
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível abrir os detalhes."); }
  }

  async function review(objectType: "event" | "cluster", objectId: string, action: "review" | "resolve" | "dismiss" | "confirm") {
    setBusy(objectId); setError("");
    try {
      const response = await fetch("/api/admin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ object_type: objectType, object_id: objectId, action }) });
      if (!response.ok) throw new Error("Não foi possível salvar a revisão.");
      setEvents({}); setExpanded(null); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao salvar a revisão."); }
    finally { setBusy(""); }
  }

  async function mutate(payload: Record<string, unknown>, message: string, key: string): Promise<boolean> {
    if (!window.confirm(message)) return false;
    setBusy(key); setError("");
    try {
      const response = await fetch("/api/admin/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Não foi possível aplicar a alteração.");
      setEvents({}); setExpanded(null); await load();
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Falha ao aplicar a alteração."); return false; }
    finally { setBusy(""); }
  }

  return <div className="admin-content feedback-admin">
    <div className="admin-hero"><span className="section-kicker">FRUSTRAÇÕES E AUTODIAGNÓSTICO</span><h1>Feedback da Beta.</h1><p className="lead">Investigue padrões, leia o contexto sanitizado e registre a revisão humana. As contagens são ocorrências observadas, não taxas de frustração.</p></div>
    <section className="admin-section">
      <div className="section-title"><div><span className="section-kicker">VISÃO GERAL</span><h2>Último mês</h2></div><button className="refresh-button" disabled={loading} onClick={() => void load()}>Atualizar</button></div>
      {error && <p className="form-message" role="alert">{error}</p>}
      {loading && !summary ? <p className="quiet-message">Carregando registros…</p> : summary ? <>
        <div className="metric-grid feedback-metrics">
          <div className="metric-card"><span>EVENTOS</span><strong>{summary.by_category.reduce((total, item) => total + Number(item.count), 0)}</strong></div>
          <div className="metric-card"><span>SEM IDENTIFICAÇÃO</span><strong>{summary.unidentified_count}</strong></div>
          <div className="metric-card"><span>TERMOS OFENSIVOS</span><strong>{summary.profanity_occurrences}</strong></div>
        </div>
        <div className="admin-data-grid feedback-summary-grid">
          <section className="data-card"><h3>Ocorrências por categoria</h3>{summary.by_category.length ? summary.by_category.map((row) => <div className="feedback-stat-row" key={row.category}><span>{categoryLabels[row.category] ?? row.category}</span><strong>{row.count}</strong></div>) : <p className="quiet-message">Nenhum evento neste período.</p>}</section>
          <section className="data-card"><h3>Nível de fricção observado</h3>{summary.by_friction_level.map((row) => <div className="feedback-stat-row" key={row.level}><span>Nível {row.level}</span><strong>{row.count}</strong></div>)}</section>
          <section className="data-card"><h3>Frustrações por analista</h3>{summary.by_analyst.length ? summary.by_analyst.map((row) => <div className="feedback-analyst-row" key={row.user_id}><span>{row.email}<small>{row.count} ocorrência(s) no período</small></span><button className="feedback-delete" disabled={busy === row.user_id} onClick={() => void mutate({ action: "delete_analyst_history", target_user_id: row.user_id }, `Apagar todo o histórico de feedback de ${row.email}? Serão removidos detalhes, contagens mensais identificadas, termos ofensivos e agrupamentos associados. Eventos de outras pessoas permanecem. Esta ação não pode ser desfeita.`, row.user_id)}>Apagar histórico</button></div>) : <p className="quiet-message">Nenhuma frustração identificada no período.</p>}</section>
          <section className="data-card"><h3>Origem do sinal</h3>{summary.by_signal_source.map((row) => <div className="feedback-stat-row" key={row.source}><span>{sourceLabels[row.source] ?? row.source}</span><strong>{row.count}</strong></div>)}</section>
        </div>
      </> : <p className="quiet-message">O resumo não está disponível.</p>}
    </section>

    <section className="admin-section">
      <div className="section-title"><div><span className="section-kicker">INVESTIGAÇÃO</span><h2>Grupos e eventos</h2></div></div>
      <p className="section-description">Abra um grupo para comparar casos e consultar objetivo, resultado, lacuna, motivo e evidências registrados.</p>
      <div className="feedback-groups">{groups.map((group) => <article className="feedback-group" key={group.group_id}>
        <button className="feedback-group-toggle" aria-expanded={expanded === group.group_id} onClick={() => void toggleGroup(group)}><span><strong>{group.label || categoryLabels[group.category] || group.category}</strong><small>{categoryLabels[group.category] ?? group.category} · {group.event_count} ocorrência(s) · {statusLabels[group.status] ?? group.status}</small></span><span>{formatDate(group.last_recorded_at)}　{expanded === group.group_id ? "−" : "+"}</span></button>
        {expanded === group.group_id && <div className="feedback-group-body">{group.summary && <p className="feedback-cluster-summary">{group.summary}</p>}{(events[group.group_id] ?? []).map((event) => <FeedbackEventCard key={event.event_id} event={event} busy={busy} onReview={(action) => void review("event", event.event_id, action)} onCorrect={(patch) => mutate({ object_type: "event", object_id: event.event_id, action: "correct", patch }, "Salvar a correção deste resumo? O texto substituído não será guardado.", event.event_id)} onDelete={() => void mutate({ object_type: "event", object_id: event.event_id, action: "delete" }, "Apagar este evento detalhado e seus termos ofensivos? A operação não pode ser desfeita.", event.event_id)} />)}{!events[group.group_id] && <p className="quiet-message">Carregando detalhes…</p>}{group.cluster_id && <div className="feedback-actions"><button disabled={busy === group.cluster_id} onClick={() => void review("cluster", group.cluster_id!, "confirm")}>Confirmar agrupamento</button><button disabled={busy === group.cluster_id} onClick={() => void review("cluster", group.cluster_id!, "dismiss")}>Desfazer agrupamento</button></div>}</div>}
      </article>)}{!groups.length && !loading && <p className="quiet-message">Nenhum evento registrado para exibir.</p>}</div>
      {hasMore && <button className="refresh-button feedback-more" disabled={loading} onClick={() => void load(false, offset)}>Carregar mais grupos</button>}
    </section>

    <section className="admin-section">
      <div className="section-title"><div><span className="section-kicker">LINGUAGEM OFENSIVA</span><h2>Termos identificados</h2></div></div>
      <p className="section-description">A lista inclui apenas expressões presentes literalmente no sinal recebido; o contexto fica nos detalhes do evento.</p>
      <div className="feedback-profanity">{profanity.map((item, index) => <div className="feedback-stat-row" key={`${item.normalized_term}-${item.actor_email}-${index}`}><span><strong>{item.normalized_term}</strong><small>{item.actor_email ?? "Analista não identificado"} · alvo: {item.target} · motivo: {item.reason_category}</small></span><strong>{item.event_count}</strong></div>)}{!profanity.length && <p className="quiet-message">Nenhum termo identificado neste período.</p>}</div>
    </section>
    <footer className="card-footer"><span>Dados contextuais do Supabase · acesso restrito a masters</span><a className="admin-link" href="/admin/users">Painel de controle ↗</a></footer>
  </div>;
}

function FeedbackEventCard({ event, busy, onReview, onCorrect, onDelete }: {
  event: Event;
  busy: string;
  onReview: (action: "review" | "resolve" | "dismiss") => void;
  onCorrect: (patch: Record<string, string>) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [goal, setGoal] = useState(event.context?.goal_summary ?? "");
  const [outcome, setOutcome] = useState(event.context?.observed_outcome ?? "");
  const [gap, setGap] = useState(event.context?.identified_gap ?? "");
  const [reason, setReason] = useState(event.declared_reason ?? "");
  return <div className="feedback-event">
    <div className="feedback-event-heading"><strong>{event.actor_email ?? "Analista não identificado"}</strong><span>{formatDate(event.recorded_at)} · fricção {event.friction_level}/3 · {statusLabels[event.review_status] ?? event.review_status}</span></div>
    {editing ? <div className="feedback-correction-form">
      <label>Objetivo<textarea maxLength={500} value={goal} onChange={(e) => setGoal(e.target.value)} /></label>
      <label>Resultado observado<textarea maxLength={500} value={outcome} onChange={(e) => setOutcome(e.target.value)} /></label>
      <label>Lacuna identificada<textarea maxLength={500} value={gap} onChange={(e) => setGap(e.target.value)} /></label>
      <label>Motivo declarado<textarea maxLength={600} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
      <div className="feedback-actions"><button disabled={busy === event.event_id} onClick={async () => { if (await onCorrect({ goal_summary: goal, observed_outcome: outcome, identified_gap: gap, declared_reason: reason })) setEditing(false); }}>Salvar correção</button><button onClick={() => setEditing(false)}>Cancelar</button></div>
    </div> : <dl className="feedback-context">{[["Objetivo", event.context?.goal_summary], ["Resultado observado", event.context?.observed_outcome], ["Lacuna identificada", event.context?.identified_gap], ["Evidência de frustração", event.frustration_evidence], ["Motivo declarado", event.declared_reason], ["Hipótese da Beta", event.reason_inference]].filter((item) => item[1]).map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}
    {event.profanity.length > 0 && <p className="feedback-terms"><strong>Termo(s) identificado(s):</strong> {event.profanity.map((term) => `“${term.exact_term}” (${term.target})`).join(" · ")}</p>}
    {event.context?.evidence_refs?.length ? <p className="feedback-refs">Referências: {event.context.evidence_refs.join(" · ")}</p> : null}
    {event.reason_confidence !== null && <p className="feedback-refs">Confiança da hipótese: {Math.round(event.reason_confidence * 100)}%</p>}
    <div className="feedback-actions">{!editing && <button disabled={busy === event.event_id} onClick={() => setEditing(true)}>Corrigir contexto</button>}{event.review_status === "new" && <button disabled={busy === event.event_id} onClick={() => onReview("review")}>Marcar em revisão</button>}{event.review_status !== "resolved" && <button disabled={busy === event.event_id} onClick={() => onReview("resolve")}>Resolver</button>}{event.review_status !== "dismissed" && <button disabled={busy === event.event_id} onClick={() => onReview("dismiss")}>Descartar</button>}<button className="feedback-delete" disabled={busy === event.event_id} onClick={onDelete}>Apagar evento</button></div>
  </div>;
}
