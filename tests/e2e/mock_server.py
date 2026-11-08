import http.server,json,os,re,sys
ROOT=sys.argv[1]; PORT=int(sys.argv[2]); os.chdir(ROOT)
DB={"productos":[{"id":1,"name":"Demo DB","category":"Prueba","price":1000,"description":"Desde la base","color":"#B8F2D0","image_url":None,"active":True,"created_at":"2026-01-01"}],"solicitudes":[]}; NID=[10]
class H(http.server.SimpleHTTPRequestHandler):
    def log_message(s,*a): pass
    def j(s,c,o=None):
        b=json.dumps(o).encode() if o is not None else b""; s.send_response(c); s.send_header("Content-Type","application/json"); s.send_header("Content-Length",str(len(b))); s.end_headers(); s.wfile.write(b)
    def auth(s): return s.headers.get("Authorization")=="Bearer tok"
    def body(s): n=int(s.headers.get("Content-Length",0)); return s.rfile.read(n)
    def do_GET(s):
        if s.path=="/js/config.js":
            b=open("js/config.js",encoding="utf8").read().replace('supabaseUrl: ""',f'supabaseUrl: "http://localhost:{PORT}"').replace('aiEndpoint: ""',f'aiEndpoint: "http://localhost:{PORT}/ai"').replace('supabaseAnonKey: ""','supabaseAnonKey: "anon"').encode()
            s.send_response(200); s.send_header("Content-Type","text/javascript"); s.send_header("Content-Length",str(len(b))); s.end_headers(); s.wfile.write(b); return
        m=re.match(r"/rest/v1/(\w+)",s.path)
        if m:
            t=m.group(1); rows=DB[t]
            if s.headers.get("Authorization") not in ("Bearer tok","Bearer anon"): return s.j(401,{"message":"JWT expired"})
            if t=="solicitudes" and not s.auth(): return s.j(200,[])
            if t=="productos" and not s.auth(): rows=[r for r in rows if r["active"]]
            return s.j(200,rows)
        super().do_GET()
    def do_POST(s):
        if s.path=="/ai":
            d=json.loads(s.body()); last=d["messages"][-1]["text"]
            if "falla" in last: return s.j(429,{"error":"El asistente está muy ocupado. Usa el formulario o escríbenos por WhatsApp."})
            o={"piece":"Ropa","details":"Gorro lila para mi hermano","colors":"lila"} if "gorro" in last else None
            return s.j(200,{"reply":"Perfecto, ya tengo tu idea." if o else "¿Para quién es?","order":o})
        if s.path.startswith("/auth/v1/token"):
            d=json.loads(s.body()); return s.j(200,{"access_token":"tok"}) if d["password"]=="ok" else s.j(400,{})
        if s.path.startswith("/storage/v1/object/productos/"):
            s.body(); return s.j(200,{}) if s.auth() else s.j(403,{})
        m=re.match(r"/rest/v1/(\w+)",s.path); d=json.loads(s.body()); t=m.group(1)
        if t=="productos" and not s.auth(): return s.j(401,{})
        NID[0]+=1; d.update(id=NID[0],created_at="2026-02-01"); d.setdefault("active",True); d.setdefault("status","nueva"); DB[t].append(d); s.j(201)
    def do_PATCH(s):
        if not s.auth(): s.body(); return s.j(401,{})
        m=re.match(r"/rest/v1/(\w+)\?id=eq\.(\d+)",s.path); d=json.loads(s.body())
        for r in DB[m.group(1)]:
            if r["id"]==int(m.group(2)): r.update(d)
        s.j(204)
    def do_DELETE(s):
        if not s.auth(): return s.j(401,{})
        m=re.match(r"/rest/v1/(\w+)\?id=eq\.(\d+)",s.path); DB[m.group(1)]=[r for r in DB[m.group(1)] if r["id"]!=int(m.group(2))]; s.j(204)
http.server.ThreadingHTTPServer(("",PORT),H).serve_forever()
