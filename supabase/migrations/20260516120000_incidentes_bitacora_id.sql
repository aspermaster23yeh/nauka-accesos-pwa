-- Vincular incidentes al registro de bitácora desde el detalle de movimiento
alter table public.incidentes
  add column if not exists bitacora_id uuid references public.bitacora_accesos (id) on delete set null;

create index if not exists idx_incidentes_bitacora on public.incidentes (bitacora_id)
where bitacora_id is not null;
