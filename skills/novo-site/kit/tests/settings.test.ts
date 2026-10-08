import { describe, it, expect } from "vitest";
import { mergeSettings, mergeWith, isSecao } from "@/lib/settings";
import { SITE_DEFAULTS } from "@/lib/defaults";

describe("mergeSettings", () => {
  it("entrada vazia devolve defaults", () => {
    expect(mergeSettings(null)).toEqual(SITE_DEFAULTS);
    expect(mergeSettings("lixo")).toEqual(SITE_DEFAULTS);
  });

  it("mantém o que veio e completa o que falta", () => {
    const s = mergeSettings({ hero: { titulo: "Novo título" } });
    expect(s.hero.titulo).toBe("Novo título");
    expect(s.hero.subtitulo).toBe(SITE_DEFAULTS.hero.subtitulo);
    expect(s.sobre).toEqual(SITE_DEFAULTS.sobre);
  });

  it("tipo errado volta para o default", () => {
    const s = mergeSettings({ visibilidade: { sobre: "sim" }, hero: { titulo: 42 } });
    expect(s.visibilidade.sobre).toBe(SITE_DEFAULTS.visibilidade.sobre);
    expect(s.hero.titulo).toBe(SITE_DEFAULTS.hero.titulo);
  });

  it("descarta chaves desconhecidas", () => {
    const s = mergeSettings({ invasor: 1, hero: { extra: "x" } }) as unknown as Record<string, unknown>;
    expect(s.invasor).toBeUndefined();
    expect((s.hero as Record<string, unknown>).extra).toBeUndefined();
  });
});

describe("mergeWith com arrays", () => {
  it("array válido substitui; inválido mantém o default", () => {
    expect(mergeWith(["a"], ["b", "c"])).toEqual(["b", "c"]);
    expect(mergeWith(["a"], "x")).toEqual(["a"]);
  });
});

describe("isSecao", () => {
  it("só aceita seções existentes", () => {
    expect(isSecao("hero")).toBe(true);
    expect(isSecao("__proto__")).toBe(false);
    expect(isSecao("constructor")).toBe(false);
  });
});
