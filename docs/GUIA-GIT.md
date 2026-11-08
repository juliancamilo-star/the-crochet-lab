# Guía de Git y GitHub (Fase 4)

Git guarda el historial de tu proyecto en "fotos" llamadas commits. Cada commit debe ser un cambio completo y entendible.

## 1. Preparar Git (una sola vez)

```
git --version
git config --global user.name "Tu Nombre"
git config --global user.email "tu-correo-de-github@ejemplo.com"
git config --global init.defaultBranch main
```
Si `git --version` falla, instala Git desde git-scm.com y vuelve a abrir la terminal.

## 2. Crear el repositorio local

Dentro de la carpeta `the-crochet-lab`:
```
git init
git status
```
`git status` muestra los archivos aún sin guardar. Úsalo antes y después de cada paso.

## 3. Los primeros seis commits

Cada bloque agrupa archivos que forman un cambio completo. Ejecuta uno por uno.

```
git add README.md .gitignore .nojekyll package.json
git commit -m "Crea la estructura base del proyecto"

git add index.html css js/app.js js/config.js js/data.js
git commit -m "Añade la portada con la identidad visual"

git add js/supabase.js js/products.js supabase/schema.sql
git commit -m "Prepara la capa de datos y el esquema de Supabase"

git add catalogo.html js/catalogo.js
git commit -m "Añade el catálogo con búsqueda y filtros"

git add pedido.html js/pedido.js js/validate.js tests
git commit -m "Añade el formulario de pedido con validación y pruebas"

git add docs
git commit -m "Documenta la arquitectura y la guía de Git"
```
Comprueba con `git log --oneline`: deben verse 6 commits. Con `git status` debe decir "nothing to commit".

## 4. Subirlo a GitHub

1. En github.com pulsa **New repository**. Nombre: `the-crochet-lab`. Público. **No** marques README ni .gitignore (ya los tienes).
2. En tu terminal (cambia TU-USUARIO):
```
git remote add origin https://github.com/TU-USUARIO/the-crochet-lab.git
git push -u origin main
```
3. Si pide contraseña, GitHub ya no acepta la de tu cuenta: inicia sesión en la ventana del navegador que se abre, o usa un Personal Access Token (Settings > Developer settings).

## 5. Publicar con GitHub Pages

En el repositorio: **Settings > Pages > Build and deployment**. Source: *Deploy from a branch*. Branch: `main`, carpeta `/ (root)`. Guarda y espera uno o dos minutos. Tu web quedará en `https://TU-USUARIO.github.io/the-crochet-lab/`.

## 6. Qué viene

- Fase 6 y 7: trabajaremos en ramas (`git switch -c fase-6-backend`), las probaremos y las uniremos a `main` con `git merge`.
- Cada avance real será un commit nuevo. Al terminar tendrás bastante más de 15, todos con sentido.
