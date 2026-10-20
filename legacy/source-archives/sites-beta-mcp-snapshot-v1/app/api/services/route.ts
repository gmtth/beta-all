import { authorizeMovidesk, fetchMovidesk } from "../_movidesk";

export async function GET(request: Request) {
  const auth = await authorizeMovidesk(request);
  if ("response" in auth) return auth.response;
  return fetchMovidesk("services", request, auth.token, ["id", "name", "isActive"]);
}
