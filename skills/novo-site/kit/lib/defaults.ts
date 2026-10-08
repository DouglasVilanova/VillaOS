import type { SiteSettings } from "./types";

// Conteúdo usado quando o banco não responde ou não existe (modo proposta).
// /novo-site preenche com os textos do briefing.
export const SITE_DEFAULTS: SiteSettings = {
  hero: {
    titulo: "Título principal do cliente",
    destaque: "com destaque",
    subtitulo: "Uma frase que explica o que o cliente faz e para quem.",
    ctaLabel: "Falar no WhatsApp",
    ctaHref: "#contato",
    imagem: "",
  },
  sobre: {
    titulo: "Sobre",
    texto: "Texto curto sobre a história e os diferenciais do cliente.",
  },
  contato: { whatsapp: "", email: "", telefone: "", endereco: "", instagram: "" },
  seo: {
    titulo: "Nome do Cliente",
    descricao: "Descrição do site com até 160 caracteres.",
    googleVerification: "",
    head: "",
    bodyStart: "",
  },
  visibilidade: { sobre: true },
};
