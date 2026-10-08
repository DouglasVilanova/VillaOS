# VillaOS Site Kit — Design

**Data:** 2026-10-07
**Status:** aprovado no brainstorming, revisada (4 passes), aguardando revisão do usuário
**Autor:** Douglas Vilanova (Villa Digital) + Claude

> O VillaOS roda num workspace que já tem memória do negócio (`_memoria/`) e skills de
> marketing próprias (`carrossel`, `seo`, `anuncio-google`, `relatorio-ads`…). Essas skills
> não fazem parte deste repositório; onde a spec fala em "skills existentes", refere-se a elas.

---

## 1. Objetivo

Transformar o VillaOS na ferramenta de produção de sites da Villa Digital. Ao criar um site
com o VillaOS, o sistema deve saber todas as demandas técnicas daquele projeto (SEO,
segurança, painel, performance, publicação) a partir do briefing, e aplicá-las de forma
consistente e profissional.

As skills de marketing atuais (carrossel, seo, anúncios, relatórios, e-mail, avaliações)
continuam intactas. Este trabalho adiciona a frente de criação de sites.

### Critérios de sucesso

- Um site novo sai de `/novo-site` com `npm run build` passando, painel com login funcionando
  e auditoria sem achados críticos.
- O briefing detecta os módulos do site (blog, painel, chatbot…) e as regras de implicação
  puxam automaticamente os requisitos técnicos de cada módulo.
- Qualquer pedido posterior num cliente ("adiciona blog no X") parte do manifesto do
  projeto, não da memória da conversa.
- Uma proposta para prospect fica online em subdomínio Villa Digital, sem indexação e com
  senha, e o mesmo projeto vira o site final sem migração de código.

### Fora de escopo

- Migrar clientes existentes (4tentos, blass, despachante) para o kit. Eles servem de fonte;
  migração, se houver, é trabalho separado.
- Chatbot com IA (decidido: roteiro fixo, sem custo de API).
- E-commerce com checkout/pagamento.
- Integração CodeRabbit (o repositório `awesome-coderabbit` foi analisado: contém só
  exemplos de configuração da ferramenta, sem conteúdo de segurança aproveitável).

---

## 2. Fontes

Todo o conteúdo do kit e das skills é extraído de código real em produção:

| Cliente | Caminho | O que fornece |
|---|---|---|
| 4tentos | `clientes/4tentos/` (+ `PRD.md`, `MEMORY.md`) | CMS por blocos com `settings` JSONB, `mergeSettings`, RPC atômica, `BlockForm`, Supabase Auth em 3 camadas, CSP com GTM/Pixel/CAPI, formulário de leads SMTP, marquee, scroll-stack, CTA sticky, `ScrollVelocity`, diagnóstico de LCP, armadilhas documentadas |
| blass | `clientes/blass/` (+ `MEMORY.md`) | Auth env + cookie HMAC, `security-hardening.sql`, upload Sharp → WebP, sitemap/robots/manifest dinâmicos, `JsonLd` escapado, `Reveal`, editor de posição de blocos, catálogo de produtos, `unoptimized` por cota da Vercel |
| despachante-alvorada | `clientes/despachante-alvorada/` | Site estático, CSP rígida em `vercel.json`, redirects do site antigo, `LocalBusiness` JSON-LD completo, chatbot de roteiro fixo → WhatsApp com tracking |
| villadigital | site da agência | Referência de stack atual (Next 16, React 19), `sanitize-html`, restrição `/gestao` por role |

Lacunas encontradas nessas fontes, que o kit corrige por padrão:

1. Qualquer usuário autenticado é admin total (4tentos). Kit: allowlist `admins` + `is_admin()`.
2. Lead existe só como e-mail; SMTP fora do ar perde o lead (4tentos). Kit: grava em `leads` antes.
3. Sitemap e robots ausentes (4tentos). Kit: `sitemap.ts` e `robots.ts` sempre presentes.
4. Rate limit em memória não sobrevive a múltiplas instâncias (ambos). Kit: rate limit em
   tabela Postgres sempre que houver Supabase (seção 7.4).
5. Verificação do Search Console injetada por JS não é lida pelo Google (4tentos, já
   corrigido lá). Kit: só via `metadata.verification`.

---

## 3. Arquitetura

### 3.1 Estrutura no VillaOS

```
templates/site-kit/                    starter kit
  KIT.md                               contrato: o que trocar por cliente
  regras.md                            regras de implicação (seção 5)
  app/(site)/                          home, blog, not-found, error
  app/gestao/login/                    login (fora do grupo protegido)
  app/gestao/(protected)/              blocos, blog, seo, visibilidade, leads, seguranca
  app/api/                             upload, leads
  app/sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  lib/settings.ts                      getSettings + mergeSettings + SITE_DEFAULTS
  lib/auth/                            env-hmac.ts, supabase-admin.ts, index.ts (reexporta o modo; /novo-site apaga o não usado)
  lib/rate-limit.ts                    Postgres (RPC) com Supabase; memória sem Supabase
  lib/upload.ts                        Sharp → WebP, limites por pasta
  lib/seo.ts lib/slug.ts lib/supabase/
  components/gestao/                   BlockForm, ImageUpload, GalleryUpload, RichTextEditor, Toast
  components/motion/                   núcleo de animações (seção 8)
  components/JsonLd.tsx
  supabase/                            001_schema 002_blog 003_rpc 004_hardening 005_leads
  next.config.ts                       headers + CSP (perfis em lib/csp.ts)
  proxy.ts                             auth /gestao + gate de preview (Next 16 renomeou middleware → proxy)
  .gitignore .env.example              o kit é um repo completo; cópia exclui node_modules e .next

.claude/skills/
  novo-site/  painel-gestao/  blog/  auth-admin/  seguranca/  seo-tecnico/
  chatbot-lp/ formulario-leads/ animacoes/ design-cliente/ performance/
  publicar-site/ auditar-site/ orquestrar/

.claude/agents/
  security-auditor.md  seo-auditor.md  performance-auditor.md

clientes/<cliente>/                    um repo por cliente (pasta ignorada no git do VillaOS)
  site.json                            manifesto do projeto
  design-system.md                     identidade do cliente
  CLAUDE.md                            aponta pro manifesto e design-system
  auditoria-AAAA-MM-DD-<origem>.md     relatórios (origem: seguranca, auditar-site, orquestrar)
```

### 3.2 Fronteiras

- **Kit**: código que funciona sozinho. `npm run dev` sobe com `SITE_DEFAULTS` mesmo sem
  Supabase configurado (princípio herdado da 4tentos: o site nunca cai por erro de banco).
- **Skill**: como decidir e como mexer. Contém decisões, checklists, armadilhas e snippets
  de módulos que não vão em todo site (chatbot, animações extras, auth multiusuário).
- **Agente**: não edita código-fonte. Pode rodar comandos de inspeção (build, `npm audit`,
  Lighthouse), que só escrevem em `clientes/<x>/.auditoria/` (ignorado no git).
  Recebe o caminho do cliente, lê `site.json`, devolve relatório em texto. A skill que o
  chamou grava o arquivo de auditoria e corrige, com aprovação do usuário.
- **Manifesto (`site.json`)**: fonte da verdade do projeto. Toda skill e agente lê primeiro.
- **`design-system.md`**: ponte visual. Escrito por `design-cliente`; lido por `novo-site`,
  `animacoes`, `chatbot-lp` e `carrossel` (quando o post é para o cliente).

### 3.3 Stack do kit

Última versão estável do Next.js (App Router) + React 19 + Tailwind CSS 4 + Motion +
Supabase (`@supabase/ssr`) + TipTap 3 + `sanitize-html` + Sharp + zod. Padrões dos
clientes são portados para as APIs atuais: `cookies()` assíncrono, `proxy.ts` no lugar de
`middleware.ts`, `optimizePackageImports` no lugar de `modularizeImports`. Versões exatas
fixadas no `package.json` do kit no momento da implementação.

Todo site do kit roda como app Next na Vercel (sem export estático), para que o `proxy.ts`
esteja sempre disponível. Sites estáticos existentes (despachante) continuam como estão; a
skill `/seguranca` tem uma variante `vercel.json` só para eles.

### 3.4 Roteamento e orquestração

Inspirado no `intelligent-routing` e no `orchestrator` do ag-kit (vudovn/ag-kit, presente
em `clientes/4tentos/.agent/`), adaptado ao Claude Code. O ag-kit não é importado: foi
feito para o Google Antigravity, cobre domínios fora do escopo (games, mobile) e seu
roteamento "sempre ativo" conflitaria com o superpowers.

**Tabela de roteamento** no `CLAUDE.md` raiz, cobrindo marketing e sites. Cada linha:
intenção (palavras em português) → skill → agentes. Exemplos:

| Intenção | Skill | Agentes |
|---|---|---|
| site novo, proposta, LP pra cliente | `/novo-site` | — |
| fechou contrato, transformar proposta em site | `/novo-site --ativar` | — |
| blog, artigo, post no site | `/blog` | — |
| login, senha, painel, admin | `/auth-admin`, `/painel-gestao` | `security-auditor` |
| segurança, vulnerabilidade, vazou | `/seguranca` | `security-auditor` |
| google, indexar, sitemap, meta tags | `/seo-tecnico` (código) ou `/seo` (estratégia) | `seo-auditor` |
| lento, LCP, pagespeed | `/performance` | `performance-auditor` |
| animação, efeito, scroll | `/animacoes` | — |
| cores, fonte, identidade do cliente | `/design-cliente` | — |
| publicar, domínio, DNS, no ar | `/publicar-site` | auditores disponíveis na fase (fases 1-3: só `security-auditor`) |
| carrossel, post Instagram/LinkedIn | `/carrossel` | — |
| anúncio Google | `/anuncio-google` | — |
| relatório de anúncios, Meta Ads, campanha | `/relatorio-ads` | — |
| e-mail profissional | `/email-profissional` | — |
| avaliações Google | `/responder-avaliacoes` | — |
| demanda que toca 2+ linhas acima | `/orquestrar` | conforme plano |

