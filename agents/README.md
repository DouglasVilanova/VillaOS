# Agentes

Auditores que não editam código-fonte. Recebem o caminho do projeto do cliente, leem
`site.json` para saber o que se aplica e devolvem achados com severidade (crítico, alto,
médio, baixo), `arquivo:linha` e a skill que corrige.

| Agente | Fase | Status |
|---|---|---|
| `security-auditor` | 1 | disponível |
| `seo-auditor` | 4 | planejado |
| `performance-auditor` | 4 | planejado |

Detalhes na seção 9 da [spec](../docs/specs/2026-10-07-villaos-site-kit-design.md).
