import type { Manifest } from "./manifest";
import type { SiteSettings } from "./types";

/** Organization ou LocalBusiness (quando o manifesto tem `local`). Campos vazios são omitidos. */
export function organizacaoLd(m: Manifest, s: SiteSettings, url: string): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": m.local ? "LocalBusiness" : "Organization",
    "@id": `${url}/#organizacao`,
    name: m.nome,
    url: `${url}/`,
    description: s.seo.descricao || undefined,
    telephone: s.contato.telefone || undefined,
    email: s.contato.email || undefined,
  };
  if (m.local) {
    ld.address = {
      "@type": "PostalAddress",
      streetAddress: s.contato.endereco || undefined,
      addressLocality: m.local.cidade,
      addressRegion: m.local.uf,
      addressCountry: "BR",
    };
  }
  if (s.contato.instagram) ld.sameAs = [s.contato.instagram];
  return JSON.parse(JSON.stringify(ld)) as Record<string, unknown>;
}
