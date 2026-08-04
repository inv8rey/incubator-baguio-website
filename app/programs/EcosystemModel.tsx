"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const ORANGE = "#F26522";
const DARK = "#141417";

interface ProgramItem {
  title: string;
  description: string;
  tagline: string;
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
  programs: ProgramItem[];
}

const ICONS = {
  briefcase: `<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"></path><path d="M3 12h18"></path>`,
  people: `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
  sprout: `<path d="M12 21V10"></path><path d="M12 10C12 10 7.5 10.5 6 6.5C6 6.5 11 5.5 12 10Z"></path><path d="M12 10C12 10 16.5 10.5 18 6.5C18 6.5 13 5.5 12 10Z"></path>`,
  lightbulb: `<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path>`,
  database: `<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path>`,
};

const STEPS: StepData[] = [
  {
    key: "founder-development",
    number: "01",
    title: "FOUNDER DEVELOPMENT",
    theme: "Equip founders to build with confidence.",
    purpose: "We support aspiring and early-stage founders with personalized guidance, practical learning, and wellness support throughout their entrepreneurial journey.",
    color: ORANGE,
    bg: "rgba(242,101,34,0.12)",
    icon: ICONS.sprout,
    programs: [
      { title: "Founder Office Hours", tagline: "One-on-one guidance on validation, funding, legal, and more.", description: "Weekly one-on-one consultation sessions where founders receive tailored guidance on business validation, product development, funding, legal concerns, marketing, and referrals to appropriate ecosystem partners." },
      { title: "Founder Learning Series", tagline: "Workshops and masterclasses on the core skills of building a startup.", description: "A recurring learning program featuring workshops, masterclasses, and expert-led sessions on startup fundamentals, including customer discovery, business model development, product validation, fundraising, intellectual property, marketing, finance, and emerging technologies." },
      { title: "Founder Wellness Sessions", tagline: "Quarterly sessions on resilience, balance, and founder mental health.", description: "Quarterly sessions focused on mental health, stress management, resilience, productivity, and work-life balance to help founders sustain their entrepreneurial journey." },
    ],
  },
  {
    key: "ecosystem-building",
    number: "02",
    title: "ECOSYSTEM BUILDING",
    theme: "Connect the people building Baguio's ecosystem.",
    purpose: "We connect founders, universities, government, industry, and community partners through structured referrals, shared dialogue, and greater visibility.",
    color: "#285E7A",
    bg: "rgba(40,94,122,0.12)",
    icon: ICONS.people,
    programs: [
      { title: "Startup Referral Network", tagline: "Connecting founders to the right TBIs, mentors, and partners.", description: "A structured referral system that connects entrepreneurs, startups, researchers, and innovators to the most appropriate Technology Business Incubator, government agency, mentor, or ecosystem partner based on their needs and stage of development." },
      { title: "Quadruple Helix Roundtable", tagline: "Quarterly dialogue across government, academe, industry, and startups.", description: "A quarterly dialogue bringing together representatives from government, academia, industry, and the startup community to discuss ecosystem priorities, identify collaboration opportunities, and generate actionable recommendations." },
      { title: "Quarterly Startup Showcase with the Mayor", tagline: "Selected startups present to city leadership each quarter.", description: "A quarterly platform where selected startups present their innovations, progress, and challenges to city leadership, fostering dialogue, recognition, and opportunities for collaboration and support." },
      { title: "Innovation Calendar", tagline: "One shared calendar for all ecosystem events across the city.", description: "A centralized calendar that consolidates startup, innovation, entrepreneurship, research, and technology-related events from ecosystem partners, giving the community a single place to discover opportunities for learning, networking, funding, competitions, and collaboration." },
    ],
  },
  {
    key: "open-innovation",
    number: "03",
    title: "OPEN INNOVATION",
    theme: "Turn real-world challenges into co-created solutions.",
    purpose: "We connect government agencies, businesses, and institutions with startups, researchers, and students to solve real problems and shape the city's research and innovation priorities.",
    color: "#9E2A52",
    bg: "rgba(158,42,82,0.12)",
    icon: ICONS.lightbulb,
    programs: [
      { title: "Open Innovation Challenges", tagline: "Organizations post real problems; innovators co-develop solutions.", description: "A challenge-based innovation platform where government agencies, businesses, universities, and organizations can publish real-world problems and collaborate with startups, researchers, students, and innovators to co-develop practical, scalable solutions." },
      { title: "Baguio City Annual Research and Innovation Agenda", tagline: "Stakeholder-driven process to set the city's R&I priorities each year.", description: "A collaborative annual initiative to review and refine Baguio City's Research and Innovation Agenda by engaging key ecosystem stakeholders in identifying emerging challenges, validating priority sectors, and recommending strategic research and innovation directions." },
      { title: "Innovation Pilot Program", tagline: "Real-world testing ground for solutions before city-wide scaling.", description: "A structured pilot program that gives innovative solutions the opportunity for real-world testing and validation, helping organizations evaluate feasibility before wider implementation or scaling." },
    ],
  },
  {
    key: "ecosystem-intelligence",
    number: "04",
    title: "ECOSYSTEM INTELLIGENCE",
    theme: "Measure, learn, and strengthen the ecosystem.",
    purpose: "We track, assess, and share ecosystem data to guide planning, measure progress, and strengthen Baguio's position as a growing innovation hub.",
    color: "#1A6B3C",
    bg: "rgba(26,107,60,0.12)",
    icon: ICONS.database,
    programs: [
      { title: "Startup Ecosystem Database", tagline: "Centralized directory of startups, mentors, TBIs, and partners.", description: "A centralized and regularly updated database of startups, entrepreneurs, researchers, mentors, investors, Technology Business Incubators, government agencies, universities, and ecosystem partners that serves as the primary source of ecosystem data for planning, collaboration, referrals, and performance monitoring." },
      { title: "Startup Ecosystem Dashboard", tagline: "Live metrics on startup activity, funding, and ecosystem health.", description: "A centralized digital dashboard that tracks key indicators of Baguio City's startup ecosystem, providing real-time insights into ecosystem performance, startup activity, programs, partnerships, funding, and innovation initiatives." },
      { title: "Startup Ecosystem Assessment", tagline: "Continuous surveys to surface gaps and opportunities citywide.", description: "A continuous assessment initiative that gathers insights from startups and ecosystem stakeholders to identify needs, challenges, opportunities, and ecosystem gaps." },
      { title: "Annual Startup Ecosystem Report", tagline: "Yearly publication on the state of Baguio's innovation economy.", description: "An annual publication that presents the state of Baguio City's startup ecosystem, including ecosystem trends, key achievements, stakeholder insights, and recommendations for future ecosystem development." },
      { title: "Knowledge Hub", tagline: "Open repository of toolkits, research, policies, and resources.", description: "A digital repository of startup, innovation, entrepreneurship, and research resources, including toolkits, reports, funding opportunities, policies, case studies, publications, and learning materials that support evidence-based decision-making and ecosystem capacity building." },
      { title: "StartupBlink Ecosystem Development Initiative", tagline: "Improving Baguio's visibility and ranking on global startup indexes.", description: "A long-term initiative to strengthen Baguio City's startup ecosystem by improving ecosystem data, increasing global visibility, benchmarking performance, and enhancing the city's position in international startup ecosystem rankings." },
    ],
  },
];

function IconSvg({ path, size = 20, stroke = "currentColor", strokeWidth = 1.9 }: { path: string; size?: number; stroke?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: path }} />
  );
}

function ProgramPhotoStack({ active, images }: { active: number; images: Record<string, string> }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", background: "#F5F4F0" }}>
      {STEPS.map((s, i) =>
        images[s.key] ? (
          <img
            key={s.key}
            src={images[s.key]}
            alt={s.title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === active ? 1 : 0, transition: "opacity 0.7s ease" }}
          />
        ) : (
          <div
            key={s.key}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(135deg, ${s.color}22, ${s.color}0a)`, opacity: i === active ? 1 : 0, transition: "opacity 0.7s ease" }}
          >
            <IconSvg path={s.icon} size={72} stroke={s.color} strokeWidth={1.2} />
          </div>
        )
      )}
    </div>
  );
}

