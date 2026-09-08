import fs from "fs";
import path from "path";

const ORANGE = "#F26522";
const DARK = "#1A1714";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The four card photos aren't in the repo yet. Rather than ship an <img>
// that 404s on every visit (and needs a client-side onError to hide), this
// stays a server component and just checks whether the file is actually
// there — drop a photo into /public/assets and it replaces the tinted
// placeholder on the next build, with no code change.
function photoIfPresent(file: string): string | null {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "assets", file)) ? `${BP}/assets/${file}` : null;
  } catch {
    return null;
  }
}

interface Path {
  key: string;
  title: string;
  blurb: string;
  cta: string;
  href: string;
  /** Badge colour; also tints the placeholder shown until a photo is added. */
  color: string;
  icon: React.ReactNode;
  /** Filename expected in /public/assets — see photoIfPresent above. */
  image: string;
}

const PATHS: Path[] = [
  {
    key: "students",
    title: "Students",
    blurb: "Find competitions, programs, mentors, challenges, and people to build with.",
    cta: "Explore for Students",
    href: `${BP}/programs#students`,
    color: ORANGE,
    image: "path-students.png",
    icon: (
      <>
        <path d="M12 3 2 8l10 5 10-5-10-5Z" />
        <path d="M6 10.6V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.4" />
        <path d="M22 8v6" />
      </>
    ),
  },
  {
    key: "startups",
    title: "Startups & Founders",
    blurb: "Get support to develop, validate, and grow your startup.",
    cta: "Explore for Startups",
    href: `${BP}/programs#startups`,
    color: "#22345C",
    image: "path-startups.png",
    icon: (
      <>
        <path d="M12 2.5c3 2 4.8 5.4 4.8 9.2L17 17H7l.2-5.3c0-3.8 1.8-7.2 4.8-9.2Z" />
        <circle cx="12" cy="10" r="2" />
        <path d="M7 15.5 4.5 18l1.2 3 2.6-1.3M17 15.5 19.5 18l-1.2 3-2.6-1.3" />
      </>
    ),
  },
  {
    key: "researchers",
    title: "Researchers",
    blurb: "Turn research into real-world solutions through collaboration and innovation.",
    cta: "Explore for Researchers",
    href: `${BP}/programs#researchers`,
    color: "#1A6B3C",
    image: "path-researchers.png",
    icon: (
      <>
        <path d="M9 3v6l-5 9.5A2 2 0 0 0 5.7 21h12.6a2 2 0 0 0 1.7-2.5L15 9V3" />
        <path d="M8 3h8M7.5 14.5h9" />
      </>
    ),
  },
  {
    key: "organizations",
    title: "Organizations",
    blurb: "Post challenges, find innovators, and collaborate on solutions for a stronger Baguio.",
    cta: "Explore for Organizations",
    href: `${BP}/programs#organizations`,
    color: "#7C5CD6",
    image: "path-organizations.png",
    icon: (
      <>
        <path d="M4 21V7l8-4 8 4v14M4 21h16" />
        <path d="M9 21v-6h6v6M8.5 10h1.5M14 10h1.5" />
      </>
    ),
  },
];

/** Faint Cordillera ridge + pine, echoing the chevron motif used site-wide. */
function RidgeArt() {
  return (
    <svg width="420" height="260" viewBox="0 0 420 260" fill="none" aria-hidden style={{ display: "block" }}>
      <g stroke="#403222" strokeOpacity="0.14" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M0 96 74 40l40 30 38-24 52 42 44-28 66 50 106-58" />
        <path d="M0 130 96 74l58 40 60-34 78 56 128-64" />
        <path d="M62 246v-30M62 216l-26 12M62 216l26 12M62 196l-22 10M62 196l22 10" />
        <path d="M62 150 34 200h56L62 150ZM62 178l-34 44h68l-34-44Z" />
      </g>
    </svg>
  );
}

export default function FindYourPath() {
  return (
    <section style={{ background: "#FCFAF6", padding: "84px 40px", position: "relative", overflow: "hidden" }}>
      <div className="ib-findpath-ridge" style={{ position: "absolute", left: -40, top: 60, pointerEvents: "none" }}>
        <RidgeArt />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "relative", textAlign: "center", marginBottom: 52 }}>
          <div className="ib-findpath-note" style={{ position: "absolute", right: 0, top: -6, textAlign: "left", pointerEvents: "none" }}>
            <div
              style={{
                fontFamily: "'Segoe Script', 'Bradley Hand', 'Brush Script MT', cursive",
                fontSize: 17,
                lineHeight: 1.45,
                color: "#6E685F",
                transform: "rotate(-4deg)",
              }}
            >
              Ideas
              <br />
              People
              <br />
              Impact
              <br />
              A stronger
              <br />
              Baguio.
            </div>
            <svg width="96" height="12" viewBox="0 0 96 12" fill="none" style={{ marginTop: 2, transform: "rotate(-4deg)" }} aria-hidden>
              <path d="M3 8c22-6 52-7 90-3" stroke={ORANGE} strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>
            Find your path
          </div>
          <h2 style={{ margin: "0 0 14px", fontSize: 44, fontWeight: 600, letterSpacing: "-0.03em", color: DARK, lineHeight: 1.1 }}>
            What brings you to
            <br />
            <span style={{ color: ORANGE }}>Incubator Baguio?</span>
          </h2>
          <p style={{ margin: "0 auto", fontSize: 16, lineHeight: 1.6, color: "#5A544B", maxWidth: 620 }}>
            Explore the programs, opportunities, and resources that fit your journey.
          </p>
        </div>

        <div className="ib-findpath-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
          {PATHS.map((p) => {
            const photo = photoIfPresent(p.image);
            return (
            <a
              key={p.key}
              href={p.href}
              className="ib-findpath-card"
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                border: "1px solid rgba(64,50,34,0.09)",
                borderRadius: 18,
                overflow: "hidden",
                textDecoration: "none",
                boxShadow: "var(--ib-shadow-sm)",
              }}
            >
              <div style={{ position: "relative", height: 190, background: `linear-gradient(150deg, ${p.color}2E 0%, ${p.color}14 60%, #F6F2EA 100%)` }}>
                {photo ? (
                  <img src={photo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.22 }}>
                    <svg width="62" height="62" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                      {p.icon}
                    </svg>
                  </span>
                )}
                <span
                  style={{
                    position: "absolute",
                    left: 22,
                    bottom: -26,
                    width: 54,
                    height: 54,
                    borderRadius: 9999,
                    background: p.color,
                    border: "3px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 16px -6px rgba(17,17,20,0.4)",
                  }}
                >
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                    {p.icon}
                  </svg>
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "42px 24px 22px" }}>
                <h3 style={{ margin: "0 0 9px", fontSize: 21, fontWeight: 600, letterSpacing: "-0.015em", color: DARK }}>{p.title}</h3>
                <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.6, color: "#5A544B", flex: 1 }}>{p.blurb}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: ORANGE }}>{p.cta}</span>
                  <span
                    className="ib-findpath-arrow"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9999,
                      background: "rgba(242,101,34,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </a>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 44 }}>
          <span style={{ flex: 1, height: 1, background: "rgba(64,50,34,0.13)" }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8B8479", whiteSpace: "nowrap" }}>
            Different journeys. A stronger Baguio.
          </span>
          <span style={{ flex: 1, height: 1, background: "rgba(64,50,34,0.13)" }} />
        </div>
      </div>
    </section>
  );
}
