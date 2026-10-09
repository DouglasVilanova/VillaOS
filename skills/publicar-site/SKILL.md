---
name: publicar-site
description: >
  Coloca no ar o site de um cliente VillaOS: confere autor do commit Villa Digital, envs na Vercel,
  audita segurança, aponta o domínio do cliente (DNS sem tocar no e-mail), tira noindex e gate de
  preview, configura o Search Console e muda o status para online. Também republica depois de
  mudança de env. Use quando o usuário disser "publicar", "colocar no ar", "subir o site",
  "apontar domínio", "DNS", "site online", "redeploy" ou "/publicar-site".
---

# /publicar-site — do preview ao domínio do cliente

Ler `site.json` e `CLAUDE.md` do cliente.

## Pré-requisitos

`gh auth status` e `vercel whoami` na conta Villa Digital (ver `/novo-site`). Sem eles, parar e
mostrar como logar.

## Workflow

1. **Autor dos commits.** No repo do cliente:
   `git config user.name "Villa Digital"` e
   `git config user.email "338858392+villadigitalmail-create@users.noreply.github.com"`.
   Se o último commit tiver outro autor: `git commit --amend --reset-author --no-edit` (só se ainda não foi enviado) ou commit novo.
2. **Build local:** `npm ci`, `npm test`, `npm run build`. Falhou → parar.
3. **Auditoria:** rodar `/seguranca` (modo verificar, `origem` = `publicar-site`). Nas fases 1–3 do VillaOS é a única auditoria;
   a partir da fase 4, `/auditar-site`. Achado crítico → parar e corrigir antes.
4. **Envs na Vercel:** conferir com `vercel env ls production` que existem todas as do `.env.example`
   que o modo exige. Remover `PREVIEW_PASSWORD` e `PREVIEW_SECRET` (`vercel env rm <NOME> production --yes`).
   Conferir `NEXT_PUBLIC_SITE_URL`: remover ou trocar para `https://<dominio>` (senão canonical,
   sitemap e robots continuam apontando para a prévia).
5. **Manifesto:** `site.json` → `status: "online"`, `dominio` preenchido. Commit `chore: publica site`.
6. **Domínio:**
   - `vercel domains add <dominio> <projeto>` e `vercel domains add www.<dominio> <projeto>`.
   - No DNS do cliente, **primeiro** o TXT `_vercel` que a Vercel pedir (verificação); depois
     `A @ 76.76.21.21` e `CNAME www cname.vercel-dns.com`.
   - **Não tocar** em MX, SPF, DKIM, DMARC: e-mail é camada separada.
   - Mostrar ao usuário a lista exata de registros e esperar ele confirmar que criou.
7. **Deploy:** `git push`. Se o projeto Vercel estiver conectado ao GitHub (`vercel git connect`
   já feito; aparece em Settings → Git), o push já publica; senão, `vercel deploy --prod`. Não fazer
   os dois. Env criada ou alterada só vale depois de redeploy.
8. **Conferir:**
   ```powershell
   curl.exe -sI https://<dominio>/ | Select-String "HTTP/|x-robots-tag|content-security-policy"
   curl.exe -s https://<dominio>/robots.txt
   ```
   Esperado: 200, **sem** `x-robots-tag`, CSP presente, `robots.txt` com `Allow: /` e `Sitemap:`.
9. **Search Console:** propriedade de domínio ou prefixo de URL; código de verificação em
   `/gestao/seo` (ou `lib/defaults.ts`); enviar o sitemap. Ver `/seo-tecnico`.
10. **Entregar:** URL, o que foi feito, pendências (DNS propagando, Search Console).

## Só republicar

Mudou env ou conteúdo de código: passos 1, 2, 7 e 8.

## Erros comuns

| Sintoma | Causa |
|---|---|
| Deploy "UNKNOWN" / "commit author doesn't have permission" | autor do commit não é Villa Digital |
| Formulário/painel parou depois de migrar conta | env errada na conta nova; ver log da função na Vercel (ex.: `535 5.7.8` = senha SMTP) |
| E-mail do cliente parou | alguém mexeu em MX/SPF; restaurar os registros anteriores |
| Google não verifica | meta tag injetada por JS; usar o campo de verificação |
