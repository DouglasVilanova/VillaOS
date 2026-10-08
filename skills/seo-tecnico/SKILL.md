---
name: seo-tecnico
description: >
  Parte de código do SEO num site VillaOS ou Next.js: metadata por página, canonical, sitemap e
  robots dinâmicos, Open Graph, JSON-LD (Organization, LocalBusiness, Article, Product, Breadcrumb),
  verificação do Google Search Console no HTML do servidor e redirects 301 do site antigo. Use
  quando o usuário disser "meta tags", "sitemap", "robots", "schema", "JSON-LD", "indexar",
  "Search Console", "redirect do site antigo", "og image" ou "/seo-tecnico". Para pesquisa de
  palavras-chave, concorrência e conteúdo, usar /seo.
---

# /seo-tecnico — SEO no código

Ler `site.json` (status, local, domínio). Página indexável só com `status: online`; antes disso
o kit emite `noindex` sozinho, e isso é esperado.

## Checklist por página

| Item | Onde | Regra |
|---|---|---|
| title | `metadata.title` ou `generateMetadata` | 50–60 caracteres, termo principal no início; template `%s | Nome` vem do layout |
| description | `metadata.description` | 150–160 caracteres, com chamada para ação |
| canonical | `alternates: { canonical: "/caminho" }` | relativo; `metadataBase` vem do layout |
| H1 | componente | exatamente um por página |
| OG | `openGraph` + `opengraph-image.tsx` na rota, se a página merece imagem própria | 1200×630 |
| JSON-LD | `<JsonLd data={...} />` | um bloco por entidade; sempre pelo componente (escapa `<`) |
| imagens | `alt` descritivo; decorativa com `alt=""` | — |
| links internos | `next/link` | texto do link descreve o destino |

Página nova:
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Conheça os serviços e fale com a equipe pelo WhatsApp. Atendimento rápido na sua cidade.",
  alternates: { canonical: "/servicos" },
};
```

## Sitemap e robots

- `app/sitemap.ts`: acrescentar cada rota pública nova (`url`, `changeFrequency`, `priority`). Rotas
  dinâmicas (posts, produtos) buscam do banco com `.catch(() => [])` e `export const revalidate = 3600`.
- `app/robots.ts`: já bloqueia `/gestao`, `/api`, `/preview` e tudo quando não está online. Não mexer sem motivo.

## JSON-LD por tipo

- Home: `organizacaoLd()` do kit (vira `LocalBusiness` com `local`).
- Artigo (fase 2): `@type: "Article"`, `headline`, `datePublished`, `dateModified`, `author`, `image`, `mainEntityOfPage`.
- Produto: `@type: "Product"`, `name`, `image`, `description`, `brand`, `sku` (sem `offers` se não houver preço público).
- Página interna: `BreadcrumbList` com `itemListElement` (`position`, `name`, `item`).

Validar em https://search.google.com/test/rich-results (pedir ao usuário para colar a URL; não
enviar dados do cliente para outros serviços).

## Google Search Console

Verificação vai no HTML do servidor: campo "Código de verificação" em `/gestao/seo` (vira
`metadata.verification.google`) ou, sem painel, `seo.googleVerification` em `lib/defaults.ts`.
Nunca colar a meta tag no campo de scripts: é injetada por JS e o Google não lê.
Depois de online: enviar `https://<dominio>/sitemap.xml` no Search Console.

## Redirects do site antigo

Levantar as URLs antigas (sitemap antigo, Search Console → Páginas, ou perguntar). Em `next.config.ts`:
```ts
async redirects() {
  return [
    { source: "/sobre-nos", destination: "/#sobre", permanent: true },
    { source: "/servicos/:path*", destination: "/#servicos", permanent: true },
  ];
},
```
Site estático legado: mesmo formato em `vercel.json` (`redirects`).

## Conferir

```powershell
curl.exe -s https://<url>/ | Select-String '<title>|name="description"|rel="canonical"|og:|application/ld\+json'
curl.exe -s https://<url>/robots.txt
curl.exe -s https://<url>/sitemap.xml
```
