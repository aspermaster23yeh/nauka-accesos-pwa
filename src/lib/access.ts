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
  solicitanteLote?: string | null;
  vencimiento?: string;
  razon?: string;
  paseId?: string;
  lote?: string;
  /** Texto del pase para revisión en caseta */
  motivo?: string | null;
  notas?: string | null;
  /** URLs firmadas (1 h); solo en flujo autorizado */
  visitanteFotoUrl?: string | null;
  visitanteIneUrl?: string | null;
  solicitanteFotoUrl?: string | null;
  solicitanteIneUrl?: string | null;
}

async function signedUrlOrNull(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  bucket: string,
  path: string | null | undefined,
  ttlSec = 3600
): Promise<string | null> {
  const p = path?.trim();
  if (!p) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(p, ttlSec);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function validateAccessQr(token: string, complejoId: string, guardiaId?: string): Promise<AccessValidationResult> {
  const supabase = getSupabaseServiceClient();
  const normalizedToken = token.trim().toLowerCase();

  const { data, error } = await supabase
    .from("pases_acceso")
    .select(
      "id, visitante_nombre, estado, vence_en, lote_number, creado_por, motivo, notas, visitante_foto_storage_path, visitante_ine_storage_path"
    )
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

  const { data: solicitanteProfile } = await supabase
    .from("profiles")
    .select("full_name, lot_number, photo_storage_path, ine_storage_path")
    .eq("id", data.creado_por)
    .maybeSingle();

  const row = data as typeof data & {
    motivo?: string | null;
    notas?: string | null;
    visitante_foto_storage_path?: string | null;
    visitante_ine_storage_path?: string | null;
  };

  const [visitanteFotoUrl, visitanteIneUrl, solicitanteFotoUrl, solicitanteIneUrl] = await Promise.all([
    signedUrlOrNull(supabase, "pases_visitante", row.visitante_foto_storage_path),
    signedUrlOrNull(supabase, "pases_visitante", row.visitante_ine_storage_path),
    signedUrlOrNull(supabase, "fotos_perfil", solicitanteProfile?.photo_storage_path),
    signedUrlOrNull(supabase, "identificaciones", solicitanteProfile?.ine_storage_path)
  ]);

  return {
    status: "authorized",
    visitanteNombre: data.visitante_nombre,
    solicitanteNombre: solicitanteProfile?.full_name ?? undefined,
    solicitanteLote: solicitanteProfile?.lot_number ?? null,
    vencimiento: data.vence_en,
    paseId: data.id,
    lote: data.lote_number,
    motivo: row.motivo ?? null,
    notas: row.notas ?? null,
    visitanteFotoUrl,
    visitanteIneUrl,
    solicitanteFotoUrl,
    solicitanteIneUrl
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
  /** Si se omite, Postgres genera el id. Para subir archivos antes del insert, pásalo explícito. */
  paseId?: string;
  visitanteFotoStoragePath: string;
  visitanteIneStoragePath: string;
}) {
  const supabase = getSupabaseServiceClient();
  const tokenQr = crypto.randomUUID();
  const paseId = input.paseId?.trim() || undefined;
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

  const foto = input.visitanteFotoStoragePath.trim();
  const ine = input.visitanteIneStoragePath.trim();
  if (!foto || !ine) {
    throw new Error("Se requieren foto del visitante e imagen de INE.");
  }

  const row: Record<string, unknown> = {
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
    tipo_acceso: "entrada",
    visitante_foto_storage_path: foto,
    visitante_ine_storage_path: ine
  };
  if (paseId) row.id = paseId;

  const { data, error } = await supabase.from("pases_acceso").insert(row).select("token_qr, id, vence_en").single();

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

  const { data: bitacoraRow, error: bitacoraError } = await supabase
    .from("bitacora_accesos")
    .insert({
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
    })
    .select("id")
    .single();
  if (bitacoraError || !bitacoraRow?.id) {
    console.error("[bitacora] insert movimiento:", bitacoraError?.message);
    throw new Error(bitacoraError?.message ?? "No se pudo registrar la bitácora.");
  }

  const { error: notifError } = await supabase.from("notificaciones_caseta").insert({
    complejo_id: input.complejoId,
    tipo: input.tipoEvento,
    bitacora_id: bitacoraRow.id,
    visitante_nombre: pass.visitante_nombre,
    lote_number: pass.lote_number,
    guardia_id: input.guardiaId
  });
  if (notifError) {
    console.error("[notificaciones_caseta]", notifError.message);
  }

  if (input.tipoEvento === "salida") {
    const { error: updateError } = await supabase.from("pases_acceso").update({ estado: "usado" }).eq("id", pass.id);
    if (updateError) throw new Error(updateError.message);
  }
}

export type CasetaNotificationRow = {
  id: string;
  complejo_id: string;
  tipo: "entrada" | "salida";
  bitacora_id: string | null;
  visitante_nombre: string | null;
  lote_number: string | null;
  guardia_id: string | null;
  created_at: string;
};

/** Últimas alertas de caseta para panel admin (service role). */
export async function getRecentCasetaNotifications(limit = 30): Promise<CasetaNotificationRow[]> {
  const supabase = getSupabaseServiceClient();
  const cap = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await supabase
    .from("notificaciones_caseta")
    .select("id, complejo_id, tipo, bitacora_id, visitante_nombre, lote_number, guardia_id, created_at")
    .order("created_at", { ascending: false })
    .limit(cap);
  if (error) {
    console.error("[notificaciones_caseta] list:", error.message);
    return [];
  }
  return (data ?? []) as CasetaNotificationRow[];
}

export async function getAdminMetrics(ctx: AuthContext) {
  const supabase = getSupabaseServiceClient();
  /** Ventana móvil 24 h (UTC) para que en servidor/Vercel coincida con actividad reciente sin depender del hilo local. */
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  /** Admin y super_admin comparten vista global de métricas. */
  const globalAdmin = ctx.role === "super_admin" || ctx.role === "admin";

  /** `exact` cuenta filas reales; `planned` es estimación del planificador y puede cuadrar mal con la bitácora. */
  const bitacoraBase = () =>
    supabase.from("bitacora_accesos").select("id", { count: "exact", head: true }).gte("created_at", since);

  const movQ = globalAdmin ? bitacoraBase() : bitacoraBase().eq("complejo_id", ctx.complejoId);
  const authQ = globalAdmin
    ? bitacoraBase().eq("resultado", "autorizado")
    : bitacoraBase().eq("complejo_id", ctx.complejoId).eq("resultado", "autorizado");
  const rejQ = globalAdmin
    ? bitacoraBase().eq("resultado", "rechazado")
    : bitacoraBase().eq("complejo_id", ctx.complejoId).eq("resultado", "rechazado");
  const incBase = supabase.from("incidentes").select("id", { count: "exact", head: true }).neq("estado", "cerrado");
  const incQ = globalAdmin ? incBase : incBase.eq("complejo_id", ctx.complejoId);

  const [movRes, authRes, rejRes, incRes] = await Promise.all([movQ, authQ, rejQ, incQ]);

  const pick = (label: string, res: { count: number | null; error: { message: string } | null }) => {
    if (res.error) {
      console.error(`[getAdminMetrics] ${label}:`, res.error.message);
      return 0;
    }
    return res.count ?? 0;
  };

  return {
    totalMovimientos: pick("movimientos", movRes),
    totalAutorizados: pick("autorizados", authRes),
    totalRechazados: pick("rechazados", rejRes),
    incidentesAbiertos: pick("incidentes", incRes)
  };
}

export type SuperAdminMovementRow = Awaited<ReturnType<typeof getBitacoraScope>>[number] & {
  guardia_nombre?: string | null;
};

export interface LoteKpiRow {
  /** Clave única complejo + número de lote en bitácora */
  loteKey: string;
  complejo_id: string | null;
  lot_number: string | null;
  count24h: number;
  autorizados: number;
  rechazados: number;
  lastAt: string;
  lastSummary: string;
}

/** Bitácora últimas 24 h enriquecida (guardia) + agregados por lote para KPIs. */
export async function getSuperAdminActivityEnriched(limit = 150): Promise<{
  movements: SuperAdminMovementRow[];
  lotKpis: LoteKpiRow[];
}> {
  const rows = await getBitacoraScope({ allComplejos: true, limit });
  const sinceMs = Date.now() - 24 * 60 * 60 * 1000;
  const inWindow = rows.filter((r) => new Date(r.created_at).getTime() >= sinceMs);

  const guardIds = [...new Set(inWindow.map((r) => r.guardia_id).filter(Boolean))] as string[];
  const supabase = getSupabaseServiceClient();
  const { data: guards } =
    guardIds.length > 0 ? await supabase.from("profiles").select("id, full_name").in("id", guardIds) : { data: [] as { id: string; full_name: string | null }[] };
  const guardMap = new Map((guards ?? []).map((g) => [g.id, g.full_name]));

  const movements: SuperAdminMovementRow[] = inWindow.map((r) => ({
    ...r,
    guardia_nombre: r.guardia_id ? (guardMap.get(r.guardia_id) ?? null) : null
  }));

  const lotMap = new Map<string, LoteKpiRow>();
  for (const r of movements) {
    const lotNum = (r.lote_number ?? "").trim() || null;
    const cid = r.complejo_id ?? "—";
    const loteKey = `${cid}::${lotNum ?? "Sin lote"}`;
    let cell = lotMap.get(loteKey);
    if (!cell) {
      cell = {
        loteKey,
        complejo_id: r.complejo_id ?? null,
        lot_number: lotNum,
        count24h: 0,
        autorizados: 0,
        rechazados: 0,
        lastAt: r.created_at,
        lastSummary: `${r.tipo_evento} · ${r.visitante_nombre ?? "—"}`
      };
      lotMap.set(loteKey, cell);
    }
    cell.count24h += 1;
    if (r.resultado === "autorizado") cell.autorizados += 1;
    else cell.rechazados += 1;
  }

  const lotKpis = [...lotMap.values()].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  return { movements, lotKpis };
}

export type LoteCatalogRow = {
  id: string;
  complejo_id: string;
  lot_number: string;
  owner_name: string | null;
  responsable_profile_id: string | null;
  responsable_nombre: string | null;
};

export async function getLotesWithResponsables(): Promise<LoteCatalogRow[]> {
  const supabase = getSupabaseServiceClient();
  const { data: lotes, error } = await supabase
    .from("lotes")
    .select("id, complejo_id, lot_number, owner_name, responsable_profile_id")
    .order("complejo_id")
    .order("lot_number");
  if (error) throw new Error(error.message);
  const ids = [...new Set((lotes ?? []).map((l) => l.responsable_profile_id).filter(Boolean))] as string[];
  const { data: profs } =
    ids.length > 0 ? await supabase.from("profiles").select("id, full_name").in("id", ids) : { data: [] as { id: string; full_name: string | null }[] };
  const pmap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  return (lotes ?? []).map((l) => ({
    id: l.id as string,
    complejo_id: l.complejo_id as string,
    lot_number: l.lot_number as string,
    owner_name: (l.owner_name as string | null) ?? null,
    responsable_profile_id: (l.responsable_profile_id as string | null) ?? null,
    responsable_nombre: l.responsable_profile_id ? (pmap.get(l.responsable_profile_id as string) ?? null) : null
  }));
}

export async function getComplejosList() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.from("complejos").select("id, nombre").order("nombre");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSolicitantesForSelect() {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, lot_number, complejo_id")
    .eq("role", "solicitante")
    .order("full_name");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type AnalyticsBucketKind = "hour" | "day" | "week" | "month";

/** Entradas autorizadas en caseta agregadas por periodo (UTC). */
export async function getEntradasTimeSeries(bucket: AnalyticsBucketKind, sinceDays = 45): Promise<{ label: string; count: number }[]> {
  const supabase = getSupabaseServiceClient();
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const { data, error } = await supabase
    .from("bitacora_accesos")
    .select("created_at")
    .eq("tipo_evento", "entrada")
    .eq("resultado", "autorizado")
    .gte("created_at", since);
  if (error) throw new Error(error.message);

  const weekMondayUtc = (d: Date) => {
    const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    const day = new Date(t).getUTCDay() || 7;
    const mondayMs = t - (day - 1) * 86400000;
    return new Date(mondayMs).toISOString().slice(0, 10);
  };

  const map = new Map<string, number>();
  for (const row of data ?? []) {
    const d = new Date(row.created_at as string);
    let key: string;
    if (bucket === "hour") {
      key = d.toISOString().slice(0, 13) + ":00:00.000Z";
    } else if (bucket === "day") {
      key = d.toISOString().slice(0, 10);
    } else if (bucket === "week") {
      key = weekMondayUtc(d);
    } else {
      key = d.toISOString().slice(0, 7);
    }
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, count]) => ({ label, count }));
}

