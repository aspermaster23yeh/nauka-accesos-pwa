import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import { getSupabaseServiceClient, type AppRole } from "../../../lib/supabase";

export const prerender = false;

const TERMS_VERSION = "1";

function homeForRole(role: AppRole): string {
  if (role === "super_admin" || role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/solicitante/inicio";
}

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user || !locals.profile || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (isPlatformAdmin(locals.profile.role)) {
    return new Response(JSON.stringify({ ok: true, redirect: "/admin/dashboard" }), { status: 200 });
  }

  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      terms_accepted_at: new Date().toISOString(),
      terms_version: TERMS_VERSION
    })
    .eq("id", locals.user.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, redirect: homeForRole(locals.profile.role) }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
