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

function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const fromImportMeta = (import.meta.env as Record<string, string | undefined>)[key];
    if (fromImportMeta) return fromImportMeta;

    if (typeof process !== "undefined") {
      const fromProcess = process.env[key];
      if (fromProcess) return fromProcess;
    }
  }
  return undefined;
}

function assertEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function resolveSupabaseConfig(): { url?: string; anonKey?: string } {
  const url = readEnv("PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anonKey = readEnv("PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_KEY");
  return { url, anonKey };
}

function hasSupabaseConfig(): boolean {
  const { url, anonKey } = resolveSupabaseConfig();
  return Boolean(url && anonKey);
}

export function getSupabaseServerClient(accessToken?: string): SupabaseClient<any, PublicSchema, any> {
  const { url, anonKey } = resolveSupabaseConfig();
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(assertEnv("PUBLIC_SUPABASE_URL", url), assertEnv("PUBLIC_SUPABASE_ANON_KEY", anonKey), {
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
  const { url, anonKey } = resolveSupabaseConfig();
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createClient(assertEnv("PUBLIC_SUPABASE_URL", url), assertEnv("PUBLIC_SUPABASE_ANON_KEY", anonKey));
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
