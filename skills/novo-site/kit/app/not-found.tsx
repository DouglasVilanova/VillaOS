import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-sm uppercase tracking-widest opacity-60">Erro 404</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Página não encontrada</h1>
        <Link href="/" className="mt-6 inline-block rounded-full bg-destaque px-5 py-2 font-semibold text-destaque-texto">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