Desempate: "post" sem contexto de rede social e com cliente que tem `blog` → `/blog`;
caso contrário → `/carrossel`; na dúvida, perguntar. "Meta" sozinho → perguntar (meta
tags ou Meta Ads). Ao aplicar uma rota, o Claude informa numa linha qual skill e agentes
está usando. Linhas
de skills ainda não implementadas entram na tabela na fase que as entrega.

**`/orquestrar`** é skill, não agente: no Claude Code subagente não chama skill nem outro
subagente, então a coordenação precisa rodar na conversa principal. Workflow:

1. Identificar o cliente e ler `site.json` e `design-system.md`.
2. Quebrar a demanda em partes e mapear cada parte para uma linha da tabela.
3. Se a demanda cria funcionalidade nova, chamar `superpowers:brainstorming`.
4. Se envolve mais de uma skill, chamar `superpowers:writing-plans`; sem plano aprovado,
   não executa (checkpoint herdado do ag-kit).
5. Executar na ordem do plano. Passos que dependem de skill com interação (briefing,
   aprovação de diff, escolha de modo) rodam na conversa principal. Tarefas de código
   independentes podem ir para subagentes via `superpowers:subagent-driven-development`;
   como subagente não invoca skill, a tarefa do plano manda o subagente ler
   `.claude/skills/<skill>/SKILL.md` e seguir as instruções relevantes como texto.
6. No fim, rodar em paralelo os agentes auditores que se aplicam ao que mudou, gravar
   relatório e atualizar `site.json` se módulos mudaram.

### 3.5 Pré-requisitos externos

`gh` e `vercel` CLIs instalados e logados na conta `villadigitalmail-create`. `/novo-site`
e `/publicar-site` verificam antes de começar (`gh auth status`, `vercel whoami`); se
faltar ou a conta for outra, param e mostram o comando de login. Uma vez só, no provedor
DNS de `villadigital.com.br`: registro CNAME `*` → `cname.vercel-dns.com`. Por projeto:
`vercel domains add <x>.villadigital.com.br`.

Supabase (só fora do modo proposta): se o `supabase` CLI estiver instalado e logado, a
skill cria o projeto, aplica as migrations (`supabase db push`) e lê as chaves; se não,
conduz um checklist manual (criar projeto no dashboard, colar cada migration no SQL Editor
em ordem, copiar URL, anon key e service role key). Em ambos os casos grava `.env.local` e
envia as envs para a Vercel (`vercel env add`) antes do primeiro deploy com painel.

---

## 4. Manifesto do projeto

`clientes/<cliente>/site.json`, criado no briefing do `/novo-site`:

```json
{
  "cliente": "blass",
  "nome": "Blass Iluminação & Componentes",
  "status": "desenvolvimento",
  "modulos": ["painel", "blog", "catalogo", "formulario-leads"],
  "auth": "env-hmac",
  "tracking": ["gtm", "meta-pixel"],
  "local": { "cidade": "Passo Fundo", "uf": "RS" },
  "dominio": "blass.ind.br",
  "preview": "blass.villadigital.com.br",
  "repo": "villadigitalmail-create/blass",
  "animacao": "medio"
}
```

Campos:

| Campo | Valores |
|---|---|
| `status` | `proposta` · `desenvolvimento` · `online` |
| `modulos` | `painel` · `blog` · `catalogo` · `formulario-leads` · `chatbot` · `area-membros` |
| `auth` | `nenhum` · `env-hmac` · `supabase-admin` · `multiusuario` |
| `tracking` | `gtm` · `ga4` · `meta-pixel` · `google-ads` |
| `animacao` | `sobrio` · `medio` · `expressivo` |

`auth` é um valor só. `multiusuario` cobre também os editores, via `profiles.role = 'admin'`;
nesse caso a pergunta "quantas pessoas vão editar" é ignorada.

O `CLAUDE.md` do cliente instrui: "antes de qualquer tarefa neste projeto, ler `site.json`
e `design-system.md`; ao adicionar módulo, atualizar `site.json` e aplicar
`templates/site-kit/regras.md`".

### 4.1 Detecção no briefing

O `/novo-site` faz perguntas de negócio, não técnicas, e deriva os módulos. Só aparecem
perguntas de módulos já implementados (fase 1: painel, número de editores, local,
tracking; fase 2 adiciona blog e contatos; fase 4 adiciona catálogo e contas de visitante):

| Pergunta | Resposta → efeito |
|---|---|
| O cliente vai publicar artigos ou novidades? | sim → `blog` |
| Alguém do cliente vai editar textos e fotos? | sim → `painel` |
| Quantas pessoas vão editar? | 1 → `env-hmac` · 2 ou mais → `supabase-admin` |
| Visitantes vão criar conta? | sim → `area-membros` + `multiusuario` (sobrepõe a anterior) |
| Tem produtos para mostrar com filtros? | sim → `catalogo` |
| Como o cliente quer receber contatos? | formulário → `formulario-leads` · WhatsApp guiado → `chatbot` |
| Atende uma cidade/região específica? | sim → `local` preenchido |
| Vai rodar anúncio ou já tem GTM/Pixel? | → `tracking` |

