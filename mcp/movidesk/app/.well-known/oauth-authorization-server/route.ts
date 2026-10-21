import { GPT_ACTION_CLIENT_ID, json, MCP_CLIENT_ID, SUPPORTED_OAUTH_SCOPES } from "../../oauth/_lib";
import { authorizationServerMetadata } from "../../oauth/metadata";

export async function GET(request: Request) {
  const issuer = new URL(request.url).origin;
  return json(authorizationServerMetadata(issuer, [...SUPPORTED_OAUTH_SCOPES], [GPT_ACTION_CLIENT_ID, MCP_CLIENT_ID]), { headers: { "cache-control": "public, max-age=300" } });
}
