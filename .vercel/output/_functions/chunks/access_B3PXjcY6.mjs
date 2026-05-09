import { b as getSupabaseServerClient } from './supabase_DBfBwpCC.mjs';

async function validateAccessQr(token, complejoId, guardiaId) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from("pases_acceso").select("id, visitante_nombre, anfitrion_nombre, estado, vence_en, lote_number").eq("token_qr", token).eq("complejo_id", complejoId).maybeSingle();
  if (error || !data) {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token,
      visitanteNombre: null,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Token no encontrado"
    });
    return { status: "not_found" };
  }
  if (data.estado !== "vigente") {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token,
      visitanteNombre: data.visitante_nombre,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Token inactivo"
    });
    return { status: "expired", razon: "Token inactivo", paseId: data.id, lote: data.lote_number };
  }
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(data.vence_en);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt < now) {
    await registerBitacoraEvent({
      supabase,
      complejoId,
      guardiaId,
      token,
      visitanteNombre: data.visitante_nombre,
      tipoEvento: "validacion",
      resultado: "rechazado",
      razon: "Codigo expirado"
    });
    return { status: "expired", razon: "Codigo expirado", paseId: data.id, lote: data.lote_number };
  }
  await registerBitacoraEvent({
    supabase,
    complejoId,
    guardiaId,
    token,
    visitanteNombre: data.visitante_nombre,
    tipoEvento: "validacion",
    resultado: "autorizado"
  });
  return {
    status: "authorized",
    visitanteNombre: data.visitante_nombre,
    anfitrionNombre: data.anfitrion_nombre,
    vencimiento: data.vence_en,
    paseId: data.id,
    lote: data.lote_number
  };
}
async function getBitacoraByComplejo(complejoId, query, accessToken) {
  const supabase = getSupabaseServerClient(accessToken);
  const normalizedQuery = query?.trim();
  let statement = supabase.from("bitacora_accesos").select("id, created_at, visitante_nombre, resultado, tipo_evento, razon, lote_number").eq("complejo_id", complejoId).order("created_at", { ascending: false }).limit(100);
  if (normalizedQuery) {
    statement = statement.or(
      `visitante_nombre.ilike.%${normalizedQuery}%,resultado.ilike.%${normalizedQuery}%,lote_number.ilike.%${normalizedQuery}%`
    );
  }
  const { data, error } = await statement;
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}
async function createVisitorPass(input) {
  const supabase = getSupabaseServerClient(input.accessToken);
  const tokenQr = crypto.randomUUID();
  const expiry = new Date(input.venceEn);
  if (Number.isNaN(expiry.getTime())) {
    throw new Error("La fecha de expiración es inválida.");
  }
  const { data, error } = await supabase.from("pases_acceso").insert({
    token_qr: tokenQr,
    complejo_id: input.complejoId,
    visitante_nombre: input.visitanteNombre,
    motivo: input.motivo,
    vence_en: expiry.toISOString(),
    estado: "vigente",
    telefono_destino: input.telefonoDestino ?? null,
    lote_number: input.lotNumber ?? null,
    creado_por: input.creadoPor,
    tipo_acceso: "entrada"
  }).select("token_qr, id, vence_en").single();
  if (error) {
    throw new Error(error.message);
  }
  return {
    tokenQr: data.token_qr,
    paseId: data.id,
    expiraEn: data.vence_en
  };
}
async function getActivePassesForResident(ctx) {
  const supabase = getSupabaseServerClient(ctx.accessToken);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  const { data, error } = await supabase.from("pases_acceso").select("id, visitante_nombre, motivo, token_qr, vence_en, estado, lote_number").eq("creado_por", ctx.userId).eq("complejo_id", ctx.complejoId).gte("vence_en", nowIso).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}
async function registerAccessMovement(input) {
  const supabase = getSupabaseServerClient(input.accessToken);
  const { data: pass, error } = await supabase.from("pases_acceso").select("id, visitante_nombre, lote_number, estado").eq("token_qr", input.tokenQr).eq("complejo_id", input.complejoId).maybeSingle();
  if (error || !pass) throw new Error("Pase no encontrado.");
  const { error: bitacoraError } = await supabase.from("bitacora_accesos").insert({
    complejo_id: input.complejoId,
    pase_id: pass.id,
    token_qr: input.tokenQr,
    guardia_id: input.guardiaId,
    visitante_nombre: pass.visitante_nombre,
    lote_number: pass.lote_number,
    tipo_evento: input.tipoEvento,
    resultado: "autorizado",
    origen: "caseta"
  });
  if (bitacoraError) throw new Error(bitacoraError.message);
  if (input.tipoEvento === "salida") {
    const { error: updateError } = await supabase.from("pases_acceso").update({ estado: "usado" }).eq("id", pass.id);
    if (updateError) throw new Error(updateError.message);
  }
}
async function getAdminMetrics(ctx) {
  const supabase = getSupabaseServerClient(ctx.accessToken);
  const startDay = /* @__PURE__ */ new Date();
  startDay.setHours(0, 0, 0, 0);
  const [{ count: totalMovimientos }, { count: totalAutorizados }, { count: totalRechazados }, { count: incidentesAbiertos }] = await Promise.all([
    supabase.from("bitacora_accesos").select("*", { count: "exact", head: true }).eq("complejo_id", ctx.complejoId).gte("created_at", startDay.toISOString()),
    supabase.from("bitacora_accesos").select("*", { count: "exact", head: true }).eq("complejo_id", ctx.complejoId).eq("resultado", "autorizado").gte("created_at", startDay.toISOString()),
    supabase.from("bitacora_accesos").select("*", { count: "exact", head: true }).eq("complejo_id", ctx.complejoId).eq("resultado", "rechazado").gte("created_at", startDay.toISOString()),
    supabase.from("incidentes").select("*", { count: "exact", head: true }).eq("complejo_id", ctx.complejoId).neq("estado", "cerrado")
  ]);
  return {
    totalMovimientos: totalMovimientos ?? 0,
    totalAutorizados: totalAutorizados ?? 0,
    totalRechazados: totalRechazados ?? 0,
    incidentesAbiertos: incidentesAbiertos ?? 0
  };
}
async function registerBitacoraEvent(input) {
  await input.supabase.from("bitacora_accesos").insert({
    complejo_id: input.complejoId,
    token_qr: input.token,
    guardia_id: input.guardiaId ?? null,
    visitante_nombre: input.visitanteNombre,
    tipo_evento: input.tipoEvento,
    resultado: input.resultado,
    razon: input.razon ?? null,
    origen: "scanner"
  });
}

export { getBitacoraByComplejo as a, getActivePassesForResident as b, createVisitorPass as c, getAdminMetrics as g, registerAccessMovement as r, validateAccessQr as v };