---

## 5. Regras de implicação

Arquivo `templates/site-kit/regras.md`. Aplicadas por `/novo-site` na criação e por
qualquer skill que adicione módulo. Também usadas pelos agentes para saber o que auditar.
Cada fase de implementação acrescenta ao arquivo só as regras dos módulos que entrega;
um módulo sem implementação ainda não aparece no briefing.

| Condição | Obriga |
|---|---|
| `painel` | `auth` ≠ `nenhum` (perguntar modo); `requireAdmin()` em toda server action de escrita; migration `004_hardening`; rate limit de login; `/gestao` com `noindex`; página de segurança (troca de senha em `supabase-admin`/`multiusuario`; em `env-hmac`, instruções de trocar `ADMIN_PASSWORD` na Vercel e redeployar) |
| `blog` | `painel`; editor TipTap com sanitização no servidor; RLS "público lê só publicado"; `Article` JSON-LD; post no sitemap; OG por post; `revalidatePath` do post e da lista |
| `catalogo` | `painel`; `Product` JSON-LD; filtros na URL (indexáveis); upload Sharp |
| `formulario-leads` ou `chatbot` | rate limit no endpoint; tabela `leads` (RLS: anon só insere; leitura pelo admin conforme modo de auth); eventos GTM/Pixel; checklist SPF/DMARC |
| `area-membros` | `auth: multiusuario`; RLS por dono (`auth.uid() = user_id`) |
| `tracking` não vazio | CSP perfil `tracking`; carregamento adiado dos scripts (performance) |
| `tracking` vazio, com `painel`, leads ou chatbot com gravação | CSP perfil `painel` |
| `tracking` vazio e sem nada acima | CSP perfil `rigido` |
| `local` preenchido | `LocalBusiness` JSON-LD; sugerir `/seo` (Google Meu Negócio) |
| `status: proposta` | `noindex` global; senha de preview; módulos que dependem de banco ficam desligados (painel, gravação de leads); sem Supabase |
| `status: online` | auditoria sem achado crítico antes da troca |

Perfis de CSP (`lib/csp.ts`):

| Perfil | Base |
|---|---|
| `rigido` | `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'` (fontes via `next/font`, self-hosted); `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'self'` |
| `painel` | `rigido` + `connect-src 'self' *.supabase.co`; `img-src` com `blob:` (preview de upload) e `*.supabase.co` |
| `tracking` | `painel` + domínios de GTM, GA4, Google Ads BR, Meta Pixel e CAPI (modelo 4tentos) |

Perfis `rigido` e `painel`: `'unsafe-eval'` só em desenvolvimento. Perfil `tracking`:
`'unsafe-eval'` também em produção, como na 4tentos, porque variáveis e tags HTML
personalizadas do GTM usam `eval`. `'unsafe-inline'` em `script-src`
é necessário porque o App Router injeta scripts inline de hidratação e porque o painel de
SEO injeta scripts livres; a alternativa (nonce por request no `proxy.ts`) forçaria
renderização dinâmica em todas as páginas. É risco aceito, mitigado por sanitização de
todo HTML vindo do banco e por escrita restrita a admin; o checklist registra isso como
aceito, não como achado. Sites estáticos legados (despachante) mantêm `script-src 'self'`.

Acesso admin ao banco por modo: em `env-hmac` o servidor usa `service_role` (ignora RLS) e
nenhuma policy de admin existe; em `supabase-admin` as policies usam `is_admin()`; em
`multiusuario`, `profiles.role = 'admin'`. O checklist de segurança aplica a regra do modo.

---

## 6. Ciclo de vida do projeto

Decisão: pasta e repositório do cliente existem desde a proposta. O site da agência
(`Villadigital2`) não hospeda prévias.

Motivos: prévia no domínio da agência seria indexada e competiria depois com o domínio do
cliente; cada prévia redeployaria o site da agência; na aprovação seria preciso extrair o
código.

```
proposta ──(contrato fechado)──▶ desenvolvimento ──(auditoria ok)──▶ online
```

1. **Proposta.** `/novo-site --proposta` cria `clientes/<x>/` só com a LP (sem Supabase,
   conteúdo em `SITE_DEFAULTS`), repo privado em `villadigitalmail-create/<x>`, deploy
   Vercel em `<x>.villadigital.com.br`. `proxy.ts` aplica `noindex` (header
   `X-Robots-Tag` + meta) e senha simples: `PREVIEW_PASSWORD` comparada em tempo constante,
   cookie assinado com `PREVIEW_SECRET`, porque o plano Hobby não tem proteção de preview.
   Tentativas de senha com rate limit em memória (suficiente para preview).
   Sem essas envs o gate fica desligado; `status: proposta` sem elas é achado crítico.
2. **Desenvolvimento.** `/novo-site --ativar <x>`: briefing completo, Supabase configurado; `site.json` ganha módulos; regras puxam o resto.
   Mesmo repo, mesma pasta.
