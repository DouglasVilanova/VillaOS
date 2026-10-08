export const PREVIEW_COOKIE = "preview_ok";
export const PREVIEW_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Valor assinado no cookie de preview (prefixo de finalidade: não serve como sessão de admin). */
export const PREVIEW_TOKEN = "preview:ok";

/**
 * Destino pós-login só pode ser caminho interno (evita open redirect).
 * Recusa "//x", "/\x" (navegador trata como "//x") e espaços/controles.
 */
export function safeNext(v: string): string {
  return /^\/(?![/\\])[^\s\\]*$/.test(v) ? v : "/";
}
