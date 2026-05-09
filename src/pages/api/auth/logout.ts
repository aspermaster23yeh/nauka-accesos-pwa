import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, locals }) => {
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

export const GET: APIRoute = async ({ cookies, locals }) => {
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
