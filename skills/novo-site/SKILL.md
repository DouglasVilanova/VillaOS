---
name: novo-site
description: >
  Cria o site de um cliente da Villa Digital a partir do starter kit VillaOS (Next.js, Tailwind,
  Supabase, Vercel). O briefing detecta os módulos e aplica painel, SEO técnico e segurança.
  Três modos: proposta (LP de prévia com senha), completo e ativar (proposta vira projeto).
  Use quando o usuário disser "novo site", "site pro cliente", "criar site", "proposta de site",
  "LP pra prospect", "fechou contrato", "ativar proposta" ou "/novo-site".
---

# /novo-site — site de cliente a partir do kit VillaOS

`<base>` = pasta desta skill (o Claude Code mostra "Base directory for this skill" ao carregar).
Kit: `<base>/kit/`. Contrato do kit: `<base>/kit/KIT.md`. Ler `KIT.md` antes de começar.

## Arquivos desta skill

- `briefing.md` — perguntas e o que cada resposta grava
- `regras.md` — regras de implicação (aplicar sempre que o manifesto mudar)
- `templates/claude-md-cliente.md`, `templates/design-system-minimo.md`

## Modos

| Chamada | Quando | Resultado |
|---|---|---|
| `/novo-site --proposta <nome>` | prospect, antes de fechar | só a LP, sem banco, preview com senha |
| `/novo-site <nome>` | site do zero, contrato fechado | projeto completo |
| `/novo-site --ativar <slug>` | proposta aprovada | a proposta ganha módulos e banco, mesma pasta e repo |

Os modos completo e proposta param se `clientes/<slug>/` já existir (sugerir `--ativar` se o
`site.json` de lá tiver `status: proposta`). O modo ativar exige a pasta com `status: proposta`.

## Pré-requisitos (checar antes de tudo)

```powershell
node -v                      # v22.12+
gh --version; gh auth status # logado como villadigitalmail-create
vercel whoami                # villadigitalmail-7623 (conta Villa Digital na Vercel; no GitHub é villadigitalmail-create)
```

Faltando `gh`: `winget install GitHub.cli` e `gh auth login`. Faltando `vercel`: `npm i -g vercel`
e `vercel login`. Conta errada: parar e pedir ao usuário para logar na conta Villa Digital.
Sem os CLIs o usuário pode seguir só com o projeto local; repo e deploy ficam para `/publicar-site`.

Pasta dos clientes: `clientes/` na raiz do workspace (conferir no `CLAUDE.md` da raiz).

## Workflow — modo proposta

1. Pré-requisitos.
2. Slug: kebab-case do nome (`slugify`). Conferir que `clientes/<slug>/` não existe.
3. Briefing: perguntas 1 a 7 de `briefing.md`.
4. Design mínimo: perguntar cores (fundo, texto, destaque), fontes (título e corpo), logo
   (caminho do arquivo ou "sem logo") e o que evitar, ou "use o padrão". Preencher
   `templates/design-system-minimo.md` → `clientes/<slug>/design-system.md`:
   - padrão do kit: fundo `#ffffff`, texto `#16161a`, suave `#f3f2ee`, destaque `#d9480f`,
     destaque-texto `#ffffff`, fontes Inter/Inter;
   - `{{SUAVE}}` não perguntado: fundo claro → `#f3f2ee`; fundo escuro → fundo clareado ~6%;
   - `{{DESTAQUE_TEXTO}}`: `#ffffff` se o destaque for escuro, `#16161a` se claro (contraste ≥ 4,5:1);
   - `{{NUNCA}}` sem resposta → "—".
5. Copiar o kit:
   ```powershell
   robocopy "<base>\kit" "clientes\<slug>" /E /XD node_modules .next .auditoria .vercel /XF .env.local *.tsbuildinfo /NFL /NDL /NJH /NJS /NP
   ```
   Código de saída 0–7 = sucesso.
6. Aplicar a lista "Modo proposta" do `KIT.md` (remover pastas, `proxy.ts` ← variante, apagar `variantes/`).
7. `site.json`: `status: "proposta"`, `modulos: []`, `auth: "nenhum"`, demais campos do briefing.
   Gravar sem BOM: `[IO.File]::WriteAllText("<caminho absoluto>\site.json", $json)`.
8. Conteúdo: preencher `lib/defaults.ts` com as respostas; tokens do design em `app/globals.css`
   (`@theme`) e fontes em `app/layout.tsx` (`next/font/google`, usando as variáveis
   `--font-sans-next` e `--font-display-next`; o `@theme` lê essas).
