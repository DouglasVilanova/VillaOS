import type { ReactNode } from "react";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { manifest } from "@/lib/manifest";
import { getSettings } from "@/lib/settings-read";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <Header nome={manifest.nome} whatsapp={s.contato.whatsapp} />
      <main>{children}</main>
      <Footer nome={manifest.nome} contato={s.contato} />
    </>
  );
}
