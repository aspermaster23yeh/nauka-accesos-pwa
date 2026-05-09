import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type PublicSchema = "public";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseServerClient(): SupabaseClient<any, PublicSchema, any> {
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

export function getSupabaseBrowserClient(): SupabaseClient<any, PublicSchema, any> {
  return createClient(
    assertEnv("PUBLIC_SUPABASE_URL", supabaseUrl),
    assertEnv("PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey)
  );
}
