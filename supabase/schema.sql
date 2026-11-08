-- Ejecutar en Supabase > SQL Editor. Crea tablas y reglas de seguridad (RLS).
create table public.productos (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  category text not null check (char_length(category) between 2 and 40),
  price integer not null check (price >= 0),
  description text not null default '' check (char_length(description) <= 500),
  image_url text, color text default '#C9B8FF',
  active boolean not null default true, created_at timestamptz not null default now());
create table public.solicitudes (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 80),
  contact text not null check (char_length(contact) between 5 and 120),
  piece text not null check (char_length(piece) between 2 and 40),
  details text not null check (char_length(details) between 10 and 1000),
  colors text check (char_length(colors) <= 120),
  status text not null default 'nueva', created_at timestamptz not null default now());
create table public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create function public.is_admin() returns boolean language sql stable security definer set search_path = public
  as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;
alter table public.productos enable row level security;
alter table public.solicitudes enable row level security;
alter table public.admins enable row level security;
create policy "catalogo publico" on public.productos for select using (active or public.is_admin());
create policy "admin gestiona productos" on public.productos for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "cualquiera envia solicitudes" on public.solicitudes for insert to anon, authenticated with check (status = 'nueva');
create policy "admin lee solicitudes" on public.solicitudes for select to authenticated using (public.is_admin());
create policy "admin actualiza solicitudes" on public.solicitudes for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- Datos de ejemplo
insert into public.productos (name, category, price, description, color) values
 ('Amigurumi de pulpo','Amigurumis',45000,'Pulpo de 20 cm con tentáculos que se enroscan. Hilo de algodón suave.','#FF8FC7'),
 ('Bolso tote de granny squares','Accesorios',85000,'Cuadros de colores unidos a mano, con forro interior y asa resistente.','#B8F2D0'),
 ('Gorro beanie lila','Ropa',38000,'Punto elástico, calentito y cómodo. Se teje en la talla que necesites.','#C9B8FF'),
 ('Portavasos florales (x4)','Decoración',28000,'Set de cuatro flores lavables para tu escritorio o tu mesa.','#FFE27A');
-- Después de crear tu usuario en Authentication > Users, hazlo admin (Fase 6):
-- insert into public.admins (user_id) values ('PEGA-AQUI-EL-UUID-DE-TU-USUARIO');
