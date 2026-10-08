// Leitura do conteúdo. O site nunca cai por erro de banco: qualquer falha devolve SITE_DEFAULTS
// (falha fica só no log da função na Vercel).
import { cache } from "react";
import { SITE_DEFAULTS } from "./defaults";
import { mergeSettings } from "./settings";
import { publicClient } from "./supabase/public";
import type { SiteSettings } from "./types";

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = publicClient();
  if (!db) return SITE_DEFAULTS;
  try {
    const { data, error } = await db.from("settings").select("data").eq("id", 1).single();
    if (error || !data) {
      if (error) console.error("[settings] leitura:", error.message);
      return SITE_DEFAULTS;
    }
    return mergeSettings((data as { data: unknown }).data);
  } catch (e) {
    console.error("[settings] leitura:", e);
    return SITE_DEFAULTS;
  }
});
