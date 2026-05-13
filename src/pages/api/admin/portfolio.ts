import type { APIRoute } from "astro";
import { isPlatformAdmin, isSuperAdmin } from "../../../lib/admin-access";
import {
  getComplejosList,
  getSuperAdminComplejosPortfolio,
  getSuperAdminLotesPortfolioForComplejo
} from "../../../lib/access";

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user || !locals.profile || !isPlatformAdmin(locals.profile.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const complejoParam = url.searchParams.get("complejoId")?.trim() ?? "";
  const updatedAt = new Date().toISOString();
  const adminComplejo = locals.profile.complejo_id ?? "complejo-1";

  try {
    if (complejoParam) {
      if (!isSuperAdmin(locals.profile.role) && complejoParam !== adminComplejo) {
        return new Response(JSON.stringify({ error: "No autorizado para este complejo." }), { status: 403 });
      }
      const lotes = await getSuperAdminLotesPortfolioForComplejo(complejoParam);
      const complejos = await getComplejosList();
      const nombre = complejos.find((c) => c.id === complejoParam)?.nombre ?? complejoParam;
      return new Response(JSON.stringify({ complejoId: complejoParam, nombre, lotes, updatedAt }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const filter = isSuperAdmin(locals.profile.role) ? null : adminComplejo;
    const complejos = await getSuperAdminComplejosPortfolio(filter);
    return new Response(JSON.stringify({ complejos, updatedAt }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error al cargar portafolio." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
