import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #050b24 0%, #071a66 55%, #1440e6 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8fb0ff",
          }}
        >
          S&C Coach · Massaggiatore Sportivo
        </div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, marginTop: 24, textTransform: "uppercase" }}>
          {site.name}
        </div>
        <div style={{ display: "flex", fontSize: 32, marginTop: 20, color: "rgba(255,255,255,0.75)" }}>
          {site.niche}
        </div>
      </div>
    ),
    { ...size }
  );
}
