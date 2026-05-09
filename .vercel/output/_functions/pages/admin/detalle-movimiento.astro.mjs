/* empty css                                       */
import { f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Dea09CxC.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_CJaypjtX.mjs';
export { renderers } from '../../renderers.mjs';

const $$DetalleMovimiento = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Detalle de Movimiento - Nauka Nayarit", "topBar": { title: "Nauka Nayarit", leftIcon: "arrow_back", leftHref: "/admin/bitacora", rightIcon: "more_vert", rightHref: "#" } }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="mb-5 flex items-center gap-2 text-[#006d36]"> <span class="material-symbols-outlined">check_circle</span> <span class="text-xs font-bold uppercase tracking-[0.08em]">Acceso completado</span> </div> <h1 class="text-6xl font-extrabold tracking-[-0.02em] text-[#213138]">Carlos Ruiz</h1> <p class="mt-2 text-3xl text-[#43474a]">Visita de Mantenimiento</p> <section class="mt-6 space-y-4"> <article class="rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.05)]"> <h2 class="mb-4 text-3xl font-semibold text-[#213138]">Registro de Tiempo</h2> <div class="grid grid-cols-2 gap-3"> <div> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Hora de Entrada</p> <p class="mt-1 text-5xl font-bold text-[#213138]">14:30</p> <p class="text-sm text-[#5f6368]">Puerta Principal</p> </div> <div> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Hora de Salida</p> <p class="mt-1 text-5xl font-bold text-[#213138]">18:45</p> <p class="text-sm text-[#5f6368]">Puerta de Servicio</p> </div> </div> <div class="mt-4 flex items-center justify-between border-t border-[#eeeeee] pt-4"> <p class="text-sm text-[#5f6368]">Duracion total de estancia</p> <p class="text-sm font-semibold text-[#213138]">4h 15m</p> </div> </article> <article class="rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.05)]"> <h2 class="mb-4 text-3xl font-semibold text-[#213138]">Autorizacion</h2> <div class="flex items-center gap-3"> <div class="grid h-12 w-12 place-items-center rounded-full bg-[#eeeeee] text-[#5f6368]"> <span class="material-symbols-outlined">person</span> </div> <div> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Autorizado por</p> <p class="text-2xl font-semibold text-[#213138]">Juan Perez</p> <p class="text-sm text-[#5f6368]">Residente - Lote 42</p> </div> </div> <div class="mt-4 rounded-xl bg-[#f3f3f4] p-3"> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Metodo de verificacion</p> <p class="mt-1 text-base font-semibold text-[#213138]">Codigo QR unico</p> </div> </article> <article class="rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.05)]"> <h2 class="mb-4 text-3xl font-semibold text-[#213138]">Detalles de Identificacion</h2> <div class="space-y-3"> <p><span class="block text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Documento presentado</span><span class="text-lg font-semibold text-[#213138]">INE</span></p> <p><span class="block text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Placas de vehiculo</span><span class="text-lg font-semibold text-[#213138]">XYA-123-B</span></p> <p><span class="block text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Empresa</span><span class="text-lg font-semibold text-[#213138]">Mantenimiento Global S.A.</span></p> </div> </article> </section> <div class="mt-6 space-y-3"> <button class="h-12 w-full rounded-xl bg-[#e8e8e8] text-lg font-semibold text-[#213138]">Imprimir Registro</button> <button class="h-12 w-full rounded-xl bg-gradient-to-b from-[#213138] to-[#37474f] text-lg font-semibold text-white">Reportar Incidencia</button> </div> ` })}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/detalle-movimiento.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/detalle-movimiento.astro";
const $$url = "/admin/detalle-movimiento";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$DetalleMovimiento,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
