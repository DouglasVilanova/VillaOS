import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { Hero } from "@/components/sections/Hero";
import { Sobre } from "@/components/sections/Sobre";
import { organizacaoLd } from "@/lib/jsonld";
import { manifest, siteUrl } from "@/lib/manifest";
import { getSettings } from "@/lib/settings-read";

// Estático com revalidação: o painel chama revalidatePath ao salvar; 1h é a rede de segurança.
export const revalidate = 3600;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const s = await getSettings();
  return (
    <>
      <JsonLd data={organizacaoLd(manifest, s, siteUrl(manifest))} />
      <Hero hero={s.hero} />
      {s.visibilidade.sobre ? <Sobre sobre={s.sobre} /> : null}
    </>
  );
}
