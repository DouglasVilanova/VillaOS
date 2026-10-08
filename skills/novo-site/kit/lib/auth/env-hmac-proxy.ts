// Checagem de sessão para o proxy (sem next/headers, sem server-only).
import { NextResponse, type NextRequest } from "next/server";
import { hmacB64url, verifyValue } from "@/lib/hmac";
import { ADMIN_COOKIE, ADMIN_PREFIXO } from "./constants";
import type { ChecagemProxy } from "./types";

/**
 * Valor esperado no cookie: "admin:<email>:<fp>", onde fp é derivado da senha atual.
 * Trocar ADMIN_EMAIL ou ADMIN_PASSWORD invalida todas as sessões abertas.
 * Devolve null se faltar alguma env.
 */
export async function valorSessaoEsperado(): Promise<string | null> {
  const s = process.env.SESSION_SECRET;
  const senha = process.env.ADMIN_PASSWORD;
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!s || !senha || !email) return null;
  const fp = (await hmacB64url(senha, s)).slice(0, 16);
  return `${ADMIN_PREFIXO}${email}:${fp}`;
}

export async function checkAdminRequest(req: NextRequest): Promise<ChecagemProxy> {
  const res = NextResponse.next({ request: req });
  const s = process.env.SESSION_SECRET;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const esperado = await valorSessaoEsperado();
  if (!s || !token || !esperado) return { ok: false, res };
  return { ok: (await verifyValue(token, s)) === esperado, res };
}