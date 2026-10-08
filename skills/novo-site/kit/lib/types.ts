// Contrato do conteúdo editável. Cada chave de topo é uma seção editada no painel.
// Novo bloco: adicionar aqui, em lib/defaults.ts e criar a página em app/gestao (skill painel-gestao).
export type SiteSettings = {
  hero: {
    titulo: string;
    destaque: string;
    subtitulo: string;
    ctaLabel: string;
    ctaHref: string;
    imagem: string;
  };
  sobre: { titulo: string; texto: string };
  contato: { whatsapp: string; email: string; telefone: string; endereco: string; instagram: string };
  seo: { titulo: string; descricao: string; googleVerification: string; head: string; bodyStart: string };
  visibilidade: { sobre: boolean };
};

export type Secao = keyof SiteSettings;
