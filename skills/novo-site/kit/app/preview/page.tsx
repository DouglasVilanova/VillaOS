import type { Metadata } from "next";
import { manifest } from "@/lib/manifest";
import { safeNext } from "@/lib/preview";
import { entrarPreview } from "./actions";

export const metadata: Metadata = { title: "Prévia", robots: { index: false, follow: false } };

export default async function Preview({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; erro?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNext(Array.isArray(params.next) ? (params.next[0] ?? "/") : (params.next ?? "/"));
  const erro = params.erro;
  return (
    <main className="grid min-h-screen place-items-center bg-suave px-4">
      <form action={entrarPreview} className="w-full max-w-sm rounded-2xl bg-fundo p-8 shadow-sm">
        <p className="text-sm uppercase tracking-widest opacity-60">Prévia</p>
        <h1 className="mt-1 font-display text-2xl font-bold">{manifest.nome}</h1>
        <input type="hidden" name="next" value={next} />
        <label className="mt-6 block text-sm font-medium">
          Senha
          <input
            type="password"
            name="senha"
            required
            autoFocus
            className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2"
          />
        </label>
        {erro ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Senha incorreta ou muitas tentativas.
          </p>
        ) : null}
        <button className="mt-6 w-full rounded-full bg-destaque py-2 font-semibold text-destaque-texto">Entrar</button>
      </form>
    </main>
  );
}
