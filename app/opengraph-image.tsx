import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

/**
 * The card WhatsApp, X, Discord and Facebook show when someone shares a link.
 * Applies to every route that doesn't ship its own `opengraph-image`.
 *
 * Drawn in code rather than shipped as a PNG so the brand colours stay in one
 * place. `next/og` renders through satori, which supports flexbox and a subset
 * of CSS only — no grid, no background-clip text — hence the plain nested divs
 * and inline styles instead of the Tailwind tokens used everywhere else. It
 * also has no access to the Montserrat webfont, so this leans on weight and
 * spacing for the brand feel instead of the display italic.
 */
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

export const size = {
  width: 1200,
  height: 630,
};

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
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundColor: "#000033",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, #8352D9 0%, rgba(131,82,217,0) 55%), radial-gradient(circle at 85% 100%, #14183B 0%, rgba(20,24,59,0) 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 28px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.28)",
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "#02F5D4",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 2,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            color: "#00F5D4",
            fontSize: 116,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          Rallyverse
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 10,
            color: "#FFFFFF",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          Power in every motion
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            color: "#D9D3FF",
            fontSize: 30,
            fontWeight: 500,
          }}
        >
          Turnamen Bulutangkis Universitas Gadjah Mada
        </div>
      </div>
    ),
    size
  );
}
