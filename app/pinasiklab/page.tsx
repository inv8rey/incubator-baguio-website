import type { Metadata } from "next";
import { pageMeta, SITE_URL } from "../seo";
import { navBarHtml, footerHtml } from "../chrome";
import { REGISTER_URL, REGISTRATION_CLOSES_AT, REGISTRATION_DEADLINE } from "./config";
import SiklabInteractive from "./SiklabInteractive";

export const metadata: Metadata = pageMeta({
  title: "PinaSIKLab Baguio 2026 — Incubator Baguio",
  description:
    "PinaSIKLab Baguio 2026: a two-day youth innovation sprint for Baguio and the BLISTT area, October 30–31, 2026. 30 teams, real community and climate challenges, working solutions. A UNDP Youth Co:Lab initiative.",
  path: "/pinasiklab/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The supplied copy left these as [placeholders]. Fill them in as they become
// available -- until then the page degrades honestly instead of showing a
// dead button or a made-up date:
//   - no REGISTER_URL      -> "Register now" opens an email to the team
//   - no REGISTRATION_DEADLINE -> reads "to be announced"
//   - no CHALLENGE_BRIEFS_URL  -> the "View challenge briefs" button is hidden
const CHALLENGE_BRIEFS_URL = "";
const CONTACT_EMAIL = "incubatorbaguio63@gmail.com";

const registerHref = REGISTER_URL || `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("PinaSIKLab Baguio 2026 registration")}`;
const registerAttrs = /^https?:/.test(REGISTER_URL) ? ' target="_blank" rel="noopener noreferrer"' : "";
const deadlineText = REGISTRATION_DEADLINE || "to be announced";

// Brand palette from the PinaSIKLab poster: blue, yellow, maroon, with a
// touch of green. Blue carries accents on light sections; yellow carries
// them on the dark (blue and maroon) sections.
const BLUE = "#2B63AE";
const BLUE_DARK = "#1F4C8C";
const YELLOW = "#F2C240";
const MAROON = "#8E2340";
const GREEN = "#5E9E45";
const ORANGE = BLUE;

function icon(inner: string, color = ORANGE, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">${inner}</svg>`;
}

const PATHS = {
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"></path><circle cx="12" cy="10" r="3"></circle>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  map: '<path d="M9 20l-6 2V6l6-2 6 2 6-2v16l-6 2-6-2z"></path><path d="M9 4v16M15 6v16"></path>',
  check: '<path d="M20 6 9 17l-5-5"></path>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"></path>',
  mentor: '<path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
  network: '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"></path>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"></path>',
  stage: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path>',
};

function registerButton(label: string, variant: "orange" | "dark" = "orange"): string {
  // "dark" = for use on the blue/maroon sections: yellow button, dark text.
  const bg = variant === "orange" ? BLUE : YELLOW;
  const fg = variant === "orange" ? "#fff" : "#1A1714";
  const cls = ' class="ib-siklab-cta"';
  return `<a href="${registerHref}"${registerAttrs}${cls} style="display:inline-flex;align-items:center;gap:9px;background:${bg};color:${fg};font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">${label} ${icon(PATHS.arrow, fg, 15)}</a>`;
}

const teamFinderHref = `${BP}/pinasiklab/teams/`;
function teamFinderButton(label: string, onOrange = false): string {
  const c = onOrange ? "background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.5);" : "background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);";
  return `<a href="${teamFinderHref}" style="display:inline-flex;align-items:center;gap:9px;${c}color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">${icon(PATHS.network, "#fff", 16)} ${label}</a>`;
}

function sectionHead(eyebrow: string, title: string, dark = false): string {
  return `
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${dark ? YELLOW : ORANGE};margin-bottom:6px;">${eyebrow}</div>
    <div style="width:42px;height:3px;background:${dark ? YELLOW : ORANGE};border-radius:2px;margin-bottom:22px;"></div>
    <h2 style="margin:0 0 20px;font-size:44px;font-weight:500;letter-spacing:-0.03em;color:${dark ? "#fff" : "#1A1714"};line-height:1.08;">${title}</h2>`;
}

function chip(text: string, dark = false): string {
  return dark
    ? `<span style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.14);border-radius:9999px;padding:8px 16px;font-size:13.5px;font-weight:600;color:rgba(255,255,255,0.85);">${text}</span>`
    : `<span style="display:inline-block;background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:9999px;padding:8px 16px;font-size:13.5px;font-weight:600;color:#1A1714;">${text}</span>`;
}

function checkItem(text: string): string {
  return `<div style="display:flex;align-items:flex-start;gap:11px;font-size:15px;line-height:1.5;color:#1A1714;">${icon(PATHS.check, "#17603A", 18)}<span>${text}</span></div>`;
}

const PARA = "margin:0 0 16px;font-size:16.5px;line-height:1.7;color:#5A544B;";

const STEPS: [string, string, string][] = [
  ["01", "Understand", "Explore a real problem and understand the people and communities affected by it."],
  ["02", "Develop", "Work with your team to identify opportunities and develop a solution."],
  ["03", "Build", "Turn your idea into a prototype that can be demonstrated and tested."],
  ["04", "Refine", "Receive guidance from mentors and improve your solution based on feedback."],
  ["05", "Pitch", "Present your solution to a panel of judges and partners."],
];

const BENEFITS: [string, string, string][] = [
  [PATHS.mentor, "Mentorship", "Work with mentors from government, academe, industry, startups, and the innovation ecosystem."],
  [PATHS.tool, "Hands-on Experience", "Go through an actual innovation process from problem identification to prototype development and pitching."],
  [PATHS.network, "Network", "Connect with fellow young innovators, mentors, government agencies, universities, startups, and industry partners."],
  [PATHS.stage, "Platform", "Present your solution to judges and partners working in the local innovation ecosystem."],
];

const FLOW = ["Baguio", "Top 5 Teams", "PinaSIKLab National Challenge", "Further Mentorship &amp; Capacity Building", "National Opportunities"];

const FAQS: { q: string; a: string }[] = [
  { q: "Who can participate?", a: "Young people aged 18–30 who reside, study, or work in Baguio City or the BLISTT municipalities." },
  { q: "Do I need to be a student?", a: "No. The program welcomes students, young professionals, youth entrepreneurs, researchers, faculty, and out-of-school youth." },
  {
    q: "Do I need technical or coding skills?",
    a: "Not every participant needs technical skills. Teams are encouraged to bring together members with complementary skills. However, each team should collectively be capable of developing and presenting a functional prototype or solution.",
  },
  { q: "Can I apply alone?", a: "Yes. Individual applications are accepted." },
  { q: "Can I apply with my existing team?", a: "Yes. Teams may apply as a pre-formed team." },
  { q: "How many teams will participate?", a: "The Baguio leg will accommodate up to 30 multidisciplinary teams, with five members per team." },
  {
    q: "What will we work on?",
    a: "Teams will work on selected problem statements connected to Baguio&rsquo;s research and innovation priorities. The detailed challenge briefs will be provided through the program.",
  },
  {
    q: "What happens after the Baguio leg?",
    a: "The Top 5 teams will proceed to the PinaSIKLab National Challenge for further mentorship and capacity building.",
  },
];

// Orgs without a logo file render as text wordmarks.
interface Org { name: string; alt?: string; logo?: string }
const LOGO_GROUPS: { label: string; orgs: Org[] }[] = [
  { label: "A UNDP Youth Co:Lab initiative", orgs: [{ name: "UNDP Philippines / Youth Co:Lab", logo: "undp.png" }] },
  { label: "Locally organized by", orgs: [{ name: "Incubator Baguio", logo: "ib-icon-dark.png" }, { name: "SIGLAT Youth Innovation Hub", logo: "siglat.png" }] },
  {
    label: "With the support of",
    orgs: [
      { name: "City Government of Baguio", logo: "city-of-baguio-seal.png" },
      { name: "CPDSO", alt: "City Planning, Development and Sustainability Office (CPDSO)", logo: "cpdso-logo.png" },
    ],
  },
  { label: "Supported by", orgs: [{ name: "Government of Japan", logo: "government-of-japan.png" }, { name: "JICA", alt: "Japan International Cooperation Agency (JICA)", logo: "jica.png" }] },
];

function orgTile(o: Org): string {
  if (o.logo) {
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;"><img class="ib-siklab-logo" src="${BP}/assets/${o.logo}" alt="${o.alt || o.name}" style="height:76px;width:auto;max-width:170px;object-fit:contain;display:block;"><span style="font-size:12px;font-weight:600;color:#5A544B;text-align:center;line-height:1.3;max-width:140px;">${o.name}</span></div>`;
  }
  return `<div class="ib-siklab-logo" style="min-height:76px;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:700;letter-spacing:-0.015em;color:#1A1714;text-align:center;line-height:1.25;max-width:100%;">${o.name}</div>`;
}

const LOGO_BAR = `
  <div class="ib-siklab-logobar">
    ${LOGO_GROUPS.map(
      (g) => `
    <div class="ib-siklab-logogroup">
      <div style="font-size:10.5px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#8A8378;margin-bottom:16px;">${g.label}</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:26px;flex-wrap:wrap;">${g.orgs.map(orgTile).join("")}</div>
    </div>`
    ).join("")}
  </div>`;

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "PinaSIKLab Baguio 2026",
  description:
    "A two-day youth innovation sprint for Baguio and the BLISTT area: multidisciplinary teams develop AI and digitally enabled solutions to real community and climate-related challenges.",
  startDate: "2026-10-30",
  endDate: "2026-10-31",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: "Baguio City",
    address: { "@type": "PostalAddress", addressLocality: "Baguio City", addressRegion: "Benguet", addressCountry: "PH" },
  },
  organizer: { "@type": "Organization", name: "Incubator Baguio", url: SITE_URL },
  url: `${SITE_URL}/pinasiklab/`,
};

