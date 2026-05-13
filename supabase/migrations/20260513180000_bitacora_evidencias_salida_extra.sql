-- Hasta 3 evidencias por salida (check-out); la primera sigue siendo la obligatoria en app.
alter table public.bitacora_accesos add column if not exists evidencia_storage_path_2 text;
alter table public.bitacora_accesos add column if not exists evidencia_storage_path_3 text;

comment on column public.bitacora_accesos.evidencia_storage_path is 'Evidencia 1 de salida (obligatoria si tipo_evento = salida).';
comment on column public.bitacora_accesos.evidencia_storage_path_2 is 'Evidencia 2 de salida (opcional).';
comment on column public.bitacora_accesos.evidencia_storage_path_3 is 'Evidencia 3 de salida (opcional).';
