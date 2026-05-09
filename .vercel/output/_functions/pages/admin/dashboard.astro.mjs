/* empty css                                       */
import { e as createAstro, f as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C6rdUW15.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../../chunks/AppLayout_BoRoxKkH.mjs';
import { a as adminNav } from '../../chunks/nav_DLwwW0lq.mjs';
import { g as getAdminMetrics } from '../../chunks/access_D2-p0EuY.mjs';
import { b as getSupabaseServerClient } from '../../chunks/supabase_CmfbSpzm.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://naukanayarit.local");
const $$Dashboard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Dashboard;
  const accessToken = Astro2.locals.accessToken;
  const profile = Astro2.locals.profile;
  const user = Astro2.locals.user;
  const complejoId = profile?.complejo_id ?? "complejo-1";
  const metrics = await getAdminMetrics({
    accessToken,
    userId: user.id,
    complejoId,
    lotNumber: profile?.lot_number
  });
  const supabase = getSupabaseServerClient(accessToken);
  const { data: incidentes } = await supabase.from("incidentes").select("id, created_at, estado, descripcion, severidad, visitante_nombre").eq("complejo_id", complejoId).order("created_at", { ascending: false }).limit(20);
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": "Dashboard Admin - Nauka Nayarit", "topBar": { title: "Nauka Nayarit", leftIcon: "shield", leftHref: "#", rightIcon: "logout", rightHref: "/api/auth/logout" }, "navItems": adminNav, "pageTitle": "Monitoreo Central" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="grid grid-cols-2 gap-3"> <article class="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)]"> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#64748b]">Movimientos hoy</p> <p class="mt-2 text-4xl font-extrabold text-[#213138]">${metrics.totalMovimientos}</p> </article> <article class="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)]"> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#64748b]">Autorizados</p> <p class="mt-2 text-4xl font-extrabold text-[#006d36]">${metrics.totalAutorizados}</p> </article> <article class="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)]"> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#64748b]">Rechazados</p> <p class="mt-2 text-4xl font-extrabold text-[#93000a]">${metrics.totalRechazados}</p> </article> <article class="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)]"> <p class="text-xs font-bold uppercase tracking-[0.08em] text-[#64748b]">Incidentes abiertos</p> <p class="mt-2 text-4xl font-extrabold text-[#213138]">${metrics.incidentesAbiertos}</p> </article> </section> <section id="incidentes" class="mt-6 space-y-3"> <h2 class="text-2xl font-bold text-[#213138]">Gestión de Incidentes</h2> ${(incidentes ?? []).length === 0 && renderTemplate`<p class="rounded-xl bg-white p-4 text-sm text-[#64748b]">Sin incidentes registrados.</p>`} ${(incidentes ?? []).map((item) => renderTemplate`<article class="rounded-xl bg-white p-4 shadow-[0_6px_18px_rgba(26,28,28,0.04)]"> <div class="flex items-center justify-between"> <p class="text-sm font-semibold uppercase tracking-[0.08em] text-[#64748b]">${item.severidad}</p> <p class="text-xs text-[#64748b]">${new Date(item.created_at).toLocaleString("es-MX")}</p> </div> <p class="mt-2 text-base font-semibold text-[#213138]">${item.descripcion}</p> <p class="mt-1 text-sm text-[#64748b]">Visitante: ${item.visitante_nombre ?? "N/A"} · Estado: ${item.estado}</p> </article>`)} </section> ` })}`;
}, "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/dashboard.astro", void 0);

const $$file = "/Users/aspermaster23/nauka-accesos-pwa/src/pages/admin/dashboard.astro";
const $$url = "/admin/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Dashboard,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
