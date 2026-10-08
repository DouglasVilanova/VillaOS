/** Política de senha do painel. Retorna a mensagem de erro ou null se a senha é aceita. */
export function validatePassword(senha: string): string | null {
  if (senha.length < 10) return "A senha precisa ter pelo menos 10 caracteres.";
  if (!/[A-Z]/.test(senha)) return "A senha precisa ter uma letra maiúscula.";
  if (!/[a-z]/.test(senha)) return "A senha precisa ter uma letra minúscula.";
  if (!/[0-9]/.test(senha)) return "A senha precisa ter um número.";
  return null;
}
