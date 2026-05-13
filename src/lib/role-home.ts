import type { AppRole } from "./supabase";

/** Pantalla principal después de completar un flujo (login, términos, éxito, etc.). */
export function getRoleHome(role: AppRole | null | undefined): string {
  if (!role) return "/";
  if (role === "super_admin" || role === "admin") return "/admin/dashboard";
  if (role === "guardia") return "/guardia/escaner";
  return "/solicitante/inicio";
}
