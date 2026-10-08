"use client";

import { useActionState } from "react";
import { trocarSenha } from "./actions";

export function TrocarSenhaForm() {
  const [estado, acao, pendente] = useActionState(trocarSenha, null);
  return (
    <form action={acao} className="max-w-sm space-y-4">
      <label className="block text-sm font-medium">
        Senha atual
        <input name="atual" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Nova senha
        <input name="nova" type="password" required minLength={10} autoComplete="new-password" className="mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2" />
      </label>
      <p className="text-xs opacity-60">Mínimo 10 caracteres, com maiúscula, minúscula e número.</p>
      {estado ? (
        <p role="status" className={`text-sm ${estado.ok ? "text-green-700" : "text-red-700"}`}>
          {estado.msg}
        </p>
      ) : null}
      <button disabled={pendente} className="rounded-full bg-neutral-900 px-5 py-2 font-semibold text-white disabled:opacity-60">
        {pendente ? "Salvando…" : "Trocar senha"}
      </button>
    </form>
  );
}
