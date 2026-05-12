import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(null, {
    status: 303,
    headers: {
      Location:
        "/auth/resultado?status=error&reason=El%20registro%20publico%20esta%20deshabilitado.%20Contacta%20a%20Nauka%20para%20darte%20de%20alta%20como%20solicitante."
    }
  });
};
