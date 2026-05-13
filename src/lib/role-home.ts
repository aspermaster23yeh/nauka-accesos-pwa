import type { AppRole } from "./supabase";

/** Pantalla principal después de completar un flujo (login, términos, éxito, etc.). */
export function getRoleHome(role: AppRole | null | undefined): string {
  if (!role) return "/";
  if (role === "super_admin") return "/admin/portafolio";
  if (role === "admin") return "/admin/dashboard";
  if (role === "lector_junta") return "/admin/bitacora";
  if (role === "guardia") return "/guardia/escaner";
  return "/solicitante/inicio";
}
