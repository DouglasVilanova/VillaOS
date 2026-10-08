"use server";

import { changePassword } from "@/lib/auth";

export async function trocarSenha(
  _anterior: { ok: boolean; msg: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; msg: string }> {
  const r = await changePassword(String(formData.get("atual") ?? ""), String(formData.get("nova") ?? ""));
  return r.ok ? { ok: true, msg: "Senha alterada." } : { ok: false, msg: r.erro };
}
