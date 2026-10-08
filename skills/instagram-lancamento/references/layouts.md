# Classes do esqueleto (`assets/head.html`)

Cada slide é um `<div class="slide <fundo>">` dentro de `slides.html`. Fundos: `dark`, `light`,
`green` (= cor de destaque da marca). Adicione `story` para 1080×1920.

## Estrutura padrão de um slide

```html
<div class="slide dark">
  <div class="glow"></div>                       <!-- opcional: brilho no canto (glow bl = baixo/esq.) -->
  <div class="top"><img class="logo" src="logo.png"><span class="count">02 / 07</span></div>
  <div class="body"> … conteúdo … </div>
  <div class="foot"><span>{{HANDLE}}</span><span>arraste →</span></div>
</div>
```

`{{HANDLE}}` é trocado pelo @ do config.

## Blocos de conteúdo

| Classe | Uso |
|---|---|
| `.eyebrow` | rótulo pequeno em caixa alta acima do título |
| `h1` / `h2` | título de capa (100px) / título interno (68px) |
| `.hl` | trecho destacado na cor da marca dentro do título |
| `.rule` | régua fina de destaque |
| `p` | texto de apoio · `.src` fonte do dado (sempre que houver número) |
| `.big` | número gigante (ex.: `52%`) · `.num` numeral de lista (ex.: `01`) |
| `.quote` | aspas gigantes em marca d'água (layout CITAÇÃO) |
| `.bars > .bar > b, i[style=height:%], span` | gráfico de barras; `i.g` = barra cinza de comparação |
| `.cards > .card > b, span` | grade 2×2 de números com legenda |
| `.list > li > span` | lista numerada com divisórias |
| `.steps > .step > b` | passo a passo com círculos numerados |
| `.check > i` | checklist com ✓ |
| `.vs > .a / .b > h3, p` | comparação lado a lado (antes/depois, chat/agente) |
| `.imgbox > img` | imagem com cantos arredondados e sombra (ex.: infográfico do blog) |
| `.center` (no `.body`) | centraliza tudo — usar no slide de CTA |
| `.cta-btn` | botão-pílula do CTA |

## Ritmo

Capa → 2–3 layouts internos diferentes → CTA. Nunca dois fundos iguais seguidos. A capa de cada
post alterna com a do post anterior no feed (escuro → destaque → claro).

Elementos específicos de um post (mockup de celular, balões de chat) entram num `<style>` no topo
do próprio `slides.html`.
