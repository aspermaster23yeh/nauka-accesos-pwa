import { b as getSupabaseServerClient } from '../../../chunks/supabase_BRSQsonA.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request, cookies, url }) => {
  const formData = await request.formData();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const lotNumber = String(formData.get("lot_number") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!fullName || !lotNumber || !email || !password) {
    return new Response("Completa todos los campos.", { status: 400 });
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
    return new Response(error.message, { status: 400 });
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
  return new Response(null, {
    status: 303,
    headers: { Location: "/residente/inicio" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
