// Manifesto do projeto (site.json na raiz). Fonte da verdade para skills e para o código.
// Import relativo (não "@/") porque next.config.ts também importa este arquivo.
import type { CspProfile } from "./csp";
import raw from "../site.json";

export type Modulo = "painel" | "blog" | "catalogo" | "formulario-leads" | "chatbot" | "area-membros";
export type Status = "proposta" | "desenvolvimento" | "online";
export type AuthModo = "nenhum" | "env-hmac" | "supabase-admin" | "multiusuario";

export type Manifest = {
  cliente: string;
  nome: string;
  status: Status;
  modulos: Modulo[];
  auth: AuthModo;
  tracking: string[];
  local: { cidade: string; uf: string } | null;
  dominio: string;
  preview: string;
  repo: string;
  animacao: "sobrio" | "medio" | "expressivo";
};

export const manifest = raw as Manifest;

const MODULOS_COM_BANCO: Modulo[] = ["painel", "formulario-leads", "chatbot", "area-membros"];

export function cspProfile(m: Manifest): CspProfile {
  if (m.tracking.length > 0) return "tracking";
  if (m.modulos.some((x) => MODULOS_COM_BANCO.includes(x))) return "painel";
  return "rigido";
}

export function indexavel(m: Manifest): boolean {
  return m.status === "online";
}

export function siteUrl(m: Manifest, envUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string {
  if (envUrl) return envUrl.replace(/\/+$/, "");
  if (m.status === "online" && m.dominio) return `https://${m.dominio}`;
  if (m.preview) return `https://${m.preview}`;
  return "http://localhost:3000";
}

export function temPainel(m: Manifest): boolean {
  return m.modulos.includes("painel") && m.auth !== "nenhum";
}
