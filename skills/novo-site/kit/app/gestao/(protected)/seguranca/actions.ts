"use server";

import { changePassword } from "@/lib/auth";

export async function trocarSenha(
  _anterior: { ok: boolean; msg: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; msg: string }> {
  const nova = String(formData.get("nova") ?? "");
  if (nova !== String(formData.get("confirmacao") ?? "")) return { ok: false, msg: "As senhas não conferem." };
  const r = await changePassword(String(formData.get("atual") ?? ""), nova);
  return r.ok ? { ok: true, msg: "Senha alterada." } : { ok: false, msg: r.erro };
}
