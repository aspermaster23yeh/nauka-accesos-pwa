import type { APIRoute } from "astro";
import { getSupabaseServerClient, getSupabaseServiceClient, type AppRole } from "../../../lib/supabase";

export const prerender = false;

function sanitizeEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "")
    .trim()
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .toLowerCase();
}

function loginTarget(role: AppRole): string {
  if (role === "super_admin") return "/super-admin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/solicitante/inicio";
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = sanitizeEmail(formData.get("email"));
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/auth/resultado?status=error&reason=Email%20y%20contrasena%20son%20obligatorios" }
      });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/auth/resultado?status=error&reason=${encodeURIComponent(error?.message ?? "No se pudo iniciar sesion.")}`
        }
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
      const adminSupabase = getSupabaseServiceClient();
      const upsertPayload = {
        id: data.user.id,
        role: "solicitante" as const,
        full_name: data.user.user_metadata?.full_name ?? null,
        lot_number: data.user.user_metadata?.lot_number ?? null,
        complejo_id: data.user.user_metadata?.complejo_id ?? "complejo-1"
      };
      const { error: upsertError } = await adminSupabase.from("profiles").upsert(upsertPayload, { onConflict: "id" });
      if (upsertError) {
        return new Response(null, {
          status: 303,
          headers: { Location: `/auth/resultado?status=error&reason=${encodeURIComponent(upsertError.message)}` }
        });
      }
      profile = { role: "solicitante", id: data.user.id };
    }

    const target = loginTarget(profile.role as AppRole);
    return new Response(null, {
      status: 303,
      headers: {
        Location: target
      }
    });
  } catch (error) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/auth/resultado?status=error&reason=${encodeURIComponent(
          error instanceof Error ? error.message : "Error interno de inicio de sesion"
        )}`
      }
    });
  }
};
