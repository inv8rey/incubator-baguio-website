import fs from "fs";
import path from "path";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const INK = "#1A1714";
const INK_2 = "#5A544B";
const INK_3 = "#6E685F";

// Reuses the same photos as the homepage's Find Your Path cards (see
// app/FindYourPath.tsx) so a click there lands on a visually matching
// section here, instead of a generic page. The existsSync guard keeps a
// missing file from shipping a broken <img>: the tinted placeholder shows
// until the photo is actually added.
function photoIfPresent(file: string): string | null {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "assets", file)) ? `${BP}/assets/${file}` : null;
  } catch {
    return null;
  }
}

/**
 * Icon-chip palettes. Each `fg` clears 4.5:1 on the chip's own tint and on
 * the card surface, so the same value is safe for the glyph and the arrow.
 * Amber is the one that needed darkening from the usual #C97A1A (3.0:1).
 */
const TONES = {
  green: { fg: "#1A6B3C", bg: "rgba(26,107,60,0.11)" },
  blue: { fg: "#285E7A", bg: "rgba(40,94,122,0.11)" },
  amber: { fg: "#9A5C0D", bg: "rgba(154,92,13,0.12)" },
  rose: { fg: "#9E2A52", bg: "rgba(158,42,82,0.10)" },
} as const;

type ToneKey = keyof typeof TONES;

const ICONS = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M21 19c0-2.4-1.8-4.5-4-5" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11.5l-1.7 4 1.7 4H5" />
    </>
  ),
  document: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h6M9 9h1" />
    </>
  ),
  documentSearch: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6" />
      <path d="M14 2v6h6" />
      <circle cx="16.5" cy="17.5" r="2.5" />
      <path d="m18.5 19.5 2 2" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V7l8-4 8 4v14M4 21h16" />
      <path d="M9 21v-6h6v6M8.5 10h1.5M14 10h1.5" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />,
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
} as const;

interface Action {
  title: string;
  desc: string;
  href: string;
  tone: ToneKey;
  icon: keyof typeof ICONS;
}

interface Audience {
  id: string;
  label: string;
  /** Split across two lines; the break is deliberate, not a wrap. */
  headline: [string, string];
  intro: string;
  image: string;
  /** Text-safe accent (>=4.5:1 on the panel). */
  accent: string;
  /** Brand hue, decorative only — tints the photo frame, never carries text. */
  tint: string;
  actions: Action[];
}

const AUDIENCES: Audience[] = [
  {
    id: "students",
    label: "For Students",
    headline: ["Have an idea?", "Start here."],
    intro:
      "Incubator Baguio connects you with the people, opportunities, and support you need to turn your ideas into real projects and solutions.",
    image: "path-students.png",
    accent: "#A8400F",
    tint: "#F26522",
    actions: [
      {
        title: "Find Opportunities",
        desc: "Grants, competitions, and other funding opportunities.",
        href: `${BP}/knowledge?category=${encodeURIComponent("Funding & Opportunities")}`,
        tone: "green",
        icon: "compass",
      },
      {
        title: "Find a Mentor",
        desc: "Get guidance from experienced people.",
        href: `${BP}/ecosystem?tab=Mentors`,
        tone: "amber",
        icon: "people",
      },
      {
        title: "Explore Challenges",
        desc: "Work on real problems in Baguio.",
        href: `${BP}/challenges`,
        tone: "blue",
        icon: "flag",
      },
      {
        title: "Explore Research",
        desc: "Find research and innovation opportunities.",
        href: `${BP}/knowledge?category=${encodeURIComponent("Research & Innovation")}`,
        tone: "rose",
        icon: "document",
      },
    ],
  },
  {
    id: "startups",
    label: "For Startups & Founders",
    headline: ["Build. Grow.", "Go Further."],
    intro:
      "Incubator Baguio connects you with mentors, partners, resources, and opportunities to help you build and scale sustainable businesses in Baguio and beyond.",
    image: "path-startups.png",
    accent: "#22345C",
    tint: "#22345C",
    actions: [
      {
        title: "Find a Mentor",
        desc: "Get guidance from experienced founders and industry experts.",
        href: `${BP}/ecosystem?tab=Mentors`,
        tone: "green",
        icon: "people",
      },
      {
        title: "Find Partners",
        desc: "Connect with potential co-founders, collaborators, and industry partners.",
        href: `${BP}/ecosystem`,
        tone: "blue",
        icon: "building",
      },
      {
        title: "Explore Funding",
        desc: "Discover grants, investors, and other funding opportunities.",
        href: `${BP}/knowledge?category=${encodeURIComponent("Funding & Opportunities")}`,
        tone: "amber",
        icon: "chart",
      },
      {
        title: "Join Programs",
        desc: "Browse and register for trainings, workshops, and startup events.",
        href: `${BP}/calendar`,
        tone: "rose",
        icon: "calendar",
      },
    ],
  },
  {
    id: "researchers",
    label: "For Researchers",
    headline: ["Research", "for a better Baguio."],
    intro:
      "Incubator Baguio helps you turn research into real-world solutions by connecting you with partners, funding opportunities, and pathways for adoption and impact.",
    image: "path-researchers.png",
    accent: "#1A6B3C",
    tint: "#1A6B3C",
    actions: [
      {
        title: "Share Your Research",
        desc: "Contribute to a centralized repository of research outputs.",
        href: `${BP}/knowledge?category=${encodeURIComponent("Research & Innovation")}`,
        tone: "green",
        icon: "documentSearch",
      },
      {
        title: "Find Collaborators",
        desc: "Connect with mentors across academe, industry, government, and community.",
        href: `${BP}/ecosystem?tab=Mentors`,
        tone: "blue",
        icon: "people",
      },
      {
        title: "Explore Funding",
        desc: "Discover grants and support for your research and innovations.",
        href: `${BP}/knowledge?category=${encodeURIComponent("Funding & Opportunities")}`,
        tone: "amber",
        icon: "chart",
      },
      {
        title: "Translate to Impact",
        desc: "Talk to our team about technology transfer, policy inputs, and real-world application.",
        href: `${BP}/contact`,
        tone: "rose",
        icon: "bulb",
      },
    ],
  },
  {
    id: "organizations",
    label: "For Organizations",
    headline: ["Work together", "for a stronger Baguio."],
    intro:
      "Incubator Baguio helps organizations collaborate with researchers, innovators, and the community to address real challenges and create inclusive, sustainable solutions.",
    image: "path-organizations.png",
    accent: "#54399B",
    tint: "#7C5CD6",
    actions: [
      {
        title: "Post a Challenge",
        desc: "Share your priority issues and connect with solution providers.",
        href: `${BP}/challenges/post`,
        tone: "green",
        icon: "bulb",
      },
      {
        title: "Find Partners",
        desc: "Collaborate with academe, startups, NGOs, and the community.",
        href: `${BP}/ecosystem`,
        tone: "blue",
        icon: "people",
      },
      {
        title: "Join Events",
        desc: "Browse workshops, forums, and innovation activities on the calendar.",
        href: `${BP}/calendar`,
        tone: "amber",
        icon: "calendar",
      },
      {
        title: "Propose a Collaboration",
        desc: "Have an innovation program you'd like to run with us? Get in touch.",
        href: `${BP}/contact`,
        tone: "rose",
        icon: "mail",
      },
    ],
  },
];

