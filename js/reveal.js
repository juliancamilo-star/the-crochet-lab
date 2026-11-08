// Aparición suave al hacer scroll. No hace nada si el visitante pidió menos movimiento.
const ok = "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches;
const io = ok ? new IntersectionObserver((es) => es.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: 0.12 }) : null;
export function reveal(el) { if (!io) return; el.classList.add("reveal"); io.observe(el); }
