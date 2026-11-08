// Ventana de detalle de producto con <dialog>: se cierra con Esc, con "Cerrar" o tocando fuera.
let dlg;
export function openDetail(p, priceText) {
  if (!dlg) {
    dlg = document.createElement("dialog");
    dlg.className = "detail";
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    document.body.append(dlg);
  }
  const art = document.createElement("div");
  art.className = "card__art";
  art.style.setProperty("--tone", p.color || "#C9B8FF");
  if (p.image_url) { const i = document.createElement("img"); i.src = p.image_url; i.alt = p.name; art.append(i); }
  const h = document.createElement("h2"); h.textContent = p.name;
  const m = document.createElement("p"); m.className = "card__meta"; m.textContent = `${p.category} · ${priceText}`;
  const d = document.createElement("p"); d.textContent = p.description;
  const go = document.createElement("a"); go.className = "btn"; go.textContent = "Pedir algo así";
  go.href = `pedido.html?producto=${encodeURIComponent(p.name)}`;
  const x = document.createElement("button"); x.type = "button"; x.className = "detail__close"; x.textContent = "Cerrar";
  x.addEventListener("click", () => dlg.close());
  const box = document.createElement("div"); box.className = "detail__body"; box.append(h, m, d, go, x);
  dlg.replaceChildren(art, box);
  dlg.showModal();
}
