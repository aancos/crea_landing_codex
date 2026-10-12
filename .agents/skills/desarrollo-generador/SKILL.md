---
name: desarrollo-generador
description: Modificar el frontend de LandingLab AI, el formulario, la previsualización, la copia o la descarga de las páginas generadas.
---

# Desarrollo del generador

## Procedimiento

1. Leer `index.html` y comprobar el contrato actual con `/api/generate`: `brief`, `tone`, `audience`, `palette`; respuesta de éxito `{ html }`.
2. Identificar los estados reales de la UI: selección de paleta, dispositivo, vista previa/código, carga, error, copia y descarga.
3. Mantener HTML/CSS/JS nativos salvo que exista una decisión explícita de migrar de stack.
4. Usar HTML semántico, etiquetas de formulario y controles accesibles; comprobar teclado, foco y mensajes de error.
5. Tratar el HTML generado como no confiable: no añadir usos de `innerHTML` ni ampliar permisos del `iframe`. Coordinar cambios de la vista previa con `seguridad-validacion`.
6. Comprobar desktop, tablet y móvil; evitar depender de anchos o alturas fijas que rompan la interfaz.
7. Probar generación correcta y fallida, selección de opciones, cambio entre vista previa/código, copia y descarga. Si no se dispone de entorno, dejar las pruebas explícitamente pendientes.
8. Resumir archivos modificados, decisiones, pruebas realizadas y riesgos residuales.

## Resultado esperado

Cambios puntuales en el generador, manteniendo el contrato HTTP y el aislamiento de la vista previa como requisito de seguridad pendiente de solución validada.
