import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import { getSupabaseServerClient, getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !locals.profile || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!isPlatformAdmin(locals.profile.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const supabase = getSupabaseServerClient(locals.accessToken);
  const { data, error } = await supabase
    .from("incidentes")
    .select("id, created_at, estado, descripcion, severidad, visitante_nombre, lote_number")
    .eq("complejo_id", locals.profile.complejo_id ?? "complejo-1")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ incidentes: data ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const severidades = new Set(["baja", "media", "alta"]);

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.profile) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (!isPlatformAdmin(locals.profile.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const descripcion = String(body?.descripcion ?? "").trim();
  if (!descripcion) return new Response(JSON.stringify({ error: "Descripcion requerida." }), { status: 400 });
  const rawSev = String(body?.severidad ?? "media").toLowerCase();
  const severidad = severidades.has(rawSev) ? rawSev : "media";

  const bitacoraId = typeof body?.bitacoraId === "string" ? body.bitacoraId.trim() : "";
  const service = getSupabaseServiceClient();

  let complejo_id = locals.profile.complejo_id ?? "complejo-1";
  let visitante_nombre: string | null = body?.visitanteNombre != null ? String(body.visitanteNombre).trim() || null : null;
  let lote_number: string | null = body?.loteNumber != null ? String(body.loteNumber).trim() || null : null;
  let bitacora_id: string | null = null;

  if (bitacoraId) {
    const { data: mov, error: movErr } = await service
      .from("bitacora_accesos")
      .select("id, complejo_id, visitante_nombre, lote_number")
      .eq("id", bitacoraId)
      .maybeSingle();
    if (movErr || !mov) {
      return new Response(JSON.stringify({ error: "Movimiento no encontrado." }), { status: 404 });
    }
    const adminComplejo = locals.profile.complejo_id ?? "complejo-1";
    if (locals.profile.role !== "super_admin" && mov.complejo_id !== adminComplejo) {
      return new Response(JSON.stringify({ error: "No autorizado para este complejo." }), { status: 403 });
    }
    complejo_id = mov.complejo_id;
    bitacora_id = mov.id;
    visitante_nombre = visitante_nombre ?? (mov.visitante_nombre as string | null);
    lote_number = lote_number ?? (mov.lote_number as string | null);
  } else if (locals.profile.role !== "super_admin") {
    complejo_id = locals.profile.complejo_id ?? "complejo-1";
  }

  const insertRow: Record<string, unknown> = {
    complejo_id,
    creado_por: locals.user.id,
    descripcion,
    severidad,
    estado: "abierto",
    visitante_nombre,
    lote_number
  };
  if (bitacora_id) insertRow.bitacora_id = bitacora_id;

  const { error } = await service.from("incidentes").insert(insertRow);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }), { status: 201 });
};
