import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.profile || locals.profile.role !== "guardia" || !locals.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return new Response(JSON.stringify({ error: "Archivo requerido." }), { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "La imagen no debe superar 8 MB." }), { status: 400 });
  }

  const complejoId = locals.profile.complejo_id ?? "complejo-1";
  const ext = file.type === "image/png" ? "png" : "jpg";
  const objectPath = `${complejoId}/${locals.user.id}/salida-${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const service = getSupabaseServiceClient();
  const { error } = await service.storage.from("evidencias_salida").upload(objectPath, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ path: objectPath }), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};