export default function EcosystemModel() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
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
                <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>Our Programs</div>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.15 }}>Programs Built Around the <span style={{ color: ORANGE }}>Startup Journey.</span></h2>
              </div>
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                <ProgramPhotoStack active={active} images={images} />
              </div>
            </div>

            {/* Content */}
            <div style={{ paddingLeft: 56, display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }} className="ib-4e-content">
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#9A958B", marginBottom: 18 }}>{step.number} / 0{STEPS.length}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                  <div style={{ width: 68, height: 68, borderRadius: 9999, background: step.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.5s ease" }}>
                    <IconSvg path={step.icon} size={32} stroke="#fff" strokeWidth={1.7} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-0.01em", color: DARK, lineHeight: 1.1 }}>{step.title}</h3>
                    <div style={{ fontSize: 15, fontWeight: 600, color: step.color, marginTop: 4, transition: "color 0.5s ease" }}>{step.theme}</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 520 }}>{step.purpose}</p>
              </div>

              <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", marginTop: 22, paddingTop: 20, borderTop: "1px solid rgba(20,20,25,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14, flexShrink: 0 }}>
                  <IconSvg path={ICONS.briefcase} size={15} stroke={ORANGE} strokeWidth={2.2} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B" }}>Programs</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 8, minHeight: 0 }} className="ib-4e-programs">
                  {step.programs.map((p) => (
                    <div key={p.title} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{p.title}</div>
                      <div style={{ fontSize: 12.5, color: "#9A958B", lineHeight: 1.45 }}>{p.tagline}</div>
                    </div>
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
                    title={s.title}
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
                      margin: "4px 0",
                    }}
                  >
                    {s.number}
                  </button>
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
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ORANGE, marginBottom: 8 }}>Our Programs</div>
          <h2 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: DARK }}>Programs Built Around the <span style={{ color: ORANGE }}>Startup Journey.</span></h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {STEPS.map((s) => (
            <div key={s.key} style={{ border: "1px solid rgba(20,20,25,0.10)", borderRadius: 20, overflow: "hidden" }}>
              {images[s.key] && (
                <img src={images[s.key]} alt={s.title} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
              )}
              <div style={{ padding: "26px 22px" }}>
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
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9A958B", marginBottom: 2 }}>Programs</div>
                {s.programs.map((p) => (
                  <div key={p.title} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK, lineHeight: 1.3 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#9A958B", lineHeight: 1.45 }}>{p.tagline}</div>
                  </div>
                ))}
              </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