function ActionCard({ action }: { action: Action }) {
  const tone = TONES[action.tone];
  return (
    <a
      href={action.href}
      className="ib-apath-action"
      style={{ "--tone-fg": tone.fg, "--tone-bg": tone.bg } as React.CSSProperties}
    >
      <span className="ib-apath-action-chip" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          {ICONS[action.icon]}
        </svg>
      </span>
      <span className="ib-apath-action-title">{action.title}</span>
      <svg className="ib-apath-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      <span className="ib-apath-action-desc">{action.desc}</span>
    </a>
  );
}

function AudiencePanel({ audience, flip }: { audience: Audience; flip: boolean }) {
  const photo = photoIfPresent(audience.image);
  return (
    <section
      id={audience.id}
      aria-labelledby={`${audience.id}-heading`}
      style={{
        background: "#fff",
        border: "1px solid rgba(64,50,34,0.1)",
        borderRadius: 24,
        padding: 40,
        boxShadow: "var(--ib-shadow-sm)",
        scrollMarginTop: 96,
      }}
    >
      <div className={`ib-apath-panel${flip ? " ib-apath-panel--flip" : ""}`}>
        <div>
          <p className="ib-apath-eyebrow" style={{ color: audience.accent }}>
            <span className="ib-apath-rule" style={{ background: audience.accent }} />
            {audience.label}
          </p>
          <h3 id={`${audience.id}-heading`} className="ib-apath-heading">
            {audience.headline[0]}
            <br />
            {audience.headline[1]}
          </h3>
          <p className="ib-apath-intro">{audience.intro}</p>

          <div className="ib-apath-actions">
            {audience.actions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </div>

        <div className="ib-apath-media">
          <div
            className="ib-apath-frame"
            style={{ background: `linear-gradient(150deg, ${audience.tint}26 0%, ${audience.tint}12 58%, #F6F2EA 100%)` }}
          >
            {photo ? (
              <img src={photo} alt="" width={1536} height={1024} loading="lazy" decoding="async" />
            ) : (
              <span className="ib-apath-frame-fallback" style={{ color: audience.tint }} aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
                  {ICONS[audience.actions[0].icon]}
                </svg>
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AudiencePaths() {
  return (
    <section id="program-grid" aria-labelledby="program-grid-heading" style={{ background: "#FCFAF6", padding: "84px 40px", scrollMarginTop: 88 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 44px" }}>
          <p className="ib-apath-eyebrow ib-apath-eyebrow--centered" style={{ color: "#A8400F" }}>
            Get Started
          </p>
          <h2 id="program-grid-heading" style={{ margin: "0 0 14px", fontSize: 40, fontWeight: 600, letterSpacing: "-0.025em", color: INK, lineHeight: 1.14 }}>
            Programs built around <span style={{ color: "#A8400F" }}>your journey.</span>
          </h2>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: INK_2 }}>
            Whether you&rsquo;re a student, founder, researcher, or organization &mdash; here&rsquo;s where to begin.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {AUDIENCES.map((audience, i) => (
            <AudiencePanel key={audience.id} audience={audience} flip={i % 2 === 1} />
          ))}
        </div>

        <div className="ib-apath-footer">
          <p className="ib-apath-footer-note">
            <span className="ib-apath-footer-tag">Different journeys. A stronger Baguio.</span>
            Want to get involved a different way? Become a mentor, partner, or sponsor.
          </p>
          <a href={`${BP}/ecosystem`} className="ib-apath-footer-link">
            Get Involved
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
