/* empty css                                    */
import { f as createComponent, l as renderHead, h as addAttribute, r as renderTemplate } from '../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import 'clsx';
/* empty css                                    */
import { l as loginBackground } from '../chunks/491461670_17919450432084004_8291959886084544470_n_CWABb-a5.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="es-MX"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="theme-color" content="#0f1f2a"><title>Iniciar Sesion - Nauka Nayarit</title>${renderHead()}</head> <body class="min-h-screen bg-slate-950 text-slate-100"> <main class="relative mx-auto flex min-h-[100dvh] w-full max-w-[430px] items-center justify-center overflow-hidden p-5"> <div class="absolute inset-0 bg-cover bg-center bg-no-repeat"${addAttribute(`background-image: url(${loginBackground.src});`, "style")}></div> <div class="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"></div> <section class="relative z-10 w-full space-y-8 rounded-[32px] border border-white/20 bg-white/10 px-6 py-8 shadow-[0_28px_56px_rgba(2,8,20,0.48)] backdrop-blur-sm"> <header class="text-center"> <p class="text-[2rem] font-extrabold tracking-[0.22em] text-emerald-400">NAUKA NAYARIT</p> <p class="mt-1 text-lg font-medium tracking-wide text-white/90">Acceso a Residentes</p> </header> <form class="space-y-5 rounded-[22px] bg-white px-5 py-6 text-slate-800 shadow-xl" method="post" action="/api/auth/login"> <h1 class="text-4xl font-semibold tracking-tight">Iniciar Sesion</h1> <div class="space-y-2"> <label class="block text-sm font-semibold uppercase tracking-[0.08em] text-slate-700" for="identity">
Correo o telefono
</label> <input id="email" name="email" type="email" autocomplete="email" placeholder="tu@correo.com" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"> </div> <div class="space-y-2"> <div class="flex items-center justify-between gap-3"> <label class="block text-sm font-semibold uppercase tracking-[0.08em] text-slate-700" for="password">
Contrasena
</label> <a href="#" class="text-sm font-semibold text-slate-500 transition hover:text-slate-700">Olvide mi contrasena</a> </div> <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"> </div> <button type="submit" class="mt-1 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 text-base font-bold uppercase tracking-[0.16em] text-white transition hover:brightness-110">
Ingresar →
</button> <p class="pt-4 text-center text-base text-slate-500">
¿No tienes acceso?
<a href="/registro" class="font-semibold text-emerald-700 transition hover:text-emerald-800">Solicitar cuenta</a> </p> </form> <p class="text-center text-sm font-medium uppercase tracking-[0.15em] text-white/70">Portal de acceso seguro</p> </section> </main> </body></html>`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/index.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
