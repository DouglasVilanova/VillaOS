import Link from "next/link";
import { waLink } from "@/lib/wa";

export function Header({ nome, whatsapp }: { nome: string; whatsapp: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-fundo/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-lg font-bold">
          {nome}
        </Link>
        {whatsapp ? (
          <a
            href={waLink(whatsapp, "Olá! Vim pelo site.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-destaque px-4 py-2 text-sm font-semibold text-destaque-texto"
          >
            WhatsApp
          </a>
        ) : null}
      </div>
    </header>
  );
}
