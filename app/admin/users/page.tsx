import { requireChatGPTUser } from "../../chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "../../oauth/_lib";
import UserAdminPanel from "../../user-admin-panel";
export const dynamic = "force-dynamic";
export default async function UsersPage() { const user = await requireChatGPTUser("/admin/users"); await ensureSchema(); const role = await getUserRole(user.email); if (!isMaster(role)) return <main className="shell"><section className="card"><h1>Access restricted</h1><p>Only master accounts can manage users.</p></section></main>; return <main className="shell"><section className="card"><div className="eyebrow"><span className="dot" /> ADMINISTRATION</div><h1>Authorized users</h1><p>Register technical support accounts. They can authorize the GPT but cannot manage users.</p><UserAdminPanel /></section></main>; }
