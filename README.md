# VillaOS

Skills e agentes para o Claude Code que transformam a criação de sites e o marketing
digital da Villa Digital num processo padronizado: do briefing ao site no ar, com SEO,
segurança, painel administrativo e performance resolvidos por padrão.

> **Status:** fase 1 disponível (kit base, painel, auth, SEO técnico, segurança, publicação,
> orquestração e auditor de segurança), mais `blog-seo-cluster` e `instagram-lancamento`.
> Fases 2–4 no [roadmap](#roadmap).
> Arquitetura: [`docs/specs/2026-10-07-villaos-site-kit-design.md`](docs/specs/2026-10-07-villaos-site-kit-design.md).

---

## Como funciona

1. **Briefing vira manifesto.** `/novo-site` faz perguntas de negócio ("o cliente vai
   publicar artigos?", "quantas pessoas vão editar o site?") e grava `site.json` com os
   módulos do projeto.
2. **Módulos puxam requisitos.** Regras de implicação aplicam o que cada módulo exige.
   Blog ⇒ painel + sanitização + RLS + JSON-LD de artigo + sitemap. Formulário ⇒ rate
   limit + tabela de leads + SPF/DMARC.
3. **Toda skill lê o manifesto.** Qualquer pedido posterior ("adiciona blog no cliente X")
   parte do `site.json`, não da memória da conversa.
4. **Agentes auditam.** Auditores de segurança, SEO e performance verificam o projeto e
   devolvem achados por severidade; a skill correspondente corrige.

Ciclo de cada site: `proposta` (LP de prévia com senha e sem indexação) →
`desenvolvimento` (`/novo-site --ativar`) → `online` (`/publicar-site`, bloqueado se a
auditoria tiver achado crítico).

Stack dos sites: Next.js (App Router) · React 19 · Tailwind CSS 4 · Supabase · Vercel.

---

## Skills

Legenda: ✅ disponível · 🛠️ em construção (fase indicada)

### Criação de sites

#### `/novo-site` ✅
Cria o site de um cliente a partir do starter kit (que vem dentro da própria skill).
- **Modos:** `--proposta` (só a LP, sem banco, prévia com senha e sem indexação), completo
  (site do zero) e `--ativar` (a proposta aprovada vira projeto completo, mesma pasta e repo).
- **Briefing:** perguntas de negócio, uma por vez, que viram o `site.json` (módulos, modo de
  login, tracking, cidade, domínio).
- **Aplica sozinho:** painel, SEO técnico, headers de segurança, `noindex` fora do ar, design
  mínimo do cliente, `CLAUDE.md` do projeto, repositório e prévia publicada.
- **Entrega:** link da prévia, acesso ao painel e lista de pendências.

#### `/painel-gestao` ✅
Deixa partes do site editáveis no painel `/gestao`.
- Novo campo ou nova seção editável (texto, texto longo, código, imagem, liga/desliga).
- Conteúdo guardado num documento único com valores padrão: campo novo não exige migração de banco.
- Toggles de visibilidade por seção e upload de imagem convertido para WebP.

#### `/auth-admin` ✅
Login e logout do painel.
- **1 editor:** e-mail e senha em variáveis de ambiente, sessão em cookie assinado.
- **2 ou mais editores:** contas no Supabase, cadastro público desligado, só entra quem tem papel de admin.
- Troca de senha, inclusão e remoção de editores, diagnóstico de "não consigo entrar".
- Visitantes com cadastro próprio (área de membros) chegam na fase 4.

#### `/seo-tecnico` ✅
SEO no código do site.
- Title, description e canonical por página; sitemap e robots dinâmicos.
- Imagem de compartilhamento (Open Graph) gerada por página.
- Dados estruturados: Organization, LocalBusiness, Article, Product, Breadcrumb.
- Verificação do Google Search Console no HTML do servidor e redirects 301 do site antigo.

#### `/seguranca` ✅
Verifica e corrige a segurança de um site (do kit ou legado).
- **Verificar:** chama o agente `security-auditor` e grava o relatório datado na pasta do cliente.
- **Corrigir:** aplica os itens aprovados, mostrando o diff antes, e confere de novo.
- Cobre segredos no repositório, login do painel, regras de acesso do banco, storage,
  headers e CSP, upload, `noindex` e senha da prévia.

#### `/publicar-site` ✅
Leva o site da prévia para o domínio do cliente.
- Confere autor dos commits, build, variáveis de ambiente e auditoria (bloqueia se houver achado crítico).
- Lista os registros de DNS a criar, sem tocar nos de e-mail.
- Tira `noindex` e senha da prévia, publica, confere e registra no Search Console.

#### `/orquestrar` ✅
Coordena pedidos que envolvem várias áreas de um site ("deixa o site pronto pra campanha").
- Lê o manifesto, quebra o pedido em partes e escolhe a skill de cada parte.
- Faz brainstorm e plano quando o pedido cria algo novo ou envolve mais de uma skill.
- Roda os auditores no fim e atualiza o `site.json` se os módulos mudaram.

#### `/blog` 🛠️ fase 2
Ativa o módulo de blog no site: posts e categorias no painel, editor de texto rico com
conteúdo sanitizado, rascunho e publicado, dados estruturados de artigo e sitemap.

#### `/formulario-leads` 🛠️ fase 2
Formulário de contato que grava o lead no banco antes de enviar o e-mail (nenhum lead se
perde se o e-mail falhar), com limite de envios, página de leads no painel e checklist de
SPF/DMARC.

#### `/chatbot-lp` 🛠️ fase 2
Chatbot de roteiro fixo para landing pages: perguntas guiadas sobre o serviço, validação
das respostas e envio da conversa pronta para o WhatsApp, com eventos de conversão. Sem
custo de API.

#### `/design-cliente` 🛠️ fase 3
Decide a identidade visual do site uma vez por cliente: entrevista (nicho, público,
referências, cores, logo), escolha de um estilo base e geração do `design-system.md` com
tokens, fontes e nível de animação. Todas as outras skills seguem esse arquivo.

#### `/animacoes` 🛠️ fase 3
Efeitos prontos para os sites, limitados pelo nível de animação do cliente: revelar ao
rolar, faixa contínua, cards empilhados, CTA fixo, rolagem suave, inclinação 3D, brilho
que segue o cursor, contador e texto revelado. Todos respeitam "reduzir movimento" do sistema.

#### `/performance` 🛠️ fase 4
Leva o site às metas de Core Web Vitals no celular (LCP < 2,5 s, CLS < 0,1): adiamento de
scripts de tracking, pré-carregamento da imagem principal, carregamento tardio de
animações, imagens e cache.

#### `/auditar-site` 🛠️ fase 4
Roda os três auditores em paralelo e consolida um relatório único por severidade, com a
skill que corrige cada achado.

### Marketing digital

#### `/blog-seo-cluster` ✅
Cluster de posts para SEO e tráfego orgânico.
1. Pesquisa notícias e dados reais do tema.
2. Monta o cluster (página pilar + posts satélite) ligado aos serviços da empresa e pede aprovação.
3. Escreve os posts em Markdown com links internos e CTAs.
4. Gera as imagens de capa e de corpo na identidade da marca, em WebP.
5. Publica pela API do blog (rascunho por padrão) e confere links e imagens no local e em produção.

Configuração por projeto em `marketing/blog/blog.config.json` (modelo em `references/`).

#### `/instagram-lancamento` ✅
Instagram de uma empresa do zero até o conteúdo pronto para postar.
1. **Plano:** objetivo, pilares, calendário e metas.
2. **Bio:** @, nome pesquisável, bio de 150 caracteres, links com UTM e respostas automáticas.
3. **Destaques:** roteiro dos stories e capas 1080×1920.
4. **Posts:** carrosséis 1080×1350 e capas de Reel em PNG, com legenda e hashtags.
5. **Revisão e publicação:** galeria de revisão e publicação no Instagram e Facebook, sempre com confirmação.

Configuração por projeto em `marketing/instagram/instagram.config.json` (modelo em `references/`).

---

## Agentes

Os agentes auditam e **não editam código**: recebem o caminho do projeto, leem o
`site.json` e devolvem uma tabela de achados (severidade, arquivo e linha, problema,
correção e skill que corrige). Quem grava o relatório e corrige é a skill que chamou.

#### `security-auditor` ✅
Segredos no repositório e no histórico, dependências vulneráveis, login do painel (toda
escrita protegida, só admin entra), regras de acesso do banco, storage, headers e CSP,
upload, `noindex` e senha da prévia. Entende projetos antigos sem `site.json` deduzindo
módulos e modo de login pela estrutura do código.

#### `seo-auditor` 🛠️ fase 4
Gera o site e lê o HTML final: meta tags, canonical, dados estruturados, sitemap, robots,
verificação do Search Console e itens básicos de acessibilidade (alt, contraste, títulos, rótulos).

#### `performance-auditor` 🛠️ fase 4
Mede o site no perfil de celular e aponta a causa de cada métrica fora da meta (LCP, CLS,
TBT), com a correção da skill `/performance`.

---

## Estrutura

```
skills/      uma pasta por skill, com SKILL.md e arquivos de apoio
agents/      um .md por agente
docs/specs/  especificações de design
scripts/     instalar.ps1 (instalação) e validar.mjs (validação das skills)
```

## Instalação

Requisitos: Claude Code, Node 22.12 ou superior (exigido pelo kit), PowerShell (Windows).

```powershell
git clone https://github.com/DouglasVilanova/VillaOS.git
cd VillaOS
powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1
```

Instala em `~/.claude/skills` e `~/.claude/agents` (todas as sessões). Para instalar só num
projeto: `-Destino <projeto>\.claude`. Abrir uma sessão nova do Claude Code depois de instalar.

O instalador substitui a pasta de cada skill instalada: edições locais nelas se perdem (edite no repositório e reinstale).

Algumas rotas do `/orquestrar` apontam para skills de marketing opcionais do workspace; sem elas, o roteamento avisa e segue.

Para criar e publicar sites, a skill `novo-site` usa `gh` e `vercel` CLIs logados na conta da agência.

Para validar após editar skills: `node scripts/validar.mjs`.

---

## Roadmap

| Fase | Entrega |
|---|---|
| ✅ 1. Base | `novo-site`, `orquestrar`, `painel-gestao`, `auth-admin`, `seo-tecnico`, `seguranca`, `publicar-site` · agente `security-auditor` · starter kit |
| 2. Conteúdo e conversão | `blog`, `formulario-leads`, `chatbot-lp` · ✅ `blog-seo-cluster`, ✅ `instagram-lancamento` |
| 3. Visual | `design-cliente`, `animacoes` |
| 4. Qualidade | `performance`, `auditar-site`, área de membros · agentes `seo-auditor`, `performance-auditor` |
