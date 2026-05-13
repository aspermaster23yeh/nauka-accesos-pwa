import type { APIRoute } from "astro";
import { getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || locals.profile?.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const service = getSupabaseServiceClient();
  const { data, error } = await service
    .from("profiles")
    .select("id, full_name, lot_number, complejo_id, role, onboarding_status, ine_storage_path, photo_storage_path, terms_accepted_at, created_at")
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ profiles: data ?? [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
