import { b as getActivePassesForResident, c as createVisitorPass } from '../../../chunks/access_D2-p0EuY.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
function requireResident(locals) {
  if (!locals.user || !locals.profile || locals.profile.role !== "residente" || !locals.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
}
const GET = async ({ locals }) => {
  try {
    requireResident(locals);
    const passes = await getActivePassesForResident({
      accessToken: locals.accessToken,
      userId: locals.user.id,
      role: "residente",
      complejoId: locals.profile.complejo_id ?? "complejo-1",
      lotNumber: locals.profile.lot_number
    });
    return new Response(JSON.stringify({ passes }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: "No se pudieron cargar los pases." }), { status });
  }
};
const POST = async ({ request, locals }) => {
  try {
    requireResident(locals);
    const body = await request.json();
    const visitanteNombre = String(body?.visitanteNombre ?? "").trim();
    const motivo = String(body?.motivo ?? "Visita").trim();
    const venceEn = String(body?.venceEn ?? "");
    const telefonoDestino = String(body?.telefonoDestino ?? "").trim();
    if (!visitanteNombre || !venceEn) {
      return new Response(JSON.stringify({ error: "Datos incompletos." }), { status: 400 });
    }
    const pass = await createVisitorPass({
      accessToken: locals.accessToken,
      creadoPor: locals.user.id,
      complejoId: locals.profile.complejo_id ?? "complejo-1",
      lotNumber: locals.profile.lot_number,
      motivo,
      visitanteNombre,
      venceEn,
      telefonoDestino
    });
    return new Response(JSON.stringify({ pass }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo crear el pase." }), { status });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