9. Layout: ajustar `components/sections/*` usando `frontend-design:frontend-design` com a
   instrução de obedecer `design-system.md`. Sem a skill instalada, avisar e seguir só com o
   design-system.
10. `CLAUDE.md` do cliente a partir de `templates/claude-md-cliente.md`. Placeholders sem valor
    (`{{SUPABASE_REF}}`, `{{DOMINIO}}` na proposta) → "—"; `{{PENDENCIAS}}` sem itens → "Nenhuma".
11. Aplicar `regras.md` (R-PROPOSTA, R-LOCAL).
12. Validar: `npm ci`, `npm test`, `npm run build`.
13. Senha da prévia: gerar uma senha fácil de ditar (duas palavras + 4 dígitos) e
    `PREVIEW_SECRET` com `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
    Gravar em `.env.local` sem BOM (`[IO.File]::WriteAllText`).
14. Repositório e deploy (se os CLIs estiverem ok): seção "Repositório e preview".
15. Entregar: link do preview, senha da prévia, o que foi assumido, pendências.

## Workflow — modo completo

1. Pré-requisitos e slug (passos 1–2 do modo proposta).
2. Briefing completo: perguntas 1 a 10.
3. Design mínimo (passo 4 do modo proposta).
4. Copiar o kit (passo 5).
5. `site.json` com `status: "desenvolvimento"` e as respostas (sem BOM).
6. Aplicar `regras.md`: R-PAINEL ou R-SEM-PAINEL, R-TRACKING, R-LOCAL, R-DESENV. Depois apagar `variantes/`.
7. Conteúdo, layout e `CLAUDE.md` (passos 8–10 do modo proposta).
8. Supabase (se `painel`): seção "Supabase".
9. Envs em `.env.local` (ver `.env.example`), gravado sem BOM. `env-hmac`: gerar `SESSION_SECRET` e uma
   `ADMIN_PASSWORD` forte (≥10, maiúscula, minúscula, número); `ADMIN_EMAIL` do cliente.
   Não repetir senhas no chat: dizer que estão em `.env.local`.
10. Validar: `npm ci`, `npm test`, `npm run build`.
11. Repositório e preview.
12. Rodar `/seguranca` em modo verificar; corrigir críticos antes de entregar.
13. Entregar: link, como acessar o painel, pendências, próximos passos (`/publicar-site` quando aprovado).

## Workflow — modo ativar

1. Pré-requisitos. Ler `clientes/<slug>/site.json`; exigir `status: "proposta"`.
2. Briefing: mostrar o que já existe e perguntar 8 a 10 (e o que estiver vazio de 1 a 7).
3. Trazer de volta do kit o que o modo proposta removeu, conforme os módulos escolhidos:
   ```powershell
   $k = "<base>\kit"; $d = "clientes\<slug>"
   robocopy "$k\app\gestao" "$d\app\gestao" /E /NFL /NDL /NJH /NJS /NP
   robocopy "$k\app\api" "$d\app\api" /E /NFL /NDL /NJH /NJS /NP
   robocopy "$k\lib\auth" "$d\lib\auth" /E /NFL /NDL /NJH /NJS /NP
   robocopy "$k\components\gestao" "$d\components\gestao" /E /NFL /NDL /NJH /NJS /NP
   robocopy "$k\supabase" "$d\supabase" /E /NFL /NDL /NJH /NJS /NP
   Copy-Item "$k\lib\proxy\admin.ts" "$d\lib\proxy\admin.ts"
   Copy-Item "$k\lib\settings-write.ts", "$k\lib\upload.ts" "$d\lib\"
   Copy-Item "$k\tests\admin-gate.test.ts" "$d\tests\"
   Copy-Item "$k\proxy.ts" "$d\proxy.ts" -Force
   ```
   Sem `painel`, pular este passo.
4. `site.json`: `status: "desenvolvimento"`, módulos, auth, tracking.
5. Aplicar `regras.md`; Supabase; envs (passos 6, 8, 9 do modo completo).
6. Gate: manter `PREVIEW_PASSWORD`/`PREVIEW_SECRET` se o cliente quiser sigilo durante o
   desenvolvimento (o gate continua ativo fora de `online`); senão remover:
   `vercel env rm PREVIEW_PASSWORD production --yes` e `vercel env rm PREVIEW_SECRET production --yes`.
7. Validar (`npm ci`, `npm test`, `npm run build`) e enviar — o repo e o projeto Vercel já existem:
   ```powershell
   git add -A; git commit -m "feat: ativa projeto completo"; git push
   ```
   Adicionar só as envs novas (`vercel env add <NOME> production`, uma por vez; se já existir,
   `vercel env rm <NOME> production --yes` antes), conferir (ver "Conferir envs") e `vercel deploy --prod`.
8. `/seguranca` verificar; entregar.

## Supabase

Criar o projeto: com `supabase` CLI logado (`supabase projects list` funciona), pegar o org em
`supabase orgs list`, rodar
`supabase projects create "<slug>" --org-id <org> --region sa-east-1 --db-password <gerada>`,
esperar o projeto ficar ativo (`supabase projects list` mostra `ACTIVE_HEALTHY`) e
`supabase projects api-keys --project-ref <ref>` para as chaves. Sem o CLI, o usuário cria em
supabase.com (região São Paulo) e copia URL, `anon` e `service_role` em Settings → API.

Aplicar as migrations nesta ordem: `001_schema.sql`, `003_rpc.sql`, `004_hardening.sql`.
Com `psql` instalado, usar a connection string do **Session pooler** do projeto (Settings →
Database; a conexão direta é só IPv6 e falha em muitas redes):
```powershell
foreach ($f in "001_schema", "003_rpc", "004_hardening") { psql "<connection string>" -v ON_ERROR_STOP=1 -f "supabase\$f.sql" }
```
Sem `psql`, guiar o usuário a colar cada arquivo no SQL Editor, na ordem, e confirmar "Success".

Depois: Authentication → Providers → Email → desligar "Allow new users to sign up".
Modo `supabase-admin`: criar os editores em Authentication → Users e rodar, para cada um:
```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '<email>';
```

Gravar URL e chaves em `.env.local`. O ref do projeto vai no `CLAUDE.md` do cliente; as chaves não.

## Repositório e preview

```powershell
cd clientes\<slug>
git init -b main
git config user.name "Villa Digital"
git config user.email "338858392+villadigitalmail-create@users.noreply.github.com"
git add -A; git commit -m "feat: projeto inicial (VillaOS)"
gh repo create villadigitalmail-create/<slug> --private --source . --push
vercel link --yes --project <slug>
```
Se `vercel link` não criar o projeto, rodar `vercel project add <slug>` e repetir o link.

Envs na Vercel (produção), uma por vez, lendo de `.env.local`:
```powershell
Get-Content .env.local | Where-Object { $_ -match '^\s*([A-Z_]+)=(.+)$' } | ForEach-Object {
  $n, $v = $_ -split '=', 2; $v | vercel env add $n production
}
```

### Conferir envs

O pipe do PowerShell pode acrescentar quebra de linha ao valor; senha com `\r\n` no fim nunca
confere. Depois de adicionar:
```powershell
vercel env pull .env.vercel --environment=production --yes
Compare-Object (Get-Content .env.local | Where-Object { $_ -match '^[A-Z_]+=.+' } | Sort-Object) (Get-Content .env.vercel | Where-Object { $_ -match '^[A-Z_]+=' } | ForEach-Object { $_ -replace '"', '' } | Sort-Object)
Remove-Item .env.vercel
```
Diferença em alguma variável → corrigir no dashboard da Vercel (Settings → Environment Variables), sem espaço nem quebra no fim.
Variáveis marcadas como "sensitive" voltam vazias no pull: conferir essas pelo login no preview.
A Vercel acrescenta variáveis próprias (`VERCEL_*`) no pull: ignorar essas linhas.

```powershell
vercel domains add <slug>.villadigital.com.br <slug>
vercel deploy --prod
```
O CNAME `*` de `villadigital.com.br` → `cname.vercel-dns.com` já existe (configuração única). Se
`vercel domains add` falhar por DNS, avisar o usuário.

## Erros comuns

- Build falha com tipo em `lib/auth`: `lib/auth/index.ts` ou `lib/auth/proxy.ts` aponta para um
  arquivo apagado ou para modos diferentes. Conferir com a tabela do `KIT.md`.
- Deploy "commit author doesn't have permission": o autor do commit não é o da Villa Digital.
  Corrigir `git config` e `git commit --amend --reset-author`.
- Painel não salva: falta `SUPABASE_SERVICE_ROLE_KEY` na Vercel ou não houve redeploy depois de criar a env.
