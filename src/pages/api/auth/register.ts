import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  const formData = await request.formData();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const lotNumber = String(formData.get("lot_number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !lotNumber || !email || !password) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/registro?error=Completa todos los campos." }
    });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${url.origin}/`,
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
      headers: { Location: `/registro?error=${encodeURIComponent(error.message)}` }
    });
  }

  if (!data.user) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/registro?error=No se pudo crear el usuario." }
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
      headers: { Location: `/registro?error=${encodeURIComponent(profileError.message)}` }
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
      headers: { Location: "/?success=Cuenta creada. Revisa tu correo para confirmar el acceso." }
    });
  }

  return new Response(null, { status: 303, headers: { Location: "/residente/inicio" } });
};
