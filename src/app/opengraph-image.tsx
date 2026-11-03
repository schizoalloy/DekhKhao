import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { logoMark } from "@/components/brand/art";

const order = ["yellow", "orange", "teal", "pink"];
const layers = [...logoMark.layers].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

export const alt = "DekhKhao — What you see is what you get.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pizza "seen through a viewfinder" — a simplified version of the page's hero idea.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FAF9F4",
          color: "#2B2B2B",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#005F56" }}>
            See food at its real size, before you order
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -5, lineHeight: 0.9, color: "#005F56" }}>{siteConfig.name}</div>
            <div style={{ fontSize: 40, marginTop: 26, color: "#B84700" }}>{siteConfig.tagline}</div>
          </div>
          <div style={{ fontSize: 22, color: "#5C5B55" }}>AR food previews for restaurants. Fully managed, no app to download.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 420 }}>
          {/* the geometric Urdu mark, traced from the brand sheet */}
          <svg width="380" height="402" viewBox={logoMark.viewBox}>
            {layers.map((l) => (
              <path key={l.name} d={l.d} fill={l.fill} fillRule="evenodd" />
            ))}
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
