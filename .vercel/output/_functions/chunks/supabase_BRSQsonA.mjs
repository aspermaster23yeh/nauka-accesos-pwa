import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zglxnozjkktsufitjtvy.supabase.co";
const supabaseAnonKey = "sb_publishable_uU6Romn_9P4tEM6qsxHHow_Bl_SJ_jf";
function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function hasSupabaseConfig() {
  return Boolean(supabaseAnonKey);
}
function getSupabaseServerClient(accessToken) {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(assertEnv("PUBLIC_SUPABASE_URL", supabaseUrl), assertEnv("PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: accessToken ? {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    } : void 0
  });
}
async function getUserFromAccessToken(accessToken) {
  if (!accessToken) return null;
  try {
    const client = getSupabaseServerClient(accessToken);
    const {
      data: { user },
      error
    } = await client.auth.getUser(accessToken);
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}
async function getProfileForUser(userId, accessToken) {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data, error } = await client.from("profiles").select("id, role, full_name, lot_number, complejo_id").eq("id", userId).maybeSingle();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export { getProfileForUser as a, getSupabaseServerClient as b, getUserFromAccessToken as g };
