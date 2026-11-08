import real from "node:assert/strict";
let n = 0;
const assert = { equal: (...a) => { n++; real.equal(...a); }, ok: (...a) => { n++; real.ok(...a); }, deepEqual: (...a) => { n++; real.deepEqual(...a); } };
import w from "../worker/index.js";
const O = "https://user.github.io", env = { GEMINI_API_KEY: "SECRETO-123", ALLOWED_ORIGINS: `${O},http://localhost:8000` };
const call = (init = {}, e = env, url = "https://w.dev/") => w.fetch(new Request(url, init), e);
const post = (body, origin = O) => call({ method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "CF-Connecting-IP": String(Math.random()) }, body: JSON.stringify(body) });
const msgs = [{ role: "user", text: "quiero un gorro lila" }];
let seen, gem = (o) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: typeof o === "string" ? o : JSON.stringify(o) }] } }] }));
const calls = [];
globalThis.fetch = async (u, i) => { seen = { u: String(u), i }; calls.push(String(u)); return typeof gem === "function" ? gem({ reply: "¿Para quién es?", order: null }) : gem; };
assert.equal((await post({ messages: msgs }, "https://malo.com")).status, 403);
assert.equal((await call({ method: "OPTIONS", headers: { Origin: O } })).status, 204);
assert.equal((await call({ method: "GET", headers: { Origin: O } })).status, 405);
assert.equal((await post({ messages: [] })).status, 400);
assert.equal((await post({ messages: [{ role: "user", text: "x".repeat(601) }] })).status, 400);
assert.equal((await post({ messages: [{ role: "system", text: "hola" }] })).status, 400);
assert.equal((await post({ messages: [{ role: "assistant", text: "hola" }] })).status, 400);
let r = await post({ messages: msgs }); let t = await r.text();
assert.equal(r.status, 200); assert.equal(JSON.parse(t).reply, "¿Para quién es?");
assert.equal(seen.i.headers["x-goog-api-key"], "SECRETO-123"); assert.ok(!t.includes("SECRETO-123")); assert.ok(seen.u.includes("gemini-3.1-flash-lite")); assert.ok(seen.i.body.includes("thinkingLevel")); assert.ok(!seen.i.body.includes("temperature"));
assert.equal(r.headers.get("Access-Control-Allow-Origin"), O);
gem = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: "Listo", order: { piece: "Ropa", details: "Gorro lila para mi hermano", colors: "lila" } }) }] } }] }));
assert.deepEqual((await (await post({ messages: msgs })).json()).order, { piece: "Ropa", details: "Gorro lila para mi hermano", colors: "lila" });
gem = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: "Ok", order: { piece: "Arma", details: "algo muy largo y raro aqui", colors: "" } }) }] } }] }));
assert.equal((await (await post({ messages: msgs })).json()).order, null);
gem = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: "no es json" }] } }] }));
assert.equal((await post({ messages: msgs })).status, 200);
gem = () => new Response("{}", { status: 429 }); assert.equal((await post({ messages: msgs })).status, 429);
gem = () => new Response("{}", { status: 500 }); assert.equal((await post({ messages: msgs })).status, 502);
assert.equal((await call({ method: "POST", headers: { Origin: O }, body: "{}" }, { ALLOWED_ORIGINS: O })).status, 500);
// Modelo retirado (404): prueba el siguiente
calls.length = 0; let k = 0;
gem = () => (k++ === 0 ? new Response("{}", { status: 404 }) : new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: "Hola", order: null }) }] } }] })));
assert.equal((await post({ messages: msgs })).status, 200); assert.equal(calls.length, 2); assert.ok(calls[1].includes("gemini-flash-latest"));
// Todos retirados: 502 tras probar los 3 modelos de la lista; con DEBUG el mensaje trae el motivo, sin la clave
calls.length = 0; gem = () => new Response('{"error":{"message":"modelo retirado"}}', { status: 404 });
assert.equal((await post({ messages: msgs })).status, 502); assert.equal(calls.length, 3);
const dbg = await call({ method: "POST", headers: { Origin: O, "CF-Connecting-IP": "dbg" }, body: JSON.stringify({ messages: msgs }) }, { ...env, DEBUG: "1" });
const dt = await dbg.text(); assert.equal(dbg.status, 502); assert.ok(dt.includes("404") && dt.includes("modelo retirado")); assert.ok(!dt.includes("SECRETO-123"));
// Límite de uso (429): no insiste con otros modelos
calls.length = 0; gem = () => new Response("{}", { status: 429 }); assert.equal((await post({ messages: msgs })).status, 429); assert.equal(calls.length, 1);
// Modelo lento (tiempo agotado): prueba el siguiente
calls.length = 0; k = 0; const ok200 = () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ reply: "Hola", order: null }) }] } }] }));
gem = () => { if (k++ === 0) throw Object.assign(new Error("t"), { name: "TimeoutError" }); return ok200(); };
assert.equal((await post({ messages: msgs })).status, 200); assert.equal(calls.length, 2);
// Modelo sin thinkingLevel (400 "thinking"): reintenta sin ese parámetro
calls.length = 0; k = 0; const bodies = [];
globalThis.fetch = async (u, i) => { calls.push(String(u)); bodies.push(i.body); return k++ === 0 ? new Response('{"error":{"message":"Thinking level is not supported"}}', { status: 400 }) : ok200(); };
assert.equal((await post({ messages: msgs })).status, 200); assert.equal(calls.length, 2); assert.ok(bodies[0].includes("thinkingLevel") && !bodies[1].includes("thinkingConfig"));
console.log(`worker: ${n} comprobaciones OK`);
