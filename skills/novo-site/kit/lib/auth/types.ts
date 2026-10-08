import type { NextResponse } from "next/server";

export type AdminSession = { email: string };
/** Resultado da checagem no proxy: `res` carrega cookies de sessão renovados. */
export type ChecagemProxy = { ok: boolean; res: NextResponse };
