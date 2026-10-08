# {{NOME}} — site

Projeto criado com o VillaOS (`/novo-site`) em {{DATA}}.

## Antes de qualquer tarefa

1. Ler `site.json` (manifesto: status, módulos, auth, tracking, domínio).
2. Ler `design-system.md` (cores, fontes, nível de animação). Ao criar ou alterar páginas,
   usar a skill `frontend-design:frontend-design` obedecendo esse arquivo: tokens, fontes e
   nível de animação são fixos; a liberdade criativa vale para composição e detalhes.
3. Ler `KIT.md` (o que trocar, o que não mexer).

## Ao adicionar ou remover módulo

Atualizar `site.json` e aplicar as regras de implicação da skill `novo-site` (`regras.md`).
Para demandas que tocam várias áreas, usar `/orquestrar`.

## Dados do projeto

- Repositório: {{REPO}}
- Preview: https://{{PREVIEW}}
- Domínio final: {{DOMINIO}}
- Supabase: {{SUPABASE_REF}}
- Autor dos commits: Villa Digital (`git config user.email` = `338858392+villadigitalmail-create@users.noreply.github.com`). Deploy na Vercel Hobby bloqueia outro autor.

## Riscos aceitos

- Scripts livres do painel de SEO são XSS por design, restritos a admin.
- `'unsafe-inline'` em `script-src` (hidratação do App Router e scripts do painel).

## Pendências do briefing

{{PENDENCIAS}}
