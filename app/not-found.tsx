import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Incubator Baguio",
  robots: { index: false, follow: false },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0B0B0D",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -180,
          left: "50%",
          transform: "translateX(-50%)",
          width: 640,
          height: 600,
          borderRadius: 9999,
          background: "radial-gradient(circle,rgba(242,101,34,0.22) 0%,transparent 62%)",
          pointerEvents: "none",
        }}
      />
      <svg
        style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", opacity: 0.1 }}
        width="760"
        height="360"
        viewBox="0 0 120 104"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <polyline points="6,40 60,8 114,40" stroke="#F5A623" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,62 60,30 114,62" stroke="#E23A2E" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,84 60,52 114,84" stroke="#9E2A52" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="6,106 60,74 114,106" stroke="#285E7A" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div style={{ position: "relative", maxWidth: 560 }}>
        <a href={`${BP}/`} style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 40 }}>
          <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ height: 36, width: "auto" }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>Incubator Baguio</span>
        </a>

        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            background: "linear-gradient(135deg,#F26522 20%,#F5A623 80%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 18,
          }}
        >
          404
        </div>

        <h1 style={{ margin: "0 0 14px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.025em", color: "#fff" }}>
          This trail doesn&rsquo;t exist
        </h1>
        <p style={{ margin: "0 auto 34px", fontSize: 15.5, lineHeight: 1.65, color: "rgba(255,255,255,0.6)", maxWidth: 420 }}>
          The page you&rsquo;re looking for may have moved, or the link might be broken. Let&rsquo;s get you back on the path.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href={`${BP}/`}
            className="ib-cta-orange"
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#F26522", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}
          >
            Back to home
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a
            href={`${BP}/ecosystem`}
            className="ib-cta-ghost"
            style={{ display: "inline-flex", alignItems: "center", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 26px", borderRadius: 9999, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)" }}
          >
            Explore the ecosystem
          </a>
        </div>
      </div>
    </main>
  );
}
