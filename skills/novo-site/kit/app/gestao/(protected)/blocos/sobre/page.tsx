import { BlockForm } from "@/components/gestao/BlockForm";
import { getSettings } from "@/lib/settings-read";

export default async function SobrePage() {
  const s = await getSettings();
  return (
    <BlockForm
      secao="sobre"
      titulo="Sobre"
      inicial={s.sobre}
      campos={[
        { nome: "titulo", label: "Título", tipo: "texto" },
        { nome: "texto", label: "Texto", tipo: "textarea", ajuda: "Quebras de linha são mantidas." },
      ]}
    />
  );
}
