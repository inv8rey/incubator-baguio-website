"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface StepData {
  key: string;
  /** Canonical short name — used by the nav's hover mega-menu and the About
   * page's mirrored pillar cards, so it stays a short label rather than the
   * longer on-card headline below. */
  title: string;
  /** One-line tagline shown as the nav mega-menu's item subtext. */
  theme: string;
  /** Small uppercase label on the card (e.g. "BUILD PROJECTS"). */
  eyebrow: string;
  /** The card's large headline (e.g. "Turn your idea into a project."). */
  headline: string;
  /** Short supporting sentence under the headline. */
  blurb: string;
  /** Card CTA button label (e.g. "Learn more"). */
  ctaLabel: string;
  /** Accent used for the icon badge ring and the no-photo gradient fallback. */
  color: string;
  icon: string;
  href: string;
}

const ICONS = {
  lightbulb: `<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path>`,
  people: `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
  target: `<circle cx="12" cy="12" r="8.5"></circle><circle cx="12" cy="12" r="4.5"></circle><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"></circle>`,
  book: `<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5v-13Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5v-13Z"></path>`,
};

const STEPS: StepData[] = [
  {
    key: "founder-development",
    title: "Project Development",
    theme: "We help you strengthen an idea before you build it.",
    eyebrow: "Build Projects",
    headline: "Turn your idea into a project.",
    blurb: "Get guidance and support to develop and test your idea.",
    ctaLabel: "Learn more",
    color: "#D9531E",
    icon: ICONS.lightbulb,
    href: `${BP}/get-started`,
  },
  {
    key: "ecosystem-building",
    title: "Ecosystem Collaboration",
    theme: "We introduce you to the people who can actually help.",
    eyebrow: "Connect People",
    headline: "Find the right people.",
    blurb: "Meet founders, mentors, researchers, investors, and partners from the Baguio innovation community.",
    ctaLabel: "Explore the ecosystem",
    color: "#22596F",
    icon: ICONS.people,
    href: `${BP}/ecosystem`,
  },
  {
    key: "open-innovation",
    title: "Open Innovation & City Adoption",
    theme: "We turn real city problems into challenges anyone can solve.",
    eyebrow: "Solve Challenges",
    headline: "Work on real problems in Baguio.",
    blurb: "Browse open challenges or submit a challenge for your organization.",
    ctaLabel: "View challenges",
    color: "#8E2749",
    icon: ICONS.target,
    href: `${BP}/challenges`,
  },
  {
    key: "ecosystem-intelligence",
    title: "Innovation Intelligence",
    theme: "We track the ecosystem so decisions use evidence, not guesses.",
    eyebrow: "Find Opportunities",
    headline: "Discover resources and opportunities.",
    blurb: "Access funding, programs, research, training, and other resources to help you move forward.",
    ctaLabel: "Explore opportunities",
    color: "#17603A",
    icon: ICONS.book,
    href: `${BP}/knowledge`,
  },
];

// Single source of truth for the four pillars — reused by the nav's hover
// mega-menu (NavMegaMenu.tsx) so it can't drift out of sync with this list
// the way app/about/page.tsx's separate hardcoded copy once did.
export const NAV_PILLARS = STEPS.map(({ title, href, theme }) => ({ title, href, theme }));

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

function ProgramCard({ step, image }: { step: StepData; image?: string }) {
  return (
    <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 400, border: "1px solid rgba(255,255,255,0.08)" }}>
      {image ? (
        <img src={image} alt={step.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${step.color}4D 0%, #14110D 78%)` }}>
          <div style={{ position: "absolute", bottom: -40, right: -40, transform: "rotate(6deg)" }}>
            <ChevronMark color={step.color} width={200} opacity={0.16} />
          </div>
        </div>
      )}
      {/* Legibility gradients. The horizontal one carries the work — text sits
          in the dark left half while the photo stays visible on the right,
          matching the reference design. The vertical one is a backstop for
          tall/stacked mobile cards, where the text block ends up lower. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(14,11,9,0.96) 0%, rgba(14,11,9,0.9) 34%, rgba(14,11,9,0.62) 58%, rgba(14,11,9,0.3) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(14,11,9,0.25) 0%, rgba(14,11,9,0.1) 45%, rgba(14,11,9,0.75) 100%)",
        }}
      />
      <div style={{ position: "relative", height: "100%", minHeight: "inherit", display: "flex", flexDirection: "column", justifyContent: "center", padding: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 9999,
              flexShrink: 0,
              background: `${step.color}2E`,
              border: `1.5px solid ${step.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSvg path={step.icon} size={19} stroke={step.color} strokeWidth={1.9} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)" }}>
            {step.eyebrow}
          </div>
        </div>
        <h3 style={{ margin: "0 0 12px", fontSize: 27, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.2, maxWidth: 300 }}>{step.headline}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", maxWidth: 320 }}>{step.blurb}</p>
        <a
          href={step.href}
          style={{
            alignSelf: "flex-start",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13.5,
            fontWeight: 600,
            color: "#fff",
            background: ORANGE,
            padding: "12px 22px",
            minHeight: 44,
            boxSizing: "border-box",
            borderRadius: 9999,
            textDecoration: "none",
          }}
        >
          {step.ctaLabel}
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </a>
      </div>
    </div>
  );
}

export default function EcosystemModel() {
  const [images, setImages] = useState<Record<string, string>>({});

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

  return (
    <section style={{ background: "#100D0B", padding: "84px 40px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60, left: -70, pointerEvents: "none" }}>
        <ChevronMark color={ORANGE} width={220} opacity={0.14} />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
        <div style={{ position: "relative", textAlign: "center", marginBottom: 56 }}>
          <div className="ib-programs-quicklabels" style={{ position: "absolute", top: 2, right: 0, display: "flex", gap: 12, alignItems: "stretch" }}>
            <span style={{ width: 1, background: ORANGE }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textAlign: "left" }}>
              <span>IDEAS</span>
              <span>PEOPLE</span>
              <span>IMPACT</span>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 14 }}>Our Programs</div>
          <h2 style={{ margin: "0 0 14px", fontSize: 42, fontWeight: 500, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.12 }}>
            Turn your ideas into <span style={{ color: ORANGE }}>real impact.</span>
          </h2>
          <p style={{ margin: "0 auto", fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.6)", maxWidth: 640 }}>
            Whether you&rsquo;re building a solution, looking for collaborators, or exploring opportunities, we provide the right support to help you move forward.
          </p>
        </div>

        <div className="ib-programs-cardgrid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {STEPS.map((s) => (
            <ProgramCard key={s.key} step={s} image={images[s.key]} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 40, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Incubator Baguio</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            <span style={{ width: 26, height: 1, background: "rgba(255,255,255,0.28)" }} />
            Ideas. People. Impact.
          </span>
        </div>
      </div>
    </section>
  );
}
