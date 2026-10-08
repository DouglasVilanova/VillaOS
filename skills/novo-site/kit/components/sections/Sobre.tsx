import type { SiteSettings } from "@/lib/types";

export function Sobre({ sobre }: { sobre: SiteSettings["sobre"] }) {
  return (
    <section id="sobre" className="bg-suave">
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{sobre.titulo}</h2>
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed opacity-85">{sobre.texto}</p>
      </div>
    </section>
  );
}
