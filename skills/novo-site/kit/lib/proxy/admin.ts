// Camada 1 da defesa em profundidade: redireciona /gestao sem sessão. As camadas 2 (layout) e
// 3 (requireAdmin em toda action) não confiam nesta.
import { NextResponse, type NextRequest } from "next/server";
import { checkAdminRequest } from "@/lib/auth/proxy";

function redirecionar(req: NextRequest, destino: string, origem: NextResponse): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = destino;
  url.search = "";
  const r = NextResponse.redirect(url);
  // Leva junto cookies de sessão renovados na checagem.
  origem.cookies.getAll().forEach((c) => r.cookies.set(c));
  return r;
}

export async function adminGate(req: NextRequest): Promise<NextResponse> {
  const caminho = req.nextUrl.pathname;
  if (!caminho.startsWith("/gestao")) return NextResponse.next({ request: req });

  const login = caminho === "/gestao/login";
  let checagem = { ok: false, res: NextResponse.next({ request: req }) };
  try {
    checagem = await checkAdminRequest(req);
  } catch (e) {
    console.error("[proxy] auth:", e);
  }
  if (!checagem.ok && !login) return redirecionar(req, "/gestao/login", checagem.res);
  if (checagem.ok && login) return redirecionar(req, "/gestao", checagem.res);
  return checagem.res;
}
