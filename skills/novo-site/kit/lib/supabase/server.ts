// Cliente com sessão do usuário via cookies (modo supabase-admin).
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(lista) {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Chamado de Server Component: cookies são só leitura; o proxy renova a sessão.
        }
      },
    },
  });
}
