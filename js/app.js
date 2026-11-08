import { CONFIG } from "./config.js";
import { DEMO_PRODUCTS } from "./data.js";
import { openDetail } from "./detail.js";
import { reveal } from "./reveal.js";

const money = (n) => new Intl.NumberFormat("es-CO", { style: "currency", currency: CONFIG.currency, maximumFractionDigits: 0 }).format(n);

// Crea la tarjeta de un producto sin usar innerHTML con datos externos (evita inyección de código).
export function productCard(p) {
  const li = document.createElement("li");
  li.className = "card";
  const art = document.createElement("div");
  art.className = "card__art";
  art.style.setProperty("--tone", p.color || "#C9B8FF");
  if (p.image_url) {
    const img = document.createElement("img");
    img.src = p.image_url; img.alt = p.name; img.loading = "lazy";
    art.append(img);
  }
  const body = document.createElement("div");
  body.className = "card__body";
  const h = document.createElement("h3"); h.textContent = p.name;
  const d = document.createElement("p"); d.textContent = p.description;
  const f = document.createElement("p"); f.className = "card__meta";
  f.textContent = `${p.category} · ${money(p.price)}`;
  const more = document.createElement("button");
  more.type = "button"; more.className = "card__more"; more.textContent = "Ver detalle";
  more.setAttribute("aria-label", `Ver detalle de ${p.name}`);
  more.addEventListener("click", () => openDetail(p, money(p.price)));
  body.append(h, d, f, more);
  li.append(art, body);
  reveal(li);
  return li;
}

const featured = document.querySelector("#featured");
if (featured) DEMO_PRODUCTS.slice(0, 3).forEach((p) => featured.append(productCard(p)));

document.querySelectorAll("[data-whatsapp]").forEach((a) => {
  const text = encodeURIComponent("¡Hola The Crochet Lab! Quiero hacer un pedido.");
  a.href = `https://wa.me/${CONFIG.whatsapp}?text=${text}`;
});

document.querySelectorAll("main section:not(.hero)").forEach(reveal);
