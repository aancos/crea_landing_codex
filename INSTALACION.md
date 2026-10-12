# Protección del endpoint /api/generate

## Cambios
- `api/generate.js`: manejador Node compatible con Vercel Functions, validación y tamaño máximo de solicitud (8 KB), `brief` máximo de 3000 caracteres.
- Límite por IP: 5 solicitudes por minuto y 30 por día UTC mediante Upstash Redis REST; compartido por todas las instancias.
- Sin claves de Redis o si Redis falla: **503 sin llamada a OpenAI**.
- OpenAI: `max_output_tokens: 3500`, timeout 25 s, sin reintentos automáticos; errores internos no se envían al cliente.
- Los límites por IP son un mecanismo básico, no una garantía contra ataques distribuidos o NAT compartidas.

## Pasos
1. Sustituye `api/generate.js` por el incluido.
2. Actualiza `.env.example` solo como referencia; no pongas claves reales en Git.
3. Crea una base de datos **Upstash Redis** con API REST.
4. En **Vercel → Project → Settings → Environment Variables** configura:
   - `OPENAI_API_KEY` y opcionalmente `OPENAI_MODEL`;
   - `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`;
   - `RATE_LIMIT_SECRET` con una cadena larga aleatoria (por ejemplo `openssl rand -hex 32`).
5. Redeploy y prueba un POST normal, un POST con brief >3000, y seis POST en menos de un minuto: el sexto debe devolver HTTP 429.
6. Sin Redis el endpoint debe devolver HTTP 503. Verifica con un entorno de prueba.
7. Configura **alertas y presupuestos de gasto en OpenAI**. `max_output_tokens` limita cada respuesta, **no el gasto mensual total**.
8. Revisa los logs, la política de retención de Upstash y las opciones de protección de bots de Vercel antes de abrirlo al público.

## Precauciones
- No se han ejecutado pruebas desplegadas ni validado la cuenta Vercel/Upstash.
- Los encabezados IP solo son fiables cuando **Vercel actúa como proxy confiable**. Si se usa otro hosting, ajusta la obtención de IP.
- La vista previa debe conservar `<iframe sandbox="allow-scripts">` **sin** `allow-same-origin`.
- Una landing puede necesitar más de 3500 tokens: aumenta el límite de forma controlada si hay salidas truncadas.
- Para tráfico adversarial, incorpora WAF / protección de bots y una cuota global de gasto o autorización.
