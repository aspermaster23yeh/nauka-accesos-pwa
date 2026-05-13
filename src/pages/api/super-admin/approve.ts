import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import { getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !isPlatformAdmin(locals.profile?.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const userId = String(body?.userId ?? "").trim();
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId requerido." }), { status: 400 });
  }

  const service = getSupabaseServiceClient();
  const { error } = await service
    .from("profiles")
    .update({
      onboarding_status: "activo",
      approved_at: new Date().toISOString(),
      approved_by: locals.user.id
    })
    .eq("id", userId);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
