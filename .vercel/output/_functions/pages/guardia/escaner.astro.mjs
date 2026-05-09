/* empty css                                       */
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_Dea09CxC.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_CJaypjtX.mjs';
import { g as guardNav } from '../../chunks/nav_kopBlL7J.mjs';
import { l as loginBackground } from '../../chunks/491461670_17919450432084004_8291959886084544470_n_CWABb-a5.mjs';
export { renderers } from '../../renderers.mjs';

const $$Escaner = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Escaner Guardia - Nauka Nayarit", "topBar": { title: "Nauka Nayarit", leftIcon: "person", leftHref: "#", rightIcon: "notifications", rightHref: "#" }, "navItems": guardNav, "activeNav": "seguridad" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="relative -mx-4 -mt-6 mb-6 h-[45vh] overflow-hidden bg-[#2f3131]"> <img${addAttribute(loginBackground.src, "src")} alt="camera bg" class="h-full w-full object-cover blur-sm brightness-75"> <div class="absolute inset-0 grid place-items-center"> <div class="relative h-64 w-64"> <div class="absolute left-0 top-0 h-12 w-12 rounded-tl-lg border-l-4 border-t-4 border-white/85"></div> <div class="absolute right-0 top-0 h-12 w-12 rounded-tr-lg border-r-4 border-t-4 border-white/85"></div> <div class="absolute bottom-0 left-0 h-12 w-12 rounded-bl-lg border-b-4 border-l-4 border-white/85"></div> <div class="absolute bottom-0 right-0 h-12 w-12 rounded-br-lg border-b-4 border-r-4 border-white/85"></div> <div class="absolute left-0 top-1/2 h-1 w-full bg-[#83fba5] shadow-[0_0_12px_2px_rgba(131,251,165,0.45)]"></div> </div> </div> </section> <section class="rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.06)]"> <div class="mb-5 flex items-center gap-2 rounded-xl bg-[#83fba5]/20 p-3 text-[#006d36]"> <span class="material-symbols-outlined">check_circle</span> <h2 class="text-5xl font-bold tracking-[-0.01em]">Visitante Autorizado</h2> </div> <p class="text-sm font-bold uppercase tracking-[0.08em] text-[#5f6368]">Nombre</p> <p class="mt-1 text-5xl font-semibold text-[#213138]">Juan Perez</p> <hr class="my-4 border-[#eeeeee]"> <p class="text-sm font-bold uppercase tracking-[0.08em] text-[#5f6368]">Destino</p> <p class="mt-1 text-6xl font-extrabold tracking-[-0.02em] text-[#213138]">Lote A-22</p> <a href="/admin/detalle-movimiento" class="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#006d36] to-[#005227] text-2xl font-semibold text-white"> <span class="material-symbols-outlined">login</span>
Registrar entrada
</a> </section> ` })}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/guardia/escaner.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/guardia/escaner.astro";
const $$url = "/guardia/escaner";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Escaner,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
