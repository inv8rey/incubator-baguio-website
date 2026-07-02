"use client";

import { useEffect, useRef, useState } from "react";

const ORANGE = "#F26522";
const DARK = "#141417";

interface InfoItem {
  icon: string;
  label: string;
}

interface StepData {
  key: string;
  number: string;
  title: string;
  theme: string;
  purpose: string;
  color: string;
  bg: string;
  icon: string;
  whoFor: InfoItem[];
  whatWeDo: string[];
  outcomes: InfoItem[];
}

const ICONS = {
  person: `<circle cx="12" cy="8" r="4"></circle><path d="M5 21v-1a7 7 0 0 1 14 0v1"></path>`,
  gradCap: `<path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path>`,
  flask: `<path d="M9 2v6l-5 9.5A2 2 0 0 0 5.7 21h12.6a2 2 0 0 0 1.7-3.5L15 8V2"></path><path d="M7.5 14.5h9"></path><path d="M8 2h8"></path>`,
  briefcase: `<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"></path><path d="M3 12h18"></path>`,
  institution: `<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a3 3 0 0 1 6 0v4"></path>`,
  coins: `<ellipse cx="9" cy="7" rx="6" ry="3"></ellipse><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7"></path><path d="M3 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-2"></path>`,
  people: `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
  chart: `<path d="M3 17 9 11l4 4 8-8"></path><path d="M15 6h6v6"></path>`,
  sprout: `<path d="M12 21V10"></path><path d="M12 10C12 10 7.5 10.5 6 6.5C6 6.5 11 5.5 12 10Z"></path><path d="M12 10C12 10 16.5 10.5 18 6.5C18 6.5 13 5.5 12 10Z"></path>`,
  refresh: `<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M3 16v5h5"></path><path d="M21 8V3h-5"></path>`,
  lightbulb: `<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path>`,
  globe: `<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"></path>`,
  database: `<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path>`,
};

const STEPS: StepData[] = [
  {
    key: "enable",
    number: "01",
    title: "ENABLE",
    theme: "Help founders build.",
    purpose: "We equip aspiring founders and early-stage innovators with the resources, knowledge, and support they need to turn ideas into startups.",
    color: ORANGE,
    bg: "rgba(242,101,34,0.12)",
    icon: ICONS.sprout,
    whoFor: [
      { icon: ICONS.person, label: "Aspiring Founders" },
      { icon: ICONS.gradCap, label: "Students" },
      { icon: ICONS.flask, label: "Researchers" },
      { icon: ICONS.briefcase, label: "Early-stage Startups" },
    ],
    whatWeDo: ["Founder Discovery", "Startup Incubation", "Founder Education", "Mentorship", "Product Validation", "Business Development", "Startup Resources", "Digital Tools"],
    outcomes: [
      { icon: ICONS.lightbulb, label: "More validated ideas" },
      { icon: ICONS.person, label: "More confident founders" },
      { icon: ICONS.sprout, label: "More startups created" },
      { icon: ICONS.briefcase, label: "Stronger early-stage ventures" },
    ],
  },
  {
    key: "engage",
    number: "02",
    title: "ENGAGE",
    theme: "Bring the ecosystem together.",
    purpose: "We connect founders, universities, government, industry, investors, and communities into one collaborative innovation ecosystem.",
    color: "#285E7A",
    bg: "rgba(40,94,122,0.12)",
    icon: ICONS.people,
    whoFor: [
      { icon: ICONS.institution, label: "Universities" },
      { icon: ICONS.institution, label: "Government Agencies" },
      { icon: ICONS.people, label: "Mentors & Investors" },
      { icon: ICONS.globe, label: "Community Groups" },
    ],
    whatWeDo: ["Community Events", "Startup Meetups", "Ecosystem Mapping", "Partnership Development", "University Engagement", "Government Collaboration", "Corporate Innovation", "Mentor Network"],
    outcomes: [
      { icon: ICONS.people, label: "Stronger partnerships" },
      { icon: ICONS.globe, label: "Better collaboration" },
      { icon: ICONS.institution, label: "Connected ecosystem" },
    ],
  },
  {
    key: "expand",
    number: "03",
    title: "EXPAND",
    theme: "Create opportunities for growth.",
    purpose: "We support startups through capital, markets, talent, and strategic partnerships.",
    color: "#9E2A52",
    bg: "rgba(158,42,82,0.12)",
    icon: ICONS.chart,
    whoFor: [
      { icon: ICONS.briefcase, label: "Growing Startups" },
      { icon: ICONS.coins, label: "Investors" },
      { icon: ICONS.institution, label: "Corporate Partners" },
      { icon: ICONS.globe, label: "New Markets" },
    ],
    whatWeDo: ["Investment Readiness", "Investor Matching", "Grant Facilitation", "Market Access", "Internationalization", "Talent Development", "Customer Matching"],
    outcomes: [
      { icon: ICONS.chart, label: "Growing startups" },
      { icon: ICONS.coins, label: "Increased investment" },
      { icon: ICONS.globe, label: "Expanded markets" },
    ],
  },
  {
    key: "evolve",
    number: "04",
    title: "EVOLVE",
    theme: "Strengthen the ecosystem.",
    purpose: "We continuously strengthen the ecosystem through collaboration, ecosystem intelligence, policy, data, and shared digital infrastructure.",
    color: "#1A6B3C",
    bg: "rgba(26,107,60,0.12)",
    icon: ICONS.refresh,
    whoFor: [
      { icon: ICONS.people, label: "Ecosystem Partners" },
      { icon: ICONS.institution, label: "Policy Makers" },
      { icon: ICONS.flask, label: "Research Institutions" },
      { icon: ICONS.globe, label: "The Whole City" },
    ],
    whatWeDo: ["Ecosystem Research", "Policy Development", "Startup Database", "Ecosystem Intelligence", "Impact Measurement", "Digital Platforms", "Annual Ecosystem Report"],
    outcomes: [
      { icon: ICONS.refresh, label: "Stronger ecosystem" },
      { icon: ICONS.institution, label: "Better policies" },
      { icon: ICONS.database, label: "Data-driven decisions" },
      { icon: ICONS.sprout, label: "Sustainable ecosystem growth" },
    ],
  },
];