const PAGE_HTML = `
${navBarHtml()}

<!-- HERO -->
<div aria-hidden="true" style="display:flex;height:6px;"><span style="flex:1;background:#5E9E45;"></span><span style="flex:1;background:#8E2340;"></span><span style="flex:1;background:#2B63AE;"></span><span style="flex:1;background:#F2C240;"></span></div>
<div style="position:relative;background:#1F4C8C;padding:64px 40px 76px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:680px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,194,64,0.26) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:900px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.55);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/programs/" style="color:inherit;text-decoration:none;">Programs</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">PinaSIKLab Baguio 2026</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:26px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,194,64,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:${YELLOW};"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">UNDP Youth Co:Lab &middot; Baguio Leg</span></div>
    <h1 style="margin:0;font-size:60px;line-height:1.05;font-weight:500;letter-spacing:-0.04em;color:#fff;">PinaSIKLab <span style="color:${YELLOW};">Baguio 2026</span></h1>
    <p style="margin:18px auto 0;font-size:24px;line-height:1.35;font-weight:500;color:rgba(255,255,255,0.88);letter-spacing:-0.01em;">Youth Innovation for Baguio and the BLISTT Area</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:26px 0 0;">
      <span style="display:inline-flex;align-items:center;gap:9px;padding:9px 18px;border-radius:9999px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);font-size:14px;font-weight:600;color:#fff;">${icon(PATHS.calendar, YELLOW, 16)} October 30&ndash;31, 2026</span>
      <span style="display:inline-flex;align-items:center;gap:9px;padding:9px 18px;border-radius:9999px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);font-size:14px;font-weight:600;color:#fff;">${icon(PATHS.pin, YELLOW, 16)} Baguio City</span>
      <span style="display:inline-flex;align-items:center;gap:9px;padding:9px 18px;border-radius:9999px;background:rgba(242,194,64,0.16);border:1px solid rgba(242,194,64,0.5);font-size:14px;font-weight:600;color:#fff;">${icon(PATHS.trophy, YELLOW, 16)} Up to &#8369;100,000 in prizes</span>
    </div>
    <p style="margin:28px auto 0;font-size:17.5px;line-height:1.65;color:rgba(255,255,255,0.68);max-width:720px;">PinaSIKLab Baguio 2026 brings together young people from Baguio City and the BLISTT area to develop technology-enabled solutions to real community and local development challenges.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:32px;">
      ${registerButton("Register now", "dark")}
      ${teamFinderButton("Find a team")}
    </div>
    <div id="ib-sk-countdown" style="margin-top:30px;min-height:96px;"></div>
  </div>
</div>

<!-- ORGANIZERS & PARTNERS -->
<div style="background:#fff;padding:44px 40px;">
  <div style="max-width:1080px;margin:0 auto;">${LOGO_BAR}</div>
</div>

<!-- ABOUT -->
<div id="about" style="background:#EEF3FA;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1.1fr;gap:52px;align-items:center;">
      <div>
        ${sectionHead("About", "About PinaSIKLab Baguio")}
        <p style="${PARA}">PinaSIKLab Baguio 2026 is the Baguio leg of <strong style="color:#1A1714;">PinaSIKLab: Pilipinas Social Innovation for Kabataan Labs 2026</strong>, a UNDP Philippines Youth Co:Lab initiative supporting young innovators in developing solutions and advancing their entrepreneurship journey.</p>
        <p style="${PARA}">The Baguio leg provides young people with an opportunity to work in multidisciplinary teams, understand local challenges, develop ideas, build prototypes, receive mentorship, and present their solutions.</p>
        <p style="margin:0;font-size:16.5px;line-height:1.7;color:#5A544B;">The program focuses on the use of AI and digital technologies to develop solutions that can address community, climate, business, and other local challenges.</p>
      </div>
      <div style="position:relative;background:#8E2340;border-radius:20px;padding:38px 34px;overflow:hidden;">
        <div style="position:absolute;top:-90px;right:-70px;width:300px;height:300px;background:radial-gradient(circle,rgba(242,194,64,0.22),transparent 65%);"></div>
        <div style="position:relative;">
          <div style="font-size:11.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${YELLOW};margin-bottom:14px;">One program, many local labs</div>
          <div style="font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#fff;line-height:1.25;margin-bottom:14px;">Pilipinas Social Innovation for Kabataan Labs 2026</div>
          <p style="margin:0 0 22px;font-size:14.5px;line-height:1.6;color:rgba(255,255,255,0.62);">A UNDP Philippines Youth Co:Lab initiative. Baguio is one of the local SIKLabs feeding into the national program.</p>
          <div style="display:flex;flex-direction:column;gap:12px;border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;">
            ${["Multidisciplinary teams", "Real local challenges", "Prototypes, mentorship, and pitching"]
              .map((t) => `<div style="display:flex;align-items:center;gap:11px;font-size:15px;font-weight:500;color:#fff;">${icon(PATHS.check, YELLOW, 18)}<span>${t}</span></div>`)
              .join("")}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- WHO CAN APPLY -->
<div id="who" style="background:#fff;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="max-width:720px;margin-bottom:40px;">
      ${sectionHead("Who Can Apply?", "Open to young innovators across the BLISTT area.")}
      <p style="margin:0;font-size:16.5px;line-height:1.7;color:#5A544B;">PinaSIKLab Baguio is open to young people aged 18&ndash;30 who are residents, students, or workers within the BLISTT area.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
      <div style="background:#EEF3FA;border-radius:20px;padding:34px;">
        <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px;">
          <span style="font-size:56px;font-weight:600;letter-spacing:-0.04em;color:${ORANGE};line-height:1;">18&ndash;30</span>
          <span style="font-size:16px;font-weight:600;color:#1A1714;">years old</span>
        </div>
        <p style="margin:0 0 20px;font-size:14.5px;line-height:1.55;color:#5A544B;">Residents, students, or workers within the BLISTT area:</p>
        <div style="display:flex;flex-wrap:wrap;gap:9px;">
          ${["Baguio City", "La Trinidad", "Itogon", "Sablan", "Tuba", "Tublay"].map((m) => chip(m)).join("")}
        </div>
      </div>
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:20px;padding:34px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${ORANGE};margin-bottom:8px;">We welcome</div>
        <p style="margin:0 0 18px;font-size:14.5px;line-height:1.55;color:#5A544B;">If you&rsquo;re 18&ndash;30 and study, work, or live in the BLISTT area, there&rsquo;s a place for you, whatever your background.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px 20px;">
          ${["Students", "Young professionals", "Youth entrepreneurs", "Researchers", "Faculty", "Out-of-school youth"].map(checkItem).join("")}
        </div>
        <div style="margin:22px 0 0;padding-top:18px;border-top:1px solid rgba(64,50,34,0.1);">
          <p style="margin:0 0 14px;font-size:14.5px;line-height:1.55;color:#5A544B;">Apply with a team you&rsquo;ve already formed, or on your own. If you apply solo, you can find teammates in the Team Finder.</p>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            <a href="${BP}/pinasiklab/register/" class="ib-siklab-cta" style="display:inline-flex;align-items:center;background:${ORANGE};color:#fff;font-weight:600;font-size:13.5px;padding:10px 18px;border-radius:9999px;text-decoration:none;">Apply as a team</a>
            <a href="${BP}/pinasiklab/register/" style="display:inline-flex;align-items:center;background:#fff;color:#1A1714;font-weight:600;font-size:13.5px;padding:10px 18px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(64,50,34,0.2);">Apply as an individual</a>
            <a href="${BP}/pinasiklab/teams/" style="display:inline-flex;align-items:center;color:${ORANGE};font-weight:600;font-size:13.5px;padding:10px 6px;text-decoration:none;">Find teammates &rarr;</a>
          </div>
        </div>
      </div>
    </div>
    <div id="ib-sk-eligibility"></div>
    <div style="background:#EEF3FA;border-radius:20px;padding:30px 34px;">
      <p style="margin:0 0 16px;font-size:15.5px;line-height:1.6;color:#5A544B;">Teams are encouraged to bring together people with different skills, including:</p>
      <div style="display:flex;flex-wrap:wrap;gap:9px;">
        ${["Technology", "Design", "Business", "Research", "Communications", "Social innovation", "Relevant sector expertise"].map((s) => chip(s)).join("")}
      </div>
    </div>
  </div>
</div>

<!-- WHAT WILL YOU DO -->
<div id="program" style="background:#8E2340;padding:76px 40px;position:relative;overflow:hidden;scroll-margin-top:80px;">
  <div style="position:absolute;top:-120px;right:-80px;width:440px;height:440px;background:radial-gradient(circle,rgba(242,194,64,0.18),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="max-width:720px;margin-bottom:40px;">
      ${sectionHead("What Will You Do?", "A two-day innovation sprint.", true)}
      <p style="margin:0;font-size:16.5px;line-height:1.7;color:rgba(255,255,255,0.66);">PinaSIKLab Baguio is a two-day innovation sprint. Participants will work through the process of:</p>
    </div>
    <div class="ib-siklab-steps">
      ${STEPS.map(
        ([n, t, d], i) => `
      <div class="ib-sk-card" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-top:4px solid ${["#F2C240", "#7FBF63", "#6FA2E6", "#F7CE55", "#F08FA6"][i % 5]};border-radius:18px;padding:24px 22px;">
        <div style="font-size:13px;font-weight:700;letter-spacing:0.12em;color:${["#F2C240", "#7FBF63", "#6FA2E6", "#F7CE55", "#F08FA6"][i % 5]};margin-bottom:14px;">${n}</div>
        <h3 style="margin:0 0 10px;font-size:20px;font-weight:600;letter-spacing:-0.01em;color:#fff;">${t}</h3>
        <p style="margin:0;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.62);">${d}</p>
      </div>`
      ).join("")}
    </div>
    <p style="margin:32px 0 0;max-width:720px;font-size:15.5px;line-height:1.65;color:rgba(255,255,255,0.6);">The program is designed to strengthen participants&rsquo; capabilities in design thinking, technical development, business and social viability, and pitching.</p>
  </div>
</div>

<!-- THE CHALLENGE -->
<div id="challenge" style="background:#EEF3FA;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;">
      <div>
        ${sectionHead("The Challenge", "Real problems from Baguio and the BLISTT area.")}
        <p style="${PARA}">Participants will work on problem statements connected to the Baguio City Research and Innovation Agenda 2026 and relevant Sustainable Development Goals.</p>
        <p style="margin:0;font-size:16.5px;line-height:1.7;color:#5A544B;">The challenges are designed around real opportunities and problems facing Baguio and the wider BLISTT area.</p>
      </div>
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:20px;padding:34px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${ORANGE};margin-bottom:12px;">Challenge briefs</div>
        <p style="margin:0 0 20px;font-size:15.5px;line-height:1.6;color:#5A544B;">Challenge briefs will be published and updated here.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${
            CHALLENGE_BRIEFS_URL
              ? `<a href="${CHALLENGE_BRIEFS_URL}" target="_blank" rel="noopener noreferrer" class="ib-siklab-cta" style="display:inline-flex;align-items:center;gap:9px;background:${ORANGE};color:#fff;font-weight:600;font-size:14.5px;padding:13px 24px;border-radius:9999px;text-decoration:none;">View challenge briefs ${icon(PATHS.arrow, "#fff", 15)}</a>`
              : ""
          }
          <a href="${BP}/research-innovation-agenda/" style="display:inline-flex;align-items:center;font-weight:600;font-size:14.5px;color:#1A1714;padding:13px 24px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(64,50,34,0.2);">Read the Research &amp; Innovation Agenda</a>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- WHAT YOU CAN BUILD -->
<div id="build" style="background:#fff;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:start;margin-bottom:28px;">
      <div>
        ${sectionHead("What Can You Build?", "Prototypes, not just pitches.")}
        <p style="${PARA}">Your solution can take different forms depending on the problem you are addressing. Examples include:</p>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:20px;">
          ${["AI-enabled solutions", "Web or mobile applications", "Digital platforms", "Data-driven solutions", "IoT and hardware solutions", "Community-based innovations", "Technology-enabled products or services"].map((t) => chip(t)).join("")}
        </div>
      </div>
      <div style="background:#EEF3FA;border-radius:20px;padding:34px;">
        <p style="margin:0 0 6px;font-size:20px;font-weight:600;letter-spacing:-0.01em;color:#1A1714;">You don&rsquo;t need to be a programmer to participate.</p>
        <p style="margin:0 0 22px;font-size:15.5px;line-height:1.6;color:#5A544B;">What matters is bringing together the right combination of technical, design, business, research, community, and domain expertise to develop a solution as a team.</p>
        <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1A1714;">Strong solutions show clear potential for:</p>
        <div style="display:flex;flex-direction:column;gap:14px;">
          ${["Community impact", "Technical feasibility", "Social or business viability", "Scalability", "Potential implementation or adoption"].map(checkItem).join("")}
        </div>
      </div>
    </div>
    <div style="background:#8E2340;border-radius:20px;padding:30px 34px;border-left:4px solid ${YELLOW};">
      <p style="margin:0 0 6px;font-size:20px;font-weight:600;letter-spacing:-0.01em;color:#fff;">The goal is not simply to present an idea.</p>
      <p style="margin:0;font-size:15.5px;line-height:1.6;color:rgba(255,255,255,0.66);">Teams will be expected to develop a working prototype or demonstrable solution addressing their selected challenge.</p>
    </div>
  </div>
</div>

<!-- WHAT YOU GET -->
<div id="benefits" style="background:#EEF3FA;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="max-width:720px;margin-bottom:40px;">
      ${sectionHead("What You Get", "More than a weekend of building.")}
    </div>
    <div class="ib-siklab-cards" style="margin-bottom:20px;">
      ${BENEFITS.map(
        ([path, t, d], i) => {
          const [tint, ink] = [["#E3ECF8", "#2B63AE"], ["#FBF0CC", "#B8860B"], ["#F6DCE3", "#8E2340"], ["#E1F0D9", "#3F7A2A"]][i % 4];
          return `
      <div class="ib-sk-card" style="background:#fff;border:1px solid rgba(43,99,174,0.14);border-radius:20px;padding:28px;">
        <div style="width:54px;height:54px;border-radius:9999px;background:${tint};display:flex;align-items:center;justify-content:center;margin-bottom:18px;">${icon(path, ink, 24)}</div>
        <h3 style="margin:0 0 10px;font-size:18px;font-weight:600;letter-spacing:-0.01em;color:#1A1714;">${t}</h3>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#5A544B;">${d}</p>
      </div>`;
        }
      ).join("")}
    </div>
    <div id="prizes" style="scroll-margin-top:130px;position:relative;overflow:hidden;background:linear-gradient(135deg,#F7CE55 0%,#F2C240 60%,#E8B52E 100%);border-radius:20px;padding:34px 38px;margin-bottom:20px;display:flex;align-items:center;gap:26px;flex-wrap:wrap;box-shadow:0 26px 54px -24px rgba(31,76,140,0.5);">
      <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.18),transparent 55%);"></div>
      <span style="position:relative;width:64px;height:64px;border-radius:9999px;background:rgba(31,42,68,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon(PATHS.trophy, "#1F2A44", 30)}</span>
      <div style="position:relative;flex:1 1 320px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#7A1F38;margin-bottom:6px;">Prizes</div>
        <div style="font-size:34px;font-weight:600;letter-spacing:-0.03em;color:#1F2A44;line-height:1.1;">Up to &#8369;<span data-countup="100000">100,000</span> worth of prizes</div>
        <p style="margin:10px 0 0;font-size:15.5px;line-height:1.6;color:#3A3320;">Two days to build, pitch, and compete. The best teams take home prizes, and the Top 5 move on to the National Challenge.</p>
      </div>
    </div>
    <div style="position:relative;overflow:hidden;background:#8E2340;border-radius:20px;padding:32px 36px;display:flex;align-items:center;gap:22px;flex-wrap:wrap;">
      <div style="position:absolute;top:-80px;right:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(242,194,64,0.24),transparent 65%);"></div>
      <div style="position:relative;flex:1 1 320px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${YELLOW};margin-bottom:8px;">Pathway to the National Challenge</div>
        <p style="margin:0;font-size:18px;font-weight:500;line-height:1.5;color:#fff;">The Top 5 teams from the Baguio leg will advance to the PinaSIKLab National Challenge for further capacity building, mentorship, and pitching.</p>
      </div>
    </div>
  </div>
</div>

<!-- FROM BAGUIO TO THE NATIONAL STAGE -->
<div id="pathway" style="background:#173B73;padding:76px 40px;position:relative;overflow:hidden;scroll-margin-top:80px;">
  <div style="position:absolute;bottom:-140px;left:-80px;width:440px;height:440px;background:radial-gradient(circle,rgba(242,194,64,0.16),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="max-width:720px;margin-bottom:40px;">
      ${sectionHead("The Wider Program", "From Baguio to the National Stage", true)}
      <p style="margin:0;font-size:16.5px;line-height:1.7;color:rgba(255,255,255,0.66);">The Baguio leg is part of the wider PinaSIKLab 2026 national program.</p>
    </div>
    <div class="ib-siklab-flow">
      ${FLOW.map(
        (label, i) =>
          `${i > 0 ? `<span class="ib-siklab-flow-arrow" style="display:flex;align-items:center;justify-content:center;">${icon(PATHS.arrow, "rgba(255,255,255,0.4)", 20)}</span>` : ""}<div style="flex:1 1 150px;display:flex;align-items:center;justify-content:center;text-align:center;border-radius:16px;padding:20px 18px;font-size:15px;font-weight:600;line-height:1.3;${
            i === 0 ? `background:${YELLOW};color:#fff;border:1px solid ${YELLOW};` : "background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.14);"
          }">${label}</div>`
      ).join("")}
    </div>
    <p style="margin:32px 0 0;max-width:760px;font-size:15.5px;line-height:1.7;color:rgba(255,255,255,0.62);">The national PinaSIKLab challenge brings together the five winning teams from each local SIKLab for a three-day bootcamp. National winners may receive grants and mentorship opportunities, as well as the opportunity to participate in a regional activity in Japan.</p>
  </div>
