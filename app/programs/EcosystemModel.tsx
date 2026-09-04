"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const DARK = "#1A1714";
const MUTED = "#5F5C57";
const FAINT = "#8E8A84";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface StepData {
  key: string;
  number: string;
  title: string;
  theme: string;
  purpose: string;
  /** One concrete, plain-language example — shown so the four pillars read as distinct. */
  example: string;
  /** Accent used for the numeral, sub-head, chevron watermark and markers. */
  color: string;
  /** Card field — a warm off-white, not a pastel. */
  bg: string;
  /** Deeper tone the visual panel fades out of. */
  bgDeep: string;
  icon: string;
  highlights: string[];
  cta: string;
  href: string;
  /** Fixed image for this step — takes precedence over program_step_images. */
  defaultImage?: string;
}

const ICONS = {
  sprout: `<path d="M12 21V10"></path><path d="M12 10C12 10 7.5 10.5 6 6.5C6 6.5 11 5.5 12 10Z"></path><path d="M12 10C12 10 16.5 10.5 18 6.5C18 6.5 13 5.5 12 10Z"></path>`,
  people: `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
  lightbulb: `<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path>`,
  database: `<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path>`,
};

const STEPS: StepData[] = [
  {
    key: "founder-development",
    number: "01",
    title: "Project Development",
    theme: "We help you strengthen an idea before you build it.",
    purpose:
      "One-on-one mentoring, technical guidance, and validation support for students, researchers, and founders working on an early-stage idea.",
    example: "Example: a student with a water-quality sensor concept gets matched with an engineer mentor to test and refine it before pitching.",
    color: "#D9531E",
    bg: "#FBF3EC",
    bgDeep: "#F3DFCD",
    icon: ICONS.sprout,
    highlights: ["Project Development Clinics", "Research & Innovation Mentoring", "Solution Validation", "Expert & Technical Assistance"],
    cta: "Explore Project Development",
    href: `${BP}/get-started`,
  },
  {
    key: "ecosystem-building",
    number: "02",
    title: "Ecosystem Collaboration",
    theme: "We introduce you to the people who can actually help.",
    purpose:
      "Warm introductions across government, universities, industry, and community groups — so you're not cold-emailing your way to the right partner.",
    example: "Example: a founder needing lab access gets introduced directly to a university research center that has one.",
    color: "#22596F",
    bg: "#EEF3F6",
    bgDeep: "#D5E3EA",
    icon: ICONS.people,
    highlights: ["Quadruple Helix Roundtables", "Research & Innovation Network", "Expert & Mentor Network", "Collaboration & Referral Platform"],
    cta: "Explore Ecosystem Collaboration",
    href: `${BP}/ecosystem`,
  },
  {
    key: "open-innovation",
    number: "03",
    title: "Open Innovation & City Adoption",
    theme: "We turn real city problems into challenges anyone can solve.",
    purpose:
      "Government offices and organizations post an actual problem they're facing; you build and pilot a solution, with a path to the City adopting it.",
    example: "Example: the traffic office posts a congestion problem; a local team builds and pilot-tests a fix on one busy street.",
    color: "#8E2749",
    bg: "#F8F0F3",
    bgDeep: "#EDD6DE",
    icon: ICONS.lightbulb,
    highlights: ["City Innovation Challenges", "Challenge Repository", "Solution Development Programs", "Innovation Pilot Program", "City Adoption Pathways"],
    cta: "Explore Open Innovation",
    href: `${BP}/challenges`,
    defaultImage: `${BP}/assets/programs-open-innovation.png`,
  },
  {
    key: "ecosystem-intelligence",
    number: "04",
    title: "Innovation Intelligence",
    theme: "We track the ecosystem so decisions use evidence, not guesses.",
    purpose:
      "Data on who's building what, where the gaps are, and what's working — published so programs and policy can respond to the real picture.",
    example: "Example: an annual report shows too few mentors for the health-tech sector, so the next mentor drive targets that gap.",
    color: "#17603A",
    bg: "#EFF4F1",
    bgDeep: "#D6E6DC",
    icon: ICONS.database,
    highlights: ["Innovation & Project Database", "Ecosystem Intelligence Dashboard", "Research & Innovation Needs Assessment", "Annual Innovation Report", "Knowledge Hub"],
    cta: "Explore Innovation Intelligence",
    href: `${BP}/knowledge`,
  },
];

function IconSvg({ path, size = 20, stroke = "currentColor", strokeWidth = 1.9 }: { path: string; size?: number; stroke?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
  );
}

/** The four-ridge Cordillera chevron used across the site, tinted to one accent. */
function ChevronMark({ color, width = 300, opacity = 0.16 }: { color: string; width?: number; opacity?: number }) {
  return (
    <svg width={width} height={width * 0.867} viewBox="0 0 120 104" fill="none" style={{ opacity }} aria-hidden>
      {[40, 60, 80, 100].map((y) => (
        <polyline key={y} points={`12,${y} 60,${y - 28} 108,${y}`} stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/**
 * The image panel. A Supabase-managed photo (or a code-level default) wins
 * when one exists; otherwise we compose a branded graphic (masked grid,
 * accent bloom, chevron watermark, ringed medallion) so an unset step still
 * reads as designed rather than blank.
 */
function StepVisual({ step, image, count }: { step: StepData; image?: string; count: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 20,
        overflow: "hidden",
        background: image ? step.bgDeep : `linear-gradient(155deg, ${step.bgDeep} 0%, ${step.bg} 52%, #FFFFFF 100%)`,
        border: "1px solid rgba(64,50,34,0.10)",
        boxShadow: "0 24px 48px -28px rgba(17,17,20,0.28), 0 2px 6px -2px rgba(17,17,20,0.06)",
      }}
    >
      {image ? (
        <img src={image} alt={step.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(64,50,34,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(64,50,34,0.05) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
              maskImage: "radial-gradient(circle at 60% 40%, #000 18%, transparent 72%)",
              WebkitMaskImage: "radial-gradient(circle at 60% 40%, #000 18%, transparent 72%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -90,
              right: -70,
              width: 340,
              height: 340,
              borderRadius: 9999,
              background: `radial-gradient(circle, ${step.color}26, transparent 68%)`,
            }}
          />
          <div style={{ position: "absolute", bottom: -52, left: -44, transform: "rotate(-8deg)" }}>
            <ChevronMark color={step.color} width={168} opacity={0.09} />
          </div>

          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ position: "absolute", width: 152, height: 152, borderRadius: 9999, border: `1px solid ${step.color}1A` }} />
              <span style={{ position: "absolute", width: 112, height: 112, borderRadius: 9999, border: `1px solid ${step.color}2B` }} />
              <div
                style={{
                  position: "relative",
                  width: 74,
                  height: 74,
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.78)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.9)",
                  boxShadow: "0 18px 34px -16px rgba(17,17,20,0.24)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSvg path={step.icon} size={34} stroke={step.color} strokeWidth={1.6} />
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(64,50,34,0.09)",
              boxShadow: "0 6px 16px -8px rgba(17,17,20,0.18)",
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: 9999, background: step.color }} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: MUTED }}>{count} programs</span>
          </div>
        </>
      )}
    </div>
  );
}