3. **Online.** `/publicar-site` roda `/auditar-site`, aponta o domínio do cliente, remove
   `noindex` e senha, muda `status`.

Opcional: após aprovação do cliente, adicionar o case ao portfólio do site da agência.

---

## 7. Skills

Todas seguem o formato das skills existentes (`SKILL.md` com frontmatter `name` e
`description` com gatilhos em português, seções Dependências e Workflow). Toda skill que
atua num cliente começa lendo `clientes/<x>/site.json` e `design-system.md`.

### 7.1 `/novo-site`
Três modos: `--proposta` (só LP), completo (site do zero com briefing) e `--ativar <x>`
(transforma uma proposta existente em projeto completo). Proposta copia só os arquivos da
LP, listados em `KIT.md`: `app/layout.tsx`, `app/(site)/`, páginas de erro, `sitemap`,
`robots`, `opengraph-image`, `lib/settings`, `lib/csp`, `lib/seo`, `lib/rate-limit` (modo
memória), `proxy.ts` só com o gate de preview (sem importar `lib/auth`), `next.config.ts`,
`package.json`. Ficam de fora `app/gestao`, `app/api`, `lib/auth`, `lib/supabase`,
`supabase/`. Os módulos não existem no projeto até a ativação. Workflow (o flag define o
modo; `--proposta` pula briefing de módulos, Supabase, auth e remoção de módulos): checar pré-requisitos (seção 3.5) → briefing (seção 4.1) → se não houver `design-system.md`, chamar
`/design-cliente` (a partir da fase 3) ou, antes disso, perguntar cores, fontes e logo e
gravar um `design-system.md` mínimo do template → copiar `templates/site-kit/`
para `clientes/<x>/` → gravar `site.json` → aplicar regras → remover módulos não usados →
gerar `CLAUDE.md` do cliente → `npm install && npm run build` → criar repo e configurar
autor do commit Villa Digital → deploy de preview.

Modo `--ativar <x>`: exige `clientes/<x>/site.json` com `status: proposta`; roda o
briefing completo (seção 4.1) aproveitando o que já está no manifesto; copia do kit os
módulos escolhidos e o modo de auth; configura Supabase (seção 3.5); aplica regras;
mantém o gate de preview; muda `status` para `desenvolvimento`; build e deploy de preview.
O modo completo aborta se a pasta já existir e sugere `--ativar`.

### 7.2 `/painel-gestao`
Como adicionar bloco editável: tipo em `SiteSettings`, default em `SITE_DEFAULTS`, página
em `gestao/(protected)/blocos/<bloco>` usando `BlockForm`, componente da seção recebendo
props (nenhum texto fixo no componente), toggle em visibilidade. Escrita via RPC atômica,
`revalidatePath("/", "layout")`. Editor de posição com preview (padrão blass) como opção.

### 7.3 `/blog`
Ativa o módulo blog: migration `002_blog`, rotas públicas e de gestão, categorias, slug
com remoção de acentos, link "ver no site" só para publicados, sanitização, JSON-LD,
sitemap, busca opcional.

### 7.4 `/auth-admin`
Três modos, escolhidos pela resposta do briefing:

| Modo | Uso | Implementação |
|---|---|---|
| `env-hmac` | 1 editor | `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`; cookie HMAC-SHA256 httpOnly/secure/lax 7 dias; comparação em tempo constante; escrita no banco via `service_role` no servidor |
| `supabase-admin` | 2-3 editores | Supabase Auth com signup desligado; tabela `admins(email)`; função `is_admin()` usada nas policies; usuários criados no dashboard |
| `multiusuario` | visitantes criam conta | signup, confirmação de e-mail, reset de senha, `profiles(id, role)`, RLS por dono, área `/conta` |

Comum: proxy → layout → `requireAdmin()`/`requireUser()` em toda action; logout
limpa sessão; senha mínima 10 caracteres com maiúscula, minúscula e número; login com
rate limit 5 tentativas por 15 min por IP+e-mail. Os modos `env-hmac` e `supabase-admin`
ficam no kit; `multiusuario` fica na pasta da skill e é aplicado sob demanda.

Rate limit (`lib/rate-limit.ts`, mesma assinatura dos clientes:
`rateLimit(key, limit, windowMs) → { ok, retryAfterMs }`): com Supabase, usa a tabela
`rate_limits(key, count, reset_at)` e a RPC `hit_rate_limit`, executável só por
`service_role` e chamada só do servidor, o que vale entre instâncias serverless. Sem
Supabase (proposta), cai para memória. `SUPABASE_SERVICE_ROLE_KEY` é obrigatória sempre
que houver `painel` ou leads.

### 7.5 `/seguranca`
Dois modos: verificar (chama o agente `security-auditor` e grava o resultado em
`clientes/<x>/auditoria-AAAA-MM-DD-<origem>.md`) e corrigir (aplica itens aprovados). Checklist em
`checklist.md`, filtrado pelo manifesto:

