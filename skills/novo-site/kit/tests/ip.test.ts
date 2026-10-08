import { describe, it, expect } from "vitest";
import { normalizarIp } from "@/lib/ip";

describe("normalizarIp", () => {
  it("mantém IPv4", () => {
    expect(normalizarIp("203.0.113.9")).toBe("203.0.113.9");
  });

  it("IPv6 completo vira os 4 primeiros grupos + ::/64", () => {
    expect(normalizarIp("2001:0db8:0000:0001:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:0:1::/64");
  });

  it("IPv6 abreviado expande antes de cortar", () => {
    expect(normalizarIp("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(normalizarIp("2001:db8:1:2:3::9")).toBe("2001:db8:1:2::/64");
  });

  it("trata ::1", () => {
    expect(normalizarIp("::1")).toBe("0:0:0:0::/64");
  });

  it("IPv4 mapeado vira IPv4", () => {
    expect(normalizarIp("::ffff:1.2.3.4")).toBe("1.2.3.4");
  });

  it("endereços do mesmo /64 dão a mesma chave", () => {
    expect(normalizarIp("2001:db8:1:2::1")).toBe(normalizarIp("2001:db8:1:2:ffff::2"));
  });
});
