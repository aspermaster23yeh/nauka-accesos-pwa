/// <reference types="astro/client" />

type AppRole = "solicitante" | "guardia" | "admin" | "super_admin";

interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  lot_number: string | null;
  complejo_id: string | null;
  terms_accepted_at: string | null;
  terms_version: string | null;
  onboarding_status: string;
  ine_storage_path: string | null;
  photo_storage_path: string | null;
}

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User | null;
    profile: UserProfile | null;
    role: AppRole | null;
    accessToken: string | null;
  }
}
