# Kit VillaOS — contrato

Starter kit copiado por `/novo-site` para `clientes/<slug>/`. Este arquivo vai junto para o
projeto do cliente e diz o que trocar, o que não mexer e como alternar modos.

## O que trocar por cliente

| Arquivo | O quê |
|---|---|
| `site.json` | manifesto (gerado pelo briefing). Status, módulos, auth, tracking, domínio |
| `lib/defaults.ts` | textos do briefing (conteúdo quando o banco está vazio ou ausente) |
| `lib/types.ts` | novos campos/seções (skill `painel-gestao`) |
| `app/globals.css` (`@theme`) | tokens do `design-system.md` |
| `app/layout.tsx` | fontes (`next/font`) do `design-system.md` |
| `components/sections/*` | layout das seções do cliente |

## O que não mexer sem a skill correspondente

- `lib/csp.ts`, `next.config.ts` (headers) → `/seguranca`
- `lib/auth/*`, `lib/proxy/admin.ts` → `/auth-admin`; `lib/proxy/gate.ts`, `proxy.ts` (gate e noindex) → `/seguranca`
- `supabase/*.sql` → `/seguranca` (rodar `004_hardening.sql` de novo depois de qualquer migration)

## Princípios

1. Nenhum texto fixo nas seções: tudo vem de `getSettings()` (exceção documentada no `CLAUDE.md` do cliente).
2. O site nunca cai por erro de banco: `getSettings()` devolve `SITE_DEFAULTS`.
3. Conteúdo lido no servidor, nunca no navegador.
4. Defesa em profundidade: proxy → layout → `requireAdmin()` em toda escrita.
5. Escrita só pelo servidor com `service_role`; o banco só tem leitura pública.

## Modos de auth

Trocar as duas linhas e apagar os arquivos do modo não usado:

| Modo | `lib/auth/index.ts` | `lib/auth/proxy.ts` | Apagar |
|---|---|---|---|
| `env-hmac` | `export * from "./env-hmac";` | `export { checkAdminRequest } from "./env-hmac-proxy";` | `supabase-admin.ts`, `supabase-admin-proxy.ts` |
| `supabase-admin` | `export * from "./supabase-admin";` | `export { checkAdminRequest } from "./supabase-admin-proxy";` | `env-hmac.ts`, `env-hmac-proxy.ts` |

## Modo proposta (só LP)

Saem só os itens abaixo; todo o resto fica (inclui `tests/`, exceto `tests/admin-gate.test.ts`, configs, `site.json`, `KIT.md`).

Saem: `app/gestao/`, `app/api/`, `lib/auth/`, `lib/proxy/admin.ts`, `lib/settings-write.ts`,
`lib/upload.ts`, `components/gestao/`, `supabase/`, `tests/admin-gate.test.ts`.

`proxy.ts` ← `variantes/proxy.proposta.ts`. A pasta `variantes/` é apagada em todos os modos,
depois de aplicadas as regras (a variante volta a ser copiada de `<kit>/variantes/` quando preciso).

## Gate de preview

Age em qualquer status fora de `online` quando `PREVIEW_PASSWORD` e `PREVIEW_SECRET` existem.
Em `proposta` essas envs são obrigatórias; em `desenvolvimento`, opcionais.

## Limites conhecidos

- O limite de tentativas de login por conta (20 em 15 min) permite que quem souber o e-mail do
  admin mantenha o login bloqueado.
- O cookie de preview continua válido até `PREVIEW_SECRET` ser rotacionado.
- Os scripts do painel de SEO (`head`/`bodyStart`) rodam só no site público, nunca em `/gestao` nem em `/preview`.

## Gravar arquivos no Windows

`site.json` e `.env.local` sem BOM: `[IO.File]::WriteAllText("<caminho absoluto>", $texto)`.

## Envs

Ver `.env.example`. Gerar segredos:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Migrations

Ordem: `001_schema.sql` → `003_rpc.sql` → `004_hardening.sql`. A fase 2 acrescenta `002` (blog) e `005` (leads).
Rodar `004_hardening.sql` de novo depois de qualquer migration nova.

## Comandos

`npm run dev` · `npm test` · `npm run typecheck` · `npm run build`
