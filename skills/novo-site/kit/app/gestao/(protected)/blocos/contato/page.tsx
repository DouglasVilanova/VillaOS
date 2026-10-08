import { BlockForm } from "@/components/gestao/BlockForm";
import { getSettings } from "@/lib/settings-read";

export default async function ContatoPage() {
  const s = await getSettings();
  return (
    <BlockForm
      secao="contato"
      titulo="Contato"
      inicial={s.contato}
      campos={[
        { nome: "whatsapp", label: "WhatsApp", tipo: "texto", ajuda: "Com DDI e DDD, ex.: 5554999990000." },
        { nome: "telefone", label: "Telefone (exibição)", tipo: "texto" },
        { nome: "email", label: "E-mail", tipo: "texto" },
        { nome: "endereco", label: "Endereço", tipo: "texto" },
        { nome: "instagram", label: "Instagram (URL completa)", tipo: "texto" },
      ]}
    />
  );
}
