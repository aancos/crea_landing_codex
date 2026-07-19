# LandingLab AI — Vercel

Versión preparada para desplegar frontend + backend en un único proyecto de Vercel.

## Estructura

- `index.html`: frontend estático.
- `api/generate.js`: Vercel Function que llama a OpenAI.
- `package.json`: dependencia del SDK de OpenAI.

El frontend usa `fetch('/api/generate')`, por lo que funciona bajo el mismo dominio de Vercel sin configurar CORS.

## Despliegue desde GitHub

1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel, crea un nuevo proyecto e importa ese repositorio.
3. En Project Settings → Environment Variables añade:
   - `OPENAI_API_KEY`: tu API key de OpenAI.
   - `OPENAI_MODEL`: opcional, por ejemplo `gpt-5`.
4. Despliega el proyecto.

No subas nunca `.env` ni tu API key al repositorio.
