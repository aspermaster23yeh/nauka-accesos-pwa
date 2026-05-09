# Nauka Nayarit - PWA Control de Accesos

Proyecto Astro SSR con Supabase para administrar pases, escaneo QR y bitácora por `complejo_id`.

## Estructura

- `src/layouts/MainLayout.astro`: layout base con estilo "Architectural Lens".
- `src/components/AccessCard.astro`: tarjeta de autorización/denegación.
- `src/components/StatusChip.astro`: chip de estado de acceso.
- `src/components/ScannerIsland.astro`: escáner QR de cámara en cliente.
- `src/pages/admin/bitacora.astro`: bitácora con filtros.
- `src/pages/residente/nuevo-pase.astro`: creación de pase y compartir por WhatsApp.
- `src/pages/guardia/escaner.astro`: interfaz principal del guardia.
- `src/pages/api/validar-qr.ts`: validación de QR contra Supabase.

## Variables de entorno

Copiar `.env.example` como `.env` y definir:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

## Reglas UX/UI aplicadas (lectura bajo sol)

1. Contraste alto de texto principal sobre fondos claros.
2. Tipografía Inter en pesos altos para etiquetas críticas.
3. Mensajes de estado grandes y directos.
4. Pantalla roja de impacto para denegaciones.
5. Secciones separadas por tono de fondo, sin bordes de 1px.
6. Botones grandes para toque rápido.
7. Jerarquía visual clara (título, estado, detalle).
8. Mensajes de error explícitos y accionables.
9. Flujo de escaneo centrado en una sola acción.
10. Feedback inmediato tras lectura de QR.
