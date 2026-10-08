import { AUTH_MODE } from "@/lib/auth";
import { TrocarSenhaForm } from "./TrocarSenhaForm";

export default function SegurancaPage() {
  const modo: string = AUTH_MODE;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Segurança</h1>
      {modo === "env-hmac" ? (
        <div className="space-y-2 text-sm">
          <p>Este site tem um único acesso, definido nas variáveis de ambiente da Vercel.</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Vercel → projeto → Settings → Environment Variables.</li>
            <li>Editar ADMIN_PASSWORD (mínimo 10 caracteres, com maiúscula, minúscula e número).</li>
            <li>Fazer redeploy. A troca encerra as sessões abertas.</li>
          </ol>
        </div>
      ) : (
        <TrocarSenhaForm />
      )}
    </div>
  );
}
