import { describe, it, expect } from "vitest";
import { organizacaoLd } from "@/lib/jsonld";
import { SITE_DEFAULTS } from "@/lib/defaults";
import type { Manifest } from "@/lib/manifest";

const m: Manifest = {
  cliente: "x", nome: "Empresa X", status: "online", modulos: [], auth: "nenhum", tracking: [],
  local: null, dominio: "x.com.br", preview: "", repo: "", animacao: "medio",
};

describe("organizacaoLd", () => {
  it("Organization sem local, sem campos vazios", () => {
    const ld = organizacaoLd(m, SITE_DEFAULTS, "https://x.com.br");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe("https://x.com.br/");
    expect("telephone" in ld).toBe(false);
    expect("address" in ld).toBe(false);
  });

  it("LocalBusiness com endereço e redes", () => {
    const s = {
      ...SITE_DEFAULTS,
      contato: { ...SITE_DEFAULTS.contato, telefone: "+55 54 3333-0000", instagram: "https://instagram.com/x" },
    };
    const ld = organizacaoLd({ ...m, local: { cidade: "Passo Fundo", uf: "RS" } }, s, "https://x.com.br");
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld.telephone).toBe("+55 54 3333-0000");
    expect(ld.address).toMatchObject({ addressLocality: "Passo Fundo", addressRegion: "RS", addressCountry: "BR" });
    expect(ld.sameAs).toEqual(["https://instagram.com/x"]);
  });
});
