# Checklist de segurança — VillaOS

Cada item: ID, severidade, quando se aplica, como verificar, como corrigir. O agente
`security-auditor` percorre esta lista; a skill indicada na seção corrige. Riscos aceitos (fim
desta lista e seção "Riscos aceitos" do `CLAUDE.md` do cliente) não viram achado.

Skill que corrige: `/auth-admin` para SEG-12, SEG-13, SEG-14, SEG-16, SEG-17; `/publicar-site`
para SEG-40 a SEG-43; `/seguranca` para todos os outros.

Severidades: **crítico** (bloqueia `online`), **alto**, **médio**, **baixo**.

## Segredos e repositório

| ID | Sev. | Aplica | Verificar | Corrigir |
|---|---|---|---|---|
| SEG-01 | crítico | sempre | `git ls-files` sem `.env*` (exceto `.env.example`); `git log --all --diff-filter=A --name-only` sem `.env`; `gitleaks detect --no-banner` só se `gitleaks` já estiver instalado (não instalar) | remover do índice, rotacionar a chave vazada, adicionar ao `.gitignore` |
| SEG-02 | crítico | sempre | `SUPABASE_SERVICE_ROLE_KEY` e `SESSION_SECRET` nunca com prefixo `NEXT_PUBLIC_`; grep `service_role` só em `lib/supabase/admin.ts` | renomear env; mover uso para módulo com `import "server-only"` |
| SEG-03 | alto | sempre | `npm audit --omit=dev` sem `critical`/`high` | `npm audit fix`; atualizar pacote |

## Autenticação e painel

| ID | Sev. | Aplica | Verificar | Corrigir |
|---|---|---|---|---|
| SEG-10 | crítico | `painel` | toda função exportada em arquivos `"use server"` que escreve (settings, upload, posts) chama `requireAdmin()` antes de I/O, direto ou via `saveSection` | adicionar `await requireAdmin()` na primeira linha |
| SEG-11 | crítico | `painel` | rotas em `app/api/**/route.ts` que escrevem checam `getAdmin()` e devolvem 401 | idem |
| SEG-12 | crítico | `supabase-admin` | `getAdmin`/proxy exigem `app_metadata.role === "admin"`, não só usuário logado | padrão de `lib/auth/supabase-admin.ts` |
| SEG-13 | alto | `supabase-admin` | signup desligado no projeto Supabase (Authentication → Providers → Email) | desligar "Allow new users to sign up" |
| SEG-14 | alto | `painel` | login com rate limit (5 por 15 min por IP e 20 por 15 min por conta) | `rateLimit` em `signIn` |
| SEG-15 | alto | `painel` | rate limit usa Postgres (`hit_rate_limit`) quando há Supabase; em memória só sem banco | `lib/rate-limit.ts` do kit + `003_rpc.sql` |
| SEG-16 | médio | `painel` | cookie de sessão `httpOnly`, `secure` em produção, `sameSite=lax` | opções do `cookies().set` |
| SEG-17 | médio | `supabase-admin` | troca de senha valida política (≥10, maiúscula, minúscula, número) e senha atual | `changePassword` do kit |

## Banco (Supabase)

| ID | Sev. | Aplica | Verificar | Corrigir |
|---|---|---|---|---|
| SEG-20 | crítico | Supabase | toda tabela de `public` com RLS (`select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity;` vazio). Sem acesso ao banco: toda `create table` nas migrations tem `enable row level security` | rodar `004_hardening.sql` |
| SEG-21 | crítico | Supabase | nenhuma policy de `insert/update/delete` para `anon`/`authenticated` (exceto `leads` insert anon, fase 2) | remover policy; escrita via servidor |
| SEG-22 | crítico | Supabase | funções de `public` sem `EXECUTE` para `anon`/`authenticated`/`public` (migrations têm `revoke`; ou `004` aplicado). Funções `returns trigger` não contam (não são chamáveis pela API) | rodar `004_hardening.sql` |
| SEG-23 | crítico | Supabase | storage sem policy de escrita para `anon` ou `authenticated` no bucket `site-images` | rodar `004_hardening.sql` |
| SEG-24 | alto | Supabase | bucket sem `image/svg+xml` | rodar `004_hardening.sql` |

## Aplicação

| ID | Sev. | Aplica | Verificar | Corrigir |
|---|---|---|---|---|
| SEG-30 | alto | sempre | headers: CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`; `poweredByHeader: false` (`curl -sI` ou `next.config`) | `next.config.ts` do kit |
| SEG-31 | alto | sempre | perfil de CSP coerente com o manifesto (`lib/manifest.ts → cspProfile`) | ajustar `site.json` ou `lib/csp.ts` |
| SEG-32 | alto | sempre | JSON-LD escapa `<` (`components/JsonLd.tsx`) | usar o componente do kit |
| SEG-33 | alto | `painel` | upload valida MIME (sem SVG) e tamanho no servidor | `lib/upload-rules.ts` + `lib/upload.ts` |
| SEG-34 | alto | HTML vindo do banco | HTML de usuário renderizado com `dangerouslySetInnerHTML` é sanitizado no servidor (fase 2: blog) | `sanitize-html` |
| SEG-35 | médio | sempre | entradas de formulário/rota validadas (tipo e tamanho) | zod ou `mergeSettings` |
| SEG-36 | médio | sempre | redirect com destino vindo do usuário passa por `safeNext` | `lib/preview.ts` |

## Exposição

| ID | Sev. | Aplica | Verificar | Corrigir |
|---|---|---|---|---|
| SEG-40 | crítico | `status: proposta` | gate de preview ativo: `PREVIEW_PASSWORD` e `PREVIEW_SECRET` definidos na Vercel; `curl -sI <preview>/` → 307 para `/preview` | definir envs e redeploy |
| SEG-41 | crítico | `status: online` | site sem `noindex`: `curl -sI` da home sem `x-robots-tag`; `robots.txt` sem linha exatamente igual a `Disallow: /` (`Disallow: /gestao` é esperado) | `status` no `site.json` + redeploy |
| SEG-42 | alto | `status` ≠ `online` | `x-robots-tag: noindex` presente | `proxy.ts` do kit |
| SEG-43 | médio | `painel` | `robots.txt` bloqueia `/gestao` e `/api` quando online | `app/robots.ts` |

## Riscos aceitos (não reportar como achado)

- `'unsafe-inline'` em `script-src` (App Router + scripts do painel).
- `'unsafe-eval'` no perfil `tracking` (GTM).
- Scripts livres do painel de SEO: XSS por design, restrito a admin.

## Projetos legados (fora do kit)

Para sites que não vieram do kit, aplicar os itens pela intenção e inferir o manifesto:

| Sinal no código | Inferência |
|---|---|
| `app/gestao/` ou `app/admin/` | `painel` |
| `supabase/` ou `@supabase/*` no `package.json` | Supabase |
| `supabase.auth.getUser`/`signInWithPassword` no guard ou no login | `auth: supabase-admin` (SEG-12, 13, 17 se aplicam) |
| cookie de sessão assinado (HMAC) com credenciais em env | `auth: env-hmac` |
| `vercel.json` com `headers` e sem `app/` | site estático |

Registrar no relatório que não há `site.json` e o que foi inferido.
