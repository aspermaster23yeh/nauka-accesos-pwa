import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://YOUR_PROJECT.supabase.co";
const supabaseAnonKey = "YOUR_PUBLIC_ANON_KEY";
function assertEnv(name, value) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function getSupabaseServerClient(accessToken) {
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
  const client = getSupabaseServerClient(accessToken);
  const {
    data: { user },
    error
  } = await client.auth.getUser(accessToken);
  if (error) return null;
  return user;
}
async function getProfileForUser(userId, accessToken) {
  const client = getSupabaseServerClient(accessToken);
  const { data, error } = await client.from("profiles").select("id, role, full_name, lot_number, complejo_id").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return data;
}

export { getProfileForUser as a, getSupabaseServerClient as b, getUserFromAccessToken as g };
