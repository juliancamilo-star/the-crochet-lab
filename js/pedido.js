import { CONFIG } from "./config.js";
import { hasDb, insert } from "./supabase.js";
import { validateOrder } from "./validate.js";
const form = document.querySelector("#order"), out = document.querySelector("#result");
const url = new URLSearchParams(location.search).get("producto");
if (url) form.details.value = `Me interesa: ${url}. `;
form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (form.website.value) return; // campo trampa para robots
  const data = Object.fromEntries(["name", "contact", "piece", "details", "colors"].map((k) => [k, form[k].value.trim()]));
  const errors = validateOrder(data);
  form.querySelectorAll("[data-err]").forEach((s) => (s.textContent = errors[s.dataset.err] || ""));
  form.querySelectorAll("input,select,textarea").forEach((f) => f.setAttribute("aria-invalid", String(Boolean(errors[f.name]))));
  if (Object.keys(errors).length) { form.querySelector("[aria-invalid=true]").focus(); return; }
  const btn = form.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Enviando…";
  let saved = false;
  try { if (hasDb()) { await insert("solicitudes", data); saved = true; } }
  catch { out.textContent = "No pudimos guardar tu solicitud. Envíala por WhatsApp con el botón de abajo."; }
  const msg = `¡Hola The Crochet Lab! Soy ${data.name}. Quiero: ${data.piece}. ${data.details}${data.colors ? " Colores: " + data.colors : ""}`;
  const a = document.createElement("a"); a.className = "btn"; a.textContent = "Enviar también por WhatsApp";
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`; a.target = "_blank"; a.rel = "noopener";
  if (saved) { out.textContent = "¡Listo! Registramos tu solicitud y te escribiremos pronto."; form.reset(); }
  else if (!hasDb()) out.textContent = "Modo demo: aún no hay base de datos conectada, así que la solicitud no se guardó. Puedes enviarla por WhatsApp.";
  out.append(" ", a); out.focus();
  btn.disabled = false; btn.textContent = "Enviar solicitud";
});
