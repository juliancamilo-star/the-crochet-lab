# Pruebas de The Crochet Lab (Fase 8)

## Automáticas (se pueden repetir)

| Comando | Qué comprueba | Último resultado |
|---|---|---|
| `npm test` | Validación del formulario (8) y lógica del Worker de IA (19) | 27 de 27 OK |
| `npm run test:e2e` | 50 comprobaciones en navegador real con servidor simulado: contraste, desbordes a 360 px y 1280 px en las 4 páginas, zonas táctiles, nombres de campos, teclado, formulario, asistente, panel admin | 50 de 50 OK, sin errores de JavaScript |

El e2e es opcional: necesita `pip install playwright` y `playwright install chromium`. Usa un servidor simulado, nunca tu Supabase real.

## Lo que ninguna prueba automática puede confirmar (hazlo tú)

1. **Seguridad real (Supabase):** en una ventana de incógnito abre `catalogo.html`: solo debe verse lo visible, y la consola no debe mostrar solicitudes. Oculta un producto desde el panel y confirma que desaparece del catálogo.
2. **Asistente real:** en `pedido.html` publicada, escribe "quiero un gorro lila". Debe responder; si no, el aviso de la página dice qué falta.
3. **Móvil de verdad:** abre la URL de GitHub Pages en tu teléfono. Revisa las fuentes, que el menú se toque bien y que el teclado no tape el formulario.
4. **Lighthouse:** en Chrome, F12 > Lighthouse > Móvil > Analizar. Apunta las notas de Rendimiento y Accesibilidad para la defensa.
5. **Enlaces publicados:** recorre las 3 páginas públicas en `https://TU-USUARIO.github.io/the-crochet-lab/`.
