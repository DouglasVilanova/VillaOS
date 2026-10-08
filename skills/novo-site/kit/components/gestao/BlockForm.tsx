"use client";

// Formulário genérico de uma seção do conteúdo.
import { useState, useTransition } from "react";
import { salvarSecao } from "@/app/gestao/(protected)/actions";
import { ImageUpload } from "./ImageUpload";

export type Campo = {
  nome: string;
  label: string;
  tipo: "texto" | "textarea" | "codigo" | "imagem" | "booleano";
  ajuda?: string;
};
type Valor = string | boolean;

const INPUT = "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2";

export function BlockForm({
  secao,
  titulo,
  inicial,
  campos,
}: {
  secao: string;
  titulo: string;
  inicial: Record<string, Valor>;
  campos: Campo[];
}) {
  const [valores, setValores] = useState(inicial);
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();
  const definir = (k: string, v: Valor) => setValores((p) => ({ ...p, [k]: v }));

  function salvar() {
    iniciar(async () => {
      const r = await salvarSecao(secao, valores);
      setMsg(r.ok ? { ok: true, texto: "Salvo." } : { ok: false, texto: r.erro });
    });
  }

  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <h1 className="text-2xl font-bold">{titulo}</h1>
      {campos.map((c) => (
        <div key={c.nome}>
          {c.tipo === "booleano" ? (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={Boolean(valores[c.nome])} onChange={(e) => definir(c.nome, e.target.checked)} />
              {c.label}
            </label>
          ) : (
            <label className="block text-sm font-medium">
              {c.label}
              {c.tipo === "texto" ? (
                <input className={INPUT} value={String(valores[c.nome] ?? "")} onChange={(e) => definir(c.nome, e.target.value)} />
              ) : null}
              {c.tipo === "textarea" || c.tipo === "codigo" ? (
                <textarea
                  className={`${INPUT} ${c.tipo === "codigo" ? "font-mono text-xs" : ""}`}
                  rows={c.tipo === "codigo" ? 8 : 4}
                  spellCheck={c.tipo !== "codigo"}
                  value={String(valores[c.nome] ?? "")}
                  onChange={(e) => definir(c.nome, e.target.value)}
                />
              ) : null}
            </label>
          )}
          {c.tipo === "imagem" ? (
            <div className="mt-1">
              <ImageUpload valor={String(valores[c.nome] ?? "")} onChange={(url) => definir(c.nome, url)} />
            </div>
          ) : null}
          {c.ajuda ? <p className="mt-1 text-xs opacity-60">{c.ajuda}</p> : null}
        </div>
      ))}
      <div className="flex items-center gap-4">
        <button type="submit" disabled={pendente} className="rounded-full bg-neutral-900 px-5 py-2 font-semibold text-white disabled:opacity-60">
          {pendente ? "Salvando…" : "Salvar"}
        </button>
        {msg ? (
          <p role="status" className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>
            {msg.texto}
          </p>
        ) : null}
      </div>
    </form>
  );
}
