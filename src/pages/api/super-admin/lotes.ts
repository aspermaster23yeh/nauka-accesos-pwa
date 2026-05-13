import type { APIRoute } from "astro";
import { getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.profile?.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), { status: 400 });
  }

  const complejo_id = String(body.complejo_id ?? "").trim();
  const lot_number = String(body.lot_number ?? "").trim();
  const owner_name = body.owner_name != null && String(body.owner_name).trim() !== "" ? String(body.owner_name).trim() : null;
  const responsableRaw = body.responsable_profile_id;
  const responsable_profile_id =
    responsableRaw != null && String(responsableRaw).trim() !== "" ? String(responsableRaw).trim() : null;

  if (!complejo_id || !lot_number) {
    return new Response(JSON.stringify({ error: "complejo_id y lot_number son obligatorios." }), { status: 400 });
  }

  const service = getSupabaseServiceClient();
  const { data, error } = await service
    .from("lotes")
    .upsert(
      {
        complejo_id,
        lot_number,
        owner_name,
        responsable_profile_id
      },
      { onConflict: "complejo_id,lot_number" }
    )
    .select("id, complejo_id, lot_number, owner_name, responsable_profile_id")
    .maybeSingle();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true, lote: data }), { status: 201, headers: { "Content-Type": "application/json" } });
};
