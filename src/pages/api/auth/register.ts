import type { APIRoute } from "astro";
import { getSupabaseServerClient, getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

function sanitizeEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "")
    .trim()
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .toLowerCase();
}

function mapRegisterError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("email rate limit exceeded")) {
    return "Demasiados intentos de registro. Espera unos minutos o desactiva confirmacion por correo temporalmente en Supabase Auth para pruebas.";
  }
  if (normalized.includes("user already registered")) {
    return "Este correo ya esta registrado. Inicia sesion.";
  }
  return message;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const formData = await request.formData();
    const fullName = String(formData.get("full_name") ?? "").trim();
    const lotNumber = String(formData.get("lot_number") ?? "").trim();
    const email = sanitizeEmail(formData.get("email"));
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
        headers: { Location: `/auth/resultado?status=error&reason=${encodeURIComponent(mapRegisterError(error.message))}` }
      });
    }

    if (!data.user) {
      return new Response(null, {
        status: 303,
        headers: { Location: "/auth/resultado?status=error&reason=No%20se%20pudo%20crear%20el%20usuario" }
      });
    }

    const adminSupabase = getSupabaseServiceClient();
    const { error: profileError } = await adminSupabase.from("profiles").upsert(
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
        Location: "/residente/inicio"
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
