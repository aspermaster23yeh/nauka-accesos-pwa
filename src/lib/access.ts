import type { AppRole } from "./supabase";
import { getSupabaseServiceClient } from "./supabase";

const MIN_PASS_LEAD_MINUTES = 1;
const MAX_PASS_WINDOW_DAYS = 30;

export type AccessStatus = "authorized" | "expired" | "not_found";

export interface AuthContext {
  accessToken: string;
  userId: string;
  role: AppRole;
  complejoId: string;
  lotNumber?: string | null;
}

export interface AccessValidationResult {
  status: AccessStatus;
  visitanteNombre?: string;
  solicitanteNombre?: string;
  vencimiento?: string;
  razon?: string;
  paseId?: string;
  lote?: string;
}

export async function validateAccessQr(token: string, complejoId: string, guardiaId?: string): Promise<AccessValidationResult> {
  const supabase = getSupabaseServiceClient();
  const normalizedToken = token.trim().toLowerCase();

  const { data, error } = await supabase
    .from("pases_acceso")
    .select("id, visitante_nombre, estado, vence_en, lote_number, creado_por")
    .ilike("token_qr", normalizedToken)
    .eq("complejo_id", complejoId)
    .maybeSingle();

  if (error || !data) {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token: normalizedToken,
      visitanteNombre: null,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Token no encontrado"
    });
    return { status: "not_found", razon: "Token no encontrado" };
  }

  if (data.estado !== "vigente") {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token: normalizedToken,
      paseId: data.id,
      loteNumber: data.lote_number,
      visitanteNombre: data.visitante_nombre,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Token inactivo"
    });
    return { status: "expired", razon: "Token inactivo", paseId: data.id, lote: data.lote_number, visitanteNombre: data.visitante_nombre };
  }

  const now = new Date();
  const expiresAt = new Date(data.vence_en);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token: normalizedToken,
      paseId: data.id,
      loteNumber: data.lote_number,
      visitanteNombre: data.visitante_nombre,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Codigo expirado"
    });
    return { status: "expired", razon: "Codigo expirado", paseId: data.id, lote: data.lote_number, visitanteNombre: data.visitante_nombre };
  }

  await registerBitacoraEvent({
    supabase,
    complejoId,
    guardiaId,
    token: normalizedToken,
    paseId: data.id,
    loteNumber: data.lote_number,
    visitanteNombre: data.visitante_nombre,
    tipoEvento: "validacion",
    resultado: "autorizado"
  });

  const { data: solicitanteProfile } = await supabase.from("profiles").select("full_name").eq("id", data.creado_por).maybeSingle();

  return {
    status: "authorized",
    visitanteNombre: data.visitante_nombre,
    solicitanteNombre: solicitanteProfile?.full_name ?? undefined,
    vencimiento: data.vence_en,
    paseId: data.id,
    lote: data.lote_number
  };
}

export async function getBitacoraByComplejo(complejoId: string, query?: string, _accessToken?: string, limit?: number) {
  return getBitacoraScope({ complejoId, query, allComplejos: false, limit });
}

export async function getBitacoraScope(input: { complejoId?: string; query?: string; allComplejos?: boolean; limit?: number }) {
  const supabase = getSupabaseServiceClient();
  const normalizedQuery = input.query?.trim();
  const cap = Math.min(Math.max(input.limit ?? (input.allComplejos ? 200 : 100), 1), 500);
  let statement = supabase
    .from("bitacora_accesos")
    .select(
      "id, created_at, visitante_nombre, resultado, tipo_evento, razon, lote_number, pase_id, token_qr, guardia_id, evidencia_storage_path, complejo_id"
    )
    .order("created_at", { ascending: false })
    .limit(cap);

  if (!input.allComplejos && input.complejoId) {
    statement = statement.eq("complejo_id", input.complejoId);
  }

  if (normalizedQuery) {
    statement = statement.or(
      `visitante_nombre.ilike.%${normalizedQuery}%,resultado.ilike.%${normalizedQuery}%,lote_number.ilike.%${normalizedQuery}%`
    );
  }

  const { data, error } = await statement;
  if (error) {
    throw new Error(error.message);
  }
  const rows = data ?? [];
  const passIds = rows.map((row) => row.pase_id).filter(Boolean);
  const { data: passes } =
    passIds.length > 0
      ? await supabase.from("pases_acceso").select("id, creado_por, motivo, notas, created_at").in("id", passIds)
      : { data: [] };
  const creatorIds = (passes ?? []).map((p) => p.creado_por).filter(Boolean);
  const { data: creators } =
    creatorIds.length > 0 ? await supabase.from("profiles").select("id, full_name, lot_number").in("id", creatorIds) : { data: [] };

  const passById = new Map((passes ?? []).map((p) => [p.id, p]));
  const creatorById = new Map((creators ?? []).map((c) => [c.id, c]));

  return rows.map((row) => {
    const pass = row.pase_id ? passById.get(row.pase_id) : null;
    const creator = pass?.creado_por ? creatorById.get(pass.creado_por) : null;
    return {
      ...row,
      motivo: pass?.motivo ?? null,
      notas: pass?.notas ?? null,
      solicitante_nombre: creator?.full_name ?? null,
      solicitante_lote: creator?.lot_number ?? null
    };
  });
}

