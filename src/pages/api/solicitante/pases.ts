import type { APIRoute } from "astro";
import { createVisitorPass, getActivePassesForSolicitante } from "../../../lib/access";

export const prerender = false;

function requireSolicitante(locals: App.Locals) {
  if (!locals.user || !locals.profile || locals.profile.role !== "solicitante" || !locals.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    requireSolicitante(locals);
    const passes = await getActivePassesForSolicitante({
      accessToken: locals.accessToken as string,
      userId: locals.user!.id,
      role: "solicitante",
      complejoId: locals.profile!.complejo_id ?? "complejo-1",
      lotNumber: locals.profile!.lot_number
    });
    return new Response(JSON.stringify({ passes }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: "No se pudieron cargar los pases." }), { status });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    requireSolicitante(locals);
    const body = await request.json();
    const visitanteNombre = String(body?.visitanteNombre ?? "").trim();
    const motivo = String(body?.motivo ?? "Visita").trim();
    const venceEn = String(body?.venceEn ?? "");
    const telefonoDestino = String(body?.telefonoDestino ?? "").trim();
    const notas = String(body?.notas ?? "").trim();
    if (!visitanteNombre || !venceEn) {
      return new Response(JSON.stringify({ error: "Datos incompletos." }), { status: 400 });
    }

    const pass = await createVisitorPass({
      accessToken: locals.accessToken as string,
      creadoPor: locals.user!.id,
      complejoId: locals.profile!.complejo_id ?? "complejo-1",
      lotNumber: locals.profile!.lot_number,
      motivo,
      visitanteNombre,
      venceEn,
      telefonoDestino,
      notas
    });

    return new Response(JSON.stringify({ pass }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo crear el pase." }), { status });
  }
};
