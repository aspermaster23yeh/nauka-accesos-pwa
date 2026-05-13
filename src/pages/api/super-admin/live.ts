import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import { getLotesWithResponsables, getSuperAdminActivityEnriched } from "../../../lib/access";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !isPlatformAdmin(locals.profile?.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const [{ movements, lotKpis }, lotesCatalog] = await Promise.all([getSuperAdminActivityEnriched(180), getLotesWithResponsables()]);
    return new Response(
      JSON.stringify({
        movements,
        lotKpis,
        lotesCatalog,
        generatedAt: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), { status: 500 });
  }
};
