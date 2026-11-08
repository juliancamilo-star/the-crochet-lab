"""Pruebas de extremo a extremo (opcional). Requiere: pip install playwright && playwright install chromium
Uso, desde la raíz del proyecto: python3 tests/e2e/e2e.py   (usa un servidor simulado; no toca tu Supabase real)"""
import subprocess, sys, time, os, json
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")); PORT = 8160; B = f"http://localhost:{PORT}/"
srv = subprocess.Popen([sys.executable, os.path.join(ROOT, "tests/e2e/mock_server.py"), ROOT, str(PORT)]); time.sleep(1)
res = []; errs = []
def ok(n, c): res.append(("OK    " if c else "FALLA ") + n)
def lum(h):
    f = lambda c: c / 12.92 if c <= .03928 else ((c + .055) / 1.055) ** 2.4
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b)
def cr(a, b): x, y = sorted([lum(a), lum(b)], reverse=True); return (x + .05) / (y + .05)
PAIRS = {"botón (blanco/violeta)": ("#FFFFFF", "#5B3FFF"), "texto/fondo": ("#1E1B3A", "#FBFAFF"), "texto/lila": ("#1E1B3A", "#C9B8FF"),
         "texto/menta": ("#1E1B3A", "#B8F2D0"), "texto/mantequilla": ("#1E1B3A", "#FFE27A"), "error/fondo": ("#C0262D", "#FBFAFF"), "blanco/tinta": ("#FFFFFF", "#1E1B3A")}
for n, (a, b) in PAIRS.items(): ok(f"contraste {n} >= 4.5 ({cr(a, b):.1f})", cr(a, b) >= 4.5)
LONG = [{"id": 1, "name": "A" * 70, "category": "Prueba", "price": 1000, "description": "B" * 140, "color": "#B8F2D0", "image_url": None, "active": True, "created_at": "2026"}]
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        for w in (360, 1280):
            pg = b.new_page(viewport={"width": w, "height": 800}); pg.on("pageerror", lambda e: errs.append(str(e)))
            for u in ["index.html", "catalogo.html", "pedido.html", "admin.html"]:
                pg.goto(B + u); pg.wait_for_load_state("networkidle")
                ok(f"{w}px {u}: sin scroll horizontal", pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
                ok(f"{w}px {u}: un solo h1, lang=es, título", pg.locator("h1").count() == 1 and pg.get_attribute("html", "lang") == "es" and len(pg.title()) > 3)
                bad = pg.evaluate("""[...document.querySelectorAll('a,button,select,input:not([type=hidden]):not(.trap):not([type=checkbox]),textarea')].filter(e=>e.offsetParent&&!e.closest('footer')&&e.getBoundingClientRect().height<40).map(e=>e.tagName+':'+(e.textContent||e.name).trim().slice(0,20))""")
                ok(f"{w}px {u}: zonas táctiles >= 40 px {bad}", not bad)
                unl = pg.evaluate("""[...document.querySelectorAll('input:not([type=hidden]):not(.trap),select,textarea')].filter(e=>e.offsetParent&&!e.labels.length&&!e.getAttribute('aria-label')).length""")
                ok(f"{w}px {u}: campos con nombre accesible", unl == 0)
            pg.route("**/rest/v1/productos*", lambda r: r.fulfill(status=200, content_type="application/json", body=json.dumps(LONG)))
            pg.goto(B + "catalogo.html"); pg.wait_for_selector("#list .card")
            ok(f"{w}px catálogo: nombre de 70 letras seguidas no desborda", pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
            pg.unroute("**/rest/v1/productos*")
            pg.goto(B + "pedido.html")
            ok(f"{w}px pedido: chat visible con aviso al activarse", pg.locator("#assistant").is_visible() and pg.locator("#chatform [name=q]").is_enabled())
            pg.close()
        pg = b.new_page(viewport={"width": 390, "height": 800}); pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("dialog", lambda d: d.accept())
        pg.goto(B + "catalogo.html"); pg.wait_for_selector("#list .card"); pg.locator(".card__more").first.focus(); pg.keyboard.press("Enter")
        ok("teclado: Enter abre el detalle y el foco entra al diálogo", pg.locator("dialog.detail[open]").count() == 1 and pg.evaluate("document.activeElement.closest('dialog')!==null"))
        pg.keyboard.press("Escape"); ok("teclado: Esc cierra y el foco vuelve al botón", pg.evaluate("document.activeElement.classList.contains('card__more')"))
        pg.click("#filters button:text('Ropa')") if pg.locator("#filters button:text('Ropa')").count() else None
        pg.goto(B + "pedido.html"); pg.click("button[type=submit]:has-text('Enviar solicitud')")
        ok("pedido: vacío marca errores y enfoca el primer campo", pg.evaluate("document.activeElement.name")=="name")
        pg.fill("#chatform [name=q]", "quiero un gorro"); pg.click("#chatform button"); pg.wait_for_selector("text=Pasar este resumen al formulario"); pg.click("text=Pasar este resumen al formulario")
        ok("asistente: el resumen llena el formulario", pg.input_value("[name=piece]") == "Ropa")
        pg.fill("[name=name]", "Ana"); pg.fill("[name=contact]", "ana@correo.com"); pg.click("button[type=submit]:has-text('Enviar solicitud')"); pg.wait_for_timeout(500)
        ok("pedido: se registra en la base", "Registramos tu solicitud" in pg.inner_text("#result"))
        pg.goto(B + "admin.html"); pg.fill("[name=email]", "a@a.com"); pg.fill("[name=password]", "ok"); pg.click("#login button"); pg.wait_for_selector("#panel:not([hidden])")
        ok("admin: login y la solicitud nueva aparece", pg.locator("#requests .row").count() == 1)
        pg.close()
        pg = b.new_page(); pg.route("**/js/config.js", lambda r: r.fulfill(body='export const CONFIG={whatsapp:"573104867437",currency:"COP",supabaseUrl:"",supabaseAnonKey:"",aiEndpoint:""};', content_type="text/javascript"))
        pg.goto(B + "pedido.html"); pg.wait_for_timeout(400)
        ok("sin aiEndpoint: el chat se ve, desactivado, con aviso claro", pg.locator("#assistant").is_visible() and pg.locator("#chatform [name=q]").is_disabled() and "falta aiEndpoint" in pg.inner_text("#ia-status"))
        b.close()
finally:
    srv.terminate()
print("\n".join(res)); print("errores JS:", errs)
print("RESULTADO:", "TODO OK" if not errs and all(r.startswith("OK") for r in res) else "HAY FALLAS"); sys.exit(0 if all(r.startswith("OK") for r in res) and not errs else 1)
