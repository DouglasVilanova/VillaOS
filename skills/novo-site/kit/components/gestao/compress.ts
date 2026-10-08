// Reduz a imagem no navegador antes do upload (limite de corpo da Vercel: 4,5 MB).
export async function compressImage(arquivo: File, max = 2400, qualidade = 0.9): Promise<Blob> {
  if (arquivo.type === "image/gif") return arquivo;
  const bmp = await createImageBitmap(arquivo);
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * escala);
  const h = Math.round(bmp.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const gerar = (tipo: string) =>
    new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir a imagem"))), tipo, qualidade),
    );
  const webp = await gerar("image/webp");
  // Safari/iOS não codifica WebP e devolve PNG: reencoda em JPEG para não estourar o limite de corpo.
  if (webp.type === "image/webp") return webp;
  // JPEG não tem transparência: pinta branco atrás da imagem para PNGs transparentes não ficarem pretos.
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  return gerar("image/jpeg");
}
