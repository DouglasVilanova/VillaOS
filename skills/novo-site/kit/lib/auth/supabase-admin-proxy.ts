// Checagem no proxy: valida a sessão e renova cookies do Supabase.
// Padrão oficial do @supabase/ssr: a resposta é recriada dentro de setAll para que os cookies
// renovados cheguem tanto ao navegador quanto aos Server Components desta mesma requisição.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { ChecagemProxy } from "./types";

export async function checkAdminRequest(req: NextRequest): Promise<ChecagemProxy> {
  let res = NextResponse.next({ request: req });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return { ok: false, res };
  const sb = createServerClient(url, chave, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll(lista) {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const {
    data: { user },
  } = await sb.auth.getUser();
  return { ok: user?.app_metadata?.role === "admin", res };
}
