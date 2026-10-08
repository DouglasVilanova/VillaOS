---
name: blog-seo-cluster
description: >
  Pipeline completo de blog para SEO e tráfego orgânico: pesquisa notícias e dados reais na web,
  monta um cluster pilar + satélites ligado aos serviços da empresa, escreve os posts em Markdown,
  gera as imagens (capa + corpo) via Higgsfield, converte para WebP no repo do site e publica pela
  API do blog, verificando links e imagens no local e em produção.
  Use sempre que o usuário pedir "posts para o blog", "conteúdo para SEO", "gera X posts com imagens",
  "aumentar tráfego orgânico", "artigos sobre [tema] ligados aos nossos serviços", "popular o blog",
  "cluster de conteúdo", "página pilar", ou quiser transformar notícias/pesquisas em artigos — mesmo
  sem dizer "SEO" ou "cluster". Para um único post + carrossel de redes sociais, prefira /publicar-tema.
---

# /blog-seo-cluster — Cluster de posts com pesquisa, imagens e publicação

Transforma um tema amplo (ex.: "benefícios de IA para empresários") em um conjunto de posts
interligados que trabalham juntos no Google e nas IAs: **pilares** (um por serviço da empresa)
e **satélites** (notícias/dados atuais), todos linkando entre si e para as páginas de serviço.

Os scripts e modelos ficam em `~/.claude/skills/blog-seo-cluster/`. Os dados do projeto ficam no
**config do projeto** (`<contentDir>/blog.config.json`) — é isso que torna a skill reutilizável.

## Passo 0 — Contexto e config

1. **Procure o config**: `marketing/blog/blog.config.json` na pasta atual.
   Se não existir, copie `references/blog.config.example.json` para lá e preencha com o usuário
   (repo do site, URL, API, serviços, CTAs, estilo visual). Pergunte só o que não dá para descobrir
   olhando o repo do site (rotas de serviço, rota da API de posts, variável do segredo).
2. **Se a pasta tiver memória do negócio** (`_memoria/` e `CLAUDE.md`): leia `_memoria/empresa.md`,
   `_memoria/preferencias.md`, `_memoria/estrategia.md` e `identidade/design-guide.md`. Se existir
   `.claude/skills/publicar-tema/SKILL.md`, siga também as regras de escrita dela (frontmatter, estrutura, tom).
3. **Confira o que já existe no blog** (posts em `<contentDir>/posts/` e a listagem pública do blog)
   para não duplicar temas nem slugs.
4. **Confira a estrutura do blog no repo do site** — um cluster de 10+ posts precisa de navegação.
   Verifique e, se faltar, proponha ao usuário adicionar antes de publicar:
   - **Link "Blog" no menu principal** (não só escondido num submenu ou no rodapé).
   - **Busca** por título/resumo e **filtro por categoria** na listagem, com estado na URL
     (`?q=` e `?cat=`) para links compartilháveis. Com poucas dezenas de posts, filtrar no cliente
     é mais simples e evita montar filtro de banco com texto do usuário (risco de injeção em
     filtros string como `.or()` do PostgREST). Busca sem acento (`normalize("NFD")`).
   - **Autor** em cada post: byline com link para o perfil e `author` do JSON-LD como `Person`
     com `sameAs` (sinal de autoria/E-E-A-T). Use `author`/`authorUrl` do config.
   Referência de implementação: `references/blog-ui.md`.

## Passo 1 — Pesquisa (WebSearch)

Busque dados de 2025–2026, priorizando fontes primárias do país do público (no Brasil: Sebrae, IBGE,
FGV, imprensa econômica; globais: McKinsey, Microsoft Work Trend Index, Gartner, Google/Deloitte).
Rode as buscas em paralelo. Para cada número que pretende usar, guarde **fonte, data, amostra e o
que exatamente mede** — números de pesquisas diferentes não se somam nem se comparam direto.

Por que tanto cuidado: o blog vai sustentar a reputação da empresa e ser lido por IAs que citam
fontes. Um número inventado ou mal atribuído custa mais do que um post a menos.

- Prefira a página da fonte original (WebFetch) aos agregadores.
- Dado antigo (ex.: estudo de 2007/2020) ou de fornecedor: pode usar, mas diga isso no texto.
- Não use número que você não conseguiu rastrear até uma fonte.

## Passo 2 — Estrutura do cluster → aprovação

Monte uma tabela e **peça aprovação antes de escrever**:

- **Pilares** (1 por serviço do config): guia completo, palavra-chave comercial + local.
- **Satélites**: cada um ancorado em 1 notícia/dado verificado, ligado a 1 pilar.
- Para cada post: título, slug curto (kebab-case, sem stopwords), palavra-chave, pilar, dado-base.

Padrão que funcionou: 4 pilares + 10 satélites. Ajuste ao número de serviços e ao pedido.

## Passo 3 — Escrever os posts

Um arquivo por post em `<contentDir>/posts/` (`P1-<slug>.md` para pilares, `01-<slug>.md` para
satélites). Use o modelo de `references/post-template.md` (frontmatter + estrutura).

- **Tamanho**: satélites 800–1.500 palavras; pilares 1.500–2.000. Confira com uma contagem de
  palavras ao final — é fácil ficar curto, e posts rasos rendem menos no Google.
