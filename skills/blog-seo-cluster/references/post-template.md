# Modelo de post

## Frontmatter

```yaml
---
title: "Título atrativo, perto da palavra-chave"
slug: slug-curto-sem-stopwords
description: "Meta description 140-160 caracteres, com palavra-chave, benefício e local."
meta_title: "Título SEO até ~60 caracteres"
excerpt: "Resumo de 1-2 frases que aparece na listagem do blog."
category: slug-da-categoria
pillar: true            # pilar; nos satélites: slug do pilar
service: /rota-do-servico
publishedAt: AAAA-MM-DD
author: "<author do config>"
keywords:
  - palavra-chave principal
  - variação 1
  - variação 2
cover: /images/blog/<slug>/capa.webp
draft: true
---
```

Valores com aspas internas: escape com `\"`.

## Estrutura — satélite (800–1.500 palavras)

1. **Lead** (1–2 parágrafos): a cena/problema real do leitor + o dado da notícia.
2. **H2 "O que a pesquisa/notícia mostrou"**: números com fonte, amostra e data. Imagem de corpo aqui.
3. **H2 explicativo**: o que isso significa, por que importa.
4. **H2 prático**: passos, checklist, como fazer.
5. **H2 "Perguntas frequentes"**: 3–4 perguntas reais, respostas curtas.
6. **H2 "Como a <empresa> ajuda"**: conexão natural com o serviço, cases públicos, link do pilar.
7. **CTA**: formulário + WhatsApp do config.
8. *Fontes:* links no rodapé, em itálico.

## Estrutura — pilar (1.500–2.000 palavras)

Guia completo do serviço: por que importa agora (dados) → o que é → o que dá/não dá para fazer →
passo a passo → cuidados → FAQ → como a empresa faz (cases) → CTA → **"Leia também"** com todos
os satélites do pilar.

## Regras de escrita

- Frases curtas, parágrafos de 2–4 linhas, sem jargão de marketing.
- Números só com fonte rastreada; dado antigo/de fornecedor com ressalva no texto.
- Nunca inventar resultado de cliente — só o que já é público no site.
- Menção local (cidade/estado) onde for natural, não forçada.
- Links internos com o slug exato: `[texto](/blog/<slug>)`.
