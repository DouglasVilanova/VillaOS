"use client";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <h1 className="font-display text-3xl font-bold">Algo deu errado</h1>
        <p className="mt-2 opacity-70">Tente de novo em instantes.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-destaque px-5 py-2 font-semibold text-destaque-texto">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
