// Merge do conteúdo vindo do banco com SITE_DEFAULTS. Garante a forma do objeto:
// campo ausente ou de tipo errado volta para o default; chave desconhecida é descartada.
import { SITE_DEFAULTS } from "./defaults";
import type { Secao, SiteSettings } from "./types";

function isPlain(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mergeWith(padrao: unknown, valor: unknown): unknown {
  if (isPlain(padrao)) {
    const origem = isPlain(valor) ? valor : {};
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(padrao)) out[k] = mergeWith(padrao[k], origem[k]);
    return out;
  }
  if (Array.isArray(padrao)) return Array.isArray(valor) ? valor : padrao;
  return typeof valor === typeof padrao ? valor : padrao;
}

export function mergeSettings(entrada: unknown): SiteSettings {
  return mergeWith(SITE_DEFAULTS, entrada) as SiteSettings;
}

export const SECOES = Object.keys(SITE_DEFAULTS) as Secao[];

export function isSecao(v: string): v is Secao {
  return (SECOES as string[]).includes(v);
}
