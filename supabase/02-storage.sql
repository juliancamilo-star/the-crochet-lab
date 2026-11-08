-- Ejecutar DESPUÉS de schema.sql. Bucket público para fotos de productos; solo el admin sube o borra.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "admin sube imagenes" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.is_admin());
create policy "admin borra imagenes" on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and public.is_admin());
