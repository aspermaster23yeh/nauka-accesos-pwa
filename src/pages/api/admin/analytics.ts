import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import type { AnalyticsBucketKind } from "../../../lib/access";
import {
  getEntradasTimeSeries,
  getTopGuardiasAccesos,
  getTopSolicitantesPorPases
} from "../../../lib/access";

export const prerender = false;

function parseBucket(raw: string | null): AnalyticsBucketKind {
  if (raw === "hour" || raw === "week" || raw === "month") return raw;
  return "day";
}

export const GET: APIRoute = async ({ locals, url }) => {
  if (!locals.user || !isPlatformAdmin(locals.profile?.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const bucket = parseBucket(url.searchParams.get("bucket"));
  const sinceDays = Math.min(120, Math.max(7, Number(url.searchParams.get("sinceDays") ?? "45") || 45));

  try {
    const [entradasSeries, topGuardias, topSolicitantes] = await Promise.all([
      getEntradasTimeSeries(bucket, sinceDays),
      getTopGuardiasAccesos(30, 15),
      getTopSolicitantesPorPases(30, 15)
    ]);
    return new Response(
      JSON.stringify({
        bucket,
        sinceDays,
        entradasSeries,
        topGuardias,
        topSolicitantes
      }),
      { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error" }), { status: 500 });
  }
};
