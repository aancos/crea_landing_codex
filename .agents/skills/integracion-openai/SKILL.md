---
name: integracion-openai
description: Revisar o mejorar el uso de la API de OpenAI en api/generate.js, prompts, modelos, validación de respuestas, latencia y costes.
---

# Integración con OpenAI

## Procedimiento

1. Leer `api/generate.js`, `package.json`, `.env.example` y la documentación actualizada aplicable a la versión instalada del SDK.
2. Identificar contrato de entrada/salida y comportamiento real de `client.responses.create` y `response.output_text`.
3. Mantener `OPENAI_API_KEY` en el backend y `OPENAI_MODEL` como configuración; nunca copiar ni imprimir valores de secretos.
4. Validar que `brief` sea texto, no esté vacío y respete un límite razonable de longitud; aplicar controles análogos al resto de los parámetros.
5. Preparar el prompt contra salidas malformadas, pero no confiar en el prompt como mecanismo de seguridad. Distinguir validación de formato de aislamiento de código.
6. Controlar errores del proveedor, límites y tiempos de espera sin filtrar detalles internos al cliente. Evitar registrar prompts privados completos salvo justificación y autorización.
7. Considerar tamaño máximo de salida, tokens, latencia, reintentos controlados, límites por usuario y gasto potencial antes de permitir acceso público.
8. Probar salida válida, salida vacía, respuesta no HTML, JSON inválido, clave ausente, error de proveedor y límite de solicitudes cuando exista.
9. Documentar modelo y parámetros efectivamente probados; no atribuir la generación al agente Codex si la llamada es a Responses API.

## Resultado esperado

Integración reproducible y con controles claros de validación, errores, coste y seguridad, sin exponer credenciales.
