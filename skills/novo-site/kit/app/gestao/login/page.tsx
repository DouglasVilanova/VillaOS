import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Entrar", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-100 px-4 text-neutral-900">
      <LoginForm />
    </main>
  );
}
