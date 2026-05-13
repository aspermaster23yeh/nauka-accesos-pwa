/** Textos coherentes para flujos de pase y onboarding (evita duplicar copy en vistas). */
export const passMessages = {
  validationNameDate: "Completa nombre del visitante, fecha y hora de visita.",
  validationPhotos: "Adjunta la foto del rostro del visitante y la foto legible del INE.",
  validationFuture: "La fecha y hora del pase deben ser futuras.",
  validationMax30: "La visita no puede programarse a más de 30 días.",
  createErrorGeneric: "No se pudo crear el pase. Revisa la conexión e inténtalo de nuevo.",
  createErrorNoToken: "El servidor no devolvió el código del pase. Contacta a soporte.",
  termsRequired: "Debes aceptar los términos para continuar.",
  termsSaveError: "No se pudo guardar la aceptación. Intenta de nuevo.",
  networkError: "Sin conexión o el servidor no respondió. Comprueba tu red e inténtalo de nuevo."
} as const;

export function supportMailto(subject = "Nauka Accesos"): string {
  const email = import.meta.env.PUBLIC_SUPPORT_EMAIL ?? "";
  if (!email) return "#";
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
}
