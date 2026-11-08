# Guía del asistente de IA (Fase 7)

La web nunca habla directo con Gemini: habla con un Worker de Cloudflare que guarda la clave secreta.

1. **Clave de Gemini:** en Google AI Studio, "Get API key" > "Create API key". Guárdala solo para el paso 3. Nunca la pegues en el código, en el chat ni en GitHub. Si se filtra, bórrala en AI Studio y crea otra.
2. **Worker:** en dash.cloudflare.com, Workers & Pages > Create > Worker (plantilla Hello World) > Deploy > Edit code. Borra el contenido, pega todo `worker/index.js` y pulsa Deploy. Los nombres de los menús pueden variar un poco.
3. **Variables** (Settings > Variables and Secrets):
   - `GEMINI_API_KEY` tipo **Secret**: tu clave.
   - `ALLOWED_ORIGINS` tipo Text: `https://TU-USUARIO.github.io,http://localhost:8000`
   - `MODEL` tipo Text (opcional): el modelo Flash o Flash-Lite que AI Studio te muestre con nivel gratuito. Por defecto usa `gemini-2.5-flash`; si Google lo retiró o no tiene cupo gratis, pon otro aquí, sin tocar el código.
4. Copia la URL del Worker (termina en `workers.dev`) en `js/config.js`, campo `aiEndpoint`.
5. Prueba en `pedido.html`: escribe "quiero un gorro lila para mi hermano". Debe responder, y al tener datos suficientes aparece "Pasar este resumen al formulario".
6. Si falla, abre el Worker > Logs y dime el error exacto (sin pegar tu clave).

Límites: el plan gratuito de Gemini tiene cupo por minuto y por día, y Google puede usar esas peticiones para mejorar sus productos: por eso el asistente no pide datos personales. Si se acaba el cupo, la web muestra un aviso y el formulario sigue funcionando.
