import { ImageResponse } from "next/og";

// A plain Route Handler (not the app/opengraph-image.tsx file convention)
// so we can reference its exact trailing-slash URL in layout.tsx metadata
// without Next.js silently overriding openGraph.images with its own
// auto-detected (non-trailing-slash) URL for the convention-based route.
export const runtime = "edge";

const size = { width: 1200, height: 630 };

export async function GET() {
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
          background: "#0B0B0D",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: "50%",
            transform: "translateX(-50%)",
            width: 820,
            height: 700,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(242,101,34,0.35) 0%, transparent 62%)",
            display: "flex",
          }}
        />
        <svg width={340} height={190} viewBox="0 0 120 104" fill="none" style={{ marginBottom: 36 }}>
          <polyline points="6,40 60,8 114,40" stroke="#F5A623" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="6,62 60,30 114,62" stroke="#E23A2E" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="6,84 60,52 114,84" stroke="#9E2A52" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="6,106 60,74 114,106" stroke="#285E7A" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            fontSize: 62,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.15,
            padding: "0 90px",
          }}
        >
          <span>Building&nbsp;Baguio&rsquo;s&nbsp;Innovation&nbsp;and&nbsp;</span>
          <span style={{ color: "#F26522" }}>Startup&nbsp;Ecosystem.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 24,
            fontWeight: 500,
            color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.02em",
          }}
        >
          incubator-baguio.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
