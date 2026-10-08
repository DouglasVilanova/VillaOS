import type { NextRequest } from "next/server";
import { indexavel, manifest } from "./lib/manifest";
import { adminGate } from "./lib/proxy/admin";
import { previewGate, withNoindex } from "./lib/proxy/gate";

export async function proxy(req: NextRequest) {
  const caminho = req.nextUrl.pathname;
  // Gate em todo status fora do ar; só age com PREVIEW_PASSWORD e PREVIEW_SECRET definidos.
  const gate = await previewGate(req, {
    ativo: manifest.status !== "online",
    senha: process.env.PREVIEW_PASSWORD,
    segredo: process.env.PREVIEW_SECRET,
  });
  if (gate) return withNoindex(gate, caminho, false);
  return withNoindex(await adminGate(req), caminho, indexavel(manifest));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$).*)"],
};
