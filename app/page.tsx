import { requireChatGPTUser } from "./chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "./oauth/_lib";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await requireChatGPTUser("/");
  await ensureSchema();
  const role = await getUserRole(user.email);
  const accessLabel = role === "master" ? "Administrador" : role === "support" ? "Suporte autorizado" : "Acesso não autorizado";
  const accessClass = role === "master" || role === "support" ? "status status-ok" : "status status-blocked";
  return <main className="shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <section className="card" aria-labelledby="page-title">
      <header className="brandbar"><div className="brand"><img src="/favicon.png" alt="" /><span>movidesk</span></div><span className="secure"><span className="secure-dot" /> CONEXÃO SEGURA</span></header>
      <div className="hero"><div className="eyebrow"><span className="pulse" /> CENTRAL DE ACESSO</div><h1 id="page-title">Seu suporte.<br /><em>Mais simples.</em></h1><p className="lead">O conector Movidesk usa esta página para confirmar sua identidade e liberar, com segurança, as consultas autorizadas.</p></div>
      <div className="access-panel"><div className="panel-heading"><span>Conta conectada</span><span className={accessClass}>{role === "master" || role === "support" ? "ATIVA" : "BLOQUEADA"}</span></div><div className="account"><span className="avatar">{user.email.slice(0, 1).toUpperCase()}</span><div><strong>{user.email}</strong><small>Usuário autenticado pelo ChatGPT</small></div></div><div className="permission"><span className="permission-icon">✓</span><div><strong>{accessLabel}</strong><small>{role === "master" ? "Acesso administrativo ao conector." : role === "support" ? "Pode consultar dados permitidos do Movidesk." : "Solicite autorização ao administrador."}</small></div></div></div>
      <footer className="card-footer">{isMaster(role) ? <a className="admin-link" href="/admin/users">Gerenciar usuários de suporte <span>↗</span></a> : <span>O acesso é protegido por OAuth 2.1 + PKCE</span>}<span className="version">MOVI / SECURE ACCESS</span></footer>
    </section>
  </main>;
}