</div>

<!-- EVENT DETAILS -->
<div id="details" style="background:#fff;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="max-width:720px;margin-bottom:40px;">
      ${sectionHead("Event Details", "PinaSIKLab Baguio 2026")}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div style="background:#EEF3FA;border-radius:20px;padding:12px 34px;">
        ${[
          [PATHS.calendar, "Date", "October 30&ndash;31, 2026"],
          [PATHS.pin, "Location", "To be added"],
          [PATHS.users, "Capacity", "30 teams"],
          [PATHS.user, "Eligibility", "Ages 18&ndash;30"],
          [PATHS.map, "Coverage", "Baguio City + BLISTT"],
        ]
          .map(
            ([path, label, value], i, arr) => `
        <div style="display:flex;align-items:center;gap:16px;padding:20px 0;${i < arr.length - 1 ? "border-bottom:1px solid rgba(64,50,34,0.11);" : ""}">
          <span style="width:42px;height:42px;border-radius:9999px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon(path, ORANGE, 19)}</span>
          <div>
            <div style="font-size:11.5px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#8A8378;">${label}</div>
            <div style="font-size:17px;font-weight:600;color:#1A1714;margin-top:2px;">${value}</div>
          </div>
        </div>`
          )
          .join("")}
      </div>
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:20px;padding:34px;display:flex;flex-direction:column;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${ORANGE};margin-bottom:10px;">Team format</div>
        <div style="font-size:36px;font-weight:600;letter-spacing:-0.03em;color:#1A1714;line-height:1.1;margin-bottom:20px;">Up to 5 members per team</div>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5A544B;">Build with a multidisciplinary team of up to five. Bring the team you&rsquo;ve already formed, or apply on your own and we&rsquo;ll help you find teammates whose skills fit yours.</p>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:28px;">
          ${chip("Existing team")}${chip("Individual applicant")}
        </div>
        <div style="margin-top:auto;">
          ${registerButton("Register now")}
          <p style="margin:14px 0 0;font-size:13.5px;color:#6E685F;">Registration deadline: <strong style="color:#1A1714;">${deadlineText}</strong></p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- FAQ -->
