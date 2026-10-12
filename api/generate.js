import OpenAI from "openai";
import { createHmac } from "node:crypto";

const MAX_BODY_BYTES = 8_192;
const MAX_BRIEF = 3_000;
const MAX_OUTPUT_TOKENS = 3_500;
const PER_MINUTE = 5;
const PER_DAY = 30;

function json(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  for (const [key, value] of Object.entries(headers)) res.setHeader(key, value);
  return res.end(JSON.stringify(body));
}

function field(value, max, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string" || value.length > max) return null;
  return value.trim();
}

async function rateLimit(req) {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;  
  const salt = process.env.RATE_LIMIT_SECRET;
  if (!url || !token || !salt) throw new Error("Rate limit sin configurar");

  // Solo confiar en esta cabecera cuando el endpoint está detrás del proxy de Vercel.
  const forwarded = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded || "")
    .split(",")[0].trim();
  if (!ip) throw new Error("No se pudo identificar la IP");
  const id = createHmac("sha256", salt).update(ip).digest("hex");

  const minute = Math.floor(Date.now() / 60_000);
  const day = Math.floor(Date.now() / 86_400_000);
  const keys = [`landing:minute:${minute}:${id}`, `landing:day:${day}:${id}`];
  const commands = [
    ["INCR", keys[0]], ["EXPIRE", keys[0], 120],
    ["INCR", keys[1]], ["EXPIRE", keys[1], 172800],
  ];
  const response = await fetch(`${url.replace(/\/+$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(3000),
  });
  if (!response.ok) throw new Error("Servicio de limitación no disponible");
  const result = await response.json();
  if (!Array.isArray(result) || result.some((x) => x.error)) {
    throw new Error("Respuesta inválida del limitador");
  }
  const minuteCount = Number(result[0]?.result);
  const dayCount = Number(result[2]?.result);
  if (!Number.isFinite(minuteCount) || !Number.isFinite(dayCount)) {
    throw new Error("Contadores no válidos");
  }
  return minuteCount <= PER_MINUTE && dayCount <= PER_DAY;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Método no permitido" });
  }

  const contentType = String(req.headers["content-type"] || "");
  if (!/^application\/json(?:;|$)/i.test(contentType)) {
    return json(res, 415, { error: "Se requiere JSON." });
  }
  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json(res, 413, { error: "Solicitud demasiado grande." });
  }

  let data;
  try {
    data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!data || typeof data !== "object" || Array.isArray(data) ||
        Buffer.byteLength(JSON.stringify(data), "utf8") > MAX_BODY_BYTES) {
      return json(res, 413, { error: "Solicitud inválida o demasiado grande." });
    }
  } catch {
    return json(res, 400, { error: "JSON inválido." });
  }

  const brief = field(data.brief, MAX_BRIEF);
  const tone = field(data.tone, 100, "Startup premium");
  const audience = field(data.audience, 200, "No especificado");
  const palette = field(data.palette, 100, "moderna y coherente");
  if (!brief || tone === null || audience === null || palette === null) {
    return json(res, 400, { error: "Revisa la descripción (máx. 3.000 caracteres) y demás campos." });
  }

  // Cerrar el servicio si falta el control de consumo, en lugar de exponer OpenAI.
  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, { error: "Servicio de generación no configurado." });
  }
  try {
    const allowed = await rateLimit(req);
    if (!allowed) {
      return json(res, 429, { error: "Límite de generaciones alcanzado. Inténtalo más tarde." },
        { "Retry-After": "60" });
    }
  } catch (error) {
    console.error("Rate limit error:", error.message);
    return json(res, 503, { error: "Protección de consumo temporalmente no disponible." });
  }

  const prompt = `Crea una landing page profesional para el producto indicado.
DESCRIPCIÓN: ${brief}
PÚBLICO: ${audience}
ESTILO: ${tone}
PALETA: ${palette}
Devuelve SOLO un documento HTML completo empezando por <!doctype html>.
HTML, CSS y JS en un único archivo, responsive, con propuesta de valor, beneficios, CTA y footer.
No inventes testimonios, clientes o cifras como hechos verificables; usa marcadores cuando falten.
No uses Markdown, fences ni dependencias externas obligatorias.`;

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 25_000,
      maxRetries: 0,
    });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: prompt,
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });
    const html = (result.output_text || "")
      .replace(/^```html\s*/i, "").replace(/```$/i, "").trim();

    if (!/^<!doctype html>/i.test(html) || !/<html[\s>]/i.test(html)) {
      return json(res, 502, { error: "La IA no devolvió un documento HTML completo." });
    }
    return json(res, 200, { html });
  } catch (error) {
    console.error("OpenAI generation:", error.status || error.name || "failed");
    return json(res, 502, { error: "No se pudo generar la landing. Inténtalo más tarde." });
  }
}
