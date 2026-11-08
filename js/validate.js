// Reglas del formulario de pedido. Se repiten en la base de datos (supabase/schema.sql): nunca confíes solo en el navegador.
export function validateOrder(d) {
  const e = {};
  const len = (s) => (s || "").trim().length;
  if (len(d.name) < 2 || len(d.name) > 80) e.name = "Escribe tu nombre (2 a 80 letras).";
  const c = (d.contact || "").trim();
  const isMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
  const isPhone = c.replace(/\D/g, "").length >= 7 && /^[\d\s+()-]+$/.test(c);
  if (!isMail && !isPhone) e.contact = "Escribe un WhatsApp o un correo válido.";
  if (!d.piece) e.piece = "Elige el tipo de pieza.";
  if (len(d.details) < 10 || len(d.details) > 1000) e.details = "Cuéntanos la idea con al menos 10 caracteres.";
  if (len(d.colors) > 120) e.colors = "Máximo 120 caracteres.";
  return e;
}
