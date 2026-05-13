-- Lote: responsable (perfil solicitante u otro usuario del complejo)

alter table public.lotes add column if not exists responsable_profile_id uuid references public.profiles (id) on delete set null;

create index if not exists idx_lotes_responsable on public.lotes (responsable_profile_id);
create index if not exists idx_lotes_complejo_number on public.lotes (complejo_id, lot_number);
