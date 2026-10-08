// Perfis de Content-Security-Policy do kit. Escolha do perfil: lib/manifest.ts → cspProfile().
// 'unsafe-inline' em script-src é risco aceito: o App Router injeta scripts inline de
// hidratação e o painel de SEO injeta scripts livres (ver spec, seção 5).
export type CspProfile = "rigido" | "painel" | "tracking";

const TRACKING_SCRIPT = [
  "*.googletagmanager.com",
  "*.google-analytics.com",
  "*.analytics.google.com",
  "*.googleadservices.com",
  "*.doubleclick.net",
  "*.facebook.com",
  "*.facebook.net",
];
const TRACKING_CONNECT = ["analytics.google.com", "www.google.com", "*.google.com.br", "*.amazonaws.com"]; // amazonaws: Facebook CAPI

export function buildCsp(perfil: CspProfile, opcoes: { dev: boolean }): string {
  const d: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "frame-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };

  if (perfil !== "rigido") {
    d["connect-src"].push("*.supabase.co");
    d["img-src"].push("blob:", "*.supabase.co");
  }
  if (perfil === "tracking") {
    // GTM com tags/variáveis HTML personalizadas usa eval.
    d["script-src"].push("'unsafe-eval'", ...TRACKING_SCRIPT);
    d["connect-src"].push(...TRACKING_SCRIPT, ...TRACKING_CONNECT);
    d["img-src"].push("https:");
    d["frame-src"].push("https://www.googletagmanager.com", "https://www.facebook.com");
  }
  if (opcoes.dev) d["script-src"].push("'unsafe-eval'");

  return Object.entries(d)
    .map(([nome, valores]) => `${nome} ${[...new Set(valores)].join(" ")}`)
    .join("; ");
}
