/* empty css                                       */
import { f as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BoRoxKkH.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$PaseDemo = createComponent(async ($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", ' <script>\n  const params = new URLSearchParams(window.location.search);\n  const code = params.get("code") || "NK-DEMO01";\n  const state = params.get("state") === "invalid" ? "invalid" : "valid";\n  const type = params.get("type") === "salida" ? "salida" : "entrada";\n  const guardUrl = `${window.location.origin}/guardia/escaner?state=${state}&type=${type}&code=${encodeURIComponent(code)}`;\n  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=${encodeURIComponent(guardUrl)}`;\n\n  const qrImage = document.getElementById("qr-image");\n  const passMeta = document.getElementById("pass-meta");\n  const guardLink = document.getElementById("guard-link");\n  const passFolio = document.getElementById("pass-folio");\n  const passExpiry = document.getElementById("pass-expiry");\n  const passWatermark = document.getElementById("pass-watermark");\n  const shareImageButton = document.getElementById("share-image");\n  const downloadPdfButton = document.getElementById("download-pdf");\n  const expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000);\n  const folio = `NAU-${code.replace("NK-", "")}-${new Date().getFullYear()}`;\n\n  if (qrImage instanceof HTMLImageElement) qrImage.src = qrUrl;\n  if (passMeta) passMeta.textContent = `Codigo: ${code} \xB7 Estado: ${state} \xB7 Tipo: ${type}`;\n  if (guardLink) guardLink.textContent = guardUrl;\n  if (passFolio) passFolio.textContent = `Folio: ${folio}`;\n  if (passExpiry) passExpiry.textContent = expiryDate.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });\n  if (passWatermark) {\n    if (state === "valid") {\n      passWatermark.textContent = "VALIDO";\n      passWatermark.className =\n        "pointer-events-none absolute right-[-34px] top-10 rotate-[28deg] rounded-lg border-2 border-[#006d36] bg-[#83fba5]/30 px-7 py-2 text-lg font-extrabold uppercase tracking-[0.08em] text-[#006d36]";\n    } else {\n      passWatermark.textContent = "INVALIDO";\n      passWatermark.className =\n        "pointer-events-none absolute right-[-38px] top-10 rotate-[28deg] rounded-lg border-2 border-[#93000a] bg-[#ffdad6] px-7 py-2 text-lg font-extrabold uppercase tracking-[0.08em] text-[#93000a]";\n    }\n  }\n\n  const fetchQrFile = async () => {\n    const response = await fetch(qrUrl);\n    const blob = await response.blob();\n    return new File([blob], `pase-${code}.png`, { type: "image/png" });\n  };\n\n  shareImageButton?.addEventListener("click", async () => {\n    try {\n      const file = await fetchQrFile();\n      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {\n        await navigator.share({\n          title: "Pase Nauka Nayarit",\n          text: `Pase ${code}`,\n          files: [file]\n        });\n        return;\n      }\n    } catch {\n      // fall through to text-only WhatsApp link\n    }\n    const text = `Pase Nauka Nayarit%0ACodigo: ${encodeURIComponent(code)}%0AValidar: ${encodeURIComponent(guardUrl)}`;\n    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");\n  });\n\n  downloadPdfButton?.addEventListener("click", () => {\n    window.print();\n  });\n<\/script>'], ["", ' <script>\n  const params = new URLSearchParams(window.location.search);\n  const code = params.get("code") || "NK-DEMO01";\n  const state = params.get("state") === "invalid" ? "invalid" : "valid";\n  const type = params.get("type") === "salida" ? "salida" : "entrada";\n  const guardUrl = \\`\\${window.location.origin}/guardia/escaner?state=\\${state}&type=\\${type}&code=\\${encodeURIComponent(code)}\\`;\n  const qrUrl = \\`https://api.qrserver.com/v1/create-qr-code/?size=520x520&data=\\${encodeURIComponent(guardUrl)}\\`;\n\n  const qrImage = document.getElementById("qr-image");\n  const passMeta = document.getElementById("pass-meta");\n  const guardLink = document.getElementById("guard-link");\n  const passFolio = document.getElementById("pass-folio");\n  const passExpiry = document.getElementById("pass-expiry");\n  const passWatermark = document.getElementById("pass-watermark");\n  const shareImageButton = document.getElementById("share-image");\n  const downloadPdfButton = document.getElementById("download-pdf");\n  const expiryDate = new Date(Date.now() + 4 * 60 * 60 * 1000);\n  const folio = \\`NAU-\\${code.replace("NK-", "")}-\\${new Date().getFullYear()}\\`;\n\n  if (qrImage instanceof HTMLImageElement) qrImage.src = qrUrl;\n  if (passMeta) passMeta.textContent = \\`Codigo: \\${code} \xB7 Estado: \\${state} \xB7 Tipo: \\${type}\\`;\n  if (guardLink) guardLink.textContent = guardUrl;\n  if (passFolio) passFolio.textContent = \\`Folio: \\${folio}\\`;\n  if (passExpiry) passExpiry.textContent = expiryDate.toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });\n  if (passWatermark) {\n    if (state === "valid") {\n      passWatermark.textContent = "VALIDO";\n      passWatermark.className =\n        "pointer-events-none absolute right-[-34px] top-10 rotate-[28deg] rounded-lg border-2 border-[#006d36] bg-[#83fba5]/30 px-7 py-2 text-lg font-extrabold uppercase tracking-[0.08em] text-[#006d36]";\n    } else {\n      passWatermark.textContent = "INVALIDO";\n      passWatermark.className =\n        "pointer-events-none absolute right-[-38px] top-10 rotate-[28deg] rounded-lg border-2 border-[#93000a] bg-[#ffdad6] px-7 py-2 text-lg font-extrabold uppercase tracking-[0.08em] text-[#93000a]";\n    }\n  }\n\n  const fetchQrFile = async () => {\n    const response = await fetch(qrUrl);\n    const blob = await response.blob();\n    return new File([blob], \\`pase-\\${code}.png\\`, { type: "image/png" });\n  };\n\n  shareImageButton?.addEventListener("click", async () => {\n    try {\n      const file = await fetchQrFile();\n      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {\n        await navigator.share({\n          title: "Pase Nauka Nayarit",\n          text: \\`Pase \\${code}\\`,\n          files: [file]\n        });\n        return;\n      }\n    } catch {\n      // fall through to text-only WhatsApp link\n    }\n    const text = \\`Pase Nauka Nayarit%0ACodigo: \\${encodeURIComponent(code)}%0AValidar: \\${encodeURIComponent(guardUrl)}\\`;\n    window.open(\\`https://wa.me/?text=\\${text}\\`, "_blank", "noopener,noreferrer");\n  });\n\n  downloadPdfButton?.addEventListener("click", () => {\n    window.print();\n  });\n<\/script>'])), renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Pase Demo - Nauka Nayarit", "topBar": { title: "Pase generado", leftIcon: "arrow_back", leftHref: "/residente/nuevo-pase" } }, { "default": async ($$result2) => renderTemplate` <style>
    @media print {
      body {
        background: #ffffff !important;
      }
      header,
      nav,
      #share-image,
      #download-pdf {
        display: none !important;
      }
      #printable-pass {
        box-shadow: none !important;
        border: 1px solid #d9d9d9 !important;
      }
      #guard-link {
        color: #334155 !important;
      }
      #pass-watermark {
        opacity: 0.22 !important;
      }
    }
  </style> ${maybeRenderHead()}<section id="printable-pass" class="relative overflow-hidden rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.06)]"> <div id="pass-watermark" class="pointer-events-none absolute right-[-34px] top-10 rotate-[28deg] rounded-lg border-2 px-7 py-2 text-lg font-extrabold uppercase tracking-[0.08em]">
