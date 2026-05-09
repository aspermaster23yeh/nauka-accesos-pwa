import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const email = String(formData.get("email") ?? "").trim();
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
      const roleFromMeta =
        data.user.user_metadata?.role === "guardia" || data.user.user_metadata?.role === "admin" ? data.user.user_metadata.role : "residente";
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
          headers: { Location: `/auth/resultado?status=error&reason=${encodeURIComponent(upsertError.message)}` }
        });
      }
      profile = { role: roleFromMeta, id: data.user.id };
    }

    const target =
      profile.role === "admin" ? "/admin/dashboard" : profile.role === "guardia" ? "/guardia/escaner" : "/residente/inicio";
    const roleTitle =
      profile.role === "admin"
        ? "Panel de Administracion listo"
        : profile.role === "guardia"
          ? "Acceso de Guardia habilitado"
          : "Bienvenido Residente";

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/auth/resultado?status=success&title=${encodeURIComponent(roleTitle)}&message=Inicio%20de%20sesion%20correcto&next=${encodeURIComponent(target)}`
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
