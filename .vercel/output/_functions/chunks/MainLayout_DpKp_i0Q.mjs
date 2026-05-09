import { e as createAstro, f as createComponent, n as renderHead, o as renderSlot, r as renderTemplate } from './astro/server_s_qG7lfK.mjs';
import 'piccolore';
import 'clsx';
/* empty css                            */

const $$Astro = createAstro("https://naukanayarit.local");
const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MainLayout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es-MX"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="theme-color" content="#FFFFFF"><meta name="description" content="PWA de control de accesos para Nauka Nayarit."><link rel="manifest" href="/manifest.webmanifest"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body class="min-h-screen bg-white sunlight-text"> <main class="mx-auto max-w-5xl px-4 py-6 sm:px-8"> <header class="mb-6 lens-section rounded-2xl px-5 py-4"> <p class="sunlight-subtext text-sm font-semibold uppercase tracking-wide">Nauka Nayarit</p> <h1 class="text-2xl font-extrabold sm:text-3xl">${title}</h1> </header> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $ };
