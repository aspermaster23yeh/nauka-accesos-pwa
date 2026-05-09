/* empty css                                       */
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BoRoxKkH.mjs';
import { l as loginBackground } from '../../chunks/491461670_17919450432084004_8291959886084544470_n_CWABb-a5.mjs';
export { renderers } from '../../renderers.mjs';

const $$AccesoDenegado = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Acceso Denegado - Nauka Nayarit", "bodyClass": "bg-[#2f3131] text-[#1a1c1c]" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="fixed inset-0 z-0"> <img${addAttribute(loginBackground.src, "src")} alt="fondo" class="h-full w-full object-cover blur-md brightness-50"> <div class="absolute inset-0 bg-[#ba1a1a]/20"></div> </section> <div class="relative z-10 flex min-h-[82vh] items-center"> <section class="w-full rounded-[14px] border-2 border-[#ba1a1a]/20 bg-white p-6 text-center shadow-[0_0_40px_rgba(186,26,26,0.16)]"> <div class="mx-auto mb-5 grid h-24 w-24 place-items-center rounded-full bg-[#ffdad6] text-[#93000a]"> <span class="material-symbols-outlined text-5xl">warning</span> </div> <h1 class="text-6xl font-extrabold uppercase tracking-tight text-[#ba1a1a]">Acceso no autorizado</h1> <p class="mt-3 text-lg font-bold uppercase tracking-[0.08em] text-[#5f6368]">Razon: Codigo expirado</p> <div class="mt-6 space-y-3"> <a href="/guardia/escaner" class="flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#213138] to-[#37474f] text-2xl font-semibold text-white">
Escanear Nuevo Codigo
</a> <button class="h-14 w-full rounded-xl bg-[#e8e8e8] text-2xl font-semibold text-[#213138]">Reportar Incidente</button> </div> </section> </div> ` })}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/guardia/acceso-denegado.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/guardia/acceso-denegado.astro";
const $$url = "/guardia/acceso-denegado";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$AccesoDenegado,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
