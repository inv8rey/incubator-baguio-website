const ORANGE = "#F26522";
const DARK = "#1A1714";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const FEATURES: { title: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: "Meaningful connections",
    desc: "Network with innovators, mentors, organizations, and experts.",
    icon: (
      <>
        <circle cx={9} cy={8} r={3.5} />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx={17} cy={7} r={2.5} />
        <path d="M21 19c0-2.4-1.8-4.5-4-5" />
      </>
    ),
  },
  {
    title: "Discover opportunities",
    desc: "Find challenges, programs, events, and resources made for you.",
    icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    title: "Create real impact",
    desc: "Share ideas, build solutions, and grow together.",
    icon: <><path d="M3 21h18" /><path d="M7 21V10M12 21V4M17 21v-7" /></>,
  },
];

export default function AuthShell({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", background: "#F6F2EA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 1320, marginBottom: 14 }}>
        <a
          href={`${BP}/`}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: DARK, textDecoration: "none" }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          Back to home
        </a>
      </div>
      <div
        className="ib-auth-shell"
        style={{
          width: "100%",
          maxWidth: 1320,
          background: "#fff",
          borderRadius: 28,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          boxShadow: "0 30px 80px rgba(26,23,20,0.14)",
        }}
      >
        {/* LEFT — branding */}
        <div className="ib-auth-left" style={{ position: "relative", background: "#F6F2EA", padding: "48px 52px 32px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 640 }}>
          <img
            src={`${BP}/assets/baguio-cathedral-sunset.png`}
            alt=""
            aria-hidden
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center bottom", zIndex: 0 }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(246,242,234,0.97) 0%, rgba(246,242,234,0.88) 26%, rgba(246,242,234,0.4) 48%, rgba(246,242,234,0.05) 64%, rgba(246,242,234,0) 72%)",
              zIndex: 1,
            }}
          />

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", flex: 1 }}>
            <a href={`${BP}/`} style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 44 }}>
              <img src={`${BP}/assets/ib-icon.png`} alt="Incubator Baguio" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "contain" }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: DARK, lineHeight: 1.2 }}>Incubator Baguio</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B8479", marginTop: 2 }}>Baguio City&rsquo;s Innovation Platform</div>
              </div>
            </a>

            <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.02em", color: DARK }}>
              Be part of Baguio&rsquo;s <span style={{ color: ORANGE }}>innovation ecosystem.</span>
            </h1>
            <p style={{ margin: "18px 0 0", fontSize: 15, lineHeight: 1.6, color: "#5A544B", maxWidth: 380 }}>
              Connect, collaborate, and create impact with innovators, organizations, and change makers in our city.
            </p>

            <div style={{ marginTop: 32, background: "#fff", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 18, padding: 22, boxShadow: "0 18px 40px -18px rgba(26,23,20,0.22)", display: "flex", flexDirection: "column", gap: 16 }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(242,101,34,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
                  </span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{f.title}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "#8B8479", marginTop: 2 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ flex: 1, minHeight: 130 }} />
            <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: ORANGE, boxShadow: "0 0 0 1px rgba(255,255,255,0.5)" }} />
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.55)", boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }} />
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: "rgba(255,255,255,0.55)", boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }} />
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ib-auth-right" style={{ padding: "52px 64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: 9999, background: ORANGE, display: "inline-block" }} />
            {eyebrow}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
