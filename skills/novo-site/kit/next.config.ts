import type { NextConfig } from "next";
import { buildCsp } from "./lib/csp";
import { cspProfile, manifest } from "./lib/manifest";

const dev = process.env.NODE_ENV !== "production";

const headersSeguranca = [
  { key: "Content-Security-Policy", value: buildCsp(cspProfile(manifest), { dev }) },
  // Sem includeSubDomains/preload: o domínio é do cliente e pode ter subdomínios fora do site.
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Auditores buildam em pasta separada (NEXT_DIST_DIR=.auditoria/build) para não
  // sobrescrever o .next de um `npm run dev` em andamento.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Uploads já saem do Sharp em WebP ≤2400px; o otimizador da Vercel é dispensável e tem
    // cota (responde 402 quando ela acaba).
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: headersSeguranca },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
    ];
  },
};

export default nextConfig;
