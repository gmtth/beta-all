import { redirect } from "next/navigation";

// GET /mcp is the legacy setup page; POST /mcp remains the MCP protocol endpoint in the Worker.
export default function LegacyMcpPage() {
  redirect("/docs#mcp");
}
