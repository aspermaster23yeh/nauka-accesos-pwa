/* empty css                                       */
import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, l as renderScript, r as renderTemplate, k as renderComponent } from '../../chunks/astro/server_s_qG7lfK.mjs';
import 'piccolore';
import { $ as $$MainLayout } from '../../chunks/MainLayout_DpKp_i0Q.mjs';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro("https://naukanayarit.local");
const $$ScannerIsland = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ScannerIsland;
  const { complejoId } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<section class="space-y-4"${addAttribute(complejoId, "data-complejo-id")}> <div class="lens-section rounded-2xl p-4"> <p class="text-sm font-semibold uppercase tracking-wide sunlight-subtext">Complejo activo</p> <p class="text-xl font-bold">${complejoId}</p> </div> <video id="scanner-video" class="w-full rounded-3xl bg-slate-900" playsinline muted></video> <div id="scanner-result" class="lens-section-muted rounded-2xl p-5"> <p class="text-lg font-semibold">Apunta la cámara al QR del visitante.</p> </div> </section> ${renderScript($$result, "/Users/aspermaster23/nauka-accesos-pwa/src/components/ScannerIsland.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/components/ScannerIsland.astro", void 0);

const $$Astro = createAstro("https://naukanayarit.local");
const $$Escaner = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Escaner;
  const complejoId = Astro2.url.searchParams.get("complejo_id") ?? "complejo-1";
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Esc\xE1ner de accesos" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="lens-section rounded-2xl p-5"> <p class="text-lg font-semibold">
Mantén brillo alto en pantalla y alinea el QR al centro. El contraste está optimizado para lectura bajo sol.
</p> </section> <section class="mt-4"> ${renderComponent($$result2, "ScannerIsland", $$ScannerIsland, { "complejoId": complejoId })} </section> ` })}`;
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
