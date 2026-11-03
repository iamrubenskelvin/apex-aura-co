/**
 * Verificação da assinatura de webhook do Stripe (esquema `t=...,v1=...`).
 *
 * Usa só Web Crypto (`crypto.subtle`), disponível no navegador, no servidor e no
 * Node usado pelos testes — sem depender de módulos internos do Node, que quebram
 * a compilação da parte cliente da loja.
 */

const DEFAULT_TOLERANCE_SEC = 300;

/**
 * `true` somente se a assinatura confere com o corpo recebido e o carimbo de tempo
 * está dentro da tolerância. Nunca processe um evento antes desta checagem.
 */
export async function verifyStripeSignature(
  rawBody: string,
  header: string | null | undefined,
  secret: string | undefined,
  toleranceSec = DEFAULT_TOLERANCE_SEC,
): Promise<boolean> {
  if (!header || !secret) return false;

  const fields = parseHeader(header);
  const timestamp = Number(fields["t"]);
  const signature = fields["v1"];
  if (!Number.isFinite(timestamp) || timestamp <= 0 || !signature) return false;
  if (toleranceSec > 0 && Math.abs(Date.now() / 1000 - timestamp) > toleranceSec) return false;

  const expected = await hmacHex(`${timestamp}.${rawBody}`, secret);
  return constantTimeEqual(expected, signature);
}

function parseHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(",")) {
    const idx = part.indexOf("=");
    if (idx < 1) continue;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return [...new Uint8Array(signed)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparação em tempo constante: não revela a assinatura por tempo de resposta. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
