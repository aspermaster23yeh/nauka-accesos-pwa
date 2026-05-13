import type { APIRoute } from "astro";
import { randomUUID } from "node:crypto";
import { createVisitorPass, getActivePassesForSolicitante } from "../../../lib/access";
import { getSupabaseServiceClient } from "../../../lib/supabase";

export const prerender = false;

function requireSolicitante(locals: App.Locals) {
  if (!locals.user || !locals.profile || locals.profile.role !== "solicitante" || !locals.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
}

function assertImageFile(file: unknown, label: string): File {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error(`${label} requerida.`);
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error(`${label}: la imagen no debe superar 8 MB.`);
  }
  if (!file.type.startsWith("image/")) {
    throw new Error(`${label}: debe ser un archivo de imagen.`);
  }
  return file;
}

function extFromMime(mime: string): "png" | "jpg" {
  return mime === "image/png" ? "png" : "jpg";
}

export const GET: APIRoute = async ({ locals }) => {
  try {
    requireSolicitante(locals);
    const passes = await getActivePassesForSolicitante({
      accessToken: locals.accessToken as string,
      userId: locals.user!.id,
      role: "solicitante",
      complejoId: locals.profile!.complejo_id ?? "complejo-1",
      lotNumber: locals.profile!.lot_number
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    requireSolicitante(locals);
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({
          error: "Envía el formulario como multipart/form-data con foto del visitante e imagen del INE."
        }),
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const visitanteNombre = String(formData.get("visitanteNombre") ?? "").trim();
    const motivo = String(formData.get("motivo") ?? "Visita").trim();
    const venceEn = String(formData.get("venceEn") ?? "");
    const telefonoDestino = String(formData.get("telefonoDestino") ?? "").trim();
    const notas = String(formData.get("notas") ?? "").trim();

    const fotoFile = assertImageFile(formData.get("fotoVisitante"), "Foto del rostro");
    const ineFile = assertImageFile(formData.get("fotoIne"), "Foto del INE");

    if (!visitanteNombre || !venceEn) {
      return new Response(JSON.stringify({ error: "Datos incompletos (nombre y vigencia)." }), { status: 400 });
    }

    const complejoId = locals.profile!.complejo_id ?? "complejo-1";
    const creadoPor = locals.user!.id;
    const paseId = randomUUID();

    const extRostro = extFromMime(fotoFile.type);
    const extIne = extFromMime(ineFile.type);
    const pathRostro = `${complejoId}/${creadoPor}/${paseId}/rostro.${extRostro}`;
    const pathIne = `${complejoId}/${creadoPor}/${paseId}/ine.${extIne}`;

    const bufRostro = Buffer.from(await fotoFile.arrayBuffer());
    const bufIne = Buffer.from(await ineFile.arrayBuffer());
    const service = getSupabaseServiceClient();

    const upR = await service.storage.from("pases_visitante").upload(pathRostro, bufRostro, {
      contentType: fotoFile.type || "image/jpeg",
      upsert: false
    });
    if (upR.error) {
      return new Response(JSON.stringify({ error: upR.error.message }), { status: 500 });
    }
    const upI = await service.storage.from("pases_visitante").upload(pathIne, bufIne, {
      contentType: ineFile.type || "image/jpeg",
      upsert: false
    });
    if (upI.error) {
      await service.storage.from("pases_visitante").remove([pathRostro]);
      return new Response(JSON.stringify({ error: upI.error.message }), { status: 500 });
    }

    let pass;
    try {
      pass = await createVisitorPass({
        accessToken: locals.accessToken as string,
        creadoPor,
        complejoId,
        lotNumber: locals.profile!.lot_number,
        motivo,
        visitanteNombre,
        venceEn,
        telefonoDestino,
        notas,
        paseId,
        visitanteFotoStoragePath: pathRostro,
        visitanteIneStoragePath: pathIne
      });
    } catch (insertErr) {
      await service.storage.from("pases_visitante").remove([pathRostro, pathIne]);
      throw insertErr;
    }

    return new Response(JSON.stringify({ pass }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "No se pudo crear el pase." }), {
      status
    });
  }
};
