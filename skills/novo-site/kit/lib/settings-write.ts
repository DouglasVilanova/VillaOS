// Escrita de uma seção do conteúdo. Sempre: requireAdmin → validação → RPC com service_role.
import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseAdmin } from "@/lib/env";
import type { Resultado } from "@/lib/resultado";
import { isSecao, mergeSettings } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveSection(secao: string, valor: unknown): Promise<Resultado> {
  await requireAdmin();
  if (!isSecao(secao)) return { ok: false, erro: "Seção inválida." };
  if (!hasSupabaseAdmin()) return { ok: false, erro: "Banco não configurado: a alteração não foi salva." };

  // mergeSettings garante a forma: só campos conhecidos, com o tipo certo.
  const limpo = mergeSettings({ [secao]: valor })[secao];
  const { error } = await createAdminClient().rpc("update_settings_section", {
    p_section: secao,
    p_value: limpo,
  });
  if (error) {
    console.error("[settings] escrita:", error.message);
    return { ok: false, erro: "Erro ao salvar. Veja os logs da função." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
