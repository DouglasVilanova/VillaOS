import { describe, it, expect } from "vitest";
import { buildCsp } from "@/lib/csp";

function diretiva(csp: string, nome: string): string {
  return csp.split("; ").find((d) => d.startsWith(`${nome} `)) ?? "";
}

describe("buildCsp", () => {
  it("rigido não libera Supabase nem unsafe-eval em produção", () => {
    const c = buildCsp("rigido", { dev: false });
    expect(diretiva(c, "connect-src")).toBe("connect-src 'self'");
    expect(diretiva(c, "script-src")).toBe("script-src 'self' 'unsafe-inline'");
    expect(diretiva(c, "object-src")).toBe("object-src 'none'");
    expect(diretiva(c, "frame-ancestors")).toBe("frame-ancestors 'self'");
  });

  it("painel libera Supabase e blob: sem unsafe-eval", () => {
    const c = buildCsp("painel", { dev: false });
    expect(diretiva(c, "connect-src")).toContain("*.supabase.co");
    expect(diretiva(c, "img-src")).toContain("blob:");
    expect(diretiva(c, "script-src")).not.toContain("'unsafe-eval'");
  });

  it("tracking libera GTM, Pixel e unsafe-eval em produção", () => {
    const c = buildCsp("tracking", { dev: false });
    expect(diretiva(c, "script-src")).toContain("*.googletagmanager.com");
    expect(diretiva(c, "script-src")).toContain("*.facebook.net");
    expect(diretiva(c, "script-src")).toContain("'unsafe-eval'");
    expect(diretiva(c, "connect-src")).toContain("*.supabase.co");
  });

  it("tracking: amazonaws só em connect-src", () => {
    const c = buildCsp("tracking", { dev: false });
    expect(diretiva(c, "script-src")).not.toContain("amazonaws");
    expect(diretiva(c, "connect-src")).toContain("*.amazonaws.com");
  });

  it("dev adiciona unsafe-eval em qualquer perfil", () => {
    expect(diretiva(buildCsp("rigido", { dev: true }), "script-src")).toContain("'unsafe-eval'");
  });

  it("não repete valores numa diretiva", () => {
    const partes = diretiva(buildCsp("tracking", { dev: true }), "script-src").split(" ");
    expect(new Set(partes).size).toBe(partes.length);
  });
});
