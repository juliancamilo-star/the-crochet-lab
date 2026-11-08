# Guía del asistente de IA (Fase 7)

La web nunca habla directo con Gemini: habla con un Worker de Cloudflare que guarda la clave secreta.

1. **Clave de Gemini:** en Google AI Studio, "Get API key" > "Create API key". Guárdala solo para el paso 3. Nunca la pegues en el código, en el chat ni en GitHub. Si se filtra, bórrala en AI Studio y crea otra.
2. **Worker:** en dash.cloudflare.com, Workers & Pages > Create > Worker (plantilla Hello World) > Deploy > Edit code. Borra el contenido, pega todo `worker/index.js` y pulsa Deploy. Los nombres de los menús pueden variar un poco.
3. **Variables** (Settings > Variables and Secrets):
   - `GEMINI_API_KEY` tipo **Secret**: tu clave.
   - `ALLOWED_ORIGINS` tipo Text: `https://TU-USUARIO.github.io,http://localhost:8000`
   - `MODEL` tipo Text (opcional): déjalo vacío. El Worker prueba solo una lista de modelos Flash vigentes y salta los que Google retiró. Si quieres forzar uno, usa un nombre que aparezca en el paso A de "Si no responde".
4. Copia la URL del Worker (termina en `workers.dev`) en `js/config.js`, campo `aiEndpoint`.
5. Prueba en `pedido.html`: escribe "quiero un gorro lila para mi hermano". Debe responder, y al tener datos suficientes aparece "Pasar este resumen al formulario".
6. Si falla, sigue "Si no responde".

## Si no responde

0. **Si el chat dice "Tardó demasiado":** el navegador esperó 30 s sin respuesta. Abre la URL de tu Worker (`workers.dev`) directo en el navegador: debe mostrar "Origen no permitido" (prueba de que tu código nuevo está desplegado y vivo). Si muestra "Hello World!", falta pegar el código y hacer Deploy. Luego F12 > Network, envía un mensaje y mira la petición al Worker: su estado y su tiempo dicen dónde se atasca.

1. **Activa el diagnóstico:** agrega la variable `DEBUG` = `1` (Text) y haz Deploy. El mensaje de error en el chat ahora dirá qué respondió Google. Quítala al terminar.
2. **Paso A, modelos vigentes para tu clave:** pega en el navegador `https://generativelanguage.googleapis.com/v1beta/models?key=TU_CLAVE`. Verás la lista de modelos; usa uno `gemini-...-flash` o `flash-lite`. No compartas esa URL: lleva tu clave.
3. **Qué significa cada error:** 404 = el modelo fue retirado; 400 "API key not valid" = clave mal copiada o borrada; 403 = la clave no tiene permiso para ese modelo; 429 = se acabó el cupo gratuito del modelo (a veces "limit: 0" = ese modelo no tiene nivel gratuito); 400 "location is not supported" = la API no atiende tu región.
4. **Si no aparece ningún error de Google:** el fallo es antes. Revisa que `ALLOWED_ORIGINS` tenga exactamente el origen (`https://usuario.github.io`, sin barra final ni ruta), que la clave se llame `GEMINI_API_KEY` y que hayas hecho Deploy tras pegar el código.

Límites: el plan gratuito de Gemini tiene cupo por minuto y por día, y Google puede usar esas peticiones para mejorar sus productos: por eso el asistente no pide datos personales. Si se acaba el cupo, la web muestra un aviso y el formulario sigue funcionando.
