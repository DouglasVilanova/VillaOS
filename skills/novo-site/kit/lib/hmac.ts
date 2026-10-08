// Token assinado com HMAC-SHA256 via Web Crypto (funciona em proxy, server actions e testes).
// Formato: base64url("<valor>|<expiraEmMs>") + "." + base64url(assinatura)
const enc = new TextEncoder();

function paraB64url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deB64url(s: string): Uint8Array<ArrayBuffer> {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function chave(segredo: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function signValue(valor: string, segredo: string, ttlMs: number, agora = Date.now()): Promise<string> {
  const payload = enc.encode(`${valor}|${agora + ttlMs}`);
  const assinatura = new Uint8Array(await crypto.subtle.sign("HMAC", await chave(segredo), payload));
  return `${paraB64url(payload)}.${paraB64url(assinatura)}`;
}

export async function verifyValue(token: string, segredo: string, agora = Date.now()): Promise<string | null> {
  try {
    const [p, s] = token.split(".");
    if (!p || !s) return null;
    const payloadBytes = deB64url(p);
    const payload = new TextDecoder().decode(payloadBytes);
    const i = payload.lastIndexOf("|");
    if (i < 0) return null;
    const expira = Number(payload.slice(i + 1));
    if (!Number.isFinite(expira) || agora > expira) return null;
    const ok = await crypto.subtle.verify("HMAC", await chave(segredo), deB64url(s), payloadBytes);
    return ok ? payload.slice(0, i) : null;
  } catch {
    return null;
  }
}

/** HMAC-SHA256 completo em base64url. */
export async function hmacB64url(valor: string, segredo: string): Promise<string> {
  return paraB64url(new Uint8Array(await crypto.subtle.sign("HMAC", await chave(segredo), enc.encode(valor))));
}

/** Comparação em tempo constante: HMAC dos dois lados, mesmo tamanho de buffer. */
export async function safeEqual(a: string, b: string, segredo: string): Promise<boolean> {
  const k = await chave(segredo);
  const [ha, hb] = await Promise.all([
    crypto.subtle.sign("HMAC", k, enc.encode(a)),
    crypto.subtle.sign("HMAC", k, enc.encode(b)),
  ]);
  const va = new Uint8Array(ha);
  const vb = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < va.length; i++) diff |= va[i] ^ vb[i];
  return diff === 0;
}
