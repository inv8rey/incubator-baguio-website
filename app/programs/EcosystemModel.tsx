"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const DARK = "#1A1714";
const MUTED = "#5F5C57";
const FAINT = "#8E8A84";

interface StepData {
  key: string;
  number: string;
  title: string;
  theme: string;
  purpose: string;
  /** Accent used for the numeral, sub-head, chevron watermark and markers. */
  color: string;
  /** Card field — a warm off-white, not a pastel. */
  bg: string;
  /** Deeper tone the visual panel fades out of. */
  bgDeep: string;
  icon: string;
  highlights: string[];
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
    title: "Founder Development",
    theme: "Helping entrepreneurs turn ideas into sustainable ventures.",
    purpose:
      "We equip founders with the knowledge, mentorship, and connections they need to validate ideas, build innovative businesses, and navigate the innovation journey with confidence.",
    color: "#D9531E",
    bg: "#FBF3EC",
    bgDeep: "#F3DFCD",
    icon: ICONS.sprout,
    highlights: ["Founder Office Hours", "Founder Learning Series", "Founder Wellness Sessions"],
  },
  {
    key: "ecosystem-building",
    number: "02",
    title: "Ecosystem Building",
    theme: "Connecting people, organizations, and opportunities.",
    purpose:
      "Innovation thrives through collaboration. We bring together government, universities, industry, innovators, and ecosystem partners to build meaningful partnerships and strengthen the City's innovation network.",
    color: "#22596F",
    bg: "#EEF3F6",
    bgDeep: "#D5E3EA",
    icon: ICONS.people,
    highlights: ["Innovator Referral Network", "Quadruple Helix Roundtable", "Innovator Showcase", "Innovation Calendar"],
  },
  {
    key: "open-innovation",
    number: "03",
    title: "Open Innovation",
    theme: "Turning real-world challenges into collaborative solutions.",
    purpose:
      "We connect organizations with innovators, researchers, and entrepreneurs to co-develop practical solutions that address the City's priorities and create lasting impact.",
    color: "#8E2749",
    bg: "#F8F0F3",
    bgDeep: "#EDD6DE",
    icon: ICONS.lightbulb,
    highlights: ["Open Innovation Challenges", "Innovation Pilot Program", "Research & Innovation Agenda"],
  },
  {
    key: "ecosystem-intelligence",
    number: "04",
    title: "Ecosystem Intelligence",
    theme: "Enabling better decisions through data and insights.",
    purpose:
      "We collect, organize, and analyze ecosystem data to support evidence-based planning, measure progress, and guide the future of innovation in Baguio.",
    color: "#17603A",
    bg: "#EFF4F1",
    bgDeep: "#D6E6DC",
    icon: ICONS.database,
    highlights: ["Ecosystem Database", "Ecosystem Dashboard", "Annual Ecosystem Report", "Knowledge Hub"],
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
 * The right-hand panel. A Supabase-managed photo wins when one exists; otherwise
 * we compose a branded graphic (masked grid, accent bloom, chevron watermark,
 * ringed medallion) so an unset image still reads as designed rather than blank.
 */
function StepVisual({ step, image, count, compact = false }: { step: StepData; image?: string; count: number; compact?: boolean }) {
  const medallion = compact ? 74 : 104;
  const ringOuter = compact ? 152 : 214;
  const ringInner = compact ? 112 : 156;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: 22,
        overflow: "hidden",
        background: image ? step.bgDeep : `linear-gradient(155deg, ${step.bgDeep} 0%, ${step.bg} 52%, #FFFFFF 100%)`,
        border: "1px solid rgba(64,50,34,0.10)",
        boxShadow: "0 30px 60px -34px rgba(17,17,20,0.30), 0 2px 6px -2px rgba(17,17,20,0.06)",
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
          <div style={{ position: "absolute", bottom: compact ? -52 : -74, left: compact ? -44 : -62, transform: "rotate(-8deg)" }}>
            <ChevronMark color={step.color} width={compact ? 168 : 236} opacity={0.09} />
          </div>

          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ position: "absolute", width: ringOuter, height: ringOuter, borderRadius: 9999, border: `1px solid ${step.color}1A` }} />
              <span style={{ position: "absolute", width: ringInner, height: ringInner, borderRadius: 9999, border: `1px solid ${step.color}2B` }} />
              <div
                style={{
                  position: "relative",
                  width: medallion,
                  height: medallion,
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
                <IconSvg path={step.icon} size={compact ? 34 : 50} stroke={step.color} strokeWidth={1.6} />
              </div>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: compact ? 14 : 22,
              left: compact ? 14 : 22,
              display: "inline-flex",
              alignItems: "center",
              gap: compact ? 6 : 8,
              padding: compact ? "5px 10px" : "7px 13px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(64,50,34,0.09)",
              boxShadow: "0 6px 16px -8px rgba(17,17,20,0.18)",
            }}
          >
            <span style={{ width: compact ? 5 : 6, height: compact ? 5 : 6, borderRadius: 9999, background: step.color }} />
            <span style={{ fontSize: compact ? 10 : 11.5, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase", color: MUTED }}>
              {count} programs
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function CardBody({ step, compact = false }: { step: StepData; compact?: boolean }) {
  return (
    <>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: compact ? 16 : 24 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 42,
              height: 26,
              padding: "0 11px",
              borderRadius: 9999,
              background: step.color,
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            {step.number}
          </span>
          <span style={{ flex: 1, height: 1, background: `${step.color}26` }} />
        </div>

        <h3
          style={{
            margin: "0 0 12px",
            fontSize: compact ? 23 : 37,
            fontWeight: 600,
            letterSpacing: "-0.026em",
            color: DARK,
            lineHeight: 1.12,
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            margin: `0 0 ${compact ? 12 : 18}px`,
            fontSize: compact ? 14.5 : 18,
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: "-0.008em",
            color: step.color,
            maxWidth: 430,
          }}
        >
          {step.theme}
        </p>
        <p style={{ margin: 0, fontSize: compact ? 13.5 : 15.5, lineHeight: 1.68, color: MUTED, maxWidth: 468 }}>{step.purpose}</p>
      </div>

      <div style={{ marginTop: compact ? 20 : 34, paddingTop: compact ? 16 : 24, borderTop: "1px solid rgba(64,50,34,0.12)" }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: FAINT, marginBottom: 13 }}>
          Highlights
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {step.highlights.map((h) => (
            <span
              key={h}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: compact ? "7px 12px" : "8px 14px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(64,50,34,0.11)",
                boxShadow: "0 1px 2px rgba(17,17,20,0.04)",
                fontSize: compact ? 12.5 : 13.5,
                fontWeight: 600,
                letterSpacing: "-0.005em",
                color: DARK,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 9999, background: step.color, flexShrink: 0 }} />
              {h}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

export default function EcosystemModel() {
  const [images, setImages] = useState<Record<string, string>>({});
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Each pinned card recedes — scales back and dims — as the next one slides
  // over it, so the stack reads as a physical deck instead of a hard swap.
  const syncDepth = useCallback(() => {
    const vh = window.innerHeight;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const next = cardRefs.current[i + 1];
      const covered = next ? 1 - Math.min(Math.max(next.getBoundingClientRect().top / vh, 0), 1) : 0;
      const eased = covered * covered * (3 - 2 * covered);
      card.style.transform = `scale(${1 - eased * 0.055}) translateY(${-eased * 16}px)`;
      const veil = card.firstElementChild as HTMLElement | null;
      if (veil) veil.style.opacity = String(eased * 0.5);
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let queued = false;
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        syncDepth();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    syncDepth();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [syncDepth]);

  return (
    <>
      {/* DESKTOP: sticky stacking deck */}
      <section className="ib-stack-wrap" style={{ position: "relative", marginTop: 64, background: "#fff" }}>
        {STEPS.map((s, i) => (
          <div
            key={s.key}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{
              position: "sticky",
              top: 0,
              zIndex: i + 1,
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              background: s.bg,
              borderRadius: "30px 30px 0 0",
              borderTop: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 -30px 60px -30px rgba(17,17,20,0.22)",
              transformOrigin: "center top",
              willChange: "transform",
            }}
          >
            {/* Recede veil — opacity driven by syncDepth. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "30px 30px 0 0",
                background: "rgba(18,18,22,0.16)",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: "relative",
                zIndex: 1,
                maxWidth: 1200,
                width: "100%",
                margin: "0 auto",
                // Fluid so a short viewport can't push the pinned card past 100vh.
                padding: "clamp(44px, 7vh, 76px) 48px",
                display: "grid",
                gridTemplateColumns: "1fr 1.04fr",
                gap: 72,
                alignItems: "center",
              }}
            >
              <div>
                <CardBody step={s} />
              </div>
              <div style={{ height: "clamp(300px, 55vh, 452px)" }}>
                <StepVisual step={s} image={images[s.key]} count={s.highlights.length} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* MOBILE fallback: plain stacked cards */}
      <section className="ib-stack-mobile" style={{ background: "#fff", padding: "0 22px 60px", display: "none" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 44 }}>
          {STEPS.map((s) => (
            <div
              key={s.key}
              style={{
                background: s.bg,
                border: "1px solid rgba(64,50,34,0.11)",
                borderRadius: 22,
                overflow: "hidden",
                boxShadow: "0 10px 26px -18px rgba(17,17,20,0.18)",
              }}
            >
              <div style={{ height: 196, padding: 14, paddingBottom: 0 }}>
                <StepVisual step={s} image={images[s.key]} count={s.highlights.length} compact />
              </div>
              <div style={{ padding: "22px 20px 24px" }}>
                <CardBody step={s} compact />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
