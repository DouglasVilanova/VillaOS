# Regras de implicação

Aplicadas por `/novo-site` ao criar ou ativar um projeto e por qualquer skill que mude
`modulos`, `tracking`, `local` ou `status` no `site.json`. Os agentes auditores usam a mesma
tabela para saber o que verificar. Cada fase do VillaOS acrescenta as regras dos módulos que
entrega.

Como aplicar: para cada linha cuja condição vale, executar todas as ações. Ao terminar, listar
para o usuário as linhas aplicadas.

| ID | Condição | Ações |
|---|---|---|
| R-PAINEL | `modulos` contém `painel` | 1. `auth` ≠ `nenhum` (se vazio, perguntar pela pergunta 9 do briefing). 2. Modo de auth aplicado em `lib/auth/index.ts` e `lib/auth/proxy.ts`, arquivos do outro modo apagados (`KIT.md`). 3. Supabase configurado e migrations 001, 003, 004 aplicadas. 4. Envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` sempre; `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` em `env-hmac`. 5. Conferir que toda server action de escrita chama `requireAdmin()` (padrão do kit). |
| R-SEM-PAINEL | `modulos` não contém `painel` e status ≠ `proposta` | Aplicar a lista "Saem" do modo proposta do `KIT.md` (`app/gestao`, `app/api`, `lib/auth`, `lib/proxy/admin.ts`, `lib/settings-write.ts`, `lib/upload.ts`, `components/gestao`, `supabase/`, `tests/admin-gate.test.ts`); `proxy.ts` ← `<base>/kit/variantes/proxy.proposta.ts`; `auth: "nenhum"`. |
| R-TRACKING | `tracking` não vazio | CSP sai automaticamente no perfil `tracking` (`lib/manifest.ts`). Avisar: scripts de tracking entram pelo painel de SEO (campo `head`), ou, sem painel, em `lib/defaults.ts` (`seo.head`). Registrar no `CLAUDE.md` do cliente que tags novas do GTM podem exigir domínio novo na CSP (`/seguranca`). |
| R-LOCAL | `local` preenchido | JSON-LD vira `LocalBusiness` automaticamente. Preencher `contato.endereco`. Sugerir `/seo` (se estiver instalada) (passo Google Meu Negócio). |
| R-PROPOSTA | `status` = `proposta` | Modo proposta do `KIT.md` (remover módulos); envs `PREVIEW_PASSWORD` e `PREVIEW_SECRET` na Vercel; sem Supabase. |
| R-DESENV | `status` = `desenvolvimento` | `noindex` automático. Gate de preview: ligado se `PREVIEW_PASSWORD` e `PREVIEW_SECRET` existirem (cliente pediu sigilo), desligado sem elas. Com gate e painel, o editor digita a senha da prévia antes do login. |
| R-ONLINE | `status` = `online` | Só via `/publicar-site`, depois de auditoria sem achado crítico. |
