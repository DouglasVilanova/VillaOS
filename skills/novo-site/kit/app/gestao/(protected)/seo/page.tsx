import { BlockForm } from "@/components/gestao/BlockForm";
import { getSettings } from "@/lib/settings-read";

export default async function SeoPage() {
  const s = await getSettings();
  return (
    <BlockForm
      secao="seo"
      titulo="SEO e scripts"
      inicial={s.seo}
      campos={[
        { nome: "titulo", label: "Título do site", tipo: "texto", ajuda: "50 a 60 caracteres, palavra-chave no início." },
        { nome: "descricao", label: "Descrição", tipo: "textarea", ajuda: "150 a 160 caracteres, com chamada para ação." },
        {
          nome: "googleVerification",
          label: "Código de verificação do Google Search Console",
          tipo: "texto",
          ajuda: "Só o valor do content da meta tag. Vai no HTML do servidor.",
        },
        { nome: "head", label: "Scripts no <head>", tipo: "codigo", ajuda: "GTM, Pixel, GA4. Domínios novos podem exigir ajuste de CSP." },
        { nome: "bodyStart", label: "Scripts no início do <body>", tipo: "codigo", ajuda: "Ex.: noscript do GTM." },
      ]}
    />
  );
}
