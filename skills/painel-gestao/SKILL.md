---
name: painel-gestao
description: >
  Adiciona ou altera blocos editáveis no painel /gestao de um site VillaOS: novo campo, nova seção
  do site editável, toggle de visibilidade, campo de imagem. Mantém o padrão do kit (conteúdo em
  settings JSONB, defaults, merge seguro, escrita pelo servidor). Use quando o usuário disser
  "deixar editável", "novo bloco no painel", "cliente quer editar", "campo no painel",
  "esconder seção", "painel administrativo" ou "/painel-gestao".
---

# /painel-gestao — blocos editáveis

Ler `site.json` (precisa ter `painel`), `KIT.md` e `design-system.md` do cliente.

## Princípios (não quebrar)

1. Nenhum texto de conteúdo fixo no componente: a seção recebe props tipadas de `getSettings()`.
2. Campo novo nunca precisa de migration: entra em `lib/types.ts` + `lib/defaults.ts`; `mergeSettings` completa dados antigos.
3. Escrita só por `salvarSecao` → `saveSection` (chama `requireAdmin()`).
4. Texto com destaque visual é fatiado em subcampos (ex.: `titulo` + `destaque`), não HTML.

## Novo campo numa seção existente

1. `lib/types.ts`: acrescentar o campo no tipo da seção.
2. `lib/defaults.ts`: valor padrão (do briefing ou placeholder).
3. Componente em `components/sections/`: usar o campo.
4. Página do bloco em `app/gestao/(protected)/blocos/<secao>/page.tsx`: acrescentar em `campos`.
5. `npm run typecheck` (o tipo `SiteSettings` pega campo faltando ou errado), `npm test` e `npm run build`.

## Nova seção editável

Exemplo: seção `servicos` com título e texto.

1. `lib/types.ts`:
   ```ts
   servicos: { titulo: string; texto: string };
   ```
2. `lib/defaults.ts`:
   ```ts
   servicos: { titulo: "Serviços", texto: "Descrição dos serviços." },
   ```
3. `components/sections/Servicos.tsx` recebendo `servicos: SiteSettings["servicos"]`. Desenhar com
   `frontend-design:frontend-design` obedecendo `design-system.md`.
4. `app/(site)/page.tsx`: renderizar `<Servicos servicos={s.servicos} />` (com toggle, se pedido).
5. `app/gestao/(protected)/blocos/servicos/page.tsx`:
   ```tsx
   import { BlockForm } from "@/components/gestao/BlockForm";
   import { getSettings } from "@/lib/settings-read";

   export default async function ServicosPage() {
     const s = await getSettings();
     return (
       <BlockForm
         secao="servicos"
         titulo="Serviços"
         inicial={s.servicos}
         campos={[
           { nome: "titulo", label: "Título", tipo: "texto" },
           { nome: "texto", label: "Texto", tipo: "textarea" },
         ]}
       />
     );
   }
   ```
6. Menu: acrescentar `{ href: "/gestao/blocos/servicos", label: "Serviços" }` em `NAV` no `app/gestao/(protected)/layout.tsx`.
7. Toggle (opcional): `visibilidade.servicos: boolean` em types/defaults, campo booleano em `/gestao/visibilidade`, condição na página.
8. `npm test`, `npm run build`, testar no navegador: editar, salvar, ver no site.

## Tipos de campo do `BlockForm`

`texto` · `textarea` · `codigo` (monoespaçado, sem corretor) · `imagem` (upload Sharp → WebP) · `booleano`.
Listas (galeria, cards repetidos) não existem no kit da fase 1: criar um componente de edição
de lista só quando um bloco precisar, seguindo o padrão do `BlockForm` (estado local + `salvarSecao`).

## Armadilhas

- Salvar e não ver mudança: `revalidatePath("/", "layout")` roda em `saveSection`; se a página nova
  estiver fora do layout raiz, revalidar o caminho dela também.
- Campo some depois de salvar: não está em `lib/defaults.ts` (o merge descarta chave desconhecida).
- Falha silenciosa de banco aparece só no log da função na Vercel (`[settings] escrita:`).
