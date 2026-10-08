/** Link do WhatsApp com mensagem opcional. */
export function waLink(numero: string, texto?: string): string {
  const digitos = numero.replace(/\D/g, "");
  return `https://wa.me/${digitos}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
}
