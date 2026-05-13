-- Rol comité (solo lectura) + RLS bitácora/pases para lectores del mismo complejo.
-- Inmutabilidad: no hay políticas UPDATE/DELETE en bitacora_accesos para roles autenticados (solo service role).

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('solicitante', 'guardia', 'admin', 'super_admin', 'lector_junta'));

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
  if app_role not in ('solicitante', 'guardia', 'admin', 'super_admin', 'lector_junta') then
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

  if app_role = 'lector_junta' then
    app_onboarding := 'activo';
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

drop policy if exists "select_bitacora_by_role" on public.bitacora_accesos;
create policy "select_bitacora_by_role"
on public.bitacora_accesos for select
using (
  (
    public.current_role() in ('guardia', 'admin')
    and complejo_id = public.current_complejo()
  )
  or public.is_super_admin()
  or (
    public.current_role() = 'lector_junta'
    and complejo_id = public.current_complejo()
  )
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
  or (
    public.current_role() = 'lector_junta'
    and complejo_id = public.current_complejo()
  )
);

comment on table public.bitacora_accesos is
  'Registro inmutable de eventos. Correcciones operativas deben documentarse como nuevas filas; no editar ni borrar filas existentes salvo mantenimiento con service role.';
