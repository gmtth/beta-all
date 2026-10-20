import { requireChatGPTUser } from "./chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "./oauth/_lib";
import { getIntegrationStatuses } from "./integration-status";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await requireChatGPTUser("/");
  await ensureSchema();
  const [role, integrations] = await Promise.all([getUserRole(user.email), getIntegrationStatuses()]);
  const accessLabel = role === "master" ? "Administrador" : role === "support" ? "Suporte autorizado" : "Acesso não autorizado";
  const accessClass = role === "master" || role === "support" ? "status status-ok" : "status status-blocked";
  return <main className="shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <section className="card" aria-labelledby="page-title">
      <header className="brandbar"><div className="integration-statuses" aria-label="Status das integrações"><span className={`integration-status integration-${integrations.movidesk}`}><span className="integration-dot" aria-hidden="true" /><span>Movidesk API</span><strong>{integrations.movidesk === "online" ? "ONLINE" : "OFFLINE"}</strong></span><span className={`integration-status integration-${integrations.supabase}`}><span className="integration-dot" aria-hidden="true" /><span>Supabase API</span><strong>{integrations.supabase === "online" ? "ONLINE" : "OFFLINE"}</strong></span></div></header>
      <div className="hero home-hero"><h1 id="page-title">Suas integrações.<br /><em>Em um só MCP.</em></h1><p className="lead">Conecte o ChatGPT às ferramentas da sua equipe em um ambiente seguro, com identidade e permissões por pessoa.</p></div>
      <div className="access-panel"><div className="panel-heading"><span>Conta conectada</span><span className={accessClass}>{role === "master" || role === "support" ? "ATIVA" : "BLOQUEADA"}</span></div><div className="account"><span className="avatar">{user.email.slice(0, 1).toUpperCase()}</span><div><strong>{user.email}</strong><small>Usuário autenticado pelo ChatGPT</small></div></div><div className="permission"><span className="permission-icon">✓</span><div><strong>{accessLabel}</strong><small>{role === "master" ? "Acesso administrativo à plataforma Beta MCP." : role === "support" ? "Pode usar as integrações autorizadas para sua conta." : "Solicite autorização ao administrador."}</small></div></div></div>
      <footer className="card-footer"><span className="footer-links"><a className="admin-link" href="/action">Configurar GPT Action <span>↗</span></a><a className="admin-link" href="/setup/mcp">Configurar MCP <span>↗</span></a>{isMaster(role) && <a className="admin-link" href="/admin/users">Gerenciar usuários de suporte <span>↗</span></a>}</span><span className="version">BETA / MCP ACCESS</span></footer>
    </section>
  </main>;
}
