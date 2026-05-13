import type { BottomNavItem } from "../components/app/BottomNav.astro";

export const solicitanteNav: BottomNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/solicitante/inicio" },
  { id: "nuevo-pase", label: "Nuevo Pase", icon: "add_card", href: "/solicitante/nuevo-pase" },
  { id: "activos", label: "Activos", icon: "qr_code_2", href: "/solicitante/inicio#pases-activos" }
];

export const guardNav: BottomNavItem[] = [
  { id: "seguridad", label: "Seguridad", icon: "shield", href: "/guardia/escaner" },
  { id: "mis-accesos", label: "Mis accesos", icon: "history", href: "/guardia/mis-accesos" },
  { id: "rechazados", label: "Rechazados", icon: "gpp_bad", href: "/guardia/acceso-denegado" }
];

export const adminNav: BottomNavItem[] = [
  { id: "dashboard", label: "Resumen", icon: "dashboard", href: "/admin/dashboard" },
  { id: "analitica", label: "Analítica", icon: "analytics", href: "/admin/analitica" },
  { id: "actividad", label: "Actividad", icon: "timeline", href: "/admin/actividad" },
  { id: "bitacora", label: "Bitácora", icon: "history", href: "/admin/bitacora" },
  { id: "evidencias", label: "Evidencias", icon: "photo_camera", href: "/admin/evidencias-salida" },
  { id: "operaciones", label: "Altas", icon: "group_add", href: "/admin/operaciones" },
  { id: "incidentes", label: "Incidentes", icon: "warning", href: "/admin/incidentes" }
];

/** Navegación mínima para rol comité (solo lectura). */
export const committeeReaderNav: BottomNavItem[] = [{ id: "bitacora", label: "Bitácora", icon: "history", href: "/admin/bitacora" }];
