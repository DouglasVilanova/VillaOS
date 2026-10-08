// Upload de imagem: valida, converte para WebP com Sharp (máx. 2400px) e sobe no bucket.
// Nunca guardar binário no Postgres: só a URL pública.
import "server-only";
import sharp from "sharp";
import { hasSupabaseAdmin } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { validarUpload } from "@/lib/upload-rules";

export type ResultadoUpload = { ok: true; url: string } | { ok: false; erro: string };

const BUCKET = "site-images";

export async function uploadImage(arquivo: File, pasta = "site"): Promise<ResultadoUpload> {
  const problema = validarUpload(arquivo.type, arquivo.size);
  if (problema) return { ok: false, erro: problema };
  if (!hasSupabaseAdmin()) return { ok: false, erro: "Banco não configurado: upload indisponível." };

  const entrada = Buffer.from(await arquivo.arrayBuffer());
  const gif = arquivo.type === "image/gif";
  let saida: Buffer;
  try {
    // Confere o conteúdo real (não só o MIME declarado) e converte.
    const meta = await sharp(entrada).metadata();
    if (gif && meta.format !== "gif") return { ok: false, erro: "O arquivo não é um GIF válido." };
    saida = gif
      ? entrada
      : await sharp(entrada)
          .rotate()
          .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer();
  } catch {
    return { ok: false, erro: "Imagem inválida ou corrompida." };
  }

  const caminho = `${pasta}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${gif ? "gif" : "webp"}`;
  const storage = createAdminClient().storage.from(BUCKET);
  const { error } = await storage.upload(caminho, saida, {
    contentType: gif ? "image/gif" : "image/webp",
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("[upload]", error.message);
    return { ok: false, erro: "Falha ao enviar a imagem." };
  }
  return { ok: true, url: storage.getPublicUrl(caminho).data.publicUrl };
}
