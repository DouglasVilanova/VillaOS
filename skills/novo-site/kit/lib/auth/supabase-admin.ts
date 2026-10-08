// Modo supabase-admin: 2+ editores via Supabase Auth, signup desligado no projeto.
// Só entra quem tem app_metadata.role = 'admin' (gravável só por service_role/dashboard).
// Mesmo padrão já usado em produção no site da agência.
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/env";
import { validatePassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import type { Resultado } from "@/lib/resultado";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_MAX, LOGIN_JANELA_MS, LOGIN_LIMITE, LOGIN_LIMITE_CONTA } from "./constants";
import type { AdminSession } from "./types";

export const AUTH_MODE = "supabase-admin";

export async function getAdmin(): Promise<AdminSession | null> {
  if (!hasSupabase()) return null;
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return null;
  return { email: user.email ?? "" };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/gestao/login");
  return admin;
}

export async function signIn(email: string, senha: string): Promise<Resultado> {
  if (!hasSupabase()) return { ok: false, erro: "Banco não configurado neste ambiente." };
  const normal = email.trim().toLowerCase().slice(0, EMAIL_MAX);
  const rl = await rateLimit(`login:${await clientIp()}:${normal}`, LOGIN_LIMITE, LOGIN_JANELA_MS);
  const rlConta = await rateLimit(`login:acct:${normal}`, LOGIN_LIMITE_CONTA, LOGIN_JANELA_MS);
  const bloqueio = !rl.ok ? rl : !rlConta.ok ? rlConta : null;
  if (bloqueio) return { ok: false, erro: `Muitas tentativas. Tente de novo em ${Math.ceil(bloqueio.retryAfterMs / 60000)} min.` };

  const sb = await createClient();
  const { data, error } = await sb.auth.signInWithPassword({ email: normal, password: senha });
  if (error || !data.user) return { ok: false, erro: "E-mail ou senha inválidos." };
  if (data.user.app_metadata?.role !== "admin") {
    await sb.auth.signOut();
    return { ok: false, erro: "Este usuário não tem permissão de administrador." };
  }
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!hasSupabase()) return;
  await (await createClient()).auth.signOut({ scope: "local" });
}

export async function changePassword(atual: string, nova: string): Promise<Resultado> {
  const admin = await requireAdmin();
  const problema = validatePassword(nova);
  if (problema) return { ok: false, erro: problema };
  const rl = await rateLimit(`senha:${admin.email.slice(0, EMAIL_MAX)}`, LOGIN_LIMITE, LOGIN_JANELA_MS);
  if (!rl.ok) return { ok: false, erro: "Muitas tentativas. Tente de novo mais tarde." };
  const sb = await createClient();
  const { error: erroAtual } = await sb.auth.signInWithPassword({ email: admin.email, password: atual });
  if (erroAtual) return { ok: false, erro: "Senha atual incorreta." };
  const { error } = await sb.auth.updateUser({ password: nova });
  if (error) return { ok: false, erro: error.message };
  const { error: erroOutras } = await sb.auth.signOut({ scope: "others" });
  if (erroOutras) console.error("[auth] signOut others:", erroOutras.message);
  return { ok: true };
}
