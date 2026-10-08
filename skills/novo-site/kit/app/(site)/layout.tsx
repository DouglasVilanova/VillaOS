import type { ReactNode } from "react";
import { SeoInjector } from "@/components/SeoInjector";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { manifest } from "@/lib/manifest";
import { getSettings } from "@/lib/settings-read";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  return (
    <>
      {s.seo.bodyStart ? <SeoInjector html={s.seo.bodyStart} alvo="body" /> : null}
      <Header nome={manifest.nome} whatsapp={s.contato.whatsapp} />
      <main>{children}</main>
      <Footer nome={manifest.nome} contato={s.contato} />
      {s.seo.head ? <SeoInjector html={s.seo.head} alvo="head" /> : null}
    </>
  );
}
