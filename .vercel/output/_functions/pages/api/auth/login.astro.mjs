import { b as getSupabaseServerClient } from '../../../chunks/supabase_DBfBwpCC.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies }) => {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    return new Response("Email y contraseña son obligatorios.", { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return new Response(error?.message ?? "No se pudo iniciar sesión.", { status: 401 });
  }
  cookies.set("sb-access-token", data.session.access_token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: data.session.expires_in
  });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  const target = profile?.role === "admin" ? "/admin/dashboard" : profile?.role === "guardia" ? "/guardia/escaner" : "/residente/inicio";
  return new Response(null, {
    status: 303,
    headers: {
      Location: target
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
