// Modo env-hmac: 1 editor. E-mail e senha em env (ADMIN_EMAIL/ADMIN_PASSWORD), sessão em cookie
// HMAC (SESSION_SECRET) com valor "admin:<email>:<fp da senha>".
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signValue, verifyValue, safeEqual } from "@/lib/hmac";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import type { Resultado } from "@/lib/resultado";
import { ADMIN_COOKIE, ADMIN_TTL_MS, EMAIL_MAX, LOGIN_JANELA_MS, LOGIN_LIMITE, LOGIN_LIMITE_CONTA } from "./constants";
import { valorSessaoEsperado } from "./env-hmac-proxy";
import type { AdminSession } from "./types";

export const AUTH_MODE = "env-hmac";

function segredo(): string | null {
  return process.env.SESSION_SECRET || null;
}

export async function getAdmin(): Promise<AdminSession | null> {
  const s = segredo();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const esperado = await valorSessaoEsperado();
  if (!s || !token || !esperado) return null;
  if ((await verifyValue(token, s)) !== esperado) return null;
  return { email: (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() };
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/gestao/login");
  return admin;
}

export async function signIn(email: string, senha: string): Promise<Resultado> {
  const s = segredo();
  const esperadoEmail = process.env.ADMIN_EMAIL;
  const esperadaSenha = process.env.ADMIN_PASSWORD;
  const esperado = await valorSessaoEsperado();
  if (!s || !esperadoEmail || !esperadaSenha || !esperado) return { ok: false, erro: "Login não configurado neste ambiente." };

  const normal = email.trim().toLowerCase().slice(0, EMAIL_MAX);
  const rl = await rateLimit(`login:${await clientIp()}:${normal}`, LOGIN_LIMITE, LOGIN_JANELA_MS);
  const rlConta = await rateLimit(`login:acct:${normal}`, LOGIN_LIMITE_CONTA, LOGIN_JANELA_MS);
  const bloqueio = !rl.ok ? rl : !rlConta.ok ? rlConta : null;
  if (bloqueio) return { ok: false, erro: `Muitas tentativas. Tente de novo em ${Math.ceil(bloqueio.retryAfterMs / 60000)} min.` };

  const [okEmail, okSenha] = await Promise.all([
    safeEqual(normal, esperadoEmail.trim().toLowerCase(), s),
    safeEqual(senha, esperadaSenha, s),
  ]);
  if (!okEmail || !okSenha) return { ok: false, erro: "E-mail ou senha inválidos." };

  (await cookies()).set(ADMIN_COOKIE, await signValue(esperado, s, ADMIN_TTL_MS), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL_MS / 1000,
  });
  return { ok: true };
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function changePassword(_atual: string, _nova: string): Promise<Resultado> {
  return {
    ok: false,
    erro: "Neste site a senha fica na variável ADMIN_PASSWORD da Vercel. Troque lá e faça redeploy; isso encerra todas as sessões abertas.",
  };
}
