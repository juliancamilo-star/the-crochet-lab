// Única puerta de entrada a los productos: base de datos si está configurada, datos de ejemplo si no.
import { DEMO_PRODUCTS } from "./data.js";
import { hasDb, select } from "./supabase.js";
export async function getProducts() {
  if (!hasDb()) return DEMO_PRODUCTS;
  return select("productos", "select=*&active=eq.true&order=created_at.desc");
}
