import { ImageResponse } from "next/og";
import { manifest } from "@/lib/manifest";
import { getSettings } from "@/lib/settings-read";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = manifest.nome;

export default async function OpenGraphImage() {
  const s = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#16161a",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.7 }}>{manifest.nome}</div>
        <div style={{ fontSize: 68, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
          {`${s.hero.titulo} ${s.hero.destaque}`}
        </div>
      </div>
    ),
    size,
  );
}
