import { createClient, type User, type SupabaseClient } from "@supabase/supabase-js";

type PublicSchema = "public";
export type AppRole = "solicitante" | "guardia" | "admin" | "super_admin";

export interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  lot_number: string | null;
  complejo_id: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  onboarding_status: string;
  ine_storage_path: string | null;
}

function readEnv(...keys: string[]): string | undefined {
  const runtimeProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  for (const key of keys) {
    const fromImportMeta = (import.meta.env as Record<string, string | undefined>)[key];
    if (fromImportMeta) return fromImportMeta;

    if (runtimeProcess?.env) {
      const fromProcess = runtimeProcess.env[key];
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

function resolveSupabaseServiceConfig(): { url?: string; serviceRoleKey?: string } {
  const url = readEnv("SUPABASE_URL", "PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
  return { url, serviceRoleKey };
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

export function getSupabaseServiceClient(): SupabaseClient<any, PublicSchema, any> {
  const { url, serviceRoleKey } = resolveSupabaseServiceConfig();
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service role environment variables are not configured.");
  }

  return createClient(assertEnv("SUPABASE_URL", url), assertEnv("SUPABASE_SERVICE_ROLE_KEY", serviceRoleKey), {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
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
    const client = getSupabaseServiceClient();
    const { data, error } = await client
      .from("profiles")
      .select(
        "id, role, full_name, lot_number, complejo_id, terms_accepted_at, terms_version, onboarding_status, ine_storage_path"
      )
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return {
      ...data,
      onboarding_status: (data as { onboarding_status?: string }).onboarding_status ?? "activo",
      terms_accepted_at: (data as { terms_accepted_at?: string | null }).terms_accepted_at ?? null,
      terms_version: (data as { terms_version?: string | null }).terms_version ?? null,
      ine_storage_path: (data as { ine_storage_path?: string | null }).ine_storage_path ?? null
    } as UserProfile;
  } catch {
    return null;
  }
}
