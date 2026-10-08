"use server";

import { saveSection } from "@/lib/settings-write";

export async function salvarSecao(secao: string, valor: unknown) {
  return saveSection(secao, valor);
}