- Headers: HSTS, nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors`,
  `poweredByHeader: false`. CSP nos três perfis da seção 5; variante `vercel.json` para
  sites estáticos legados.
- Supabase: RLS ativo em toda tabela; RPC com `revoke ... from public, anon`; storage sem
  policy de escrita para anon; bucket sem SVG; `service_role` só em módulo `server-only`.
- Aplicação: HTML sanitizado no servidor; JSON-LD com `<` escapado; upload com whitelist
  de MIME e limite de tamanho; entrada validada com zod; `requireAdmin` presente em toda
  action de escrita.
- Repositório: `.env*` no `.gitignore` e fora do histórico (gitleaks); `npm audit` sem
  crítico.
- Riscos aceitos, documentados no `CLAUDE.md` do cliente: injeção de script pelo painel de
  SEO é XSS por design, restrita a admin.

### 7.6 `/seo-tecnico`
Parte de código do SEO. A skill `/seo` existente (pesquisa, concorrência, conteúdo, GEO,
Ads) continua e passa a apontar para esta no passo on-page. Cobre: `metadata` por rota,
`metadataBase`, canonical, `sitemap.ts` dinâmico, `robots.ts` (bloqueia `/gestao` e
`/api`), `manifest.ts`, `opengraph-image.tsx`, JSON-LD por tipo de página
(`Organization`/`LocalBusiness`, `Article`, `Product`, `BreadcrumbList`), verificação do
Search Console em `metadata.verification` (nunca via JS), redirects 301 do site antigo.

### 7.7 `/chatbot-lp`
Motor do chatbot do despachante, generalizado. Roteiro em `roteiro.json`: `steps` com
`id`, `ask`, `type` (`text`, `textarea`, `choice`), `options`, `when`, `validate`,
`transform`, `optional`. Saídas: `chat.js` vanilla (site estático) ou `ChatWidget.tsx`
(kit). Final: monta mensagem → abre `wa.me` → dispara evento GTM/Pixel. Opcional: grava em
`leads` antes de abrir o WhatsApp. Respeita `prefers-reduced-motion`. A skill entrevista os
serviços do cliente e gera o roteiro. Visual herda tokens do `design-system.md`.

### 7.8 `/formulario-leads`
Route handler com zod e rate limit; grava em `leads` primeiro, depois envia e-mail (SMTP
ou Resend) e webhook opcional. Destino do e-mail: env → settings → fallback (lição 4tentos
15.3). IDs estáveis nos campos para o GTM. Página de leads no painel quando houver
`painel`. Checklist de DNS: um único registro SPF, DMARC.

### 7.9 `/design-cliente`
Camada de estratégia visual: decide uma vez por cliente e grava. Entrevista: nicho,
público, três sites de referência, cores e logo existentes, o que o cliente não quer.
Escolhe base em `estilos.md` (artesanal/orgânico, dark cinematográfico, editorial,
corporativo, bold, local/confiança) e gera `clientes/<x>/design-system.md` a partir de
`template-design-system.md`: paleta, tipografia, formas, z-index, tokens Tailwind 4
(`@theme`), nível de animação, o que nunca fazer.

`estilos.md` inclui uma versão condensada (até ~150 linhas) de princípios de psicologia
UX e da tabela anti-clichê do `frontend-design` do ag-kit (bento grid genérico, hero
dividido previsível, glassmorphism por padrão, copy "empoderar/orquestrar"), reescrita com
texto próprio e citando a fonte; conferir a licença do ag-kit antes.

**Camada de execução:** ao construir ou redesenhar páginas, `novo-site`, `painel-gestao`,
`blog` e `animacoes` usam a skill `frontend-design:frontend-design` (plugin oficial
Anthropic; se não estiver instalado, a skill avisa e segue só com `design-system.md` e
`estilos.md`) com a instrução explícita
de obedecer `design-system.md`: tokens, fontes e nível de animação do cliente são fixos;
a liberdade criativa vale para composição e detalhes. Isso evita que cada página do mesmo
cliente saia com estética diferente. Comparação feita no brainstorming: `frontend-design`
tem o melhor gosto de execução mas não persiste decisões e incentiva variar a cada
geração; o do ag-kit tem bons princípios mas ~3.700 linhas e é genérico; nenhum dos dois
substitui o `design-system.md` por cliente.

### 7.10 `/animacoes`
Núcleo no kit (seção 8) + `catalogo-externo.md` com componentes curados de React Bits e
21st.dev: nome, link, comando de instalação (`npx shadcn add <url>`), estilos que combinam,
nível de animação, peso aproximado, licença. O nível do `design-system.md` limita o que
entra. Regras: lazy abaixo da dobra, só `transform`/`opacity`, sem transform estático
competindo com keyframe, `w-max` em marquee. Referência de princípios de movimento:
skill `design-motion-principles`.

### 7.11 `/performance`
Metas: LCP < 2,5 s, CLS < 0,1, TBT < 200 ms em mobile. Técnicas extraídas do diagnóstico
4tentos: adiar GTM/Pixel para primeira interação ou 3 s, preload da imagem do hero,
Motion lazy abaixo da dobra, imagens já otimizadas no upload (permite `unoptimized` quando
a cota da Vercel acaba), cache headers para assets de marca e fontes,
`optimizePackageImports` para bibliotecas de ícones.

### 7.12 `/publicar-site`
Checa pré-requisitos (seção 3.5), configura autor do commit Villa Digital no repo do
cliente (deploy Hobby bloqueia outro autor), envs na Vercel e redeploy, domínio (TXT
`_vercel` primeiro, depois A/CNAME, MX intocado), Search Console, troca de `status`.
Antes de `online`, roda a auditoria disponível: nas fases 1-3, `/seguranca` em modo
verificar; a partir da fase 4, `/auditar-site`. Bloqueia se houver achado crítico.

### 7.13 `/auditar-site <cliente>`
Dispara os três agentes em paralelo e consolida em `clientes/<x>/auditoria-AAAA-MM-DD-<origem>.md`
com tabela por severidade e skill responsável pela correção.

### 7.14 `/orquestrar`
Coordenação de demandas multi-domínio num cliente existente. Workflow na seção 3.4.
Também é a porta de entrada quando o usuário descreve uma demanda ampla sem nomear skill
("deixa o site da blass pronto pra campanha"). Para site do zero, encaminha para
`/novo-site`.

### 7.15 Ajustes em skills e arquivos existentes

- `novo-projeto`: se a entrega incluir site, encaminhar para `/novo-site`.
- `seo`: passo de otimização on-page aponta para `/seo-tecnico`.
- `carrossel`: se o conteúdo for de um cliente com `design-system.md`, usar esse arquivo
  em vez de `identidade/design-guide.md`.
- `CLAUDE.md` raiz: seção "Criação de sites" (manifesto, regras, ciclo de vida).
- `README.md`: contagem e lista de skills.
- `templates/skills/catalogo.md`: entradas das skills novas.

---

## 8. Núcleo de animações (`components/motion/`)

| Componente | Origem | Uso |
|---|---|---|
| `Reveal` | blass | entrada ao rolar (IntersectionObserver + CSS, variantes fade/up/left/right) |
| `Marquee` | 4tentos | faixa contínua; velocidade por prop; correções 15.1 e 15.2 |
| `ScrollStack` | 4tentos | cards empilhados no scroll |
| `StickyCTA` | 4tentos | barra fixa que aparece após scroll e some na seção de contato (observer nos dois sentidos) |
| `ScrollVelocity` | 4tentos (React Bits) | texto que acelera com a velocidade do scroll |
| `SmoothScroll` | novo | Lenis, desligado com reduced-motion |
| `TiltCard` | novo | inclinação 3D no hover |
| `Spotlight` | novo | brilho que segue o cursor em cards |
| `Counter` | novo | número que conta ao entrar na tela |
| `TextReveal` | novo | texto revelado por palavra |

Todos: `prefers-reduced-motion` desliga ou simplifica; nenhum busca dados; props tipadas.

---

## 9. Agentes

Arquivos em `.claude/agents/` com frontmatter `name`, `description`, `tools` (Read, Grep,
Glob, Bash; sem Edit/Write). Não editam código-fonte; comandos de inspeção escrevem só em
`clientes/<x>/.auditoria/` (o `next.config.ts` do kit lê `distDir` de `NEXT_DIST_DIR`; o auditor builda com
`NEXT_DIST_DIR=.auditoria/build` para não sobrescrever o `.next/` de um `npm run dev`).
Em projetos sem esse hook (clientes antigos), o auditor builda no `.next` padrão e avisa
no relatório para não rodar com o dev server ativo. Entrada: caminho do cliente. Primeiro passo: ler
`site.json` para saber o que se aplica. Saída em texto: lista de achados com `severidade`
(crítico, alto, médio, baixo), `arquivo:linha`, descrição, skill que corrige. A skill que
chamou grava o relatório.

| Agente | Verifica |
|---|---|
| `security-auditor` | checklist do `/seguranca` contra código e migrations; `npm audit`; busca de segredos |
| `seo-auditor` | checklist do `/seo-tecnico`; build local e leitura do HTML gerado (meta, JSON-LD, sitemap, robots); itens básicos de acessibilidade (alt, contraste, hierarquia de headings, labels) |
| `performance-auditor` | Lighthouse CLI mobile contra preview ou `next start` local; aponta causa usando checklist do `/performance` |

Crítico, por definição: segredo exposto, tabela sem RLS, action de escrita sem
`requireAdmin`, escrita anon em storage/RPC, site `online` com `noindex`, site `proposta`
sem gate de senha.

---

## 10. Tratamento de erros

- Kit: `getSettings()` devolve `SITE_DEFAULTS` em qualquer falha de banco; `proxy.ts` não
  derruba o site se env faltar; `error.tsx`, `global-error.tsx` e `not-found.tsx` com marca.
- Painel sem banco: se as envs do Supabase faltarem, `/gestao` mostra aviso "banco não
  configurado" e as actions de escrita retornam erro tratado (toast), sem exceção.
- Leads: gravação no banco antes do e-mail; falha de e-mail é registrada no log, não perde
  o lead.
- Skills: antes de sobrescrever arquivo de cliente, mostrar o diff e pedir aprovação.
  `/novo-site` nos modos completo e `--proposta` aborta se `clientes/<x>/` já existir (sugere `--ativar`).
- `/publicar-site`: para se build falhar ou auditoria tiver crítico.

---

## 11. Testes e validação

Cada fase termina com validação num projeto descartável `clientes/_teste-kit/`:

- `npm run build` e `tsc --noEmit` sem erro.
- Site sobe sem Supabase (defaults) e com Supabase.
- Login, logout e bloqueio de `/gestao` sem sessão, em cada modo de auth.
- Server action de escrita chamada sem sessão é rejeitada.
- Modo proposta: sem cookie de preview, toda rota responde a tela de senha; resposta tem
  `X-Robots-Tag: noindex`.
- Agentes disponíveis na fase rodam no projeto de teste e não retornam crítico.
- Agentes disponíveis na fase rodam em `clientes/4tentos` e `clientes/blass` e encontram
  as lacunas conhecidas que cobrem: fase 1 (`security-auditor`) → lacunas 1 e 4;
  fase 2 (`security-auditor` com checklist de leads) → lacuna 2; fase 4 (`seo-auditor`)
  → lacunas 3 e 5.

---

## 12. Fases de implementação

Cada fase é utilizável sozinha. Ao fim de cada fase: `README.md`,
`templates/skills/catalogo.md`, `CLAUDE.md` e `regras.md` atualizados com o que ela entregou.

| Fase | Kit (`templates/site-kit/`) | Skills | Agentes / ajustes |
|---|---|---|---|
| 1. Base | `package.json`, `next.config.ts` (headers + CSP), `.gitignore` (inclui `.auditoria/`), `.env.example`, `app/layout.tsx`; `app/(site)/` home e páginas de erro; `app/gestao/` login, blocos, seo, visibilidade, seguranca; `app/api/upload`; `sitemap`, `robots`, `manifest`, `opengraph-image`; `lib/` settings, auth (`env-hmac`, `supabase-admin`), rate-limit, upload, seo, slug, csp, supabase; `components/gestao/` (exceto RichTextEditor); `JsonLd`; `supabase/` 001 (settings, storage), 003 (RPCs de settings, `rate_limits` + `hit_rate_limit`), 004 (hardening, `admins` + `is_admin()`); `proxy.ts`; `KIT.md`; `regras.md` com `painel`, `tracking`, `local`, `status` | `novo-site`, `orquestrar`, `painel-gestao`, `auth-admin`, `seo-tecnico`, `seguranca`, `publicar-site` | `security-auditor`; tabela de roteamento e ajustes em `CLAUDE.md`, `novo-projeto`, `seo` |
| 2. Conteúdo e conversão | checklist de `/seguranca` ganha "lead gravado antes do e-mail" e RLS de `leads`; `app/(site)/blog`, `app/gestao/(protected)/blog` e `leads`, `app/api/leads`, `RichTextEditor`, `supabase/` 002 e 005; regras de `blog`, `formulario-leads`, `chatbot` | `blog`, `formulario-leads`, `chatbot-lp` | — |
| 3. Visual | `components/motion/` | `design-cliente`, `animacoes` | ajuste em `carrossel`; `novo-site` passa a chamar `design-cliente` |
| 4. Qualidade | — (multiusuário fica na pasta da skill `auth-admin`) | `performance`, `auditar-site`; modo `multiusuario` em `auth-admin`; regras de `catalogo` e `area-membros` | `seo-auditor`, `performance-auditor`; `publicar-site` passa a usar `auditar-site` |

O módulo `catalogo` (Product JSON-LD, filtros) entra na fase 4 junto com as regras;
até lá, catálogos seguem o padrão blass manualmente.

---

## 13. Decisões registradas

| Decisão | Escolha | Alternativa descartada |
|---|---|---|
| Público das skills | stack Villa Digital (Next + Tailwind + Supabase + Vercel) | genéricas |
| Empacotamento | starter kit + skills | só skills com trechos |
| Stack do kit | versões estáveis atuais | Next 14 igual aos clientes |
| Chatbot | roteiro fixo → WhatsApp | IA via API |
| Prévias | repo do cliente desde a proposta | páginas dentro do site da agência |
| Agentes | 3 auditores que não editam código | agentes que editam |
| Orquestração | skill `/orquestrar` + tabela de roteamento, usando superpowers para brainstorm/plano | importar ag-kit; orquestrador como agente (subagente não chama skill) |
| Design | `design-cliente` (estratégia, persiste) + `frontend-design` (execução, travada no design-system) | só `frontend-design`; `frontend-design` do ag-kit |
| Local dos clientes | `clientes/` dentro do workspace (ignorada no git) | pasta fora do workspace |
| Rate limit | Postgres via RPC quando há Supabase | memória (não vale entre instâncias), Upstash (serviço extra) |
| Hospedagem | todo site do kit é app Next na Vercel | export estático (perderia `proxy.ts`) |