<div id="faq" style="background:#EEF3FA;padding:88px 40px;scroll-margin-top:80px;">
  <div style="max-width:860px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h2 style="margin:0;font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#1A1714;line-height:1.1;">Frequently asked questions</h2>
      <p style="margin:18px auto 0;font-size:16px;line-height:1.6;color:#5A544B;max-width:460px;">Everything you need to know before you apply to PinaSIKLab Baguio.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${FAQS.map(
        (f) => `
      <details class="ib-faq-item" style="background:#fff;border:1px solid rgba(64,50,34,0.1);border-radius:20px;overflow:hidden;">
        <summary class="ib-faq-summary" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 30px;">
          <span style="font-size:17px;font-weight:600;color:#1A1714;">${f.q}</span>
          <svg class="ib-faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${ORANGE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M6 9l6 6 6-6"></path></svg>
        </summary>
        <div style="padding:0 30px 26px;">
          <p style="margin:0;font-size:14.5px;line-height:1.65;color:#5A544B;max-width:680px;">${f.a}</p>
        </div>
      </details>`
      ).join("")}
    </div>
  </div>
</div>

<!-- READY TO PARTICIPATE -->
<div id="register" style="background:#fff;padding:72px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;background:linear-gradient(135deg,#2B63AE 0%,#245A9F 58%,#1F4C8C 100%);border-radius:24px;padding:60px 56px;position:relative;overflow:hidden;text-align:center;box-shadow:0 30px 60px -22px rgba(31,76,140,0.5);">
    <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.16),transparent 55%);"></div>
    <svg style="position:absolute;top:-30px;right:-20px;opacity:0.16;" width="320" height="280" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:620px;margin:0 auto;">
      <h2 style="margin:0 0 14px;font-size:38px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Ready to Participate?</h2>
      <p style="margin:0 0 10px;font-size:18px;font-weight:600;line-height:1.5;color:#fff;">Applications are now open for PinaSIKLab Baguio 2026.</p>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.9);">If you are 18&ndash;30 years old and live, study, or work in Baguio or the BLISTT area, you can apply as an individual or with your team. 30 teams maximum.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">${registerButton("Register for PinaSIKLab Baguio 2026", "dark")}${teamFinderButton("Find a team or teammate", true)}</div>
      <p style="margin:18px 0 0;font-size:14px;color:rgba(255,255,255,0.88);">Application deadline: <strong>${deadlineText}</strong></p>
    </div>
  </div>
