import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !locals.profile || locals.profile.role !== "admin" || !locals.accessToken) {
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

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.profile || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const descripcion = String(body?.descripcion ?? "").trim();
  if (!descripcion) return new Response(JSON.stringify({ error: "Descripcion requerida." }), { status: 400 });
  const supabase = getSupabaseServerClient(locals.accessToken);
  const { error } = await supabase.from("incidentes").insert({
    complejo_id: locals.profile.complejo_id ?? "complejo-1",
    creado_por: locals.user.id,
    descripcion,
    severidad: body?.severidad ?? "media",
    estado: "abierto",
    visitante_nombre: body?.visitanteNombre ?? null,
    lote_number: body?.loteNumber ?? null
  });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true }), { status: 201 });
};
