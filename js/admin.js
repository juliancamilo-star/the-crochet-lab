import { hasDb, select, insert, update, remove, signIn, uploadImage } from "./supabase.js";
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };
const STATES = ["nueva", "contactada", "en proceso", "entregada", "descartada"];
let token = sessionStorage.getItem("cl_token"); // vive solo mientras la pestaña esté abierta
const say = (t) => { $("#msg").textContent = t; };
const f = $("#pform");

function show() { $("#login").hidden = Boolean(token); $("#panel").hidden = !token; $("#logout").hidden = !token; if (token) guard(load); }
function logout(text = "") { token = null; sessionStorage.removeItem("cl_token"); show(); say(text); }
async function guard(fn) {
  try { await fn(); }
  catch (e) { /40[13]/.test(e.message) ? logout("Tu sesión expiró o no tienes permiso de administrador.") : say(`Ocurrió un error: ${e.message}`); }
}
const btn = (text, fn) => el("button", { type: "button", className: "card__more", textContent: text, onclick: fn });

async function load() {
  const [prods, reqs] = await Promise.all([
    select("productos", "select=*&order=created_at.desc", token),
    select("solicitudes", "select=*&order=created_at.desc", token),
  ]);
  $("#products").replaceChildren(...prods.map((p) => el("li", { className: "row" },
    el("strong", { textContent: p.name }),
    el("span", { textContent: `${p.category} · $${p.price}${p.active ? "" : " · oculto"}` }),
    btn("Editar", () => edit(p)),
    btn("Eliminar", () => confirm(`¿Eliminar "${p.name}"?`) && guard(async () => { await remove("productos", p.id, token); await load(); })))));
  $("#requests").replaceChildren(...reqs.map((r) => {
    const sel = el("select", { onchange: () => guard(() => update("solicitudes", r.id, { status: sel.value }, token)) },
      ...STATES.map((s) => el("option", { value: s, textContent: s, selected: s === r.status })));
    return el("li", { className: "row" },
      el("strong", { textContent: `${r.name} · ${r.contact}` }),
      el("span", { textContent: `${r.piece}: ${r.details}${r.colors ? " · Colores: " + r.colors : ""} · ${new Date(r.created_at).toLocaleDateString("es-CO")}` }), sel);
  }));
  if (!prods.length) say("Aún no hay productos. Crea el primero con el formulario.");
}
function edit(p) {
  const e = f.elements;
  e.id.value = p.id; e.name.value = p.name; e.category.value = p.category; e.price.value = p.price;
  e.description.value = p.description || ""; e.color.value = p.color || "#C9B8FF"; e.active.checked = p.active;
  say(`Editando "${p.name}". Si no eliges foto nueva, se conserva la actual.`); f.scrollIntoView({ behavior: "smooth" });
}
f.addEventListener("submit", (ev) => { ev.preventDefault(); guard(async () => {
  const e = f.elements;
  const d = { name: e.name.value.trim(), category: e.category.value.trim(), price: Number(e.price.value), description: e.description.value.trim(), color: e.color.value, active: e.active.checked };
  if (d.name.length < 2 || d.category.length < 2 || !(d.price >= 0)) return say("Revisa nombre, categoría y precio.");
  const file = e.image.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024 || !/^image\/(jpeg|png|webp)$/.test(file.type)) return say("La foto debe ser JPG, PNG o WEBP de máximo 2 MB.");
    d.image_url = await uploadImage(file, token);
  }
  e.id.value ? await update("productos", e.id.value, d, token) : await insert("productos", d, token);
  f.reset(); e.id.value = ""; say("Producto guardado."); await load();
}); });
$("#login").addEventListener("submit", async (ev) => {
  ev.preventDefault(); const e = ev.target.elements;
  try { token = (await signIn(e.email.value.trim(), e.password.value)).access_token; sessionStorage.setItem("cl_token", token); e.password.value = ""; say(""); show(); }
  catch (err) { say(err.message); }
});
$("#logout").addEventListener("click", () => logout("Sesión cerrada."));
if (!hasDb()) { $("#login").hidden = true; say("Falta conectar Supabase: completa js/config.js (ver docs/GUIA-SUPABASE.md)."); } else show();
