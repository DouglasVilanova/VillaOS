import { describe, it, expect } from "vitest";
import { validarUpload, UPLOAD_MAX_BYTES, GIF_MAX_BYTES } from "@/lib/upload-rules";

describe("validarUpload", () => {
  it("aceita imagem comum", () => {
    expect(validarUpload("image/png", 1000)).toBeNull();
    expect(validarUpload("image/webp", 1000)).toBeNull();
  });
  it("recusa SVG e não imagem", () => {
    expect(validarUpload("image/svg+xml", 1000)).not.toBeNull();
    expect(validarUpload("application/pdf", 1000)).not.toBeNull();
  });
  it("recusa vazio e grande demais", () => {
    expect(validarUpload("image/png", 0)).not.toBeNull();
    expect(validarUpload("image/png", UPLOAD_MAX_BYTES + 1)).not.toBeNull();
    // GIF não é comprimido no navegador: precisa caber no limite de corpo da Vercel (4,5 MB)
    expect(validarUpload("image/gif", GIF_MAX_BYTES + 1)).not.toBeNull();
    expect(validarUpload("image/gif", GIF_MAX_BYTES)).toBeNull();
  });
});
