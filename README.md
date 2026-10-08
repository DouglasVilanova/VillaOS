# VillaOS

Skills e agentes para o [Claude Code](https://claude.com/claude-code) que transformam a
criação de sites da Villa Digital num processo padronizado: do briefing ao site no ar,
com SEO, segurança, painel administrativo e performance resolvidos por padrão.

> **Status:** em construção. A arquitetura está definida em
> [`docs/specs/2026-10-07-villaos-site-kit-design.md`](docs/specs/2026-10-07-villaos-site-kit-design.md).
> As skills e os agentes entram neste repositório conforme cada fase é implementada.

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
4. **Agentes auditam.** Três auditores (segurança, SEO, performance) verificam o projeto
   e devolvem achados por severidade; a skill correspondente corrige.

Ciclo de cada site: `proposta` (LP de prévia com senha e sem indexação) →
`desenvolvimento` (`/novo-site --ativar`) → `online` (`/publicar-site`, bloqueado se a
auditoria tiver achado crítico).

Stack: Next.js (App Router) · React 19 · Tailwind CSS 4 · Supabase · Vercel.

---

## Estrutura

```
skills/      skills do Claude Code (uma pasta por skill, com SKILL.md)
agents/      agentes auditores (um .md por agente)
docs/specs/  especificações de design
```

## Instalação

Copiar as pastas desejadas para o projeto ou para o usuário:

```bash
# no projeto (vale só nele)
cp -r skills/* <projeto>/.claude/skills/
cp agents/*.md <projeto>/.claude/agents/

# globais (valem em qualquer projeto)
cp -r skills/* ~/.claude/skills/
cp agents/*.md ~/.claude/agents/
```

---

## Roadmap

| Fase | Entrega |
|---|---|
| 1. Base | `novo-site`, `orquestrar`, `painel-gestao`, `auth-admin`, `seo-tecnico`, `seguranca`, `publicar-site` · agente `security-auditor` · starter kit |
| 2. Conteúdo e conversão | `blog`, `formulario-leads`, `chatbot-lp` |
| 3. Visual | `design-cliente`, `animacoes` |
| 4. Qualidade | `performance`, `auditar-site`, auth multiusuário · agentes `seo-auditor`, `performance-auditor` |

---

## Créditos

Ideias de roteamento e orquestração inspiradas em
[ag-kit](https://github.com/vudovn/ag-kit).
