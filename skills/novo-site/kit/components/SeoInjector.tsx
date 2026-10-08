"use client";

// Injeta o HTML livre do painel de SEO (GTM, Pixel...) no <head> ou no início do <body>.
// Scripts são recriados para o navegador executar. Verificação do Search Console NÃO passa
// por aqui (crawler não executa JS): vai em metadata.verification no layout.
import { useEffect } from "react";

export function SeoInjector({ html, alvo }: { html: string; alvo: "head" | "body" }) {
  useEffect(() => {
    const pai = alvo === "head" ? document.head : document.body;
    const referencia = alvo === "body" ? pai.firstChild : null;
    const tpl = document.createElement("template");
    tpl.innerHTML = html;
    const inseridos: Node[] = [];
    tpl.content.childNodes.forEach((no) => {
      let el: Node = no.cloneNode(true);
      if (no instanceof HTMLScriptElement) {
        const s = document.createElement("script");
        for (const a of Array.from(no.attributes)) s.setAttribute(a.name, a.value);
        s.text = no.text;
        // Scripts recriados são assíncronos por padrão; mantém a ordem de execução.
        if (s.src && !no.hasAttribute("async")) s.async = false;
        el = s;
      }
      pai.insertBefore(el, referencia);
      inseridos.push(el);
    });
    return () => inseridos.forEach((n) => n.parentNode?.removeChild(n));
  }, [html, alvo]);
  return null;
}
