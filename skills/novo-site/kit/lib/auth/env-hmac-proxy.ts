// Checagem de sessão para o proxy (sem next/headers, sem server-only).
import { NextResponse, type NextRequest } from "next/server";
import { verifyValue } from "@/lib/hmac";
import { ADMIN_COOKIE, ADMIN_PREFIXO } from "./constants";
import type { ChecagemProxy } from "./types";

export async function checkAdminRequest(req: NextRequest): Promise<ChecagemProxy> {
  const res = NextResponse.next({ request: req });
  const s = process.env.SESSION_SECRET;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!s || !token) return { ok: false, res };
  const valor = await verifyValue(token, s);
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  return { ok: valor === `${ADMIN_PREFIXO}${email}`, res };
}
