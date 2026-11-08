import { productCard } from "./app.js";
import { getProducts } from "./products.js";
const list = document.querySelector("#list"), status = document.querySelector("#status");
const filters = document.querySelector("#filters"), search = document.querySelector("#search");
let all = [], cat = "Todo";
const draw = () => {
  const q = search.value.trim().toLowerCase();
  const items = all.filter((p) => (cat === "Todo" || p.category === cat) && `${p.name} ${p.description}`.toLowerCase().includes(q));
  list.replaceChildren(...items.map(productCard));
  status.textContent = items.length ? `${items.length} productos` : "No encontramos nada con ese filtro. Prueba otra categoría o escríbenos tu idea en Haz tu pedido.";
};
try {
  all = await getProducts();
  [...new Set(all.map((p) => p.category))].sort().forEach((c) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = c; filters.append(b);
  });
  filters.addEventListener("click", (ev) => {
    if (ev.target.tagName !== "BUTTON") return;
    cat = ev.target.textContent;
    filters.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === ev.target)));
    draw();
  });
  search.addEventListener("input", draw);
  draw();
} catch {
  status.textContent = "No pudimos cargar el catálogo. Recarga la página en unos minutos o escríbenos por WhatsApp.";
}
