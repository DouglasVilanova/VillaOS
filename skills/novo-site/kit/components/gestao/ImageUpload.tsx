"use client";

import { useState, type ChangeEvent } from "react";
import { validarUpload } from "@/lib/upload-rules";
import { compressImage } from "./compress";

export function ImageUpload({ valor, onChange }: { valor: string; onChange: (url: string) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function escolher(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    const problema = validarUpload(arquivo.type, arquivo.size);
    if (problema) return setErro(problema);
    setErro(null);
    setEnviando(true);
    try {
      const blob = await compressImage(arquivo);
      const fd = new FormData();
      fd.append("file", new File([blob], arquivo.name, { type: blob.type }));
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.headers.get("content-type")?.includes("application/json")) {
        throw new Error(r.status === 413 ? "Arquivo grande demais para envio." : `Falha no upload (${r.status}).`);
      }
      const json = (await r.json()) as { url?: string; erro?: string };
      if (!r.ok || !json.url) throw new Error(json.erro ?? "Falha no upload");
      onChange(json.url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-2">
      {valor ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={valor} alt="" className="h-32 w-auto rounded-lg border border-black/10 object-cover" />
      ) : null}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm">
          {enviando ? "Enviando…" : valor ? "Trocar imagem" : "Enviar imagem"}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" className="hidden" onChange={escolher} disabled={enviando} />
        </label>
        {valor ? (
          <button type="button" className="text-sm underline" onClick={() => onChange("")}>
            Remover
          </button>
        ) : null}
      </div>
      {erro ? <p className="text-sm text-red-700">{erro}</p> : null}
    </div>
  );
}
