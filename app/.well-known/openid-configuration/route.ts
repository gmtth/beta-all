import { clientId, json } from "../../oauth/_lib";

export async function GET(request: Request) {
  const issuer = new URL(request.url).origin;
  return json(
    {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code"],
      code_challenge_methods_supported: ["S256"],
      scopes_supported: ["movidesk:read"],
      token_endpoint_auth_methods_supported: ["none"],
      client_id: clientId(),
    },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
