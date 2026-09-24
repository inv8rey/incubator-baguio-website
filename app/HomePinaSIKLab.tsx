import { REGISTER_URL } from "./pinasiklab/config";

const ORANGE = "#F26522";

const META = ["October 30–31, 2026", "Baguio City", "Ages 18–30", "30 teams"];

// Sits directly under <HomeEvents />, so it shares that section's cream
// background and drops the top padding to read as its featured footer.
export default function HomePinaSIKLab({ bp }: { bp: string }) {
  return (
    <div style={{ background: "#FCFAF6", padding: "0 40px 92px" }}>
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          position: "relative",
          overflow: "hidden",
          background: "#131110",
          borderRadius: 22,
          padding: "40px 44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "absolute", top: -110, right: -70, width: 420, height: 420, background: "radial-gradient(circle,rgba(242,101,34,0.26),transparent 65%)", pointerEvents: "none" }} />
        <svg aria-hidden="true" width="300" height="260" viewBox="0 0 120 104" fill="none" style={{ position: "absolute", right: -30, bottom: -40, opacity: 0.08, pointerEvents: "none" }}>
          <polyline points="12,40 60,12 108,40" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="12,62 60,34 108,62" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="12,84 60,56 108,84" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div style={{ position: "relative", flex: "1 1 460px", minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 8px", borderRadius: 9999, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", marginBottom: 18 }}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 9999, background: "rgba(242,101,34,0.18)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 9999, background: ORANGE }} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>Featured program &middot; UNDP Youth Co:Lab</span>
          </div>
          <h2 style={{ margin: "0 0 10px", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.08, color: "#fff" }}>
            PinaSIKLab <span style={{ color: ORANGE }}>Baguio 2026</span>
          </h2>
          <p style={{ margin: "0 0 20px", fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,0.68)", maxWidth: 560 }}>
            Youth innovation for Baguio and the BLISTT area. Build AI and digitally enabled solutions to real community and climate challenges in a two-day sprint.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {META.map((m) => (
              <span key={m} style={{ padding: "7px 14px", borderRadius: 9999, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.86)" }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div style={{ position: "relative", display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ib-cta-orange"
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: ORANGE, color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}
          >
            Register now
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <a
            href={`${bp}/pinasiklab/`}
            style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            Learn more
          </a>
        </div>
      </div>
    </div>
  );
}
