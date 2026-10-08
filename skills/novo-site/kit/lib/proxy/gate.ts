// Gate de preview (status proposta) e noindex. Sem dependência de lib/auth: também é usado
// no proxy do modo proposta.
import { NextResponse, type NextRequest } from "next/server";
import { verifyValue } from "@/lib/hmac";
import { PREVIEW_COOKIE, PREVIEW_TOKEN } from "@/lib/preview";

export type GateConfig = { ativo: boolean; senha: string | undefined; segredo: string | undefined };

export async function previewGate(req: NextRequest, cfg: GateConfig): Promise<NextResponse | null> {
  if (!cfg.ativo || !cfg.senha || !cfg.segredo) return null;
  const caminho = req.nextUrl.pathname;
  if (caminho === "/preview" || caminho.startsWith("/preview/")) return null;
  const token = req.cookies.get(PREVIEW_COOKIE)?.value;
  if (token && (await verifyValue(token, cfg.segredo)) === PREVIEW_TOKEN) return null;
  const destino = caminho + req.nextUrl.search;
  const url = req.nextUrl.clone();
  url.pathname = "/preview";
  url.search = "";
  url.searchParams.set("next", destino);
  return NextResponse.redirect(url);
}

export function withNoindex(res: NextResponse, caminho: string, indexavel: boolean): NextResponse {
  if (!indexavel || caminho.startsWith("/gestao") || caminho.startsWith("/preview")) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}
