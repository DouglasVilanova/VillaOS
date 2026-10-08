// Normaliza o IP do cliente para chave de rate limit (função pura, sem next/headers).
// IPv4 fica como está; IPv4 mapeado em IPv6 vira IPv4; IPv6 vira o prefixo /64
// (um cliente controla o /64 inteiro e poderia trocar de endereço a cada tentativa).
export function normalizarIp(ip: string): string {
  const bruto = ip.trim().toLowerCase().split("%")[0];
  if (!bruto.includes(":")) return bruto;

  const mapeado = /^(?:0{0,4}:){0,5}:?ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(bruto);
  if (mapeado) return mapeado[1];

  const [cabeca, cauda, extra] = bruto.split("::");
  if (extra !== undefined) return bruto;
  const a = cabeca ? cabeca.split(":") : [];
  const b = cauda ? cauda.split(":") : [];
  const grupos = cauda === undefined ? a : [...a, ...Array<string>(Math.max(0, 8 - a.length - b.length)).fill("0"), ...b];
  if (grupos.length !== 8 || grupos.some((g) => !/^[0-9a-f]{1,4}$/.test(g))) return bruto;
  return `${grupos.slice(0, 4).map((g) => parseInt(g, 16).toString(16)).join(":")}::/64`;
}
