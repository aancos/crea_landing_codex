# AGENTS.md — LandingLab AI

## 1. Producto y usuarios

Este repositorio implementa **LandingLab AI**, un generador de landing pages a partir de una descripción de negocio. El usuario define descripción (`brief`), estilo (`tone`), público (`audience`) y paleta (`palette`); la aplicación solicita HTML a OpenAI y permite previsualizar, copiar o descargar el resultado.

## 2. Arquitectura y stack verificables

- `index.html`: interfaz estática con HTML, CSS y JavaScript nativos; llama a `POST /api/generate` y muestra la respuesta.
- `api/generate.js`: backend para Vercel, implementado en JavaScript ESM y con el SDK `openai` (`^5.0.0`) y Responses API.
- `package.json`: dependencias del proyecto; actualmente **no** declara scripts de `dev`, `test`, `lint`, `typecheck` ni `build`.
- `.env.example`: nombres de variables esperadas (`OPENAI_API_KEY`, `OPENAI_MODEL`). No contiene credenciales válidas.
- `.gitignore`: ignora `.env` y `.env.*`, excepto `.env.example`.

El despliegue previsto es frontend y backend bajo el mismo origen en Vercel. **No se ha validado en esta revisión la compatibilidad del formato actual de exportación de `api/generate.js` con el runtime real de Vercel**; comprobarla antes de publicar.

## 3. Cómo abordar cambios

1. Leer `README.md`, `package.json` y el archivo afectado.
2. Identificar si el cambio afecta a frontend, contrato HTTP, generación con IA, seguridad o despliegue.
3. Mantener los nombres existentes de los campos y la forma de respuesta (`{ html }` en caso de éxito) salvo cambio coordinado de frontend y backend.
4. Aplicar cambios mínimos, sin incorporar frameworks ni servicios adicionales por defecto.
5. Registrar qué se ha comprobado de verdad y qué sigue pendiente de ejecutar o desplegar.

## 4. Seguridad obligatoria

- **No tratar HTML generado por modelos o usuarios como código confiable.** El `iframe.srcdoc` actual no tiene atributo `sandbox`; es un riesgo identificado, no una configuración aprobada. Antes de servir el generador al público, diseñar aislamiento efectivo de la vista previa, teniendo en cuenta scripts, origen, navegación, descargas y comunicaciones con la página anfitriona.
- La API key de OpenAI debe permanecer exclusivamente en el servidor. No incluir secretos en el frontend, los logs, los ejemplos ni el repositorio.
- No publicar la API de generación sin examinar límites de tamaño, controles de abuso y coste, autenticación cuando proceda, límites de solicitudes y gestión de errores.
- Los parámetros del formulario y el HTML de salida son entradas/salidas no confiables: validar tipos, tamaños y formato; no considerar suficiente comprobar si la respuesta contiene `<html`.
- Evitar devolver al navegador trazas o detalles internos de errores, credenciales o mensajes sensibles del proveedor.
- No incluir instrucciones para desactivar controles de seguridad como solución permanente.

## 5. Integración OpenAI

- Consultar la versión instalada del SDK y la documentación vigente antes de cambiar la API, parámetros o modelo.
- No afirmar que el distintivo «Codex-powered» implique una integración real con Codex: el backend actual utiliza la API de OpenAI y un modelo configurable mediante `OPENAI_MODEL`.
- No garantizar que el HTML generado sea seguro, correcto, publicable o conforme a la descripción sin validación adicional.
- Tener en cuenta latencia, costes, errores transitorios, respuestas incompletas y presupuestos de consumo.

## 6. Verificación

Actualmente no existen scripts de tests, lint ni build definidos en `package.json`. No inventarlos ni afirmar que se ejecutaron.

Para cada cambio, usar las verificaciones pertinentes y disponibles:
- Sintaxis y coherencia de JavaScript y HTML.
- Contrato de `POST /api/generate`, incluyendo método inválido, entrada vacía, errores de JSON, error del proveedor y salida no válida.
- Previsualización aislada, copia y descarga; comportamiento responsive y accesibilidad de controles.
- Prueba real del endpoint en el entorno Vercel correspondiente antes de confirmar despliegue.

No modificar el proyecto de Vercel, variables de entorno, producción ni GitHub sin autorización expresa.

## 7. Skills del proyecto

Utilizar las skills de `.agents/skills/` cuando corresponda:
- `desarrollo-generador`: interfaz, formulario, vista previa y exportación.
- `integracion-openai`: prompt, Responses API, calidad de salida, costes y errores.
- `seguridad-validacion`: revisión de superficies no confiables, controles y pruebas.
- `despliegue-vercel`: preparación y diagnóstico del despliegue y runtime.

Las skills detallan procedimientos; este archivo conserva las reglas transversales.
