// Modo env-hmac: 1 editor. E-mail e senha em env (ADMIN_EMAIL/ADMIN_PASSWORD), sessão em cookie
// HMAC (SESSION_SECRET) com valor "admin:<email>".
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signValue, verifyValue, safeEqual } from "@/lib/hmac";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import type { Resultado } from "@/lib/resultado";
import { ADMIN_COOKIE, ADMIN_PREFIXO, ADMIN_TTL_MS, LOGIN_JANELA_MS, LOGIN_LIMITE } from "./constants";
import type { AdminSession } from "./types";

export const AUTH_MODE = "env-hmac";

function segredo(): string | null {
  return process.env.SESSION_SECRET || null;
}

/** Valor do cookie é "admin:<email>"; trocar ADMIN_EMAIL derruba sessões antigas. */
export function emailDaSessao(valor: string | null): string | null {
  if (!valor?.startsWith(ADMIN_PREFIXO)) return null;
  const email = valor.slice(ADMIN_PREFIXO.length);
  return email === (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() ? email : null;
}

export async function getAdmin(): Promise<AdminSession | null> {
  const s = segredo();
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!s || !token) return null;
  const email = emailDaSessao(await verifyValue(token, s));
  return email ? { email } : null;
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
  if (!s || !esperadoEmail || !esperadaSenha) return { ok: false, erro: "Login não configurado neste ambiente." };

  const normal = email.trim().toLowerCase();
  const rl = await rateLimit(`login:${await clientIp()}:${normal}`, LOGIN_LIMITE, LOGIN_JANELA_MS);
  if (!rl.ok) return { ok: false, erro: `Muitas tentativas. Tente de novo em ${Math.ceil(rl.retryAfterMs / 60000)} min.` };

  const [okEmail, okSenha] = await Promise.all([
    safeEqual(normal, esperadoEmail.trim().toLowerCase(), s),
    safeEqual(senha, esperadaSenha, s),
  ]);
  if (!okEmail || !okSenha) return { ok: false, erro: "E-mail ou senha inválidos." };

  (await cookies()).set(ADMIN_COOKIE, await signValue(`${ADMIN_PREFIXO}${normal}`, s, ADMIN_TTL_MS), {
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
    erro: "Neste site a senha fica na variável ADMIN_PASSWORD da Vercel. Troque lá e faça redeploy.",
  };
}
