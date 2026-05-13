-- =============================================================================
-- PELIGRO: borra datos de app + usuarios de Auth (excepto estructura).
-- Ejecutar solo en local / proyecto de pruebas.
--
-- Tras el script quedan 3 usuarios (misma contraseña de demo):
--   guardia@nauka.com   -> rol guardia
--   admin@nauka.com     -> rol admin
--   residente@nauka.com -> rol solicitante (en BD ya no existe "residente")
--
-- Contraseña demo (cámbiala en producción): NaukaDemo2026!
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1) Storage — NO uses DELETE en storage.objects: Supabase bloquea con
--    storage.protect_delete(). Vacía buckets desde:
--    Dashboard → Storage → (cada bucket) → Select all → Delete
--    o Storage API (service role): remove([paths]) por bucket.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 2) Datos públicos (orden respetando FKs)
-- ---------------------------------------------------------------------------
delete from public.notificaciones_caseta;
delete from public.bitacora_accesos;
delete from public.incidentes;
delete from public.pases_acceso;

update public.lotes
set responsable_profile_id = null
where responsable_profile_id is not null;

delete from public.lotes;
delete from public.profiles;

-- Opcional: vaciar complejos y volver a sembrar el default
delete from public.complejos;
insert into public.complejos (id, nombre)
values ('complejo-1', 'Nauka Nayarit')
on conflict (id) do update set nombre = excluded.nombre;

-- ---------------------------------------------------------------------------
-- 3) Auth: hijos de usuario primero (si falla una línea, coméntala según tu versión de Supabase)
-- ---------------------------------------------------------------------------
delete from auth.mfa_amr_claims;
delete from auth.refresh_tokens;
delete from auth.mfa_challenges;
delete from auth.mfa_factors;
delete from auth.sessions;
delete from auth.identities;
delete from auth.users;

-- ---------------------------------------------------------------------------
-- 4) Tres usuarios + identidades (dispara trigger -> public.profiles)
-- ---------------------------------------------------------------------------
do $$
declare
  inst uuid;
  uid_guardia uuid := gen_random_uuid();
  uid_admin uuid := gen_random_uuid();
  uid_solic uuid := gen_random_uuid();
  pwd text := crypt('NaukaDemo2026!', gen_salt('bf'));
begin
  select id into inst from auth.instances limit 1;
  if inst is null then
    inst := '00000000-0000-0000-0000-000000000000'::uuid;
  end if;

  -- Guardia
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    inst,
    uid_guardia,
    'authenticated',
    'authenticated',
    'guardia@nauka.com',
    pwd,
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', 'guardia',
      'complejo_id', 'complejo-1',
      'onboarding_status', 'activo'
    ),
    jsonb_build_object('full_name', 'Guardia demo'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    'guardia@nauka.com',
    uid_guardia,
    jsonb_build_object('sub', uid_guardia::text, 'email', 'guardia@nauka.com', 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  );

  -- Admin de plataforma / complejo
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    inst,
    uid_admin,
    'authenticated',
    'authenticated',
    'admin@nauka.com',
    pwd,
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', 'admin',
      'complejo_id', 'complejo-1',
      'onboarding_status', 'activo'
    ),
    jsonb_build_object('full_name', 'Admin demo'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    'admin@nauka.com',
    uid_admin,
    jsonb_build_object('sub', uid_admin::text, 'email', 'admin@nauka.com', 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  );

  -- "Residente" en correo -> rol solicitante en esquema actual
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    inst,
    uid_solic,
    'authenticated',
    'authenticated',
    'residente@nauka.com',
    pwd,
    now(),
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'role', 'solicitante',
      'complejo_id', 'complejo-1',
      'onboarding_status', 'activo'
    ),
    jsonb_build_object('full_name', 'Solicitante demo'),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    'residente@nauka.com',
    uid_solic,
    jsonb_build_object('sub', uid_solic::text, 'email', 'residente@nauka.com', 'email_verified', true),
    'email',
    now(),
    now(),
    now()
  );
end $$;

-- Ajustes de perfil (lote demo para solicitante; términos ya suelen venir del trigger)
update public.profiles
set
  lot_number = 'A-1',
  complejo_id = 'complejo-1'
where id = (select id from auth.users where lower(email) = lower('residente@nauka.com'));

update public.profiles
set lot_number = 'CAS-1'
where id = (select id from auth.users where lower(email) = lower('guardia@nauka.com'));

commit;

-- Verificación rápida
-- select u.email, p.role, p.onboarding_status, p.lot_number
-- from auth.users u
-- join public.profiles p on p.id = u.id
-- order by u.email;
