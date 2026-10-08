import type { MetadataRoute } from "next";
import { manifest as site } from "@/lib/manifest";

export default function webManifest(): MetadataRoute.Manifest {
  return {
    name: site.nome,
    short_name: site.nome,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
