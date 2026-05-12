-- Nauka: solicitante + super_admin, cumplimiento, evidencias, storage, RLS seguro

-- ---------------------------------------------------------------------------
-- Buckets (privados; subida vía service role en API)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('identificaciones', 'identificaciones', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('evidencias_salida', 'evidencias_salida', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Columnas nuevas
-- ---------------------------------------------------------------------------
alter table public.bitacora_accesos add column if not exists evidencia_storage_path text;

alter table public.profiles add column if not exists terms_accepted_at timestamptz;
alter table public.profiles add column if not exists terms_version text;
alter table public.profiles add column if not exists onboarding_status text;
alter table public.profiles add column if not exists ine_storage_path text;
alter table public.profiles add column if not exists approved_at timestamptz;
alter table public.profiles add column if not exists approved_by uuid references auth.users (id) on delete set null;

update public.profiles
set
  onboarding_status = coalesce(onboarding_status, 'activo'),
  terms_accepted_at = coalesce(terms_accepted_at, now()),
  terms_version = coalesce(terms_version, '1')
where onboarding_status is null or terms_accepted_at is null;

alter table public.profiles alter column onboarding_status set default 'pendiente_terminos';
alter table public.profiles alter column onboarding_status set not null;

alter table public.profiles drop constraint if exists profiles_onboarding_status_check;
alter table public.profiles
  add constraint profiles_onboarding_status_check
  check (onboarding_status in ('pendiente_ine', 'pendiente_terminos', 'activo', 'suspendido'));

-- Roles: migrar residente -> solicitante y ampliar enum
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'solicitante' where role = 'residente';
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('solicitante', 'guardia', 'admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- Funciones helper (SECURITY DEFINER para evitar recursión RLS en policies)
-- ---------------------------------------------------------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.current_complejo()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select complejo_id from public.profiles where id = auth.uid() limit 1;
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;

grant execute on function public.current_role() to authenticated, anon;
grant execute on function public.current_complejo() to authenticated, anon;
grant execute on function public.is_super_admin() to authenticated, anon;

-- ---------------------------------------------------------------------------
-- Trigger: rol y complejo desde app_metadata (no user_metadata para rol)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  app_role text;
  app_complejo text;
  app_onboarding text;
begin
  app_role := coalesce(nullif(trim(new.raw_app_meta_data ->> 'role'), ''), 'solicitante');
  if app_role not in ('solicitante', 'guardia', 'admin', 'super_admin') then
    app_role := 'solicitante';
  end if;

  app_complejo := coalesce(
    nullif(trim(new.raw_app_meta_data ->> 'complejo_id'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'complejo_id'), ''),
    'complejo-1'
  );

  app_onboarding := coalesce(
    nullif(trim(new.raw_app_meta_data ->> 'onboarding_status'), ''),
    'pendiente_terminos'
  );
  if app_onboarding not in ('pendiente_ine', 'pendiente_terminos', 'activo', 'suspendido') then
    app_onboarding := 'pendiente_terminos';
  end if;

  insert into public.profiles (id, role, full_name, lot_number, complejo_id, onboarding_status)
  values (
    new.id,
    app_role,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'lot_number',
    app_complejo,
    app_onboarding
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS: policies actualizadas (solicitante + super_admin)
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (
  id = auth.uid()
  or public.current_role() = 'admin'
  or public.is_super_admin()
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
using (
  id = auth.uid()
  or public.current_role() = 'admin'
  or public.is_super_admin()
)
with check (
  id = auth.uid()
  or public.current_role() = 'admin'
  or public.is_super_admin()
);

drop policy if exists "resident_insert_passes" on public.pases_acceso;
create policy "solicitante_insert_passes"
on public.pases_acceso for insert
with check (
  auth.uid() = creado_por
  and public.current_role() in ('solicitante', 'admin')
  and complejo_id = public.current_complejo()
);

drop policy if exists "read_passes_by_role" on public.pases_acceso;
create policy "read_passes_by_role"
on public.pases_acceso for select
using (
  (
    public.current_role() = 'solicitante'
    and creado_por = auth.uid()
  )
  or (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

drop policy if exists "guard_update_passes" on public.pases_acceso;
create policy "guard_update_passes"
on public.pases_acceso for update
using (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
)
with check (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

drop policy if exists "insert_bitacora_guard_or_admin" on public.bitacora_accesos;
create policy "insert_bitacora_guard_or_admin"
on public.bitacora_accesos for insert
with check (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

drop policy if exists "insert_bitacora_residente_validation" on public.bitacora_accesos;
create policy "insert_bitacora_solicitante_validation"
on public.bitacora_accesos for insert
with check (
  public.current_role() = 'solicitante'
  and tipo_evento = 'validacion'
  and complejo_id = public.current_complejo()
);

drop policy if exists "select_bitacora_by_role" on public.bitacora_accesos;
create policy "select_bitacora_by_role"
on public.bitacora_accesos for select
using (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

drop policy if exists "incidentes_admin_or_guardia_select" on public.incidentes;
create policy "incidentes_admin_or_guardia_select"
on public.incidentes for select
using (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

drop policy if exists "incidentes_create_all_roles" on public.incidentes;
create policy "incidentes_create_all_roles"
on public.incidentes for insert
with check (
  public.current_role() in ('solicitante', 'guardia', 'admin')
  and complejo_id = public.current_complejo()
  and creado_por = auth.uid()
);

drop policy if exists "incidentes_update_admin" on public.incidentes;
create policy "incidentes_update_admin"
on public.incidentes for update
using (
  (
    public.current_role() = 'admin'
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
)
with check (
  (
    public.current_role() = 'admin'
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
);

-- Complejos / lotes: super_admin lee todo
drop policy if exists "complejos_read_authenticated" on public.complejos;
drop policy if exists "complejos_select_all" on public.complejos;
create policy "complejos_select_all"
on public.complejos for select
using (auth.uid() is not null);

drop policy if exists "lotes_read_by_complejo" on public.lotes;
drop policy if exists "lotes_select_scope" on public.lotes;
create policy "lotes_select_scope"
on public.lotes for select
using (
  complejo_id = public.current_complejo()
  or public.is_super_admin()
  or (
    public.current_role() = 'admin'
    and complejo_id = public.current_complejo()
  )
);
