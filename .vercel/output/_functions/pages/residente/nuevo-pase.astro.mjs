/* empty css                                       */
import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_s_qG7lfK.mjs';
import 'piccolore';
import { $ as $$MainLayout } from '../../chunks/MainLayout_DpKp_i0Q.mjs';
import { c as createVisitorPass } from '../../chunks/access_C5HYczi0.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://naukanayarit.local");
const $$NuevoPase = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$NuevoPase;
  const complejoId = Astro2.url.searchParams.get("complejo_id") ?? "complejo-1";
  let qrToken = "";
  let shareText = "";
  let errorMessage = "";
  if (Astro2.request.method === "POST") {
    const formData = await Astro2.request.formData();
    const visitanteNombre = String(formData.get("visitante_nombre") ?? "");
    const anfitrionNombre = String(formData.get("anfitrion_nombre") ?? "");
    const venceEn = String(formData.get("vence_en") ?? "");
    const telefonoDestino = String(formData.get("telefono_destino") ?? "");
    const complejo = String(formData.get("complejo_id") ?? complejoId);
    try {
      qrToken = await createVisitorPass({
        complejoId: complejo,
        visitanteNombre,
        anfitrionNombre,
        venceEn,
        telefonoDestino
      });
      const passUrl = `${Astro2.url.origin}/guardia/escaner?complejo_id=${encodeURIComponent(complejo)}&token=${encodeURIComponent(qrToken)}`;
      shareText = `Pase de acceso Nauka Nayarit
Visitante: ${visitanteNombre}
QR: ${passUrl}`;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "No se pudo crear el pase.";
    }
  }
  return renderTemplate(_a || (_a = __template(["", ' <script>\n  const shareButton = document.getElementById("share-whatsapp");\n  if (shareButton) {\n    shareButton.addEventListener("click", async () => {\n      const text = shareButton.getAttribute("data-share-text") ?? "";\n      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);\n\n      if (navigator.share && isMobile) {\n        try {\n          await navigator.share({\n            title: "Pase Nauka Nayarit",\n            text\n          });\n          return;\n        } catch {\n          // Continue to fallback when user cancels or platform fails.\n        }\n      }\n\n      const encoded = encodeURIComponent(text);\n      window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");\n    });\n  }\n<\/script>'], ["", ' <script>\n  const shareButton = document.getElementById("share-whatsapp");\n  if (shareButton) {\n    shareButton.addEventListener("click", async () => {\n      const text = shareButton.getAttribute("data-share-text") ?? "";\n      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);\n\n      if (navigator.share && isMobile) {\n        try {\n          await navigator.share({\n            title: "Pase Nauka Nayarit",\n            text\n          });\n          return;\n        } catch {\n          // Continue to fallback when user cancels or platform fails.\n        }\n      }\n\n      const encoded = encodeURIComponent(text);\n      window.open(\\`https://wa.me/?text=\\${encoded}\\`, "_blank", "noopener,noreferrer");\n    });\n  }\n<\/script>'])), renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Nuevo pase de visitante" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="lens-section rounded-2xl p-5"> <form method="POST" class="grid gap-3"> <input type="hidden" name="complejo_id"${addAttribute(complejoId, "value")}> <label class="flex flex-col gap-1 text-sm font-semibold">
Nombre del visitante
<input required name="visitante_nombre" class="rounded-xl bg-white px-3 py-3 text-base font-medium"> </label> <label class="flex flex-col gap-1 text-sm font-semibold">
Nombre del residente/anfitrión
<input required name="anfitrion_nombre" class="rounded-xl bg-white px-3 py-3 text-base font-medium"> </label> <label class="flex flex-col gap-1 text-sm font-semibold">
Vence en
<input required type="datetime-local" name="vence_en" class="rounded-xl bg-white px-3 py-3 text-base font-medium"> </label> <label class="flex flex-col gap-1 text-sm font-semibold">
Teléfono de WhatsApp
<input required name="telefono_destino" class="rounded-xl bg-white px-3 py-3 text-base font-medium"> </label> <button class="rounded-xl bg-slate-900 px-4 py-3 text-base font-bold text-white">Generar pase</button> </form> </section> ${errorMessage && renderTemplate`<section class="mt-4 rounded-2xl bg-red-100 px-4 py-4 text-red-900"> <p class="text-base font-bold">${errorMessage}</p> </section>`}${qrToken && renderTemplate`<section class="mt-5 lens-section-muted rounded-2xl p-5"> <p class="text-sm font-semibold uppercase tracking-wide sunlight-subtext">Token QR generado</p> <p class="mt-2 break-all text-xl font-extrabold">${qrToken}</p> <button id="share-whatsapp" type="button"${addAttribute(shareText, "data-share-text")} class="mt-4 rounded-xl bg-emerald-700 px-4 py-3 text-base font-bold text-white">
Compartir por WhatsApp
</button> </section>`}` }));
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/nuevo-pase.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/nuevo-pase.astro";
const $$url = "/residente/nuevo-pase";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$NuevoPase,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
