import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SeoInjector } from "@/components/SeoInjector";
import { indexavel, manifest, siteUrl } from "@/lib/manifest";
import { getSettings } from "@/lib/settings-read";
import "./globals.css";

// Fontes self-hosted pelo next/font (CSP font-src 'self'). /novo-site troca pelas do design-system.
const sans = Inter({ subsets: ["latin"], variable: "--font-sans-next", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl(manifest)),
    title: { default: s.seo.titulo, template: `%s | ${manifest.nome}` },
    description: s.seo.descricao,
    alternates: { canonical: "/" },
    robots: indexavel(manifest) ? undefined : { index: false, follow: false },
    verification: s.seo.googleVerification ? { google: s.seo.googleVerification } : undefined,
    openGraph: { type: "website", locale: "pt_BR", siteName: manifest.nome, title: s.seo.titulo, description: s.seo.descricao },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="pt-BR" className={sans.variable}>
      <body className="antialiased">
        {s.seo.bodyStart ? <SeoInjector html={s.seo.bodyStart} alvo="body" /> : null}
        {children}
        {s.seo.head ? <SeoInjector html={s.seo.head} alvo="head" /> : null}
      </body>
    </html>
  );
}
