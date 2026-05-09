/* empty css                                       */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_s_qG7lfK.mjs';
import 'piccolore';
import { $ as $$MainLayout } from '../../chunks/MainLayout_ZbZW5qyW.mjs';
import { g as getBitacoraByComplejo } from '../../chunks/access_C5HYczi0.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://naukanayarit.local");
const $$Bitacora = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Bitacora;
  const complejoId = Astro2.url.searchParams.get("complejo_id") ?? "complejo-1";
  const search = Astro2.url.searchParams.get("q") ?? "";
  const registros = await getBitacoraByComplejo(complejoId, search);
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Bit\xE1cora de accesos" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="lens-section rounded-2xl p-5"> <form class="grid gap-3 sm:grid-cols-3"> <label class="flex flex-col gap-1 text-sm font-semibold">
Complejo
<select name="complejo_id" class="rounded-xl bg-white px-3 py-3 text-base font-medium"> <option value="complejo-1"${addAttribute(complejoId === "complejo-1", "selected")}>Complejo 1</option> <option value="complejo-2"${addAttribute(complejoId === "complejo-2", "selected")}>Complejo 2</option> <option value="complejo-3"${addAttribute(complejoId === "complejo-3", "selected")}>Complejo 3</option> </select> </label> <label class="flex flex-col gap-1 text-sm font-semibold sm:col-span-2">
Buscar por visitante o resultado
<input type="search" name="q"${addAttribute(search, "value")} class="rounded-xl bg-white px-3 py-3 text-base font-medium" placeholder="Ej. Autorizado"> </label> <button class="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white sm:w-auto">
Aplicar filtros
</button> </form> </section> <section class="mt-5 lens-section-muted rounded-2xl p-4"> <ul class="space-y-3"> ${registros.map((row) => renderTemplate`<li class="rounded-2xl bg-white px-4 py-4"> <p class="text-lg font-bold">${row.visitante_nombre}</p> <p class="text-sm font-semibold sunlight-subtext"> ${new Date(row.created_at).toLocaleString("es-MX")} - ${row.origen} </p> <p class="mt-1 text-base font-bold">${row.resultado}</p> </li>`)} </ul> </section> ` })}`;
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
