import { v as validateAccessQr } from '../../chunks/access_DF6pBMVW.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request, locals }) => {
  if (!locals.user || !locals.profile || !["guardia", "admin"].includes(locals.profile.role)) {
    return new Response(JSON.stringify({ status: "not_found", error: "Unauthorized" }), { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body?.token || !body?.complejoId) {
    return new Response(JSON.stringify({ status: "not_found" }), { status: 400 });
  }
  const guardiaId = locals.profile.role === "guardia" ? locals.user.id : typeof body.guardiaId === "string" ? body.guardiaId : void 0;
  const result = await validateAccessQr(body.token, body.complejoId, guardiaId);
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
