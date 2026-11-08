// Cliente mínimo de Supabase usando fetch (sin librerías). Solo usa la clave pública (anon).
import { CONFIG } from "./config.js";
export const hasDb = () => Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
// token = sesión del admin (Fase 6). Sin token se usa la clave pública.
const headers = (token, extra = {}) => ({
  apikey: CONFIG.supabaseAnonKey,
  Authorization: `Bearer ${token || CONFIG.supabaseAnonKey}`,
  "Content-Type": "application/json",
  ...extra,
});
export async function select(table, query = "select=*", token) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${query}`, { headers: headers(token) });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
  return r.json();
}
export async function insert(table, row, token) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}`, {
    method: "POST", headers: headers(token, { Prefer: "return=minimal" }), body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
}

// ---- Autenticación y escritura (panel admin) ----
export async function signIn(email, password) {
  const r = await fetch(`${CONFIG.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: CONFIG.supabaseAnonKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("Correo o contraseña incorrectos.");
  return r.json();
}
export async function update(table, id, patch, token) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH", headers: headers(token, { Prefer: "return=minimal" }), body: JSON.stringify(patch),
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
}
export async function remove(table, id, token) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: "DELETE", headers: headers(token) });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
}
// Sube una imagen al bucket público "productos" y devuelve su URL pública.
export async function uploadImage(file, token) {
  const ext = file.type.split("/")[1];
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const r = await fetch(`${CONFIG.supabaseUrl}/storage/v1/object/productos/${path}`, {
    method: "POST", headers: { apikey: CONFIG.supabaseAnonKey, Authorization: `Bearer ${token}`, "Content-Type": file.type }, body: file,
  });
  if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
  return `${CONFIG.supabaseUrl}/storage/v1/object/public/productos/${path}`;
}
