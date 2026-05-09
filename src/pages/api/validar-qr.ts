import type { APIRoute } from "astro";
import { validateAccessQr } from "../../lib/access";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.complejoId) {
    return new Response(JSON.stringify({ status: "not_found" }), { status: 400 });
  }

  const result = await validateAccessQr(body.token, body.complejoId);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
