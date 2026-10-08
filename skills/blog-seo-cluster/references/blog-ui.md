# Estrutura mínima do blog (Next.js App Router)

Padrão já usado em produção num site Next.js + Supabase. Adapte ao design do site alvo.

## Listagem com busca + filtro (`app/blog/page.tsx` + `app/blog/BlogList.tsx`)

- **page.tsx (server)**: busca todos os posts publicados (com a categoria) e renderiza
  `<Suspense><BlogList posts={posts} /></Suspense>` — o Suspense é exigido porque o filho usa
  `useSearchParams`.
- **BlogList.tsx (`"use client"`)**:
  - `q` em estado local (input responsivo) + `router.replace` com debounce ~250ms para `?q=`.
  - `cat` lido de `useSearchParams`; chips são `<Link scroll={false}>` que alternam `?cat=`.
  - Chips só das categorias que têm posts; "Todas" limpa o filtro.
  - Filtro: `norm(title + excerpt).includes(norm(q))` com
    `norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()`.
  - Post em destaque só quando não há filtro; contador "N artigos encontrados"; estado vazio
    com "Limpar filtros".
- Quando o blog passar de ~100 posts, migre a busca para o servidor com consulta parametrizada
  (ex.: `.ilike("title", `%${q}%`)` por coluna) — nunca interpolar texto do usuário em filtro string.

## Autor

- Constante no site (ex.: `BLOG_AUTHOR = { name, url, handle }` em `lib/site.ts`) quando todos os
  posts têm o mesmo autor; coluna `author` no banco só se houver vários.
- Byline abaixo do resumo: `Por <a href={url} rel="author noopener noreferrer" target="_blank">`.
- JSON-LD `BlogPosting.author`: `{ "@type": "Person", name, url, sameAs: [url], worksFor: { "@id": "<site>/#organization" } }`.

## Menu

- Item de primeiro nível `{ label: "Blog", link: "/blog" }` no array de navegação, entre os itens
  institucionais (ex.: depois de "Cases"). Pode continuar também em submenus.

## Verificação

- `/blog?cat=<slug>&q=<termo>` carregado direto mostra só os posts certos.
- Digitar na busca filtra na hora e atualiza a URL.
- Post mostra o byline e o JSON-LD tem `author.@type = Person`.