export async function getRecentPassesForComplejo(complejoId: string | null, limit = 12) {
  const supabase = getSupabaseServiceClient();
  let q = supabase
    .from("pases_acceso")
    .select("id, visitante_nombre, motivo, created_at, creado_por, lote_number, estado, complejo_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (complejoId) {
    q = q.eq("complejo_id", complejoId);
  }
  const { data: passes, error } = await q;
  if (error || !passes?.length) return [];
  const ids = [...new Set(passes.map((p) => p.creado_por).filter(Boolean))] as string[];
  const { data: creators } =
    ids.length > 0 ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] };
  const byId = new Map((creators ?? []).map((c) => [c.id, c]));
  return passes.map((p) => ({
    ...p,
    solicitante_nombre: p.creado_por ? (byId.get(p.creado_por)?.full_name ?? null) : null
  }));
}

export async function createVisitorPass(input: {
  complejoId: string;
  visitanteNombre: string;
  motivo: string;
  venceEn: string;
  telefonoDestino?: string;
  notas?: string;
  lotNumber?: string | null;
  creadoPor: string;
  accessToken: string;
}) {
  const supabase = getSupabaseServiceClient();
  const tokenQr = crypto.randomUUID();
  const expiry = new Date(input.venceEn);
  if (Number.isNaN(expiry.getTime())) {
    throw new Error("La fecha de expiración es inválida.");
  }
  const now = new Date();
  const minAllowed = new Date(now.getTime() + MIN_PASS_LEAD_MINUTES * 60 * 1000);
  const maxAllowed = new Date(now.getTime() + MAX_PASS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (expiry < minAllowed) {
    throw new Error("La fecha/hora del pase debe ser futura.");
  }
  if (expiry > maxAllowed) {
    throw new Error(`La fecha/hora del pase no puede superar ${MAX_PASS_WINDOW_DAYS} dias.`);
  }

  const { data, error } = await supabase
    .from("pases_acceso")
    .insert({
      token_qr: tokenQr,
      complejo_id: input.complejoId,
      visitante_nombre: input.visitanteNombre,
      motivo: input.motivo,
      vence_en: expiry.toISOString(),
      estado: "vigente",
      telefono_destino: input.telefonoDestino ?? null,
      notas: input.notas ?? null,
      lote_number: input.lotNumber ?? null,
      creado_por: input.creadoPor,
      tipo_acceso: "entrada"
    })
    .select("token_qr, id, vence_en")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    tokenQr: data.token_qr as string,
    paseId: data.id as string,
    expiraEn: data.vence_en as string
  };
}

