import type { SiteSettings } from "@/lib/types";
import { waLink } from "@/lib/wa";

export function Footer({ nome, contato }: { nome: string; contato: SiteSettings["contato"] }) {
  return (
    <footer id="contato" className="border-t border-black/5">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 text-sm md:grid-cols-3">
        <p className="font-display text-base font-bold">{nome}</p>
        <ul className="space-y-1 opacity-80">
          {contato.whatsapp ? (
            <li>
              <a href={waLink(contato.whatsapp)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
          ) : null}
          {contato.telefone ? <li>{contato.telefone}</li> : null}
          {contato.email ? (
            <li>
              <a href={`mailto:${contato.email}`}>{contato.email}</a>
            </li>
          ) : null}
          {contato.endereco ? <li>{contato.endereco}</li> : null}
        </ul>
        <div className="opacity-80 md:text-right">
          {contato.instagram ? (
            <a href={contato.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : null}
          <p className="mt-2">© {new Date().getFullYear()} {nome}</p>
        </div>
      </div>
    </footer>
  );
}
