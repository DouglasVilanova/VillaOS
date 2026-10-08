import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseAdmin } from "@/lib/env";
import { manifest } from "@/lib/manifest";
import { sair } from "../login/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Painel", robots: { index: false, follow: false } };

const NAV = [
  { href: "/gestao/blocos/hero", label: "Hero" },
  { href: "/gestao/blocos/sobre", label: "Sobre" },
  { href: "/gestao/blocos/contato", label: "Contato" },
  { href: "/gestao/visibilidade", label: "Visibilidade" },
  { href: "/gestao/seo", label: "SEO" },
  { href: "/gestao/seguranca", label: "Segurança" },
];

export default async function GestaoLayout({ children }: { children: ReactNode }) {
  // Camada 2: o layout revalida a sessão; não confia no proxy.
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 md:flex">
      <aside className="border-b border-black/10 bg-white p-4 md:w-60 md:border-b-0 md:border-r">
        <p className="font-bold">{manifest.nome}</p>
        <p className="truncate text-xs opacity-60">{admin.email}</p>
        <nav className="mt-6 flex flex-wrap gap-2 md:flex-col">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className="rounded-lg px-3 py-1.5 text-sm hover:bg-neutral-100">
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex gap-3 text-sm">
          <Link href="/" target="_blank" className="underline">
            Ver site
          </Link>
          <form action={sair}>
            <button className="underline">Sair</button>
          </form>
        </div>
      </aside>
      <section className="flex-1 p-4 md:p-10">
        {!hasSupabaseAdmin() ? (
          <div role="status" className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
            Banco não configurado: as alterações não serão salvas.
          </div>
        ) : null}
        {children}
      </section>
    </div>
  );
}