</div>

<!-- SPONSORS & COLLABORATORS -->
<div id="partners" style="background:#EEF3FA;padding:64px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="background:#8E2340;border-radius:20px;padding:34px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;">
      <div style="position:absolute;top:-80px;right:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(242,194,64,0.22),transparent 65%);"></div>
      <div style="position:relative;flex:1 1 380px;">
        <div style="font-size:11.5px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${YELLOW};margin-bottom:10px;">For sponsors and collaborators</div>
        <div style="font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#fff;line-height:1.25;margin-bottom:10px;">Sponsor or collaborate with PinaSIKLab Baguio.</div>
        <p style="margin:0;font-size:14.5px;line-height:1.65;color:rgba(255,255,255,0.64);max-width:640px;">We&rsquo;re looking for mentors, judges, technical infrastructure, participant kits and merchandise, prizes, and more. Government agencies, schools, startups, industry, and individuals are all welcome.</p>
      </div>
      <a href="${BP}/pinasiklab/partner/" class="ib-siklab-cta" style="position:relative;display:inline-flex;align-items:center;gap:9px;background:${YELLOW};color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Become a partner ${icon(PATHS.arrow, "#fff", 15)}</a>
    </div>
  </div>
</div>

${footerHtml()}
`;

export default function PinaSIKLabPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(EVENT_JSON_LD) }} />
      <div dangerouslySetInnerHTML={{ __html: PAGE_HTML }} />
      <SiklabInteractive closesAt={REGISTRATION_CLOSES_AT} />
    </main>
  );
}