// Satellite node layout for the evolving diagram (viewBox 0 0 500 500, center 250,250)
const NODES = [
  { key: "university", label: "Universities", x: 250, y: 96, icon: ICONS.institution, revealAt: 1 },
  { key: "investor", label: "Investors", x: 372, y: 148, icon: ICONS.coins, revealAt: 2 },
  { key: "government", label: "Government", x: 412, y: 250, icon: ICONS.institution, revealAt: 1 },
  { key: "community", label: "Community", x: 250, y: 404, icon: ICONS.globe, revealAt: 1 },
  { key: "market", label: "Markets", x: 128, y: 352, icon: ICONS.chart, revealAt: 2 },
  { key: "mentor", label: "Mentors", x: 88, y: 250, icon: ICONS.people, revealAt: 1 },
];

const MESH_LOOP = ["university", "investor", "government", "community", "market", "mentor", "university"];

function IconSvg({ path, size = 20, stroke = "currentColor", strokeWidth = 1.9 }: { path: string; size?: number; stroke?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
  );
}

function EcosystemIllustration({ active }: { active: number }) {
  const nodeByKey = Object.fromEntries(NODES.map((n) => [n.key, n]));
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 520, height: 520, borderRadius: "9999px", background: `radial-gradient(circle, ${STEPS[active].color}22 0%, transparent 68%)`, transition: "background 0.7s ease" }} />
      <svg viewBox="0 0 500 500" width="100%" height="100%" style={{ maxWidth: 640, maxHeight: 640 }}>
        {/* backdrop mountain skyline, reused site visual language */}
        <g opacity={0.35} stroke="#D9D4C8" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <polyline points="20,470 120,380 220,470" />
          <polyline points="260,470 340,360 420,470" />
        </g>

        {/* evolve: enclosing mesh loop */}
        <polyline
          points={MESH_LOOP.map((k) => `${nodeByKey[k].x},${nodeByKey[k].y}`).join(" ")}
          fill="none"
          stroke={STEPS[3].color}
          strokeWidth={1.5}
          strokeDasharray="4 5"
          style={{ opacity: active >= 3 ? 0.55 : 0, transition: "opacity 0.8s ease" }}
        />

        {/* spokes: center to each node */}
        {NODES.map((n) => (
          <line
            key={`spoke-${n.key}`}
            x1={250}
            y1={250}
            x2={n.x}
            y2={n.y}
            stroke={STEPS[active].color}
            strokeWidth={2}
            style={{ opacity: active >= n.revealAt ? 0.5 : 0, transition: "opacity 0.7s ease, stroke 0.7s ease" }}
          />
        ))}

        {/* satellite nodes */}
        {NODES.map((n) => (
          <g key={n.key} style={{ opacity: active >= n.revealAt ? 1 : 0, transform: active >= n.revealAt ? "scale(1)" : "scale(0.5)", transformOrigin: `${n.x}px ${n.y}px`, transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <circle cx={n.x} cy={n.y} r={30} fill="#fff" stroke={STEPS[active].color} strokeWidth={1.5} />
            <foreignObject x={n.x - 14} y={n.y - 14} width={28} height={28}>
              <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconSvg path={n.icon} size={16} stroke={STEPS[active].color} />
              </div>
            </foreignObject>
          </g>
        ))}

        {/* center founder node */}
        <circle cx={250} cy={250} r={44} fill={STEPS[active].color} style={{ transition: "fill 0.7s ease" }} />
        <foreignObject x={250 - 20} y={250 - 20} width={40} height={40}>
          <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconSvg path={ICONS.lightbulb} size={22} stroke="#fff" strokeWidth={1.8} />
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}

function InfoCard({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
        <IconSvg path={icon} size={15} stroke={ORANGE} strokeWidth={2.2} />
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B" }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default function EcosystemModel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setActive(0);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const p = scrolled / total;
      const idx = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length + 0.0001));
      setActive(idx);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function goToStep(i: number) {
    const el = wrapRef.current;
    if (!el) return;
    const total = el.getBoundingClientRect().height - window.innerHeight;
    const targetP = (i + 0.25) / STEPS.length;
    const targetScroll = window.scrollY + el.getBoundingClientRect().top + targetP * total;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }

  const step = STEPS[active];

  return (
    <>
      {/* DESKTOP: sticky scrollytelling */}
      <section ref={wrapRef} className="ib-4e-wrap" style={{ position: "relative", height: `${STEPS.length * 100}vh`, background: "#fff" }}>
        <div className="ib-4e-sticky" style={{ position: "sticky", top: 0, height: "100vh", background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 0, minHeight: 0, maxWidth: 1320, width: "100%", margin: "0 auto", padding: "40px 40px 0", alignItems: "stretch", position: "relative" }}>
            {/* Illustration */}
            <div style={{ height: "100%", position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ flexShrink: 0, marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>The 4E Ecosystem Operating Model</div>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.15 }}>A cycle of action. <span style={{ color: ORANGE }}>Endless possibilities.</span></h2>
              </div>
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <EcosystemIllustration active={active} />
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: 56, display: "flex", flexDirection: "column", justifyContent: "center" }} className="ib-4e-content">
              <div style={{ fontSize: 14, fontWeight: 700, color: "#9A958B", marginBottom: 18 }}>{step.number} / 0{STEPS.length}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                <div style={{ width: 68, height: 68, borderRadius: 9999, background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.5s ease" }}>
                  <IconSvg path={step.icon} size={32} stroke="#fff" strokeWidth={1.7} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 38, fontWeight: 800, letterSpacing: "-0.01em", color: DARK, lineHeight: 1.05 }}>{step.title}</h3>
                  <div style={{ fontSize: 16, fontWeight: 600, color: step.color, marginTop: 4, transition: "color 0.5s ease" }}>{step.theme}</div>
                </div>
              </div>
              <p style={{ margin: "0 0 30px", fontSize: 15.5, lineHeight: 1.65, color: "#6B6B73", maxWidth: 520 }}>{step.purpose}</p>

              <div style={{ display: "flex", gap: 48, paddingTop: 28, borderTop: "1px solid rgba(20,20,25,0.08)" }} className="ib-4e-cards">
                <InfoCard label="Who is this for?" icon={ICONS.gradCap}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "9px 20px" }}>
                    {step.whoFor.map((w) => (
                      <div key={w.label} style={{ fontSize: 13, color: "#44444C", lineHeight: 1.4 }}>{w.label}</div>
                    ))}
                  </div>
                </InfoCard>
                <InfoCard label="What we do" icon={ICONS.briefcase}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px" }}>
                    {step.whatWeDo.map((w) => (
                      <div key={w} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "#44444C", lineHeight: 1.35 }}>
                        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transition: "stroke 0.5s ease" }}><path d="M20 6 9 17l-5-5" /></svg>
                        {w}
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </div>

              <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                  <IconSvg path={ICONS.chart} size={15} stroke={ORANGE} strokeWidth={2.2} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B" }}>Expected outcomes</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {step.outcomes.map((o) => (
                    <span key={o.label} style={{ fontSize: 13, fontWeight: 600, color: step.color, background: step.bg, padding: "8px 16px", borderRadius: 9999, transition: "color 0.5s ease, background 0.5s ease" }}>{o.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vertical timeline, far right */}
            <div className="ib-4e-timeline" style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              {STEPS.map((s, i) => (
                <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => goToStep(i)}
                    aria-label={`Go to ${s.title}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9999,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: i <= active ? "#fff" : "#9A958B",
                      background: i <= active ? step.color : "#F4F2EC",
                      transition: "background 0.5s ease, color 0.5s ease",
                      flexShrink: 0,
                    }}
                  >
                    {s.number}
                  </button>
                  <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.05em", color: i === active ? DARK : "#C9C5BB", margin: "4px 0", transition: "color 0.4s ease" }}>{s.title}</span>
                  {i < STEPS.length - 1 && <span style={{ width: 1.5, height: 26, background: i < active ? step.color : "rgba(20,20,25,0.12)", transition: "background 0.4s ease" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom step bar */}
          <div style={{ flexShrink: 0, padding: "16px 40px", borderTop: "1px solid rgba(20,20,25,0.07)" }}>
            <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", alignItems: "center", background: "#FAFAF7", borderRadius: 16, padding: "10px 18px" }} className="ib-4e-bottombar">
              {STEPS.map((s, i) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => goToStep(i)}
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "6px 8px", borderRadius: 10, minWidth: 0, opacity: i === active ? 1 : 0.55, transition: "opacity 0.4s ease" }}
                  >
                    <span style={{ width: 26, height: 26, borderRadius: 9999, background: i === active ? s.color : "#fff", border: `1.5px solid ${i === active ? s.color : "rgba(20,20,25,0.15)"}`, color: i === active ? "#fff" : "#9A958B", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.4s ease, border-color 0.4s ease" }}>
                      {s.number}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: DARK, whiteSpace: "nowrap" }}>{s.title}</div>
                      <div className="ib-4e-bottombar-theme" style={{ fontSize: 10.5, color: "#9A958B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.theme}</div>
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#C9C5BB" strokeWidth={2.4} style={{ flexShrink: 0, margin: "0 4px" }}><path d="m9 6 6 6-6 6" /></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE fallback: stacked, non-sticky */}
      <section className="ib-4e-mobile" style={{ background: "#fff", padding: "56px 24px", display: "none" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>The 4E Ecosystem Operating Model</div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: DARK }}>A cycle of action. <span style={{ color: ORANGE }}>Endless possibilities.</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {STEPS.map((s) => (
            <div key={s.key} style={{ border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, padding: "26px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 9999, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconSvg path={s.icon} size={22} stroke="#fff" strokeWidth={1.8} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9A958B" }}>{s.number} / 0{STEPS.length}</div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: DARK }}>{s.title}</h3>
                </div>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: s.color, marginBottom: 10 }}>{s.theme}</div>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.6, color: "#6B6B73" }}>{s.purpose}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 14, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 8 }}>Who is this for?</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {s.whoFor.map((w) => <span key={w.label} style={{ fontSize: 11.5, color: "#44444C", background: "#F4F2EC", padding: "5px 10px", borderRadius: 9999 }}>{w.label}</span>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 8 }}>What we do</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 10px" }}>
                    {s.whatWeDo.map((w) => (
                      <div key={w} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#44444C" }}>
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 8 }}>Expected outcomes</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                    {s.outcomes.map((o) => <span key={o.label} style={{ fontSize: 11.5, color: s.color, background: s.bg, padding: "5px 10px", borderRadius: 9999, fontWeight: 600 }}>{o.label}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