export default function EcosystemModel() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!supabase) return;
    async function loadImages() {
      const { data } = await supabase!.from("program_step_images").select("step,image_url");
      const map: Record<string, string> = {};
      (data ?? []).forEach((r: any) => {
        if (r.image_url) map[r.step] = r.image_url;
      });
      setImages(map);
    }
    loadImages();
    const channel = supabase
      .channel("public-program-step-images")
      .on("postgres_changes", { event: "*", schema: "public", table: "program_step_images" }, loadImages)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  // Scrollspy: whichever row is crossing the upper-middle band of the
  // viewport becomes "active" in the rail, so the numbered nav tracks scroll
  // position the way the pinned/receding cards used to.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = rowRefs.current.findIndex((el) => el === entry.target);
          if (idx !== -1) setActive(idx);
        });
      },
      { rootMargin: "-35% 0px -50% 0px", threshold: 0 }
    );
    rowRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section style={{ background: "#F6F2EA", padding: "64px 0 20px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div className="ib-programs-header" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40, alignItems: "end", marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F26522", marginBottom: 12 }}>Programs</div>
            <h2 style={{ margin: 0, fontSize: 38, fontWeight: 500, letterSpacing: "-0.025em", color: DARK, lineHeight: 1.12 }}>Four ways we support the ecosystem</h2>
          </div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: MUTED }}>
            From strengthening early ideas to coordinating partners, opening city challenges, and tracking what&rsquo;s working &mdash; our programs cover every stage of the innovation journey.
          </p>
        </div>

        <div className="ib-programs-grid" style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 48, alignItems: "start" }}>
          {/* RAIL */}
          <nav className="ib-programs-rail" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column" }}>
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <div key={s.key} style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: isActive ? s.color : FAINT,
                        transition: "color .35s ease",
                        width: 20,
                        flexShrink: 0,
                      }}
                    >
                      {s.number}
                    </span>
                    <span
                      style={{
                        width: isActive ? 10 : 7,
                        height: isActive ? 10 : 7,
                        borderRadius: 9999,
                        background: isActive ? s.color : "rgba(64,50,34,0.18)",
                        flexShrink: 0,
                        transition: "all .35s ease",
                        boxShadow: isActive ? `0 0 0 4px ${s.color}22` : "none",
                      }}
                    />
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 1, height: 44, marginLeft: 30.5, background: i < active ? s.color : "rgba(64,50,34,0.14)", opacity: i < active ? 0.4 : 1, transition: "background .35s ease" }} />
                  )}
                  <div
                    style={{
                      marginTop: 6,
                      marginBottom: i < STEPS.length - 1 ? 0 : 0,
                      marginLeft: 32,
                      fontSize: 12.5,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? DARK : FAINT,
                      lineHeight: 1.3,
                      maxWidth: 110,
                      transition: "color .35s ease",
                    }}
                  >
                    {s.title}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* ROWS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className="ib-program-row"
                style={{
                  background: s.bg,
                  border: "1px solid rgba(64,50,34,0.1)",
                  borderRadius: 24,
                  padding: 28,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 32,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 40,
                        height: 24,
                        padding: "0 10px",
                        borderRadius: 9999,
                        background: s.color,
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {s.number}
                    </span>
                    <span style={{ flex: 1, height: 1, background: `${s.color}26` }} />
                  </div>

                  <h3 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.15 }}>{s.title}</h3>
                  <p style={{ margin: "0 0 12px", fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: s.color, maxWidth: 400 }}>{s.theme}</p>
                  <p style={{ margin: "0 0 12px", fontSize: 13.5, lineHeight: 1.6, color: MUTED, maxWidth: 420 }}>{s.purpose}</p>
                  <p style={{ margin: "0 0 20px", fontSize: 12.5, lineHeight: 1.55, color: s.color, maxWidth: 420, fontStyle: "italic" }}>{s.example}</p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                    {s.highlights.map((h) => (
                      <span
                        key={h}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "6px 12px",
                          borderRadius: 9999,
                          background: "rgba(255,255,255,0.85)",
                          border: "1px solid rgba(64,50,34,0.1)",
                          fontSize: 12,
                          fontWeight: 600,
                          color: DARK,
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: 9999, background: s.color, flexShrink: 0 }} />
                        {h}
                      </span>
                    ))}
                  </div>

                  <a
                    href={s.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "#fff",
                      background: s.color,
                      padding: "11px 20px",
                      minHeight: 44,
                      boxSizing: "border-box",
                      borderRadius: 9999,
                      textDecoration: "none",
                    }}
                  >
                    {s.cta}
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </a>
                </div>

                <div style={{ height: 260 }}>
                  <StepVisual step={s} image={s.defaultImage || images[s.key]} count={s.highlights.length} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
