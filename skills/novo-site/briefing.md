# Briefing de site

Perguntas de negócio, uma por vez. A coluna "Grava" diz o que vai para o `site.json` ou para
o conteúdo. Só aparecem perguntas de módulos já implementados no VillaOS (fase 1: painel,
editores, local, tracking).

## Sempre (todos os modos)

| # | Pergunta | Grava |
|---|---|---|
| 1 | Qual o nome do cliente como deve aparecer no site? | `nome`; `cliente` = slug do nome |
| 2 | Em uma frase: o que o cliente faz e para quem? | `hero.subtitulo`, `seo.descricao` (≤160) |
| 3 | Qual a promessa principal (título do topo)? | `hero.titulo` + `hero.destaque` (dividir no trecho a destacar) |
| 4 | Três diferenciais ou fatos (anos de mercado, clientes, região)? | `sobre.texto` |
| 5 | WhatsApp, telefone, e-mail, endereço e Instagram? | `contato.*` |
| 6 | Atende uma cidade/região específica? Qual? | `local` = `{ cidade, uf }` ou `null` |
| 7 | Tem domínio próprio? Qual? | `dominio` |

## Só no modo completo e no ativar

| # | Pergunta | Grava |
|---|---|---|
| 8 | Alguém do cliente vai editar textos e fotos do site? | sim → `modulos` inclui `painel` |
| 9 | Quantas pessoas vão editar? | 1 → `auth: "env-hmac"` · 2 ou mais → `auth: "supabase-admin"` |
| 10 | Vai rodar anúncio, ou já tem Google Tag Manager, GA4 ou Pixel da Meta? | `tracking`: `gtm`, `ga4`, `meta-pixel`, `google-ads` |

Sem `painel`: `auth: "nenhum"`.

## Campos que não vêm de pergunta

| Campo | Valor |
|---|---|
| `status` | `proposta` (modo proposta) ou `desenvolvimento` |
| `preview` | `<slug>.villadigital.com.br` |
| `repo` | `villadigitalmail-create/<slug>` |
| `animacao` | `medio` até a fase 3 (`/design-cliente` decide) |

## Regras

- Uma pergunta por mensagem. Se o usuário já deu a informação, não perguntar de novo.
- "Não sei" em 6, 7 ou 10 → deixar vazio e registrar no `CLAUDE.md` do cliente como pendência.
- No modo ativar, mostrar o que já está no `site.json` e perguntar só o que falta.
