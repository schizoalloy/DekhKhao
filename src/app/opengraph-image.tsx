import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

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
          background: "#f3ece1",
          color: "#1b1714",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#6a5f55" }}>
            3D + AR menus for restaurants
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 132, fontWeight: 800, letterSpacing: -5, lineHeight: 0.9 }}>{siteConfig.name}</div>
            <div style={{ fontSize: 46, marginTop: 26, color: "#c2412a", fontStyle: "italic" }}>{siteConfig.tagline}</div>
          </div>
          <div style={{ fontSize: 22, color: "#6a5f55" }}>{`by ${siteConfig.company}`}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 380 }}>
          <div
            style={{
              width: 340,
              height: 340,
              borderRadius: 999,
              background: "radial-gradient(circle at 50% 46%, #f4cf73 0%, #e2a948 62%, #b63a22 66%, #d9954a 72%, #a8622a 100%)",
              display: "flex",
              boxShadow: "0 40px 60px -20px rgba(60,30,10,0.45)",
              position: "relative",
            }}
          >
            {[
              [120, 80], [200, 96], [84, 160], [168, 164], [236, 176], [120, 236], [196, 244],
            ].map(([x, y], i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x,
                  top: y,
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  background: "radial-gradient(circle at 40% 38%, #c8472c, #7a2012)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
