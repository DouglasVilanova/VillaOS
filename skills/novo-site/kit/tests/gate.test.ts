import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { previewGate } from "@/lib/proxy/gate";

const cfg = { ativo: true, senha: "x", segredo: "y" };
const req = (p: string) => new NextRequest(`http://localhost${p}`);

describe("previewGate", () => {
  it("deixa /robots.txt passar sem cookie", async () => {
    expect(await previewGate(req("/robots.txt"), cfg)).toBeNull();
  });
  it("deixa /preview passar", async () => {
    expect(await previewGate(req("/preview"), cfg)).toBeNull();
  });
  it("redireciona outras rotas para /preview", async () => {
    const r = await previewGate(req("/sobre"), cfg);
    expect(r?.headers.get("location")).toContain("/preview?next=%2Fsobre");
  });
  it("não age com o gate inativo", async () => {
    expect(await previewGate(req("/"), { ...cfg, ativo: false })).toBeNull();
  });
});