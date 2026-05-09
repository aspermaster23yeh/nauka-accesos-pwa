const residentNav = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/residente/inicio" },
  { id: "scanner", label: "Scanner", icon: "qr_code_scanner", href: "/guardia/escaner" },
  { id: "logs", label: "Logs", icon: "history", href: "/admin/bitacora" },
  { id: "admin", label: "Admin", icon: "admin_panel_settings", href: "/admin/dashboard" }
];
const guardNav = [
  { id: "seguridad", label: "Seguridad", icon: "shield", href: "/guardia/escaner" },
  { id: "acceso", label: "Acceso", icon: "key", href: "/residente/nuevo-pase" },
  { id: "bitacora", label: "Bitacora", icon: "history", href: "/admin/bitacora" }
];
const adminNav = [
  { id: "dashboard", label: "Dashboard", icon: "monitoring", href: "/admin/dashboard" },
  { id: "bitacora", label: "Bitacora", icon: "history", href: "/admin/bitacora" },
  { id: "incidentes", label: "Incidentes", icon: "warning", href: "/admin/dashboard#incidentes" }
];

export { adminNav as a, guardNav as g, residentNav as r };
