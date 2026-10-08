"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";

export async function entrar(_anterior: { erro: string } | null, formData: FormData): Promise<{ erro: string } | null> {
  const r = await signIn(String(formData.get("email") ?? ""), String(formData.get("senha") ?? ""));
  if (!r.ok) return { erro: r.erro };
  redirect("/gestao");
}

export async function sair() {
  await signOut();
  redirect("/gestao/login");
}
