import type { Metadata } from "next";
import { requireChatGPTUser } from "./chatgpt-auth";
import { ensureSchema, getUserRole, isMaster } from "./oauth/_lib";
export const metadata: Metadata = { title: "Movidesk OAuth Proxy", description: "OAuth access for Movidesk." };
export const dynamic = "force-dynamic";
export default async function Home() { const user = await requireChatGPTUser("/"); await ensureSchema(); const role = await getUserRole(user.email); return <main className="shell"><section className="card"><div className="eyebrow"><span className="dot" /> OAUTH PROXY</div><h1>Connect your GPT to Movidesk.</h1><p>This Site authenticates users and issues temporary OAuth tokens. The Movidesk token stays protected on the server.</p><div className="details"><strong>Connected user</strong><span>{user.email}</span></div><div className="details"><strong>Access level</strong><span>{role === "master" ? "Master" : role === "support" ? "Technical support" : "Unauthorized"}</span></div>{isMaster(role) ? <a className="admin-link" href="/admin/users">Manage support users →</a> : null}</section></main>; }
