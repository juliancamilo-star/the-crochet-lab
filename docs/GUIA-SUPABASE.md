# Guía de Supabase (Fase 6)

1. En supabase.com pulsa **New project**. Nombre `the-crochet-lab`, elige una contraseña de base de datos (guárdala en un gestor, no en el repo) y la región más cercana.
2. **SQL Editor > New query**: pega todo `supabase/schema.sql` y pulsa Run. Después haz lo mismo con `supabase/02-storage.sql`.
3. **Authentication > Users > Add user**: crea tu usuario con correo y contraseña (marca "Auto confirm"). Copia su UUID.
4. En el SQL Editor ejecuta (con tu UUID): `insert into public.admins (user_id) values ('TU-UUID');`
5. **Authentication > Sign In / Providers**: desactiva "Allow new users to sign up". Así nadie más puede crear cuentas.
6. **Project Settings > API** (o API Keys): copia la **Project URL** y la clave **anon / publishable**. Nunca copies la clave `service_role` ni la secreta.
7. Pega ambas en `js/config.js` (`supabaseUrl`, `supabaseAnonKey`). La clave anon es pública por diseño; la protección real son las reglas RLS.
8. Prueba: abre `admin.html`, entra, crea un producto con foto, y revisa que aparezca en `catalogo.html`. Envía una solicitud en `pedido.html` y revisa que aparezca en el panel.
