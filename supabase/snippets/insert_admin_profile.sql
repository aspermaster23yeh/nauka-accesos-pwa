-- =============================================================================
-- Admin de complejo: correo, contraseña y perfil
-- =============================================================================
--
-- Correo y contraseña NO se guardan en public.profiles.
-- Van en auth.users cuando creas el usuario en Supabase Auth.
--
-- ORDEN CORRECTO:
--
-- 1) Crear el usuario (correo + contraseña)
--    Opción A — Recomendada: Dashboard → Authentication → Users → "Add user"
--      - Email: tu-admin@ejemplo.com
--      - Password: (la que quieras; cumple política de Auth de tu proyecto)
--      - Marca "Auto Confirm User" si no quieres flujo de correo en desarrollo
--    Opción B: Invitar desde tu app (super admin) o Auth API admin.createUser
--
-- 2) Ejecuta el INSERT de abajo: enlaza el perfil al usuario por correo
--    (sustituye admin@tu-dominio.com por el correo del paso 1).
--
-- Si prefieres usar el UUID a mano:
--    select id, email from auth.users where email = 'tu-admin@ejemplo.com';
--    Luego insert into public.profiles (id, ...) values ('<uuid>'::uuid, ...);
-- =============================================================================
-- Variante: ya creaste el usuario en Auth con un correo conocido
-- (la contraseña la pusiste al crear el usuario; no va en SQL).
-- Sustituye solo el correo en la línea WHERE.
-- Si no inserta ninguna fila, ese correo no existe en auth.users.
-- =============================================================================

insert into public.profiles (
  id,
  role,
  full_name,
  lot_number,
  complejo_id,
  onboarding_status,
  terms_accepted_at,
  terms_version
)
select
  u.id,
  'admin',
  'Administrador complejo',
  null,
  'complejo-1',
  'activo',
  now(),
  '1'
from auth.users u
where lower(u.email) = lower('admin@nauka.com')
on conflict (id) do update
set
  role = excluded.role,
  complejo_id = excluded.complejo_id,
  full_name = excluded.full_name,
  onboarding_status = 'activo',
  terms_accepted_at = coalesce(public.profiles.terms_accepted_at, now()),
  terms_version = coalesce(public.profiles.terms_version, '1');

