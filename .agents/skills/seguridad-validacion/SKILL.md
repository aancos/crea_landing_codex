---
name: seguridad-validacion
description: Auditar y comprobar la seguridad, aislamiento de HTML generado, controles de abuso y pruebas funcionales de LandingLab AI.
---

# Seguridad y validación

## Prioridades verificadas

- `index.html` asigna HTML generado a `iframe.srcdoc` sin `sandbox`.
- `api/generate.js` no muestra autenticación, límites de petición o control de tasa.
- La validación actual del HTML de respuesta es superficial.
- No hay scripts globales de tests, lint o build declarados.

## Procedimiento

1. Identificar superficies no confiables: campos del formulario, respuesta de OpenAI, HTML ejecutable en vista previa y descarga.
2. Analizar el `iframe.srcdoc` sin `sandbox` como un riesgo prioritario. Proponer y probar una política restrictiva de iframe/sandbox y, si se requieren scripts dentro del HTML, un origen separado o arquitectura que evite ampliar privilegios indebidamente. Evaluar navegación, formularios, pop-ups, APIs, mensajes y acceso al documento padre.
3. Comprobar que la API key no esté en frontend ni en respuestas/logs accesibles.
4. Revisar controles de tamaño de entrada, cuotas, rate limiting, autenticación si corresponde, presupuestos y manejo de abuso.
5. Verificar método HTTP, estructura JSON, tipos, entrada ausente, peticiones demasiado grandes, errores del proveedor y respuestas incompletas o malformadas.
6. Revisar cabeceras y políticas web pertinentes (CSP, tipos MIME, caché, permisos del navegador), sin asumir que sustituyen el aislamiento.
7. Validar navegación por teclado, estados de carga/error y responsive; ejecutar herramientas de comprobación si existen y documentar cuáles se han usado.
8. Separar hallazgos confirmados, riesgos potenciales, cambios aplicados y mitigaciones verificadas. No declarar «seguro para producción» sin pruebas de extremo a extremo.

## Resultado esperado

Lista priorizada de hallazgos y pruebas, con mitigaciones propuestas o implementadas, evidencias y condiciones para habilitar el servicio público.
