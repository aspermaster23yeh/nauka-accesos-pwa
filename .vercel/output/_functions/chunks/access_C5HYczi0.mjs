import { createClient } from '@supabase/supabase-js';

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
async function getBitacoraByComplejo(complejoId, query) {
  const supabase = getSupabaseServerClient();
  const normalizedQuery = query?.trim();
  let statement = supabase.from("bitacora_accesos").select("id, created_at, visitante_nombre, resultado, origen").eq("complejo_id", complejoId).order("created_at", { ascending: false }).limit(100);
  if (normalizedQuery) {
    statement = statement.or(`visitante_nombre.ilike.%${normalizedQuery}%,resultado.ilike.%${normalizedQuery}%`);
  }
  const { data, error } = await statement;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}
async function createVisitorPass(input) {
  const supabase = getSupabaseServerClient();
  const tokenQr = crypto.randomUUID();
  const { data, error } = await supabase.from("pases_acceso").insert({
    token_qr: tokenQr,
    complejo_id: input.complejoId,
    visitante_nombre: input.visitanteNombre,
    anfitrion_nombre: input.anfitrionNombre,
    vence_en: input.venceEn,
    estado: "vigente",
    telefono_destino: input.telefonoDestino
  }).select("token_qr").single();
  if (error) {
    throw new Error(error.message);
  }
  return data.token_qr;
}

export { createVisitorPass as c, getBitacoraByComplejo as g, validateAccessQr as v };
