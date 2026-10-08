---
name: instagram-lancamento
description: >
  Cria ou reestrutura o Instagram de uma empresa do zero até o conteúdo pronto pra postar: plano
  de lançamento (objetivo, pilares, calendário, metas), bio completa (@, nome pesquisável, bio de
  150 caracteres, links com UTM, respostas automáticas), destaques (roteiro dos stories + capas
  1080x1920 geradas em HTML) e os primeiros posts (carrosséis 1080x1350 e capas de Reel renderizados
  em PNG na identidade da marca, com legenda e hashtags), galeria de revisão e publicação no
  Instagram + Facebook via Meta Graph API (sempre com confirmação). Use sempre que o usuário disser "vou criar
  o Instagram", "montar o perfil", "bio do Instagram", "destaques", "primeiros posts", "plano de
  Instagram", "lançar a conta", "grid inicial" ou pedir carrosséis em lote para um perfil novo —
  mesmo sem dizer "lançamento". Para um carrossel avulso, prefira /carrossel.
---

# /instagram-lancamento — Perfil novo, do plano ao post pronto

Entrega tudo que um perfil comercial precisa para nascer bem: estratégia curta e acionável, perfil
preenchido, destaques com capa e os 9–12 primeiros posts já renderizados — coerentes entre si e com
a marca. Os scripts e o esqueleto visual ficam nesta pasta; os dados da empresa ficam no **config do
projeto** (`<pasta>/instagram.config.json`).

## Passo 0 — Contexto e config

1. Procure `marketing/instagram/instagram.config.json`. Se não existir, copie
   `references/instagram.config.example.json` e preencha com o usuário: nome, @ desejado, cidade,
   site, WhatsApp, serviços (nome + URL), cases públicos, cores, fonte, caminho do logo.
   Descubra o que puder sozinho (site do cliente, `layout.tsx` para a fonte, `public/logo.*`).
2. **Se for um MazyOS** (`_memoria/`, `CLAUDE.md`): leia `_memoria/empresa.md`,
   `preferencias.md`, `estrategia.md` e `identidade/design-guide.md`; siga o tom e as regras de
   `.claude/skills/carrossel/SKILL.md` (layouts nomeados, alternância de capas, legenda automática).
3. Reaproveite o que já existe: posts de blog (viram carrosséis), cases do site, imagens já geradas.

## Passo 1 — Plano (`marketing/instagram/PLANO.md`)

Modelo em `references/modelos.md`. Curto e acionável:
objetivo principal (quase sempre: conversas no WhatsApp / leads) · público · posicionamento em uma
frase · 3–5 pilares com % · roteiro de lançamento (semana 0) · calendário das 4 primeiras semanas ·
rotina semanal realista (≈2h) · metas de 90 dias · regras (só números com fonte, cases só públicos)
· tabela de acompanhamento.

## Passo 2 — Bio (`marketing/instagram/bio/BIO.md`)

Modelo em `references/modelos.md`: 3–4 opções de @ · **nome pesquisável** (≤64, com as palavras
que o cliente busca) · categoria · **3 versões de bio ≤150 caracteres** (conte!) · link principal
com UTM (`utm_source=instagram&utm_medium=bio`) + até 4 links extras · botões de contato · foto de
perfil · mensagem de boas-vindas e respostas rápidas do Direct.

## Passo 3 — Destaques (`marketing/instagram/destaques/`)

Modelo em `references/modelos.md`. 5–6 destaques (nome ≤15 caracteres), na ordem de
conversão: Serviços → Cases → Demonstração → Como funciona → Dicas → Contato. Para cada um, o
roteiro de cada story.

**Capas**: gere em HTML (nítido, cor exata, sem custo) — copie `assets/destaques-capas.html` para
`destaques/capas/slides.html`, troque os ícones se precisar (SVGs de linha em
`references/icones.md`) e renderize (Passo 5). Saída 1080×1920 com o ícone centralizado para o
recorte circular.

## Passo 4 — Posts (`marketing/instagram/posts/`)

1. `CALENDARIO.md` com os 9–12 primeiros posts: formato, pilar, data, quais fixar (os 3 primeiros,
   publicados no mesmo dia, ordem inversa — o post 01 por último para ficar à esquerda).
2. Um `.md` por post (`references/modelos.md`): slides com texto final, legenda, hashtags,
   notas de visual. Reels: roteiro segundo a segundo + legenda.
3. **Mostre os textos e peça aprovação antes de renderizar** — refazer texto é barato, refazer
   arte não.

Mix que funcionou: 01 quem somos · 02 serviços · 03 case → educativos com dado (do blog) alternando
com cases e 2 Reels (bastidores + demonstração).

**Cases (regra):** todo case leva o **logo do cliente** (`.logo-card`), o **print real do site no
celular** (`.shot`) e um slide **"veja ao vivo"** com o endereço do site do cliente (`.live`), além de
"🔗 Veja ao vivo: <site>" na legenda (no Facebook vira link clicável). Prova real convence mais que
descrição. Fonte típica: portfólio do site da agência (logos, prints mobile, URLs). Logo de cliente
pode vir como foto/símbolo — confira cada um numa prancha antes de usar.

## Passo 5 — Renderizar

Uma pasta por post em `marketing/conteudo/post-NN-<slug>-<data>/` com `slides.html` (só os
`<div class="slide ...">`; classes em `references/layouts.md`). Depois:

