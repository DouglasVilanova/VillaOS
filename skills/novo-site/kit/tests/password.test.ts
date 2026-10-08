import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/password";

describe("validatePassword", () => {
  it("aceita senha forte", () => {
    expect(validatePassword("Abcdefgh12")).toBeNull();
  });
  it("exige 10 caracteres", () => {
    expect(validatePassword("Abcdef12")).toMatch(/10/);
  });
  it("exige maiúscula, minúscula e número", () => {
    expect(validatePassword("abcdefgh12")).toMatch(/maiúscula/);
    expect(validatePassword("ABCDEFGH12")).toMatch(/minúscula/);
    expect(validatePassword("Abcdefghij")).toMatch(/número/);
  });
});
