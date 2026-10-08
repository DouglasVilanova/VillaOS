import Image from "next/image";
import type { SiteSettings } from "@/lib/types";

export function Hero({ hero }: { hero: SiteSettings["hero"] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
            {hero.titulo} <span className="text-destaque">{hero.destaque}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-80">{hero.subtitulo}</p>
          {hero.ctaLabel ? (
            <a
              href={hero.ctaHref || "#contato"}
              className="mt-8 inline-flex w-fit rounded-full bg-destaque px-6 py-3 font-semibold text-destaque-texto"
            >
              {hero.ctaLabel}
            </a>
          ) : null}
        </div>
        {hero.imagem ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-suave">
            <Image src={hero.imagem} alt="" fill preload sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
