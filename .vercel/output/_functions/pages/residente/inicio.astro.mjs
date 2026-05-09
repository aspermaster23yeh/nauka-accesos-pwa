/* empty css                                       */
import { e as createAstro, f as createComponent, r as renderTemplate, k as renderComponent, m as maybeRenderHead, h as addAttribute } from '../../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BoRoxKkH.mjs';
import { r as residentNav } from '../../chunks/nav_DLwwW0lq.mjs';
import { b as getActivePassesForResident } from '../../chunks/access_DF6pBMVW.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://naukanayarit.local");
const $$Inicio = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Inicio;
  const ctx = {
    accessToken: Astro2.locals.accessToken,
    userId: Astro2.locals.user.id,
    complejoId: Astro2.locals.profile?.complejo_id ?? "complejo-1",
    lotNumber: Astro2.locals.profile?.lot_number
  };
  const activePasses = await getActivePassesForResident(ctx);
  const lotTitle = Astro2.locals.profile?.lot_number ?? "A-22";
  return renderTemplate(_a || (_a = __template(["", ' <script>\n  const filterButtons = Array.from(document.querySelectorAll(".pass-filter"));\n  const passCards = Array.from(document.querySelectorAll("[data-pass-type]"));\n  let activeFilter = "todos";\n\n  const renderFilter = () => {\n    filterButtons.forEach((button) => {\n      const selected = button.getAttribute("data-pass-filter") === activeFilter;\n      button.className = `pass-filter h-10 rounded-lg text-sm font-semibold uppercase tracking-[0.08em] ${\n        selected ? "bg-[#213138] text-white" : "bg-transparent text-[#213138]"\n      }`;\n    });\n\n    passCards.forEach((card) => {\n      const type = card.getAttribute("data-pass-type");\n      const visible = activeFilter === "todos" || activeFilter === type;\n      card.classList.toggle("hidden", !visible);\n    });\n  };\n\n  filterButtons.forEach((button) => {\n    button.addEventListener("click", () => {\n      activeFilter = button.getAttribute("data-pass-filter") ?? "todos";\n      renderFilter();\n    });\n  });\n\n  renderFilter();\n\n  Array.from(document.querySelectorAll(".share-pass")).forEach((button) => {\n    button.addEventListener("click", () => {\n      const token = button.getAttribute("data-share-token") ?? "";\n      const url = `${window.location.origin}/guardia/escaner?state=valid&type=entrada&code=${encodeURIComponent(token)}`;\n      const text = `Pase Nauka Nayarit%0AValida este QR en caseta:%0A${encodeURIComponent(url)}`;\n      window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");\n    });\n  });\n<\/script>'], ["", ' <script>\n  const filterButtons = Array.from(document.querySelectorAll(".pass-filter"));\n  const passCards = Array.from(document.querySelectorAll("[data-pass-type]"));\n  let activeFilter = "todos";\n\n  const renderFilter = () => {\n    filterButtons.forEach((button) => {\n      const selected = button.getAttribute("data-pass-filter") === activeFilter;\n      button.className = \\`pass-filter h-10 rounded-lg text-sm font-semibold uppercase tracking-[0.08em] \\${\n        selected ? "bg-[#213138] text-white" : "bg-transparent text-[#213138]"\n      }\\`;\n    });\n\n    passCards.forEach((card) => {\n      const type = card.getAttribute("data-pass-type");\n      const visible = activeFilter === "todos" || activeFilter === type;\n      card.classList.toggle("hidden", !visible);\n    });\n  };\n\n  filterButtons.forEach((button) => {\n    button.addEventListener("click", () => {\n      activeFilter = button.getAttribute("data-pass-filter") ?? "todos";\n      renderFilter();\n    });\n  });\n\n  renderFilter();\n\n  Array.from(document.querySelectorAll(".share-pass")).forEach((button) => {\n    button.addEventListener("click", () => {\n      const token = button.getAttribute("data-share-token") ?? "";\n      const url = \\`\\${window.location.origin}/guardia/escaner?state=valid&type=entrada&code=\\${encodeURIComponent(token)}\\`;\n      const text = \\`Pase Nauka Nayarit%0AValida este QR en caseta:%0A\\${encodeURIComponent(url)}\\`;\n      window.open(\\`https://wa.me/?text=\\${text}\\`, "_blank", "noopener,noreferrer");\n    });\n  });\n<\/script>'])), renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Inicio Residente - Nauka Nayarit", "topBar": { title: "Nauka Nayarit", leftIcon: "location_on", leftHref: "#", rightIcon: "person", rightHref: "#" }, "pageTitle": `Lote ${lotTitle}`, "navItems": residentNav }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<p class="-mt-5 mb-10 text-xs font-bold uppercase tracking-[0.08em] text-[#5f6368]">Panel de Residente</p> <a href="/residente/nuevo-pase" class="mb-10 flex h-24 w-full items-center justify-center gap-3 rounded-[14px] bg-gradient-to-b from-[#213138] to-[#37474f] px-5 text-3xl font-semibold text-white shadow-[0_14px_28px_rgba(26,28,28,0.18)]"> <span class="material-symbols-outlined text-4xl">add</span> <span class="text-3xl">Crear Nuevo Pase de Acceso</span> </a> <section class="space-y-4"> <h2 class="text-5xl font-bold tracking-[-0.02em] text-[#213138]">Pases Activos</h2> <div class="grid grid-cols-2 gap-2 rounded-xl bg-[#eeeeee] p-1"> <button data-pass-filter="todos" class="pass-filter h-10 rounded-lg bg-[#213138] text-sm font-semibold uppercase tracking-[0.08em] text-white">Todos</button> <button data-pass-filter="visita" class="pass-filter h-10 rounded-lg bg-transparent text-sm font-semibold uppercase tracking-[0.08em] text-[#213138]">Solo Visitas</button> </div> ${activePasses.map((pass) => renderTemplate`<article${addAttribute((pass.motivo ?? "visita").toLowerCase(), "data-pass-type")} class="relative rounded-[14px] bg-white p-5 shadow-[0_8px_24px_rgba(26,28,28,0.06)]"> <span class="absolute left-0 top-0 h-full w-1 rounded-l-[14px] bg-[#0a8d4f]"></span> <div class="flex items-start gap-4 pl-1"> <div class="grid h-12 w-12 place-items-center rounded-full bg-[#83fba5]/25 text-[#006d36]"> <span class="material-symbols-outlined">badge</span> </div> <div class="flex-1"> <p class="text-4xl font-semibold text-[#213138]">${pass.visitante_nombre}</p> <p class="mt-1 text-xl text-[#5f6368]"> ${new Date(pass.vence_en).toLocaleString("es-MX", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })} · ${(pass.motivo ?? "VISITA").toUpperCase()} </p> <div class="mt-4 flex gap-3"> <a${addAttribute(`/residente/pase-demo?code=${encodeURIComponent(pass.token_qr)}&state=valid&type=entrada`, "href")} class="flex-1 rounded-xl bg-[#eeeeee] px-4 py-3 text-center text-2xl font-semibold text-[#213138]">
Ver QR
</a> <button${addAttribute(pass.token_qr, "data-share-token")} class="share-pass grid w-12 place-items-center rounded-xl bg-[#25D366]/10 text-[#075E54]"> <span class="material-symbols-outlined">chat</span> </button> </div> </div> </div> </article>`)} </section> ` }));
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/inicio.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/residente/inicio.astro";
const $$url = "/residente/inicio";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Inicio,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
