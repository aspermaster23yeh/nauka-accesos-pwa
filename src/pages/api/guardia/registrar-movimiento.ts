import type { APIRoute } from "astro";
import { registerAccessMovement } from "../../../lib/access";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.profile || locals.profile.role !== "guardia" || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tokenQr = String(body?.token ?? "");
  const tipoEvento = body?.tipoEvento === "salida" ? "salida" : "entrada";
  if (!tokenQr) {
    return new Response(JSON.stringify({ error: "Token requerido." }), { status: 400 });
  }

  try {
    await registerAccessMovement({
      accessToken: locals.accessToken,
      guardiaId: locals.user.id,
      complejoId: locals.profile.complejo_id ?? "complejo-1",
      tokenQr,
      tipoEvento
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo registrar movimiento." }), { status: 500 });
  }
};