- **Links internos**: satélite → seu pilar + página do serviço + CTAs; pilar → todos os seus satélites
  ("Leia também"). Use os slugs definidos no Passo 2 (`/blog/<slug>`).
- **Imagens no Markdown**: capa no frontmatter (`cover: <imageUrlPrefix>/<slug>/capa.webp`) e 1
  imagem de corpo `![alt descritivo](<imageUrlPrefix>/<slug>/1.webp)` após o primeiro H2 relevante.
  Use um prefixo próprio (ex.: `/images/blog`), não `/blog/...`, para não colidir com as rotas do blog.
- **FAQ** no fim (3–4 perguntas reais) e seção "Como a <empresa> faz isso" com cases que **já estão
  públicos no site** — nunca invente resultado de cliente.
- **Fontes** com link no rodapé de cada post.
- Frontmatter começa com `draft: true`.

## Passo 4 — Prompts de imagem

Gere `<contentDir>/prompts-imagens.md` seguindo `references/prompts-template.md`: um bloco por
imagem com o **nome exato do arquivo** (`<slug>-capa.png`, `<slug>-1.png`) e o prompt com o
`brandStyle` do config embutido.

- Capas: **sem texto** (o site já mostra o título).
- Infográficos: só os números que estão no post, escritos por extenso no prompt. Gráfico
  conceitual (sem dado) → peça explicitamente "sem nenhum número ou porcentagem".
- Diga "sem logotipos ou nomes de marcas" — os modelos adoram desenhar logo do ChatGPT/WhatsApp.

Se o usuário preferir gerar as imagens ele mesmo, entregue esse arquivo e pare aqui até as imagens
chegarem em `<contentDir>/imagens/`.

## Passo 5 — Gerar imagens (Higgsfield)

Pré-requisitos (cheque com `higgsfield account status`):
- CLI instalada (`npm i -g @higgsfield/cli`), login feito (`higgsfield auth login`, aprovação no
  navegador) e **workspace selecionado** (`higgsfield workspace list` → `higgsfield workspace set <id>`).
- Veja o custo antes: `higgsfield generate cost gpt_image_2_5 --prompt x --aspect_ratio 16:9 --resolution 2k`.

Rode em segundo plano (leva ~1–2 min por imagem):

```bash
node ~/.claude/skills/blog-seo-cluster/scripts/gerar-imagens.mjs --config <contentDir>/blog.config.json
```

O script pula imagens que já existem em qualquer formato (.png/.jpg/.webp) — assim imagens feitas
pelo usuário convivem com as geradas. Para refazer: `FORCE=1 ... <trecho-do-nome>`.

**Revise todas antes de publicar.** Monte uma prancha de miniaturas (sharp, grade 4 colunas) e olhe:
números inventados, números errados, logos de marcas, texto truncado. Corrija o prompt e regenere.

## Passo 6 — Publicar

```bash
# 1. Imagens → WebP no repo do site (1600px, q80)
node ~/.claude/skills/blog-seo-cluster/scripts/publicar.mjs imagens --config <cfg>

# 2. Posts → API do blog (rascunho por padrão; PUBLISH=1 publica)
API_URL=<localUrl ou siteUrl> node ~/.claude/skills/blog-seo-cluster/scripts/publicar.mjs posts --config <cfg>
```

- **Rascunho por padrão.** Publicar direto só quando o usuário pedir explicitamente.
- A API precisa aceitar `slug` (links internos estáveis). Se ela gera slug a partir do título,
  adicione um `slug` opcional na rota antes — senão os links entre posts quebram.
- Se a API do site em produção ainda não tem as mudanças, publique pelo **servidor local**
  (`API_URL=<localUrl>`): normalmente ele usa o mesmo banco de produção.
- O segredo da API é lido do `.env` do site pelo script e nunca deve ser impresso.

## Passo 7 — Verificar e subir

1. Abra o blog local no navegador do app e confira listagem, capa, imagem de corpo e FAQ.
   Valide por script todos os links internos e imagens dos posts (status 200).
2. Commit no repo do site **só** de `public/<imagePublicDir>/` e da rota da API (se mudou) — não
   arraste mudanças não relacionadas do working tree. Respeite regras de autor de commit do projeto
   (ex.: memória sobre conta exigida pela Vercel). Push e acompanhe até as imagens responderem 200
   em produção.
3. Atualize os `.md` para `draft: false` se publicou, e versione posts/prompts no projeto
   (imagens brutas ficam fora do git — a versão final em WebP está no repo do site).

## Entrega

```
✓ Pesquisa: N fontes verificadas
✓ Posts: <contentDir>/posts/ (X pilares + Y satélites, Z palavras em média)
✓ Imagens: N geradas (M refeitas) · custo C créditos
✓ Publicação: rascunho/publicado · commit <hash> · verificado em produção
Pendências: ...
```

Se a pasta tiver `_memoria/`, ao terminar pergunte se quer atualizar a memória (`_memoria/estrategia.md`
com o cluster publicado). Se a skill `/publicar-tema` existir, ofereça-a para gerar carrossel + legendas dos posts.
