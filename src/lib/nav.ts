import type { BottomNavItem } from "../components/app/BottomNav.astro";

export const solicitanteNav: BottomNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/solicitante/inicio" },
  { id: "nuevo-pase", label: "Nuevo Pase", icon: "add_card", href: "/solicitante/nuevo-pase" },
  { id: "activos", label: "Activos", icon: "qr_code_2", href: "/solicitante/inicio#pases-activos" }
];

export const guardNav: BottomNavItem[] = [
  { id: "seguridad", label: "Seguridad", icon: "shield", href: "/guardia/escaner" },
  { id: "rechazados", label: "Rechazados", icon: "gpp_bad", href: "/guardia/acceso-denegado" }
];

export const adminNav: BottomNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "monitoring", href: "/admin/dashboard" },
  { id: "bitacora", label: "Bitacora", icon: "history", href: "/admin/bitacora" },
  { id: "incidentes", label: "Incidentes", icon: "warning", href: "/admin/dashboard#incidentes" }
];

export const superAdminNav: BottomNavItem[] = [
  { id: "usuarios", label: "Usuarios", icon: "group", href: "/super-admin/dashboard" },
  { id: "bitacora", label: "Bitácora", icon: "history", href: "/super-admin/bitacora" }
];
