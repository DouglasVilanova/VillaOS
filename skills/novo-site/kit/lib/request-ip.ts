// IP do cliente para chave de rate limit (Vercel preenche x-forwarded-for).
import { headers } from "next/headers";
import { normalizarIp } from "./ip";

export async function clientIp(): Promise<string> {
  const h = await headers();
  return normalizarIp(h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local");
}
