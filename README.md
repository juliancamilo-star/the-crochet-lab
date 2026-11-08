# The Crochet Lab

Web de un emprendimiento de crochet: catálogo, pedidos personalizados, panel de administración y asistente de IA. Proyecto final "Mi emprendimiento digital" (Jóvenes creativos, ruta básica).

## Estructura

| Ruta | Contenido |
|---|---|
| `index.html`, `catalogo.html`, `pedido.html` | Páginas públicas |
| `css/styles.css` | Estilos y diseño responsive |
| `js/` | Lógica: configuración, productos, formulario, validación, cliente de Supabase |
| `supabase/schema.sql` | Tablas y reglas de seguridad de la base de datos |
| `tests/` | Pruebas automáticas |
| `docs/` | Arquitectura y guía de Git |

## Ejecutar en tu computador

```
python3 -m http.server 8000
```
Abre http://localhost:8000. (No funciona con doble clic: los módulos de JavaScript necesitan un servidor.)

## Pruebas

```
npm test
```

## Seguridad

El repositorio es público. Las claves privadas (como la de la IA) nunca se suben: viven como secretos en el servidor intermedio. Ver `docs/ARQUITECTURA.md`.
