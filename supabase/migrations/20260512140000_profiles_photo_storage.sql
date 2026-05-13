-- Foto de perfil (rostro) para solicitantes creados por super_admin; bucket privado.

alter table public.profiles add column if not exists photo_storage_path text;

insert into storage.buckets (id, name, public)
values ('fotos_perfil', 'fotos_perfil', false)
on conflict (id) do nothing;
