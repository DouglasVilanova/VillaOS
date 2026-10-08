"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { safeEqual, signValue } from "@/lib/hmac";
import { PREVIEW_COOKIE, PREVIEW_TOKEN, PREVIEW_TTL_MS, safeNext } from "@/lib/preview";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

export async function entrarPreview(formData: FormData) {
  const destino = safeNext(String(formData.get("next") ?? "/"));
  const senha = String(formData.get("senha") ?? "");
  const esperada = process.env.PREVIEW_PASSWORD;
  const segredo = process.env.PREVIEW_SECRET;
  if (!esperada || !segredo) redirect(destino);

  const rl = await rateLimit(`preview:${await clientIp()}`, 10, 15 * 60 * 1000);
  const ok = rl.ok && (await safeEqual(senha, esperada, segredo));
  if (!ok) redirect(`/preview?erro=1&next=${encodeURIComponent(destino)}`);

  (await cookies()).set(PREVIEW_COOKIE, await signValue(PREVIEW_TOKEN, segredo, PREVIEW_TTL_MS), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PREVIEW_TTL_MS / 1000,
  });
  redirect(destino);
}
