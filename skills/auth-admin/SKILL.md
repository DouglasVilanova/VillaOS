---
name: auth-admin
description: >
  Configura, troca ou repara o login do painel de um site VillaOS: modo env-hmac (1 editor, senha
  em env) ou supabase-admin (2+ editores via Supabase Auth com app_metadata.role admin). Cria
  editores, troca senha, explica logout e resolve "não consigo entrar". Use quando o usuário disser
  "login", "logout", "senha do painel", "adicionar editor", "admin", "trocar modo de login",
  "não consigo entrar no painel" ou "/auth-admin".
---

# /auth-admin — login do painel

Contrato dos modos: `KIT.md` do projeto (seção "Modos de auth"). Ler `site.json` (`auth`).

## Qual modo

| Situação | Modo |
|---|---|
| 1 pessoa edita | `env-hmac` |
| 2 ou mais pessoas | `supabase-admin` |
| visitantes criam conta | `multiusuario` — fase 4 do VillaOS, ainda não disponível. Avisar e não improvisar. |

Defesa em profundidade, igual nos dois modos: proxy (`lib/proxy/admin.ts`) → layout protegido
(`requireAdmin()`) → toda escrita (`requireAdmin()` em `saveSection`, `getAdmin()` no upload).
Escrita no banco sempre pelo servidor com `service_role`.

## Configurar `env-hmac`

1. Gerar `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
2. `ADMIN_EMAIL` = e-mail do editor; `ADMIN_PASSWORD` forte (≥10, maiúscula, minúscula, número).
3. `.env.local` e Vercel (`vercel env add <NOME> production`), depois redeploy.
4. Trocar senha: editar `ADMIN_PASSWORD` na Vercel + redeploy. A sessão aberta termina sozinha,
   porque o cookie é vinculado a `ADMIN_PASSWORD`, `ADMIN_EMAIL` e `SESSION_SECRET`: mudar qualquer um
   deles encerra as sessões (não é preciso trocar também o `SESSION_SECRET`).

## Configurar `supabase-admin`

1. Supabase: Authentication → Providers → Email → desligar "Allow new users to sign up".
2. Criar cada editor em Authentication → Users → Add user (senha forte, "Auto Confirm User").
3. Promover a admin (SQL Editor):
   ```sql
   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '<email>';
   ```
4. Remover acesso: `update auth.users set raw_app_meta_data = raw_app_meta_data - 'role' where email = '<email>';`
   (ou apagar o usuário).
5. Envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
6. Troca de senha: o próprio editor em `/gestao/seguranca`.

## Trocar de modo

1. Editar `lib/auth/index.ts` e `lib/auth/proxy.ts` conforme a tabela do `KIT.md`.
2. Se os arquivos do modo novo foram apagados, copiar de `<base de novo-site>/kit/lib/auth/`
   (`<base de novo-site>` = pasta irmã `novo-site` desta skill).
3. Apagar os arquivos do modo antigo.
4. `site.json`: `auth`.
5. Envs do modo novo; remover as do antigo na Vercel.
6. `npm run build`; commit `feat(auth): modo <novo>`; redeploy.

## Não consigo entrar

| Sintoma | Causa provável |
|---|---|
| "Login não configurado neste ambiente." | faltam `SESSION_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` (env-hmac) |
| "Banco não configurado neste ambiente." | faltam envs do Supabase (supabase-admin) |
| "E-mail ou senha inválidos." com dados certos | env criada sem redeploy; espaço no fim do valor da env |
| "Este usuário não tem permissão de administrador." | falta `role: admin` no `app_metadata` |
| "Muitas tentativas." | rate limit (5 em 15 min por IP, 20 em 15 min por conta): esperar o tempo indicado ou limpar a linha em `public.rate_limits` |
| loga e volta para o login | cookie não grava: domínio diferente entre preview e produção, ou `SESSION_SECRET`, `ADMIN_EMAIL` ou `ADMIN_PASSWORD` mudou (a sessão antiga deixa de valer) |
