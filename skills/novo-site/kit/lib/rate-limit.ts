// Rate limit. Com Supabase: tabela rate_limits + RPC hit_rate_limit (vale entre instâncias
// serverless). Sem Supabase (modo proposta, dev): memória do processo.
import { hasSupabaseAdmin } from "./env";

export type RateResult = { ok: boolean; retryAfterMs: number };
export type Limiter = (key: string, limit: number, windowMs: number) => Promise<RateResult>;

export function createMemoryLimiter(agora: () => number = Date.now, max = 10_000): Limiter {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return async (key, limit, windowMs) => {
    const now = agora();
    if (buckets.size > max) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    const b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, retryAfterMs: 0 };
    }
    if (b.count >= limit) return { ok: false, retryAfterMs: b.resetAt - now };
    b.count += 1;
    return { ok: true, retryAfterMs: 0 };
  };
}

const memoria = createMemoryLimiter();

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  if (!hasSupabaseAdmin()) return memoria(key, limit, windowMs);
  try {
    const { createAdminClient } = await import("./supabase/admin");
    const { data, error } = await createAdminClient().rpc("hit_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });
    if (error || !data) throw error ?? new Error("RPC sem resposta");
    const r = data as { ok: boolean; retry_after_ms: number };
    return { ok: r.ok, retryAfterMs: Number(r.retry_after_ms) || 0 };
  } catch (e) {
    console.error("[rate-limit] Postgres indisponível, usando memória:", e);
    return memoria(key, limit, windowMs);
  }
}
