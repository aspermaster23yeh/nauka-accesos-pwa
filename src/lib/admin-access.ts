import type { AppRole } from "./supabase";

/** Admin de plataforma: mismo alcance que el antiguo super_admin (vista global, APIs de gestión). */
export function isPlatformAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}