export async function getActivePassesForSolicitante(ctx: AuthContext) {
  const supabase = getSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("pases_acceso")
    .select("id, visitante_nombre, motivo, token_qr, vence_en, estado, lote_number")
    .eq("creado_por", ctx.userId)
    .eq("complejo_id", ctx.complejoId)
    .gte("vence_en", nowIso)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function registerAccessMovement(input: {
  accessToken: string;
  guardiaId: string;
  complejoId: string;
  tokenQr: string;
  tipoEvento: "entrada" | "salida";
  evidenciaStoragePath?: string | null;
}) {
  const supabase = getSupabaseServiceClient();
  const normalizedToken = input.tokenQr.trim().toLowerCase();

  if (input.tipoEvento === "salida" && !input.evidenciaStoragePath?.trim()) {
    throw new Error("La salida requiere una foto de evidencia.");
  }

  const { data: pass, error } = await supabase
    .from("pases_acceso")
    .select("id, visitante_nombre, lote_number, estado, token_qr")
    .ilike("token_qr", normalizedToken)
    .eq("complejo_id", input.complejoId)
    .maybeSingle();
  if (error || !pass) throw new Error("Pase no encontrado.");

  const { error: bitacoraError } = await supabase.from("bitacora_accesos").insert({
    complejo_id: input.complejoId,
    pase_id: pass.id,
    token_qr: pass.token_qr ?? normalizedToken,
    guardia_id: input.guardiaId,
    visitante_nombre: pass.visitante_nombre,
    lote_number: pass.lote_number,
    tipo_evento: input.tipoEvento,
    resultado: "autorizado",
    origen: "caseta",
    evidencia_storage_path: input.evidenciaStoragePath?.trim() ?? null
  });
  if (bitacoraError) {
    console.error("[bitacora] insert movimiento:", bitacoraError.message);
    throw new Error(bitacoraError.message);
  }

  if (input.tipoEvento === "salida") {
    const { error: updateError } = await supabase.from("pases_acceso").update({ estado: "usado" }).eq("id", pass.id);
    if (updateError) throw new Error(updateError.message);
  }
}

export async function getAdminMetrics(ctx: AuthContext) {
  const supabase = getSupabaseServiceClient();
  /** Ventana móvil 24 h (UTC) para que en servidor/Vercel coincida con actividad reciente sin depender del hilo local. */
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const isSuper = ctx.role === "super_admin";

  const bitacoraBase = () => supabase.from("bitacora_accesos").select("id", { count: "planned", head: true }).gte("created_at", since);

  const movQ = isSuper ? bitacoraBase() : bitacoraBase().eq("complejo_id", ctx.complejoId);
  const authQ = isSuper
    ? bitacoraBase().eq("resultado", "autorizado")
    : bitacoraBase().eq("complejo_id", ctx.complejoId).eq("resultado", "autorizado");
  const rejQ = isSuper
    ? bitacoraBase().eq("resultado", "rechazado")
    : bitacoraBase().eq("complejo_id", ctx.complejoId).eq("resultado", "rechazado");
  const incBase = supabase.from("incidentes").select("id", { count: "planned", head: true }).neq("estado", "cerrado");
  const incQ = isSuper ? incBase : incBase.eq("complejo_id", ctx.complejoId);

  const [{ count: totalMovimientos }, { count: totalAutorizados }, { count: totalRechazados }, { count: incidentesAbiertos }] =
    await Promise.all([movQ, authQ, rejQ, incQ]);

  return {
    totalMovimientos: totalMovimientos ?? 0,
    totalAutorizados: totalAutorizados ?? 0,
    totalRechazados: totalRechazados ?? 0,
    incidentesAbiertos: incidentesAbiertos ?? 0
  };
}

async function registerBitacoraEvent(input: {
  supabase: ReturnType<typeof getSupabaseServiceClient>;
  complejoId: string;
  guardiaId?: string;
  token: string;
  paseId?: string;
  loteNumber?: string | null;
  visitanteNombre: string | null;
  tipoEvento: "validacion";
  resultado: "autorizado" | "rechazado";
  razon?: string;
}) {
  const { error } = await input.supabase.from("bitacora_accesos").insert({
    complejo_id: input.complejoId,
    pase_id: input.paseId ?? null,
    token_qr: input.token,
    guardia_id: input.guardiaId ?? null,
    visitante_nombre: input.visitanteNombre,
    lote_number: input.loteNumber ?? null,
    tipo_evento: input.tipoEvento,
    resultado: input.resultado,
    razon: input.razon ?? null,
    origen: "scanner"
  });
  if (error) {
    console.error("[bitacora] insert validacion:", error.message);
  }
}
