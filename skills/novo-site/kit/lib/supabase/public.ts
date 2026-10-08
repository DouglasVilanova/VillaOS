// Cliente anônimo sem cookies, para leitura pública (RLS só permite SELECT).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cliente: SupabaseClient | null = null;

export function publicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return null;
  cliente ??= createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
  return cliente;
}
