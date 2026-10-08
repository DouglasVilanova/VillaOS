// Cliente com service_role: ignora RLS. Só servidor. Toda escrita do painel passa por aqui
// depois de requireAdmin().
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("Supabase admin não configurado");
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
