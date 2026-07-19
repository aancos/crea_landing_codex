import OpenAI from "openai";

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      if (!process.env.OPENAI_API_KEY) {
        return Response.json(
          { error: "Falta OPENAI_API_KEY en las variables de entorno de Vercel." },
          { status: 500 }
        );
      }

      const { brief, tone, audience, palette } = await request.json();

      if (!brief?.trim()) {
        return Response.json(
          { error: "Falta la descripción del producto." },
          { status: 400 }
        );
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `
Crea una landing page profesional y visualmente impactante para este producto o negocio:

DESCRIPCIÓN:
${brief}

PÚBLICO:
${audience || "No especificado"}

ESTILO:
${tone || "Startup premium"}

PALETA:
${palette || "moderna y coherente"}

Devuelve SOLO un documento HTML completo y autocontenido, empezando por <!doctype html>.
Requisitos:
- HTML + CSS + JavaScript dentro de un único archivo.
- Responsive para desktop, tablet y móvil.
- Diseño de calidad de portfolio, no una plantilla genérica.
- Hero potente, propuesta de valor clara, CTA, beneficios/features, prueba social o métricas, sección final de conversión y footer.
- Copy específico para el negocio descrito.
- Buen uso de tipografía, espacio, jerarquía visual, cards, gradientes o detalles gráficos.
- Sin dependencias externas obligatorias.
- No uses markdown ni fences de código.
- No expliques nada fuera del HTML.
`;

      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5",
        input: prompt,
      });

      let html = response.output_text?.trim() || "";
      html = html.replace(/^```html\s*/i, "").replace(/```$/i, "").trim();

      if (!html.toLowerCase().includes("<html")) {
        return Response.json(
          { error: "El modelo no devolvió HTML válido." },
          { status: 502 }
        );
      }

      return Response.json({ html });
    } catch (error) {
      console.error(error);
      return Response.json(
        { error: error?.message || "Error generando la landing." },
        { status: 500 }
      );
    }
  },
};
