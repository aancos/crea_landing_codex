---
name: despliegue-vercel
description: Preparar, revisar o diagnosticar el despliegue de LandingLab AI en Vercel y la compatibilidad de su función /api/generate.
---

# Despliegue en Vercel

## Procedimiento

1. Leer `README.md`, `package.json`, `.env.example` y `api/generate.js`; comprobar la configuración de Vercel asociada si se dispone de acceso autorizado.
2. Verificar en documentación vigente y mediante prueba la convención de exportación soportada por el runtime seleccionado. El `export default { async fetch(request) {...} }` del código actual no debe darse por compatible sin comprobación.
3. Confirmar cómo se sirven `index.html` y `/api/generate` bajo el mismo origen y si hacen falta archivos de configuración adicionales.
4. Configurar `OPENAI_API_KEY` solo como secreto del entorno de Vercel. `OPENAI_MODEL` es opcional; verificar nombre y disponibilidad actuales antes de seleccionarlo.
5. Antes de publicar un endpoint de pago, comprobar controles de abuso, aislamiento de HTML generado, límites de entrada, presupuestos y gestión de errores con `seguridad-validacion`.
6. Probar solicitudes reales a `/api/generate`: POST correcto, GET no permitido, cuerpo vacío, JSON malformado, ausencia de configuración y fallo del proveedor, sin exponer claves ni datos privados.
7. Comprobar interfaz, iframe, copia, descarga y rutas sobre la URL desplegada; revisar logs sin registrar datos sensibles.
8. Diferenciar «preparado», «desplegado», «probado» y «publicado». Solicitar autorización expresa antes de modificar variables, dominios o despliegues externos.

## Resultado esperado

Checklist de despliegue con compatibilidad comprobada, pruebas observadas, URL autorizada y pendientes; nunca afirmar un despliegue no ejecutado.
