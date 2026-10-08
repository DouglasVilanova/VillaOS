---
name: orquestrar
description: >
  Coordena demandas que tocam várias áreas num site de cliente (ex.: "deixa o site pronto pra
  campanha", "login seguro e SEO no site X"): lê o manifesto, quebra a demanda, escolhe skills e
  agentes pela tabela de roteamento, chama brainstorming e plano quando preciso e roda auditores no
  fim. Use quando o pedido envolver duas ou mais áreas (painel, auth, SEO, segurança, publicação,
  conteúdo) ou o usuário disser "orquestrar", "faz tudo que precisa", "deixa pronto" ou "/orquestrar".
---

# /orquestrar — demandas multi-área

Roda na conversa principal (subagente não chama skill nem outro subagente). Para site do zero,
encaminhar para `/novo-site`.

## Tabela de roteamento

A tabela vive no `CLAUDE.md` da raiz do workspace (seção "Criação de sites (VillaOS)"). Ler de lá;
ela é atualizada a cada fase do VillaOS.

## Workflow

1. **Cliente e contexto.** Identificar `clientes/<slug>`; ler `site.json`, `design-system.md`, `CLAUDE.md` do cliente.
2. **Quebrar a demanda** em partes e mapear cada uma para uma linha da tabela. Mostrar ao usuário
   numa linha: "Aplicando `/x` + `/y`, auditor `z` no fim."
3. **Funcionalidade nova?** (algo que o site ainda não faz) → `superpowers:brainstorming` antes.
4. **Mais de uma skill?** → `superpowers:writing-plans`. Sem plano aprovado, não executar.
   Cada tarefa do plano nomeia a skill de referência: "seguir `<caminho>/SKILL.md`, seção X".
5. **Executar** na ordem do plano:
   - passos com interação (briefing, escolha de modo, aprovação de diff, DNS) na conversa principal;
   - tarefas de código independentes podem ir para subagentes (`superpowers:subagent-driven-development`):
     o subagente lê o `SKILL.md` indicado como texto e segue a seção.
6. **Auditar** o que mudou: todos os auditores aplicáveis, em paralelo. Na fase 1 só existe o
   `security-auditor`, chamado via `/seguranca` (modo verificar, `origem` = `orquestrar`), que grava
   `clientes/<slug>/auditoria-AAAA-MM-DD-orquestrar.md`.
7. **Manifesto.** Se módulos, tracking, local ou status mudaram: atualizar `site.json` e aplicar
   `regras.md` da skill `novo-site`.
8. **Entregar:** o que foi feito por skill, achados da auditoria, pendências.

## Desempate de rota

- "post" sem rede social e cliente com `blog` → blog; senão → `/carrossel`; na dúvida, perguntar.
- "meta" sozinho → perguntar: meta tags (`/seo-tecnico`) ou Meta Ads (`/relatorio-ads`).
- Pedido de marketing puro (carrossel, anúncio, e-mail) não precisa de orquestração: chamar a skill direto.