```bash
NODE_PATH="<repo-com-playwright-e-sharp>/node_modules" \
  node ~/.claude/skills/instagram-lancamento/scripts/build.js \
  --config marketing/instagram/instagram.config.json <pasta> [<pasta> ...]
```

O script injeta cores/fonte do config no esqueleto `assets/head.html`, gera `carrossel.html`, copia
o logo recortado (sem margens) e salva `instagram/slide-NN.png` — 1080×1350, ou 1080×1920 para
slides com classe `story` (capas de Reel e de destaques). Requer `playwright` (com Chromium
instalado) e `sharp`.

**Regras de arte** (por quê: grid coeso e legível no celular):
- Capas alternam escuro → destaque → claro ao longo do feed; nunca duas iguais seguidas.
- Dentro do carrossel, nunca dois slides seguidos com o mesmo fundo; 2+ layouts diferentes.
- Logo topo-esquerda + contador topo-direita + rodapé com @ em todos os slides.
- Logo claro some em fundo claro: o esqueleto aplica `filter: brightness(0)` nos fundos claros/destaque.
- Dados sempre com a fonte em `.src` no próprio slide.

## Passo 6 — Revisar e entregar

1. Monte uma prancha de miniaturas (sharp, uma linha por post) e **olhe tudo**: acentos
   (mojibake = arquivo lido com encoding errado; no Windows/PowerShell use UTF-8 explícito),
   texto estourando, logo invisível, slide repetido.
2. Gere `legenda.md` (do `## Legenda` do post) e copie o `.md` como `texto.md` em cada pasta.
3. **Confira o @ real** antes de renderizar a versão final (a API devolve o `username` — o @
   desejado muitas vezes não está disponível; ex.: `@empresa` virou `@empresa_x`).
4. **Galeria para revisão:** crie `<conteudo>/status.json` (`{"NN": {"ordem": n, "previsto": "DD/MM/AAAA"}}`,
   `"reel": true` para Reels sem vídeo) e rode
   `node ~/.claude/skills/instagram-lancamento/scripts/galeria.js --config <cfg> <conteudo>` →
   `galeria.html` com grid simulado do perfil + slides + legenda + status. Sirva com
   `npx serve <conteudo>` (o navegador do app não abre `file://`).
5. Commit no projeto. Entregue a galeria e a lista do que o usuário faz sozinho: gravar Reels,
   autorização de clientes citados.

## Passo 7 — Publicar (Meta Graph API) — opcional

**Pré-requisitos (o usuário faz, uma vez):** Instagram profissional ligado à Página do Facebook;
app tipo Empresa em developers.facebook.com com URL de política de privacidade e **URL de
exclusão de dados válida** (a Meta valida — crie uma página `noindex` fora do menu se não existir);
**usuário do sistema** no Gerenciador de Negócios com token sem expiração e permissões
`instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement,
pages_manage_posts, business_management` (só essas). Token em `<repo-do-site>/.env` como
`META_PAGE_ACCESS_TOKEN` — **nunca colar no chat**, nunca com prefixo `NEXT_PUBLIC_`, não subir na
Vercel se a postagem roda localmente.

**Configuração (você faz):** descubra `META_PAGE_ID` e `META_IG_USER_ID` com
`GET me/accounts?fields=id,name,instagram_business_account{id,username}` (sem imprimir o token) e
grave no `.env` junto com `META_PUBLIC_SITE_URL`. Copie `scripts/meta-post.mjs` para
`<repo-do-site>/scripts/`.

**Fluxo por post** (a Meta baixa as imagens por URL pública; o Instagram só aceita JPEG):
1. `node scripts/meta-post.mjs prepare <pasta-do-post> <NN-slug>` → JPEG em `public/instagram/<slug>/`
2. commit + push só de `public/instagram/` e esperar `check <NN-slug>` responder tudo 200
3. `publish <pasta> <slug>` (prévia) → mostrar slides + legenda → **pedir confirmação explícita**
4. só depois do "sim": `publish ... --confirmado` (posta IG carrossel + FB multi-foto, devolve os links)
5. atualizar `status.json` (publicado + links) e regenerar a galeria

O script junta linhas quebradas da legenda (o `.md` tem quebras por largura que virariam quebras
no post) e mantém parágrafos, listas com emoji e hashtags. Limites: legenda ≤ 2.200 caracteres,
2–10 imagens por carrossel. Reels exigem vídeo gravado.

**Destaques:** a API publica stories, mas **não cria destaques**. Gere os stories de cada destaque
(1080×1920, margem segura ~250px no topo e ~320px embaixo), prepare com `prepare <pasta> destaque-<n> --stories`
e publique com `stories destaque-<n> --confirmado`. Depois o usuário, no app: Perfil → + → Destaque →
escolhe os stories (ficam no Arquivo mesmo após 24h) → define a capa (`destaques/capas/`).
Figurinha de link não existe pela API — o endereço vai escrito no story.

**Ritmo e lembrete:** combine com o usuário quantos posts por dia (ex.: 3) e crie uma tarefa
agendada diária que lê `status.json`, mostra a prévia dos posts do dia e **só publica após
confirmação na conversa**. Publicar é irreversível e público — nunca agende publicação sem
confirmação humana no momento.

## O que nunca fazer

- Inventar número de resultado de cliente ou depoimento. Case = só o que já é público.
- Usar conversa real de cliente em print ou Reel — sempre número/dados de teste.
- Logos de terceiros sem autorização.
