/* empty css                                       */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BoRoxKkH.mjs';
import { a as adminNav } from '../../chunks/nav_DLwwW0lq.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://naukanayarit.local");
const $$Bitacora = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Bitacora;
  return renderTemplate`const q = Astro.url.searchParams.get("q") ?? "";
const complejoId = Astro.locals.profile?.complejo_id ?? "complejo-1";
const registros = await getBitacoraByComplejo(complejoId, q, Astro.locals.accessToken ?? undefined);
${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Bitacora - Nauka Nayarit", "topBar": { title: "Nauka Nayarit", leftIcon: "person", leftHref: "#", rightIcon: "notifications", rightHref: "#" }, "navItems": adminNav, "pageTitle": "Registro Digital" }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<p class="-mt-5 mb-6 text-sm font-bold uppercase tracking-[0.08em] text-[#7a7e82]">Bitacora de Accesos · Octubre 24, 2023</p><form class="space-y-3" method="get"><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#73787b]">search</span><input name="q"${addAttribute(q, "value")} class="h-12 w-full rounded-xl bg-[#f3f3f4] pl-11 pr-4 text-base outline-none" placeholder="Buscar por nombre, lote o vehiculo..."></div><button type="submit" class="flex h-12 w-full items-center gap-2 rounded-xl bg-[#f3f3f4] px-4 text-base font-semibold text-[#213138]"><span class="material-symbols-outlined text-lg">filter_list</span>
Filtros
</button></form><div class="my-5 flex items-center gap-3"><p class="text-xs font-bold uppercase tracking-[0.08em] text-[#7a7e82]">Hoy</p><div class="h-px flex-1 bg-[#eeeeee]"></div></div><div class="space-y-3">${registros.map((row) => renderTemplate`<a${addAttribute(`/admin/detalle-movimiento?id=${row.id}`, "href")}${addAttribute(`flex items-center gap-3 rounded-xl p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)] ${row.resultado === "rechazado" ? "bg-[#ffdad6]/35" : "bg-white"}`, "class")}><div${addAttribute(`grid h-11 w-11 place-items-center rounded-full ${row.resultado === "rechazado" ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#83fba5]/25 text-[#006d36]"}`, "class")}><span class="material-symbols-outlined">${row.resultado === "rechazado" ? "warning" : "login"}</span></div><div><p${addAttribute(`text-lg font-semibold ${row.resultado === "rechazado" ? "text-[#93000a]" : "text-[#213138]"}`, "class")}>${new Date(row.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}${row.visitante_nombre ?? "Sin nombre"}</p><p${addAttribute(`text-sm ${row.resultado === "rechazado" ? "text-[#93000a]" : "text-[#5f6368]"}`, "class")}>${(row.tipo_evento ?? "movimiento").toUpperCase()} · ${row.lote_number ?? "Sin lote"}${row.razon ? `\xB7 ${row.razon}` : ""}</p></div></a>`)}</div>` })}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/bitacora.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/bitacora.astro";
const $$url = "/admin/bitacora";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Bitacora,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