/** Guardias con más registros de entrada/salida autorizados en caseta. */
export async function getTopGuardiasAccesos(
  sinceDays = 30,
  limit = 15
): Promise<{ id: string; full_name: string | null; count: number }[]> {
  const supabase = getSupabaseServiceClient();
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const { data, error } = await supabase
    .from("bitacora_accesos")
    .select("guardia_id")
    .in("tipo_evento", ["entrada", "salida"])
    .eq("resultado", "autorizado")
    .not("guardia_id", "is", null)
    .gte("created_at", since);
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const r of data ?? []) {
    const id = r.guardia_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const ids = sorted.map(([id]) => id);
  if (ids.length === 0) return [];
  const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const pmap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  return sorted.map(([id, count]) => ({ id, full_name: pmap.get(id) ?? null, count }));
}

/** Solicitantes que más pases de visita han creado (quién “da” más altas de acceso). */
export async function getTopSolicitantesPorPases(
  sinceDays = 30,
  limit = 15
): Promise<{ id: string; full_name: string | null; count: number }[]> {
  const supabase = getSupabaseServiceClient();
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const { data, error } = await supabase.from("pases_acceso").select("creado_por").gte("created_at", since);
  if (error) throw new Error(error.message);
  const counts = new Map<string, number>();
  for (const r of data ?? []) {
    const id = r.creado_por as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const ids = sorted.map(([id]) => id);
  if (ids.length === 0) return [];
  const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
  const pmap = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
  return sorted.map(([id, count]) => ({ id, full_name: pmap.get(id) ?? null, count }));
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
