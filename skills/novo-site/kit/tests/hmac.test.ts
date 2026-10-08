import { describe, it, expect } from "vitest";
import { signValue, verifyValue, safeEqual } from "@/lib/hmac";

const S = "segredo-de-teste-com-32-caracteres!!";

describe("signValue/verifyValue", () => {
  it("ida e volta", async () => {
    const t = await signValue("admin@x.com", S, 60_000);
    expect(await verifyValue(t, S)).toBe("admin@x.com");
  });

  it("aceita valor com | e :", async () => {
    const t = await signValue("a|b:c", S, 60_000);
    expect(await verifyValue(t, S)).toBe("a|b:c");
  });

  it("recusa assinatura adulterada", async () => {
    const t = await signValue("admin@x.com", S, 60_000);
    const [p, s] = t.split(".");
    const trocado = (s[0] === "A" ? "B" : "A") + s.slice(1);
    expect(await verifyValue(`${p}.${trocado}`, S)).toBeNull();
  });

  it("recusa payload trocado", async () => {
    const a = await signValue("admin@x.com", S, 60_000);
    const b = await signValue("outro@x.com", S, 60_000);
    expect(await verifyValue(`${b.split(".")[0]}.${a.split(".")[1]}`, S)).toBeNull();
  });

  it("recusa expirado", async () => {
    const t = await signValue("admin@x.com", S, 1_000, 0);
    expect(await verifyValue(t, S, 2_000)).toBeNull();
  });

  it("recusa outro segredo", async () => {
    const t = await signValue("admin@x.com", S, 60_000);
    expect(await verifyValue(t, "outro-segredo")).toBeNull();
  });

  it("recusa lixo", async () => {
    expect(await verifyValue("nada", S)).toBeNull();
    expect(await verifyValue("a.b", S)).toBeNull();
  });
});

describe("safeEqual", () => {
  it("compara", async () => {
    expect(await safeEqual("abc", "abc", S)).toBe(true);
    expect(await safeEqual("abc", "abd", S)).toBe(false);
    expect(await safeEqual("abc", "abcd", S)).toBe(false);
  });
});
