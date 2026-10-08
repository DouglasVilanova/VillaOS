import { BlockForm } from "@/components/gestao/BlockForm";
import { getSettings } from "@/lib/settings-read";

export default async function VisibilidadePage() {
  const s = await getSettings();
  return (
    <BlockForm
      secao="visibilidade"
      titulo="Visibilidade das seções"
      inicial={s.visibilidade}
      campos={[{ nome: "sobre", label: "Mostrar a seção Sobre", tipo: "booleano" }]}
    />
  );
}
