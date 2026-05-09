import { e as createAstro, f as createComponent, m as maybeRenderHead, h as addAttribute, r as renderTemplate, l as renderHead, k as renderComponent, n as renderSlot } from './astro/server_Dea09CxC.mjs';
import 'piccolore';
/* empty css                            */
import 'clsx';

const $$Astro$2 = createAstro("https://naukanayarit.local");
const $$TopAppBar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$TopAppBar;
  const { title, leftIcon = "arrow_back", leftHref = "#", rightIcon, rightHref = "#" } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header class="sticky top-0 z-40 flex items-center justify-between border-b border-[#ececec] bg-white/90 px-4 py-3 backdrop-blur"> <a${addAttribute(leftHref, "href")} class="grid h-10 w-10 place-items-center rounded-full text-[#213138] transition hover:bg-[#eeeeee]"> <span class="material-symbols-outlined">${leftIcon}</span> </a> <h2 class="text-lg font-bold tracking-tight text-[#213138]">${title}</h2> ${rightIcon ? renderTemplate`<a${addAttribute(rightHref, "href")} class="grid h-10 w-10 place-items-center rounded-full text-[#213138] transition hover:bg-[#eeeeee]"> <span class="material-symbols-outlined">${rightIcon}</span> </a>` : renderTemplate`<span class="h-10 w-10"></span>`} </header>`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/components/app/TopAppBar.astro", void 0);

const $$Astro$1 = createAstro("https://naukanayarit.local");
const $$BottomNav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$BottomNav;
  const { items, activeId } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<nav class="fixed bottom-0 left-1/2 z-50 flex h-20 w-full max-w-[430px] -translate-x-1/2 items-center justify-around border-t border-white/70 bg-white/90 px-2 backdrop-blur-xl"> ${items.map((item) => {
    const isActive = item.id === activeId;
    return renderTemplate`<a${addAttribute(item.href, "href")}${addAttribute(`flex w-20 flex-col items-center justify-center rounded-xl px-2 py-2 text-[10px] font-bold uppercase tracking-[0.08em] transition ${isActive ? "bg-[#eeeeee] text-[#213138]" : "text-[#7a7e82] hover:text-[#213138]"}`, "class")}> <span class="material-symbols-outlined mb-1">${item.icon}</span> <span>${item.label}</span> </a>`;
  })} </nav>`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/components/app/BottomNav.astro", void 0);

const $$Astro = createAstro("https://naukanayarit.local");
const $$AppLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$AppLayout;
  const { title, pageTitle, topBar, navItems = [], activeNav, bodyClass = "bg-[#f9f9f9] text-[#1a1c1c]" } = Astro2.props;
  return renderTemplate`<html lang="es-MX"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><meta name="theme-color" content="#f9f9f9"><title>${title}</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0,0" rel="stylesheet">${renderHead()}</head> <body${addAttribute(`min-h-screen ${bodyClass}`, "class")}> <div class="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-[#f9f9f9]"> ${topBar && renderTemplate`${renderComponent($$result, "TopAppBar", $$TopAppBar, { ...topBar })}`} <main${addAttribute(`flex-1 px-4 ${navItems.length > 0 ? "pb-24" : "pb-6"} ${pageTitle ? "pt-6" : "pt-4"}`, "class")}> ${pageTitle && renderTemplate`<h1 class="mb-6 text-[2.6rem] font-extrabold leading-tight tracking-[-0.02em] text-[#213138]">${pageTitle}</h1>`} ${renderSlot($$result, $$slots["default"])} </main> ${navItems.length > 0 && renderTemplate`${renderComponent($$result, "BottomNav", $$BottomNav, { "items": navItems, "activeId": activeNav })}`} </div> </body></html>`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/layouts/AppLayout.astro", void 0);

export { $$AppLayout as $ };
