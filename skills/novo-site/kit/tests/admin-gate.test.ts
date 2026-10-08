import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const checkAdminRequest = vi.fn();
vi.mock("@/lib/auth/proxy", () => ({ checkAdminRequest: (req: NextRequest) => checkAdminRequest(req) }));

import { adminGate } from "@/lib/proxy/admin";

const semSessao = () => checkAdminRequest.mockResolvedValue({ ok: false, res: NextResponse.next() });

describe("adminGate", () => {
  beforeEach(() => checkAdminRequest.mockReset());

  it("redireciona GET sem sessão para o login", async () => {
    semSessao();
    const r = await adminGate(new NextRequest("http://localhost/gestao/seo"));
    expect(r.status).toBe(307);
    expect(new URL(r.headers.get("location")!, "http://localhost").pathname).toBe("/gestao/login");
  });

  it("não redireciona server action sem sessão (requireAdmin cuida do redirect)", async () => {
    semSessao();
    const r = await adminGate(
      new NextRequest("http://localhost/gestao/seo", { method: "POST", headers: { "next-action": "abc" } }),
    );
    expect(r.status).toBe(200);
    expect(r.headers.get("location")).toBeNull();
  });

  it("redireciona /gestao/login com sessão para /gestao", async () => {
    checkAdminRequest.mockResolvedValue({ ok: true, res: NextResponse.next() });
    const r = await adminGate(new NextRequest("http://localhost/gestao/login"));
    expect(r.status).toBe(307);
    expect(new URL(r.headers.get("location")!, "http://localhost").pathname).toBe("/gestao");
  });
});