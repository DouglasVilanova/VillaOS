import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slug";
import { stripHtml, clampText, absUrl } from "@/lib/seo";
import { waLink } from "@/lib/wa";

describe("slugify", () => {
  it("remove acentos e símbolos", () => {
    expect(slugify("Iluminação & LED: Guia 2026!")).toBe("iluminacao-led-guia-2026");
  });
  it("tira hífens das pontas", () => {
    expect(slugify("  --Olá--  ")).toBe("ola");
  });
  it("limita a 80 caracteres", () => {
    expect(slugify("a".repeat(120)).length).toBe(80);
  });
});

describe("seo", () => {
  it("stripHtml remove tags e normaliza espaços", () => {
    expect(stripHtml("<p>Olá <b>mundo</b></p>\n<p>!</p>")).toBe("Olá mundo !");
  });
  it("clampText corta em palavra e põe reticências", () => {
    const r = clampText("palavra ".repeat(40), 60);
    expect(r.length).toBeLessThanOrEqual(61);
    expect(r.endsWith("palavra…")).toBe(true);
  });
  it("clampText mantém texto curto", () => {
    expect(clampText("curto", 60)).toBe("curto");
  });
  it("absUrl", () => {
    expect(absUrl("/img.webp", "https://x.com")).toBe("https://x.com/img.webp");
    expect(absUrl("img.webp", "https://x.com")).toBe("https://x.com/img.webp");
    expect(absUrl("https://cdn.com/a.webp", "https://x.com")).toBe("https://cdn.com/a.webp");
    expect(absUrl("//cdn.com/a.webp", "https://x.com")).toBe("https://cdn.com/a.webp");
    expect(absUrl(undefined, "https://x.com")).toBeUndefined();
    expect(absUrl("", "https://x.com")).toBeUndefined();
  });
});

describe("waLink", () => {
  it("mantém só dígitos", () => {
    expect(waLink("+55 (54) 99999-0000")).toBe("https://wa.me/5554999990000");
  });
  it("codifica a mensagem", () => {
    expect(waLink("5554999990000", "Olá, vim pelo site")).toBe(
      "https://wa.me/5554999990000?text=Ol%C3%A1%2C%20vim%20pelo%20site",
    );
  });
});
