"use client";

import { useActionState } from "react";
import { entrar } from "./actions";

export function LoginForm() {
  const [estado, acao, pendente] = useActionState(entrar, null);
  return (
    <form action={acao} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold">Painel</h1>
      <label className="block text-sm font-medium">
        E-mail
        <input name="email" type="email" required autoComplete="username" className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Senha
        <input name="senha" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2" />
      </label>
      {estado?.erro ? (
        <p role="alert" className="text-sm text-red-700">
          {estado.erro}
        </p>
      ) : null}
      <button disabled={pendente} className="w-full rounded-full bg-neutral-900 py-2 font-semibold text-white disabled:opacity-60">
        {pendente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
