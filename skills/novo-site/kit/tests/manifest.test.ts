import { describe, it, expect } from "vitest";
import { cspProfile, indexavel, siteUrl, temPainel, type Manifest } from "@/lib/manifest";

const base: Manifest = {
  cliente: "x",
  nome: "X",
  status: "desenvolvimento",
  modulos: [],
  auth: "nenhum",
  tracking: [],
  local: null,
  dominio: "x.com.br",
  preview: "x.villadigital.com.br",
  repo: "",
  animacao: "medio",
};

describe("cspProfile", () => {
  it("sem painel e sem tracking → rigido", () => {
    expect(cspProfile(base)).toBe("rigido");
  });
  it("com painel → painel", () => {
    expect(cspProfile({ ...base, modulos: ["painel"] })).toBe("painel");
  });
  it("com formulário de leads → painel", () => {
    expect(cspProfile({ ...base, modulos: ["formulario-leads"] })).toBe("painel");
  });
  it("tracking vence painel", () => {
    expect(cspProfile({ ...base, modulos: ["painel"], tracking: ["gtm"] })).toBe("tracking");
  });
});

describe("indexavel", () => {
  it("só online é indexável", () => {
    expect(indexavel(base)).toBe(false);
    expect(indexavel({ ...base, status: "proposta" })).toBe(false);
    expect(indexavel({ ...base, status: "online" })).toBe(true);
  });
});

describe("siteUrl", () => {
  it("env tem prioridade e perde a barra final", () => {
    expect(siteUrl(base, "https://outro.com/")).toBe("https://outro.com");
  });
  it("online usa o domínio do cliente", () => {
    expect(siteUrl({ ...base, status: "online" }, "")).toBe("https://x.com.br");
  });
  it("fora do ar usa o preview", () => {
    expect(siteUrl(base, "")).toBe("https://x.villadigital.com.br");
  });
  it("sem nada → localhost", () => {
    expect(siteUrl({ ...base, preview: "" }, "")).toBe("http://localhost:3000");
  });
});

describe("temPainel", () => {
  it("exige módulo painel e auth", () => {
    expect(temPainel({ ...base, modulos: ["painel"] })).toBe(false);
    expect(temPainel({ ...base, modulos: ["painel"], auth: "env-hmac" })).toBe(true);
  });
});
