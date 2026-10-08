// Proxy do modo proposta: só gate de preview e noindex. Não importa lib/auth (não existe).
import { NextResponse, type NextRequest } from "next/server";
import { manifest } from "./lib/manifest";
import { previewGate, withNoindex } from "./lib/proxy/gate";

export async function proxy(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  const gate = await previewGate(req, {
    ativo: manifest.status !== "online",
    senha: process.env.PREVIEW_PASSWORD,
    segredo: process.env.PREVIEW_SECRET,
  });
  return withNoindex(gate ?? NextResponse.next(), caminho, false);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$).*)"],
};
