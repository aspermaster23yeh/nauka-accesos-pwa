import type { APIRoute } from "astro";
import { getAdminMetrics, getBitacoraByComplejo } from "../../../lib/access";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user || !locals.profile || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (locals.profile.role !== "admin" && locals.profile.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const query = url.searchParams.get("q") ?? "";
    const complejoId = locals.profile.complejo_id ?? "complejo-1";
    const [metrics, registros] = await Promise.all([
      getAdminMetrics({
        accessToken: locals.accessToken,
        userId: locals.user.id,
        role: locals.profile.role === "super_admin" ? "super_admin" : "admin",
        complejoId,
        lotNumber: locals.profile.lot_number
      }),
      getBitacoraByComplejo(complejoId, query, locals.accessToken)
    ]);

    return new Response(JSON.stringify({ metrics, registros }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo cargar dashboard." }), { status: 500 });
  }
};
