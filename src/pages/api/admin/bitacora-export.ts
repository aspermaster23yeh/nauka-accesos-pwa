import type { APIRoute } from "astro";
import { getBitacoraScope } from "../../../lib/access";
import { canExportBitacora, isCommitteeReader, isPlatformAdmin } from "../../../lib/admin-access";

export const prerender = false;

function csvEscape(cell: string | null | undefined): string {
  const s = String(cell ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export const GET: APIRoute = async ({ url, locals }) => {
  if (!locals.user || !locals.profile || !canExportBitacora(locals.profile.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const q = url.searchParams.get("q")?.trim() || undefined;
  const desde = url.searchParams.get("desde")?.trim() || undefined;
  const hasta = url.searchParams.get("hasta")?.trim() || undefined;
  const resultadoRaw = url.searchParams.get("resultado")?.trim();
  const resultado =
    resultadoRaw === "autorizado" || resultadoRaw === "rechazado" ? (resultadoRaw as "autorizado" | "rechazado") : undefined;
  const filterComplejoId = url.searchParams.get("complejo_id")?.trim() || undefined;
  const cap = Math.min(Math.max(Number(url.searchParams.get("limit") ?? "2000") || 2000, 1), 5000);

  const reader = isCommitteeReader(locals.profile.role);
  const rows = await getBitacoraScope({
    allComplejos: !reader && isPlatformAdmin(locals.profile.role),
    complejoId: reader ? (locals.profile.complejo_id ?? "complejo-1") : undefined,
    filterComplejoId: reader ? undefined : filterComplejoId,
    query: q,
    desde,
    hasta,
    resultado,
    limit: cap
  });

  const header = [
    "id",
    "created_at",
    "visitante_nombre",
    "resultado",
    "tipo_evento",
    "complejo_id",
    "lote_number",
    "pase_id",
    "token_qr",
    "guardia_id",
    "razon",
    "motivo",
    "solicitante_nombre"
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.id),
        csvEscape(r.created_at),
        csvEscape(r.visitante_nombre),
        csvEscape(r.resultado),
        csvEscape(r.tipo_evento),
        csvEscape(r.complejo_id),
        csvEscape(r.lote_number),
        csvEscape(r.pase_id),
        csvEscape(r.token_qr),
        csvEscape(r.guardia_id),
        csvEscape(r.razon),
        csvEscape(r.motivo),
        csvEscape(r.solicitante_nombre)
      ].join(",")
    );
  }

  const csv = "\uFEFF" + lines.join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="bitacora-export.csv"'
    }
  });
};