--
</div> <div class="mb-4 flex items-center justify-between"> <div class="flex items-center gap-3"> <div class="grid h-12 w-12 place-items-center rounded-full bg-[#213138] text-white"> <span class="material-symbols-outlined">shield</span> </div> <div> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#64748b]">Control de accesos</p> <h1 class="text-2xl font-extrabold tracking-tight text-[#213138]">Nauka Nayarit</h1> </div> </div> <p id="pass-folio" class="rounded-lg bg-[#eeeeee] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-[#213138]">Folio: --</p> </div> <h2 class="text-3xl font-extrabold tracking-tight text-[#213138]">Pase digital para caseta</h2> <p id="pass-meta" class="mt-1 text-sm text-[#5f6368]">Codigo: --</p> <div class="mt-5 rounded-xl bg-[#eeeeee] p-5 text-center"> <img id="qr-image" alt="QR de pase" class="mx-auto h-56 w-56 rounded-xl bg-white p-2 shadow-sm"> <div class="mt-4 grid grid-cols-2 gap-2 text-left"> <div class="rounded-lg bg-white p-3"> <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Expira</p> <p id="pass-expiry" class="text-sm font-semibold text-[#213138]">--</p> </div> <div class="rounded-lg bg-white p-3"> <p class="text-[11px] font-bold uppercase tracking-[0.08em] text-[#64748b]">Firma visual</p> <p class="text-sm font-semibold text-[#213138]">Nauka Secure Pass</p> </div> </div> <p id="guard-link" class="mt-3 break-all text-xs font-semibold text-[#37474f]"></p> </div> <div class="mt-4 space-y-3"> <button id="share-image" type="button" class="h-12 w-full rounded-xl bg-[#25D366]/15 text-base font-semibold text-[#005227]">
Compartir imagen (WhatsApp)
</button> <button id="download-pdf" type="button" class="h-12 w-full rounded-xl bg-gradient-to-b from-[#213138] to-[#37474f] text-base font-semibold text-white">
Descargar PDF
</button> </div> </section> ` }));
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/pase-demo.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/pase-demo.astro";
const $$url = "/residente/pase-demo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$PaseDemo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
