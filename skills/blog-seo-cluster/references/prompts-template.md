# Modelo do arquivo de prompts de imagem

O script `gerar-imagens.mjs` lê exatamente este formato: uma linha com o nome do arquivo em
negrito+código e, na linha seguinte, o prompt em citação (`> `). Uma imagem por bloco.

```markdown
# Prompts de imagens — Blog <empresa>

**Onde salvar:** `<contentDir>/imagens/` com o nome exato.

## <Título do post>

**`<slug>-capa.png`**
> <cena visual da capa>. <brandStyle do config>. Proporção 16:9, sem texto.

**`<slug>-1.png`**
> <infográfico/diagrama com os rótulos e números exatos do post>. <brandStyle>. Proporção 16:9.
```

## O que funciona

- **Capa**: uma cena com metáfora visual do tema + objetos/ícones do assunto. Sem texto.
- **Corpo**: infográfico com 2–6 elementos rotulados, gráfico de barras com os números do post,
  antes/depois, diagrama de fluxo, mockup de conversa.
- Escreva rótulos entre aspas e em português, curtos.

## O que dá errado (e como evitar)

- **Números inventados** em gráficos "conceituais" → escreva "SEM NENHUM NÚMERO OU PORCENTAGEM,
  apenas estes rótulos: ...".
- **Logos de marcas** (ChatGPT/OpenAI, WhatsApp, Google, WordPress) → "sem logotipos ou nomes de
  marcas; interface genérica".
- **Texto errado** ("247" em vez de "24/7") → evite texto em capa; em infográfico, confira e regenere.
