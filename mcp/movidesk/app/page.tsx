import { requireChatGPTUser } from "./chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "./oauth/_lib";
import { getIntegrationStatuses } from "./integration-status";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await requireChatGPTUser("/");
  await ensureSchema();
  const [role, integrations] = await Promise.all([getUserRole(user.email), getIntegrationStatuses()]);
  const accessLabel = role === "master" ? "Administrador" : role === "support" ? "Suporte autorizado" : "Acesso não autorizado";
  const hasAccess = role === "master" || role === "support";
  const accessClass = hasAccess ? "status status-ok" : "status status-blocked";
  return <main className="shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <section className="card" aria-labelledby="page-title">
      <header className="brandbar"><div className="integration-statuses" aria-label="Status das integrações"><span className={`integration-status integration-${integrations.movidesk}`}><span className="integration-dot" aria-hidden="true" /><span>Movidesk API</span><strong>{integrations.movidesk === "online" ? "ONLINE" : "OFFLINE"}</strong></span><span className={`integration-status integration-${integrations.supabase}`}><span className="integration-dot" aria-hidden="true" /><span>Supabase API</span><strong>{integrations.supabase === "online" ? "ONLINE" : "OFFLINE"}</strong></span></div></header>
      <div className="hero home-hero"><h1 id="page-title">Suas integrações.<br /><em>Em um só MCP.</em></h1><p className="lead">A Beta ajuda a equipe a analisar chamados e diagnosticar ocorrências, consultando o Movidesk e a base de conhecimento. O acesso é individual e respeita as permissões da sua conta.</p></div>
      <div className="access-panel"><div className="panel-heading"><span>Acesso da conta</span><span className={accessClass} aria-label={hasAccess ? "Acesso autorizado" : "Acesso não autorizado"}>{hasAccess ? "AUTORIZADO" : "SEM ACESSO"}</span></div><div className="account"><span className="avatar">{user.email.slice(0, 1).toUpperCase()}</span><div><strong>{user.email}</strong><small>Usuário autenticado pelo ChatGPT</small></div></div><div className="permission"><span className="permission-icon">{hasAccess ? "✓" : "!"}</span><div><strong>{accessLabel}</strong><small>{role === "master" ? "Acesso administrativo à plataforma Beta MCP." : role === "support" ? "Pode usar as integrações autorizadas para sua conta." : "Solicite autorização ao administrador."}</small></div></div></div>
      <footer className="card-footer"><span className="footer-links"><a className="admin-link" href="/action">Configurar GPT Action <span>↗</span></a><a className="admin-link" href="/mcp">Configurar MCP <span>↗</span></a>{isMaster(role) && <a className="admin-link" href="/admin/users">Painel de controle <span>↗</span></a>}<a className="admin-link" href="/privacy">Privacidade <span>↗</span></a></span></footer>
    </section>
  </main>;
}
