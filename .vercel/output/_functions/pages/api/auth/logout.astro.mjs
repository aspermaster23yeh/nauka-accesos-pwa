import { b as getSupabaseServerClient } from '../../../chunks/supabase_DBfBwpCC.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ cookies, locals }) => {
  const accessToken = locals.accessToken;
  if (accessToken) {
    const client = getSupabaseServerClient(accessToken);
    await client.auth.signOut();
  }
  cookies.delete("sb-access-token", { path: "/" });
  return new Response(null, {
    status: 303,
    headers: { Location: "/" }
  });
};
const GET = async ({ cookies, locals }) => {
  const accessToken = locals.accessToken;
  if (accessToken) {
    const client = getSupabaseServerClient(accessToken);
    await client.auth.signOut();
  }
  cookies.delete("sb-access-token", { path: "/" });
  return new Response(null, {
    status: 303,
    headers: { Location: "/" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
