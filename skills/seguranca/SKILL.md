---
name: seguranca
description: >
  Verifica e corrige a segurança de um site de cliente (VillaOS ou legado): segredos no repo,
  auth do painel, RLS e funções do Supabase, storage, headers e CSP, upload, noindex e gate de
  preview. Modo verificar roda o agente security-auditor e grava o relatório; modo corrigir aplica
  os itens aprovados. Use quando o usuário disser "segurança", "auditar segurança", "vulnerabilidade",
  "vazou chave", "RLS", "CSP bloqueando", "headers", "está seguro?" ou "/seguranca".
---

# /seguranca — verificar e corrigir

`<base>` = pasta desta skill. Checklist: `<base>/checklist.md`.

## Entrada

Cliente (`clientes/<slug>`). Se não for dito, perguntar. Ler `site.json` se existir.

Parâmetro opcional `origem` (padrão `seguranca`): `/orquestrar` e `/publicar-site` passam o
próprio nome, para o relatório não sobrescrever outro do mesmo dia.

## Modo verificar (padrão)

1. Disparar o agente `security-auditor` com o prompt:
   "Audite `<caminho absoluto do cliente>`. Checklist: `<base>/checklist.md`. URL (se houver):
   `<preview ou domínio>`. Devolva só as seções do formato do agente."
2. Gravar o resultado em `clientes/<slug>/auditoria-AAAA-MM-DD-<origem>.md`:
   cabeçalho (data, commit `git rev-parse --short HEAD`, status do manifesto), tabela de achados,
   seção "Riscos aceitos", seção "Não verificado" (o que exigiria acesso ao banco/Vercel).
3. Resumir no chat: contagem por severidade e os críticos.
4. Perguntar quais corrigir.

## Modo corrigir

Para cada achado aprovado:
1. Mostrar o diff proposto (ou o comando, para envs e SQL) antes de aplicar.
2. Aplicar. Código: editar o arquivo. Banco: SQL para o usuário rodar no SQL Editor (ou `psql`,
   se configurado). Vercel: comando `vercel env add` ou instrução no dashboard + redeploy.
3. Reexecutar a verificação do item (comando da coluna "Verificar").
4. Commit no repo do cliente: `fix(seguranca): <ID> <resumo>` (autor Villa Digital, ver `CLAUDE.md` do cliente).

Segredo vazado (SEG-01): além de remover, sempre rotacionar a chave no provedor; reescrever
histórico só com autorização explícita do usuário.

## CSP bloqueando algo

Sintoma: console do navegador "Refused to load ... because it violates the Content Security Policy".
1. Identificar o domínio bloqueado e a diretiva.
2. Se for tracking (GTM/Pixel/Ads) e o perfil não for `tracking`: adicionar ao `tracking` do `site.json`.
3. Se for outro serviço: acrescentar o domínio na diretiva certa em `lib/csp.ts`, só no perfil
   necessário, e registrar no `CLAUDE.md` do cliente.
4. Redeploy e conferir no console.

## Site estático legado

Headers ficam em `vercel.json` (`headers[].headers`). Modelo para site estático sem scripts inline:
`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests`.
