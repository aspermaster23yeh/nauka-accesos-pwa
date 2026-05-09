import { g as getAdminMetrics, a as getBitacoraByComplejo } from '../../../chunks/access_DF6pBMVW.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const GET = async ({ locals, url }) => {
  if (!locals.user || !locals.profile || locals.profile.role !== "admin" || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  try {
    const query = url.searchParams.get("q") ?? "";
    const complejoId = locals.profile.complejo_id ?? "complejo-1";
    const [metrics, registros] = await Promise.all([
      getAdminMetrics({
        accessToken: locals.accessToken,
        userId: locals.user.id,
        role: "admin",
        complejoId,
        lotNumber: locals.profile.lot_number
      }),
      getBitacoraByComplejo(complejoId, query, locals.accessToken)
    ]);
    return new Response(JSON.stringify({ metrics, registros }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo cargar dashboard." }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
