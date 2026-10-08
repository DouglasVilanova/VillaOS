// Regras de upload compartilhadas por cliente e servidor. SVG fica de fora (pode carregar script).
export const UPLOAD_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
// Limite do arquivo escolhido; JPG/PNG/WebP/AVIF são reduzidos no navegador antes do envio.
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
// GIF vai como está: precisa caber no corpo máximo de função da Vercel (4,5 MB).
export const GIF_MAX_BYTES = 4 * 1024 * 1024;

export function validarUpload(tipo: string, tamanho: number): string | null {
  if (!UPLOAD_MIME.includes(tipo)) return "Formato não aceito. Use JPG, PNG, WebP, AVIF ou GIF.";
  if (tamanho <= 0) return "Arquivo vazio.";
  if (tamanho > UPLOAD_MAX_BYTES) return "Arquivo maior que 10 MB.";
  if (tipo === "image/gif" && tamanho > GIF_MAX_BYTES) return "GIF maior que 4 MB.";
  return null;
}
