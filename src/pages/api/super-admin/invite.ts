import { randomBytes } from "node:crypto";
import type { APIRoute } from "astro";
import { getSupabaseServiceClient, type AppRole } from "../../../lib/supabase";

export const prerender = false;

const allowedRoles: AppRole[] = ["solicitante", "guardia", "admin"];

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.profile?.role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return new Response(JSON.stringify({ error: "Formulario inválido." }), { status: 400 });
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const lotNumber = String(formData.get("lot_number") ?? "").trim();
  const complejoId = String(formData.get("complejo_id") ?? "complejo-1").trim();
  const roleRaw = String(formData.get("role") ?? "solicitante").trim() as AppRole;
  const ineFile = formData.get("ine");

  if (!email || !fullName || !lotNumber) {
    return new Response(JSON.stringify({ error: "Email, nombre y lote son obligatorios." }), { status: 400 });
  }

  const inviteRole = allowedRoles.includes(roleRaw) ? roleRaw : "solicitante";
  const onboardingFromIne = ineFile instanceof File && ineFile.size > 0 ? "pendiente_terminos" : "pendiente_ine";

  const service = getSupabaseServiceClient();
  const password = `Aa1!${randomBytes(18).toString("base64url")}`;

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, lot_number: lotNumber },
    app_metadata: {
      role: inviteRole,
      complejo_id: complejoId,
      onboarding_status: onboardingFromIne
    }
  });

  if (createError || !created.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? "No se pudo crear el usuario." }), { status: 400 });
  }

  const userId = created.user.id;

  let inePath: string | null = null;
  if (ineFile instanceof File && ineFile.size > 0 && ineFile.size <= 6 * 1024 * 1024) {
    const ext = ineFile.type === "image/png" ? "png" : "jpg";
    const objectPath = `${complejoId}/${userId}/ine-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await ineFile.arrayBuffer());
    const { error: upErr } = await service.storage.from("identificaciones").upload(objectPath, buffer, {
      contentType: ineFile.type || "image/jpeg",
      upsert: false
    });
    if (!upErr) {
      inePath = objectPath;
    }
  }

  const { error: profileErr } = await service.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      lot_number: lotNumber,
      complejo_id: complejoId,
      role: inviteRole,
      ine_storage_path: inePath,
      onboarding_status: inePath ? "pendiente_terminos" : "pendiente_ine",
      approved_at: new Date().toISOString(),
      approved_by: locals.user.id
    },
    { onConflict: "id" }
  );

  if (profileErr) {
    return new Response(JSON.stringify({ error: profileErr.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      userId,
      temporaryPassword: password,
      message: "Usuario creado. Entrega la contraseña temporal por un canal seguro o restablece desde Supabase Auth."
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};
