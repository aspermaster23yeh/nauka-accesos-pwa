import type { AppRole } from "./supabase";

/** Admin de plataforma: mismo alcance que el antiguo super_admin (vista global, APIs de gestión). */
export function isPlatformAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: AppRole | null | undefined): boolean {
  return role === "super_admin";
}

/** Comité: solo lectura de bitácora y exportes en su complejo. */
export function isCommitteeReader(role: AppRole | null | undefined): boolean {
  return role === "lector_junta";
}

/** Rutas /admin/* accesibles para lector_junta (sin panel operativo). */
export function isCommitteeReaderAdminPath(pathname: string): boolean {
  if (pathname === "/admin/bitacora") return true;
  if (pathname.startsWith("/admin/detalle-movimiento")) return true;
  if (pathname.startsWith("/admin/pase/")) return true;
  return false;
}

export function canExportBitacora(role: AppRole | null | undefined): boolean {
  return isPlatformAdmin(role) || isCommitteeReader(role);
}
