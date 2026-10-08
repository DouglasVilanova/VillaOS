import type { MetadataRoute } from "next";
import { indexavel, manifest, siteUrl } from "@/lib/manifest";

export default function robots(): MetadataRoute.Robots {
  if (!indexavel(manifest)) return { rules: [{ userAgent: "*", disallow: "/" }] };
  const base = siteUrl(manifest);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/gestao", "/api", "/preview"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
