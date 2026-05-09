import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const supabaseAnonKey = "YOUR_PUBLIC_ANON_KEY";
function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function getSupabaseServerClient() {
  return createClient(
    assertEnv("PUBLIC_SUPABASE_URL", supabaseUrl),
    assertEnv("PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}

async function validateAccessQr(token, complejoId) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("pases_acceso").select("id, visitante_nombre, anfitrion_nombre, estado, vence_en").eq("token_qr", token).eq("complejo_id", complejoId).maybeSingle();
  if (error || !data) {
    return { status: "not_found" };
  }
  if (data.estado !== "vigente") {
    return { status: "expired" };
  }
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(data.vence_en);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    return { status: "expired" };
  }
  return {
    status: "authorized",
    visitanteNombre: data.visitante_nombre,
    anfitrionNombre: data.anfitrion_nombre,
    vencimiento: data.vence_en
  };
}

const prerender = false;
const POST = async ({ request }) => {
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.complejoId) {
    return new Response(JSON.stringify({ status: "not_found" }), { status: 400 });
  }
  const result = await validateAccessQr(body.token, body.complejoId);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
