import { describe, it, expect, vi } from "vitest";
import { createMemoryLimiter, rateLimit } from "@/lib/rate-limit";

describe("createMemoryLimiter", () => {
  it("bloqueia depois do limite e libera após a janela", async () => {
    let t = 0;
    const rl = createMemoryLimiter(() => t);
    expect((await rl("k", 2, 1000)).ok).toBe(true);
    expect((await rl("k", 2, 1000)).ok).toBe(true);
    const bloqueado = await rl("k", 2, 1000);
    expect(bloqueado.ok).toBe(false);
    expect(bloqueado.retryAfterMs).toBe(1000);
    t = 400;
    expect((await rl("k", 2, 1000)).retryAfterMs).toBe(600);
    t = 1000;
    expect((await rl("k", 2, 1000)).ok).toBe(true);
  });

  it("chaves são independentes", async () => {
    const rl = createMemoryLimiter(() => 0);
    await rl("a", 1, 1000);
    expect((await rl("a", 1, 1000)).ok).toBe(false);
    expect((await rl("b", 1, 1000)).ok).toBe(true);
  });
});

describe("rateLimit sem Supabase", () => {
  it("usa memória", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", ""); // não depender do shell do desenvolvedor
    const chave = `teste-${Math.random()}`;
    expect((await rateLimit(chave, 1, 60_000)).ok).toBe(true);
    expect((await rateLimit(chave, 1, 60_000)).ok).toBe(false);
  });
});
