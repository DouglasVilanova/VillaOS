import { BlockForm } from "@/components/gestao/BlockForm";
import { getSettings } from "@/lib/settings-read";

export default async function HeroPage() {
  const s = await getSettings();
  return (
    <BlockForm
      secao="hero"
      titulo="Hero"
      inicial={s.hero}
      campos={[
        { nome: "titulo", label: "Título", tipo: "texto" },
        { nome: "destaque", label: "Trecho em destaque", tipo: "texto", ajuda: "Aparece na cor de destaque, logo após o título." },
        { nome: "subtitulo", label: "Subtítulo", tipo: "textarea" },
        { nome: "ctaLabel", label: "Texto do botão", tipo: "texto", ajuda: "Vazio esconde o botão." },
        { nome: "ctaHref", label: "Link do botão", tipo: "texto", ajuda: "Ex.: #contato ou https://wa.me/55..." },
        { nome: "imagem", label: "Imagem", tipo: "imagem" },
      ]}
    />
  );
}
