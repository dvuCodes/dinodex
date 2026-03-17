import { ImageResponse } from "next/og";

export const alt = "Dinodex — Dinosaur Encyclopedia";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          background: "linear-gradient(135deg, #FFFBF0 0%, #FFF8ED 45%, #FEE2E2 100%)",
          color: "#1C1917",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 15% 20%, rgba(16,185,129,0.22), transparent 28%), radial-gradient(circle at 85% 15%, rgba(239,68,68,0.24), transparent 32%), radial-gradient(circle at 80% 80%, rgba(245,158,11,0.22), transparent 24%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 68px",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                width: 78,
                height: 78,
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                background: "#1C1917",
                color: "#FFFBF0",
                fontSize: 42,
              }}
            >
              🦖
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                  color: "#78716C",
                }}
              >
                Dinosaur Encyclopedia
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 84,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                DINODEX
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              maxWidth: 860,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 36,
                lineHeight: 1.2,
                color: "#292524",
              }}
            >
              Browse 30 dinosaurs, switch their growth stages, and explore a playful anime-style dino collection.
            </div>
            <div
              style={{
                display: "flex",
                gap: 14,
              }}
            >
              {["30 Species", "3 Growth Stages", "Static + Fast"].map((label, index) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    borderRadius: 999,
                    padding: "12px 20px",
                    fontSize: 22,
                    fontWeight: 700,
                    background:
                      index === 0 ? "#10B981" : index === 1 ? "#E11D48" : "#F59E0B",
                    color: "#FFFBF0",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
