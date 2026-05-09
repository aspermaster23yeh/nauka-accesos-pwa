import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/?error=Email y contraseña son obligatorios." }
    });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return new Response(null, {
      status: 303,
      headers: { Location: `/?error=${encodeURIComponent(error?.message ?? "No se pudo iniciar sesión.")}` }
    });
  }

  cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: data.session.expires_in
  });

  let { data: profile } = await supabase
    .from("profiles")
    .select("role, id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    const roleFromMeta = data.user.user_metadata?.role === "guardia" || data.user.user_metadata?.role === "admin" ? data.user.user_metadata.role : "residente";
    const upsertPayload = {
      id: data.user.id,
      role: roleFromMeta,
      full_name: data.user.user_metadata?.full_name ?? null,
      lot_number: data.user.user_metadata?.lot_number ?? null,
      complejo_id: data.user.user_metadata?.complejo_id ?? "complejo-1"
    };
    const { error: upsertError } = await supabase.from("profiles").upsert(upsertPayload, { onConflict: "id" });
    if (upsertError) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/?error=${encodeURIComponent(upsertError.message)}` }
      });
    }
    profile = { role: roleFromMeta, id: data.user.id };
  }

  const target =
    profile.role === "admin" ? "/admin/dashboard" : profile.role === "guardia" ? "/guardia/escaner" : "/residente/inicio";

  return new Response(null, {
    status: 303,
    headers: {
      Location: target
    }
  });
};
