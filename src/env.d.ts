/// <reference types="astro/client" />

type AppRole = "residente" | "c" | "admin";

interface UserProfile {
  id: string;
  role: AppRole;
  full_name: string | null;
  lot_number: string | null;
  complejo_id: string | null;
}

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User | null;
    profile: UserProfile | null;
    role: AppRole | null;
    accessToken: string | null;
  }
}
