import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  try {
    const formData = await request.formData();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const lotNumber = String(formData.get("lot_number") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!fullName || !lotNumber || !email || !password) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/auth/resultado?status=error&reason=Completa%20todos%20los%20campos" }
      });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          lot_number: lotNumber,
          role: "residente"
        }
      }
    });

    if (error) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/auth/resultado?status=error&reason=${encodeURIComponent(error.message)}` }
      });
    }

    if (!data.user) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/auth/resultado?status=error&reason=No%20se%20pudo%20crear%20el%20usuario" }
      });
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        role: "residente",
        full_name: fullName,
        lot_number: lotNumber,
        complejo_id: "complejo-1"
      },
      { onConflict: "id" }
    );
    if (profileError) {
      return new Response(null, {
        status: 303,
        headers: { Location: `/auth/resultado?status=error&reason=${encodeURIComponent(profileError.message)}` }
      });
    }

    if (data.session?.access_token) {
      cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        maxAge: data.session.expires_in
      });
    }

    if (!data.session) {
      return new Response(null, {
        status: 303,
        headers: {
          Location:
            "/auth/resultado?status=success&title=Cuenta%20creada&message=Revisa%20tu%20correo%20para%20confirmar%20el%20acceso"
        }
      });
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location:
          "/auth/resultado?status=success&title=Registro%20exitoso&message=Tu%20cuenta%20se%20registro%20correctamente&next=/residente/inicio"
      }
    });
  } catch (error) {
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/auth/resultado?status=error&reason=${encodeURIComponent(
          error instanceof Error ? error.message : "Error interno de registro"
        )}`
      }
    });
  }
};
