// Asistente de pedidos: habla con el Worker (nunca con Gemini directo). El navegador no guarda ninguna clave.
import { CONFIG } from "./config.js";
const box = document.querySelector("#assistant");
const status = box?.querySelector("#ia-status");
if (box && !CONFIG.aiEndpoint) status.textContent = "El asistente aún no está configurado (falta aiEndpoint en js/config.js). Mientras tanto puedes usar el formulario.";
if (box && CONFIG.aiEndpoint) {
  status.remove();
  box.querySelectorAll("#chatform [disabled]").forEach((e) => (e.disabled = false));
  const log = box.querySelector("#chat"), form = box.querySelector("#chatform"), input = form.elements.q, send = form.querySelector("button");
  const history = [];
  const add = (role, text) => { const li = document.createElement("li"); li.className = `msg msg--${role}`; li.textContent = text; log.append(li); li.scrollIntoView({ block: "nearest" }); return li; };
  const fill = (o) => {
    const f = document.querySelector("#order");
    if ([...f.piece.options].some((x) => x.value === o.piece || x.text === o.piece)) f.piece.value = o.piece;
    f.details.value = o.details; f.colors.value = o.colors || ""; f.scrollIntoView({ behavior: "smooth" }); f.name.focus();
  };
  add("bot", "¡Hola! Cuéntame qué te gustaría que tejamos y te ayudo a dejar el pedido claro.");
  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const text = input.value.trim(); if (!text) return;
    add("user", text); history.push({ role: "user", text }); input.value = ""; send.disabled = true;
    const wait = add("bot", "Escribiendo…"); const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch(CONFIG.aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.slice(-8) }), signal: ctl.signal });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Error");
      wait.textContent = d.reply; history.push({ role: "assistant", text: d.reply });
      if (d.order) { const b = document.createElement("button"); b.type = "button"; b.className = "card__more"; b.textContent = "Pasar este resumen al formulario"; b.onclick = () => fill(d.order); wait.append(document.createElement("br"), b); }
    } catch (e) {
      history.pop(); wait.textContent = e.name === "AbortError" ? "Tardó demasiado. Intenta de nuevo o usa el formulario." : (e.message && e.message !== "Failed to fetch" ? e.message : "El asistente no está disponible ahora. Puedes llenar el formulario o escribirnos por WhatsApp.");
    } finally { clearTimeout(t); send.disabled = false; input.focus(); }
  });
}
