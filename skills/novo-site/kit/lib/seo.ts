/** Remove tags HTML e normaliza espaços (descrições a partir de texto rico). */
export function stripHtml(s?: string): string {
  return (s ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Corta em até `max` caracteres sem quebrar palavra. */
export function clampText(s: string, max = 160): string {
  const t = s.trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const espaco = corte.lastIndexOf(" ");
  return `${(espaco > 40 ? corte.slice(0, espaco) : corte).trim()}…`;
}

/** URL absoluta a partir de caminho relativo; URLs absolutas passam direto. */
export function absUrl(u: string | undefined, base: string): string | undefined {
  if (!u) return undefined;
  if (/^https?:\/\//i.test(u)) return u;
  return `${base}${u.startsWith("/") ? "" : "/"}${u}`;
}
