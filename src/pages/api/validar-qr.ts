import type { APIRoute } from "astro";
import { validateAccessQr } from "../../lib/access";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.profile || !["guardia", "admin"].includes(locals.profile.role)) {
    return new Response(JSON.stringify({ status: "not_found", error: "Unauthorized" }), { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.complejoId) {
    return new Response(JSON.stringify({ status: "not_found" }), { status: 400 });
  }

  const guardiaId = locals.profile.role === "guardia" ? locals.user.id : typeof body.guardiaId === "string" ? body.guardiaId : undefined;
  const result = await validateAccessQr(body.token, body.complejoId, guardiaId);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
