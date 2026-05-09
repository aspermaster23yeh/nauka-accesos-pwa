-- Nauka Accesos - Initial schema with role-based security
create extension if not exists pgcrypto;

create table if not exists public.complejos (
  id text primary key,
  nombre text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lotes (
  id uuid primary key default gen_random_uuid(),
  complejo_id text not null references public.complejos (id) on delete cascade,
  lot_number text not null,
  owner_name text,
  created_at timestamptz not null default now(),
  unique (complejo_id, lot_number)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'residente' check (role in ('residente', 'guardia', 'admin')),
  full_name text,
  lot_number text,
  complejo_id text references public.complejos (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pases_acceso (
  id uuid primary key default gen_random_uuid(),
  token_qr text not null unique,
  complejo_id text not null references public.complejos (id),
  lote_number text,
  visitante_nombre text not null,
  motivo text,
  tipo_acceso text not null default 'entrada' check (tipo_acceso in ('entrada', 'salida')),
  estado text not null default 'vigente' check (estado in ('vigente', 'usado', 'cancelado')),
  telefono_destino text,
  creado_por uuid not null references auth.users (id),
  vence_en timestamptz not null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create table if not exists public.bitacora_accesos (
  id uuid primary key default gen_random_uuid(),
  complejo_id text not null references public.complejos (id),
  pase_id uuid references public.pases_acceso (id) on delete set null,
  token_qr text,
  visitante_nombre text,
  lote_number text,
  guardia_id uuid references auth.users (id),
  tipo_evento text not null check (tipo_evento in ('validacion', 'entrada', 'salida', 'incidente')),
  resultado text not null check (resultado in ('autorizado', 'rechazado')),
  razon text,
  origen text not null default 'scanner',
  created_at timestamptz not null default now()
);

create table if not exists public.incidentes (
  id uuid primary key default gen_random_uuid(),
  complejo_id text not null references public.complejos (id),
  creado_por uuid not null references auth.users (id),
  visitante_nombre text,
  lote_number text,
  descripcion text not null,
  severidad text not null default 'media' check (severidad in ('baja', 'media', 'alta')),
  estado text not null default 'abierto' check (estado in ('abierto', 'en_revision', 'cerrado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pases_token_qr on public.pases_acceso (token_qr);
create index if not exists idx_pases_complejo_estado on public.pases_acceso (complejo_id, estado, vence_en);
create index if not exists idx_bitacora_complejo_created on public.bitacora_accesos (complejo_id, created_at desc);
create index if not exists idx_bitacora_visitante on public.bitacora_accesos (visitante_nombre);
create index if not exists idx_incidentes_complejo_estado on public.incidentes (complejo_id, estado);

insert into public.complejos (id, nombre)
values ('complejo-1', 'Nauka Nayarit')
on conflict (id) do nothing;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, lot_number, complejo_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'residente'),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'lot_number',
    coalesce(new.raw_user_meta_data ->> 'complejo_id', 'complejo-1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

alter table public.complejos enable row level security;
alter table public.lotes enable row level security;
alter table public.profiles enable row level security;
alter table public.pases_acceso enable row level security;
alter table public.bitacora_accesos enable row level security;
alter table public.incidentes enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_complejo()
returns text
language sql
stable
as $$
  select complejo_id from public.profiles where id = auth.uid();
$$;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
using (id = auth.uid() or public.current_role() = 'admin')
with check (id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "resident_insert_passes" on public.pases_acceso;
create policy "resident_insert_passes"
on public.pases_acceso for insert
with check (
  auth.uid() = creado_por
  and public.current_role() in ('residente', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "read_passes_by_role" on public.pases_acceso;
create policy "read_passes_by_role"
on public.pases_acceso for select
using (
  (
    public.current_role() = 'residente'
    and creado_por = auth.uid()
  )
  or (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
);

drop policy if exists "guard_update_passes" on public.pases_acceso;
create policy "guard_update_passes"
on public.pases_acceso for update
using (
  public.current_role() in ('guardia', 'admin')
  and complejo_id = public.current_complejo()
)
with check (
  public.current_role() in ('guardia', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "insert_bitacora_guard_or_admin" on public.bitacora_accesos;
create policy "insert_bitacora_guard_or_admin"
on public.bitacora_accesos for insert
with check (
  public.current_role() in ('guardia', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "insert_bitacora_residente_validation" on public.bitacora_accesos;
create policy "insert_bitacora_residente_validation"
on public.bitacora_accesos for insert
with check (
  public.current_role() = 'residente'
  and tipo_evento = 'validacion'
  and complejo_id = public.current_complejo()
);

drop policy if exists "select_bitacora_by_role" on public.bitacora_accesos;
create policy "select_bitacora_by_role"
on public.bitacora_accesos for select
using (
  public.current_role() in ('guardia', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "incidentes_admin_or_guardia_select" on public.incidentes;
create policy "incidentes_admin_or_guardia_select"
on public.incidentes for select
using (
  public.current_role() in ('guardia', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "incidentes_create_all_roles" on public.incidentes;
create policy "incidentes_create_all_roles"
on public.incidentes for insert
with check (
  public.current_role() in ('residente', 'guardia', 'admin')
  and complejo_id = public.current_complejo()
  and creado_por = auth.uid()
);

drop policy if exists "incidentes_update_admin" on public.incidentes;
create policy "incidentes_update_admin"
on public.incidentes for update
using (
  public.current_role() = 'admin'
  and complejo_id = public.current_complejo()
)
with check (
  public.current_role() = 'admin'
  and complejo_id = public.current_complejo()
);
