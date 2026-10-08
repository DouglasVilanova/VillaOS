import { describe, it, expect } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { previewGate, withNoindex } from "@/lib/proxy/gate";
import { safeNext, PREVIEW_COOKIE, PREVIEW_TOKEN } from "@/lib/preview";
import { signValue } from "@/lib/hmac";

const cfg = { ativo: true, senha: "s3nha", segredo: "segredo-de-teste" };

describe("safeNext", () => {
  it("só aceita caminho interno", () => {
    expect(safeNext("/sobre")).toBe("/sobre");
    expect(safeNext("/sobre?x=1")).toBe("/sobre?x=1");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
    expect(safeNext("/\t/evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("")).toBe("/");
  });
});

describe("previewGate", () => {
  it("inativo ou sem envs não bloqueia", async () => {
    const req = new NextRequest("http://localhost/sobre");
    expect(await previewGate(req, { ...cfg, ativo: false })).toBeNull();
    expect(await previewGate(req, { ...cfg, senha: undefined })).toBeNull();
  });

  it("sem cookie redireciona para /preview com next", async () => {
    const res = await previewGate(new NextRequest("http://localhost/sobre"), cfg);
    expect(res?.status).toBe(307);
    const destino = new URL(res!.headers.get("location")!);
    expect(destino.pathname).toBe("/preview");
    expect(destino.searchParams.get("next")).toBe("/sobre");
  });

  it("preserva a query string em next", async () => {
    const res = await previewGate(new NextRequest("http://localhost/sobre?x=1"), cfg);
    const destino = new URL(res!.headers.get("location")!);
    expect(destino.searchParams.get("next")).toBe("/sobre?x=1");
  });

  it("a própria /preview passa", async () => {
    expect(await previewGate(new NextRequest("http://localhost/preview"), cfg)).toBeNull();
  });

  it("cookie válido passa; cookie de outro segredo não", async () => {
    const bom = await signValue(PREVIEW_TOKEN, cfg.segredo, 60_000);
    const ruim = await signValue(PREVIEW_TOKEN, "outro", 60_000);
    const outraFinalidade = await signValue("admin:a@b.com", cfg.segredo, 60_000);
    const comCookie = (t: string) =>
      new NextRequest("http://localhost/sobre", { headers: { cookie: `${PREVIEW_COOKIE}=${t}` } });
    expect(await previewGate(comCookie(bom), cfg)).toBeNull();
    expect((await previewGate(comCookie(ruim), cfg))?.status).toBe(307);
    expect((await previewGate(comCookie(outraFinalidade), cfg))?.status).toBe(307);
  });
});

describe("withNoindex", () => {
  it("marca quando não indexável ou área interna", () => {
    expect(withNoindex(NextResponse.next(), "/", false).headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(withNoindex(NextResponse.next(), "/gestao/seo", true).headers.get("x-robots-tag")).toBe(
      "noindex, nofollow",
    );
    expect(withNoindex(NextResponse.next(), "/", true).headers.get("x-robots-tag")).toBeNull();
  });
});
