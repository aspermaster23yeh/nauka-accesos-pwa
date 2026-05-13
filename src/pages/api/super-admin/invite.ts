import { randomBytes } from "node:crypto";
import type { APIRoute } from "astro";
import { isPlatformAdmin } from "../../../lib/admin-access";
import { getSupabaseServiceClient, type AppRole } from "../../../lib/supabase";

export const prerender = false;

const allowedRoles: AppRole[] = ["solicitante", "guardia", "admin", "lector_junta"];
const maxBytes = 6 * 1024 * 1024;

async function uploadProfileImage(
  service: ReturnType<typeof getSupabaseServiceClient>,
  bucket: string,
  complejoId: string,
  userId: string,
  prefix: string,
  file: File
): Promise<{ path: string | null; error?: string }> {
  if (file.size <= 0) {
    return { path: null, error: "Archivo vacío." };
  }
  if (file.size > maxBytes) {
    return { path: null, error: "La imagen supera 6 MB." };
  }
  const okType = file.type === "image/jpeg" || file.type === "image/png";
  if (!okType) {
    return { path: null, error: "Solo se permiten imágenes JPG o PNG." };
  }
  const ext = file.type === "image/png" ? "png" : "jpg";
  const objectPath = `${complejoId}/${userId}/${prefix}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await service.storage.from(bucket).upload(objectPath, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: false
  });
  if (upErr) {
    return { path: null, error: upErr.message };
  }
  return { path: objectPath };
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !isPlatformAdmin(locals.profile?.role)) {
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
  const photoFile = formData.get("photo");

  if (!email || !fullName || !lotNumber) {
    return new Response(JSON.stringify({ error: "Email, nombre y lote son obligatorios." }), { status: 400 });
  }

  const inviteRole = allowedRoles.includes(roleRaw) ? roleRaw : "solicitante";

  const ineIsFile = ineFile instanceof File && ineFile.size > 0;
  const photoIsFile = photoFile instanceof File && photoFile.size > 0;

  if (inviteRole === "solicitante") {
    if (!ineIsFile) {
      return new Response(JSON.stringify({ error: "La identificación oficial (INE) es obligatoria para crear un solicitante." }), { status: 400 });
    }
    if (!photoIsFile) {
      return new Response(JSON.stringify({ error: "La foto del usuario (rostro) es obligatoria para crear un solicitante." }), { status: 400 });
    }
  }

  const onboardingForAuth =
    inviteRole === "solicitante"
      ? "pendiente_terminos"
      : inviteRole === "lector_junta"
        ? "activo"
        : ineIsFile
          ? "pendiente_terminos"
          : "pendiente_ine";

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
      onboarding_status: onboardingForAuth
    }
  });

  if (createError || !created.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? "No se pudo crear el usuario." }), { status: 400 });
  }

  const userId = created.user.id;

  let inePath: string | null = null;
  let photoPath: string | null = null;

  if (inviteRole === "solicitante" && ineFile instanceof File && photoFile instanceof File) {
    const [ineUp, photoUp] = await Promise.all([
      uploadProfileImage(service, "identificaciones", complejoId, userId, "ine", ineFile),
      uploadProfileImage(service, "fotos_perfil", complejoId, userId, "foto", photoFile)
    ]);
    if (ineUp.error || !ineUp.path) {
      return new Response(
        JSON.stringify({ error: ineUp.error ?? "No se pudo subir la identificación.", userId, partial: true }),
        { status: 500 }
      );
    }
    if (photoUp.error || !photoUp.path) {
      return new Response(
        JSON.stringify({ error: photoUp.error ?? "No se pudo subir la foto del usuario.", userId, partial: true }),
        { status: 500 }
      );
    }
    inePath = ineUp.path;
    photoPath = photoUp.path;
  } else {
    if (ineIsFile && ineFile instanceof File) {
      const r = await uploadProfileImage(service, "identificaciones", complejoId, userId, "ine", ineFile);
      if (!r.error && r.path) {
        inePath = r.path;
      }
    }
    if (photoIsFile && photoFile instanceof File && inviteRole !== "solicitante" && inviteRole !== "lector_junta") {
      const r = await uploadProfileImage(service, "fotos_perfil", complejoId, userId, "foto", photoFile);
      if (!r.error && r.path) {
        photoPath = r.path;
      }
    }
  }

  const onboardingStatus =
    inviteRole === "solicitante"
      ? "pendiente_terminos"
      : inviteRole === "lector_junta"
        ? "activo"
        : inePath
          ? "pendiente_terminos"
          : "pendiente_ine";

  const profileRow: Record<string, unknown> = {
    id: userId,
    full_name: fullName,
    lot_number: lotNumber,
    complejo_id: complejoId,
    role: inviteRole,
    ine_storage_path: inePath,
    photo_storage_path: photoPath,
    onboarding_status: onboardingStatus,
    approved_at: new Date().toISOString(),
    approved_by: locals.user.id
  };
  if (inviteRole === "lector_junta") {
    profileRow.terms_accepted_at = new Date().toISOString();
    profileRow.terms_version = "1";
  }

  const { error: profileErr } = await service.from("profiles").upsert(profileRow, { onConflict: "id" });

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
