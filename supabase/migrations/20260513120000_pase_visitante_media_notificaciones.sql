-- Fotos del visitante (rostro + INE) en cada pase; notificaciones a administración en entrada/salida en caseta.

-- Bucket privado (subida vía service role en API, igual que evidencias_salida)
insert into storage.buckets (id, name, public)
values ('pases_visitante', 'pases_visitante', false)
on conflict (id) do nothing;

alter table public.pases_acceso add column if not exists visitante_foto_storage_path text;
alter table public.pases_acceso add column if not exists visitante_ine_storage_path text;

create table if not exists public.notificaciones_caseta (
  id uuid primary key default gen_random_uuid(),
  complejo_id text not null references public.complejos (id) on delete cascade,
  tipo text not null check (tipo in ('entrada', 'salida')),
  bitacora_id uuid references public.bitacora_accesos (id) on delete cascade,
  visitante_nombre text,
  lote_number text,
  guardia_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notif_caseta_created on public.notificaciones_caseta (created_at desc);
create index if not exists idx_notif_caseta_complejo on public.notificaciones_caseta (complejo_id, created_at desc);

alter table public.notificaciones_caseta enable row level security;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'super_admin')
  );
$$;

grant execute on function public.is_platform_admin() to authenticated, anon;

drop policy if exists "notif_caseta_select_platform_admin" on public.notificaciones_caseta;
create policy "notif_caseta_select_platform_admin"
on public.notificaciones_caseta for select
using (
  public.is_platform_admin()
  and (
    public.is_super_admin()
    or complejo_id = public.current_complejo()
  )
);
