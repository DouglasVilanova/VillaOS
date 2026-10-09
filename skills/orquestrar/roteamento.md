# Tabela de roteamento

O `CLAUDE.md` do workspace pode estender esta tabela; em conflito, vale a do workspace.

Ao aplicar uma rota, dizer numa linha qual skill e agente estão sendo usados. Skills com origem
"workspace (opcional)" só valem se estiverem instaladas.

| Intenção | Skill | Agente | Origem |
|---|---|---|---|
| site novo, proposta, LP pra cliente/prospect | `/novo-site` | — | VillaOS |
| fechou contrato, transformar proposta em site | `/novo-site --ativar` | — | VillaOS |
| deixar editável, bloco no painel, esconder seção | `/painel-gestao` | `security-auditor` | VillaOS |
| login, senha, editor do painel, admin | `/auth-admin` | `security-auditor` | VillaOS |
| segurança, vulnerabilidade, vazou, CSP, RLS | `/seguranca` | `security-auditor` | VillaOS |
| meta tags, sitemap, robots, schema, Search Console | `/seo-tecnico` | — | VillaOS |
| palavras-chave, concorrência, Google Meu Negócio, GEO | `/seo` | — | workspace (opcional) |
| publicar, domínio, DNS, no ar, redeploy | `/publicar-site` | `security-auditor` | VillaOS |
| cluster de posts SEO, popular o blog | `/blog-seo-cluster` | — | VillaOS |
| lançar ou montar o Instagram (plano, bio, destaques, primeiros posts) | `/instagram-lancamento` | — | VillaOS |
| demanda que toca 2+ linhas acima | `/orquestrar` | conforme o plano | VillaOS |
| carrossel, post Instagram/LinkedIn | `/carrossel` | — | workspace (opcional) |
| anúncio Google | `/anuncio-google` | — | workspace (opcional) |
| relatório de anúncios, Meta Ads | `/relatorio-ads` | — | workspace (opcional) |
| e-mail profissional | `/email-profissional` | — | workspace (opcional) |
| avaliações do Google | `/responder-avaliacoes` | — | workspace (opcional) |

## Desempate

- "post" sem rede social num cliente com blog → blog (`/blog-seo-cluster`); senão `/carrossel`; na
  dúvida, perguntar.
- "meta" sozinho → perguntar: meta tags (`/seo-tecnico`) ou Meta Ads (`/relatorio-ads`).
- "Instagram" para lançar ou montar o perfil do zero → `/instagram-lancamento`; um carrossel avulso → `/carrossel`.
