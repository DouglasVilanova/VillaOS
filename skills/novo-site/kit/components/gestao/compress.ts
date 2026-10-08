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
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao comprimir a imagem"))), "image/webp", qualidade),
  );
}
