import { createClient, type User, type SupabaseClient } from "@supabase/supabase-js";

type PublicSchema = "public";
export type AppRole = "residente" | "guardia" | "admin";

export interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  lot_number: string | null;
  complejo_id: string | null;
}

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.SUPABASE_KEY;

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseServerClient(accessToken?: string): SupabaseClient<any, PublicSchema, any> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(assertEnv("PUBLIC_SUPABASE_URL", supabaseUrl), assertEnv("PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}

export function getSupabaseBrowserClient(): SupabaseClient<any, PublicSchema, any> {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(assertEnv("PUBLIC_SUPABASE_URL", supabaseUrl), assertEnv("PUBLIC_SUPABASE_ANON_KEY", supabaseAnonKey));
}

export async function getUserFromAccessToken(accessToken?: string): Promise<User | null> {
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

export async function getProfileForUser(userId: string, accessToken?: string): Promise<UserProfile | null> {
  try {
    const client = getSupabaseServerClient(accessToken);
    const { data, error } = await client
      .from("profiles")
      .select("id, role, full_name, lot_number, complejo_id")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}
