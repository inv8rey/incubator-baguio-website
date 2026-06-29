import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Incubator Baguio",
  description:
    "Tell us what you're looking for and we'll guide you to the right support, programs, and ecosystem partners at Incubator Baguio.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const CARDS: {
  color: string;
  bg: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
}[] = [
  {
    color: "#F26522",
    bg: "rgba(242,101,34,0.16)",
    icon: `<path d="M14.5 2.5c2.5 0 4.5 2 4.5 4.5 0 4.5-3 8-7 10-4-2-7-5.5-7-10 0-2.5 2-4.5 4.5-4.5 1 0 2 .4 2.5 1 .5-.6 1.5-1 2.5-1Z"></path><path d="M9 14l-3 3 1 3 3-1"></path>`,
    title: "I have a startup",
    desc: "I'm building a startup and looking for support to grow.",
    href: `${BP}/programs`,
  },
  {
    color: "#D88A0A",
    bg: "rgba(245,166,35,0.18)",
    icon: `<path d="M12 2a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v1h6v-1c0-.4.1-.8.5-1.1A6 6 0 0 0 12 2Z"></path><path d="M9.5 18h5M10.5 21h3"></path>`,
    title: "I have a business idea",
    desc: "I have an idea and need help to validate and build it.",
    href: `${BP}/programs`,
  },
  {
    color: "#3F9E4D",
    bg: "rgba(126,217,87,0.18)",
    icon: `<path d="M9 2v6l-5 9.5A2 2 0 0 0 5.7 21h12.6a2 2 0 0 0 1.7-3.5L15 8V2"></path><path d="M7.5 14.5h9"></path><path d="M8 2h8"></path>`,
    title: "I'm a researcher",
    desc: "I want to commercialize research and connect with partners.",
    href: `${BP}/knowledge`,
  },
  {
    color: "#7C5CD6",
    bg: "rgba(124,92,214,0.18)",
    icon: `<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M16 7V5a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2"></path><path d="M3 12h18"></path>`,
    title: "I'm looking for funding",
    desc: "I'm looking for grants, investors, or funding opportunities.",
    href: `${BP}/ecosystem`,
  },
  {
    color: "#3A7BD5",
    bg: "rgba(58,123,213,0.16)",
    icon: `<circle cx="12" cy="8" r="4"></circle><path d="M5 21v-1a7 7 0 0 1 14 0v1"></path>`,
    title: "I'm looking for a mentor",
    desc: "I want to connect with mentors and experts.",
    href: `${BP}/ecosystem`,
  },
  {
    color: "#E23A2E",
    bg: "rgba(226,58,46,0.16)",
    icon: `<rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path>`,
    title: "I want to join events",
    desc: "I want to attend workshops, meetups, pitch events, and more.",
    href: `${BP}/events`,
  },
  {
    color: "#0F9B8E",
    bg: "rgba(15,155,142,0.16)",
    icon: `<rect x="4" y="3" width="9" height="18" rx="1"></rect><rect x="13" y="9" width="7" height="12" rx="1"></rect><path d="M7 7h3M7 11h3M7 15h3"></path>`,
    title: "I represent an organization",
    desc: "I'm part of an institution, company, or organization and want to collaborate.",
    href: `${BP}/challenges`,
  },
];

const STATS: { color: string; icon: string; title: string; desc: string }[] = [
  {
    color: "#F26522",
    icon: `<circle cx="9" cy="8" r="3"></circle><path d="M3.5 19a5.5 5.5 0 0 1 11 0"></path><circle cx="17.5" cy="9" r="2.3"></circle><path d="M15.2 19a4 4 0 0 1 7 0"></path>`,
    title: "Connected Ecosystem",
    desc: "Startups, universities, TBIs, investors, and partners.",
  },
  {
    color: "#F26522",
    icon: `<circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2Z"></path>`,
    title: "Right Support",
    desc: "We guide you to the right programs and people.",
  },
  {
    color: "#F26522",
    icon: `<path d="M3 17 9 11l4 4 8-8"></path><path d="M15 6h6v6"></path>`,
    title: "More Opportunities",
    desc: "Access funding, mentors, events, and resources.",
  },
  {
    color: "#F26522",
    icon: `<path d="M3 20 9 8l5 6 4-5 3 4"></path><path d="M3 20h18"></path>`,
    title: "Stronger Impact",
    desc: "Together, we build and grow Baguio's innovation ecosystem.",
  },
];

const HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="${BP}/get-started" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;">Get Started <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

<!-- ROUTER -->
<div style="background:#0B0B0D;padding:40px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div class="ib-getstarted-grid" style="display:grid;grid-template-columns:1.15fr 1fr 1fr 1fr 1fr;gap:18px;align-items:start;">

      <!-- HERO PANEL -->
      <div style="grid-column:1;grid-row:1;position:relative;background:linear-gradient(160deg,#1A0F08 0%,#0B0B0D 70%);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:30px 26px;overflow:hidden;display:flex;flex-direction:column;">
        <div style="position:absolute;top:-80px;left:-60px;width:280px;height:280px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.32),transparent 65%);pointer-events:none;"></div>
        <div style="position:relative;">
          <div style="font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">Welcome to Incubator Baguio</div>
          <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:700;letter-spacing:-0.025em;color:#fff;">What are you looking for today?<span style="color:#F26522;">.</span></h1>
          <div style="width:46px;height:3px;background:#F26522;border-radius:9999px;margin:18px 0;"></div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.6);">Tell us more so we can guide you to the right support, programs, and ecosystem partners.</p>
        </div>
        <svg style="position:relative;margin-top:auto;padding-top:26px;opacity:0.8;" width="100%" height="92" viewBox="0 0 360 110" fill="none" preserveAspectRatio="xMidYMax meet">
          <path d="M10 100 L40 100 L40 60 L60 60 L60 40 L80 40 L80 100" stroke="rgba(242,101,34,0.55)" stroke-width="1.5" fill="none"></path>
          <path d="M120 100 L120 50 L135 30 L150 50 L150 100" stroke="rgba(242,101,34,0.4)" stroke-width="1.5" fill="none"></path>
          <path d="M180 100 Q220 60 260 100" stroke="rgba(242,101,34,0.35)" stroke-width="1.5" fill="none"></path>
          <path d="M280 100 L300 70 L320 100" stroke="rgba(242,101,34,0.45)" stroke-width="1.5" fill="none"></path>
          <line x1="0" y1="100" x2="360" y2="100" stroke="rgba(255,255,255,0.12)" stroke-width="1"></line>
        </svg>
      </div>

      <!-- NOT SURE PANEL -->
      <div style="grid-column:1;grid-row:2;background:#141417;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px 24px;display:flex;gap:16px;align-items:flex-start;">
        <div style="width:42px;height:42px;border-radius:9999px;background:rgba(242,101,34,0.16);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z"></path><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z"></path></svg>
        </div>
        <div>
          <div style="font-size:14.5px;font-weight:600;color:#fff;margin-bottom:6px;">Not sure where to start?</div>
          <p style="margin:0 0 10px;font-size:13px;line-height:1.55;color:rgba(255,255,255,0.55);">Chat with our team and we&rsquo;ll help you find the right path.</p>
          <a href="mailto:hello@incubatorbaguio.ph" style="font-size:13px;font-weight:600;color:#F26522;text-decoration:none;display:inline-flex;align-items:center;gap:5px;">Chat with our team <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.6"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
        </div>
      </div>

      <!-- CARDS -->
      ${CARDS.map((c, i) => {
        const col = (i % 4) + 2;
        const row = i < 4 ? 1 : 2;
        return `
      <a href="${c.href}" class="ib-getstarted-card" style="grid-column:${col};grid-row:${row};text-decoration:none;background:#141417;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:22px 20px;display:flex;flex-direction:column;">
        <div style="width:46px;height:46px;border-radius:9999px;background:${c.bg};display:flex;align-items:center;justify-content:center;margin-bottom:14px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${c.icon}</svg>
        </div>
        <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:6px;">${c.title}</div>
        <p style="margin:0;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.55);">${c.desc}</p>
        <div style="margin-top:14px;width:30px;height:30px;border-radius:9999px;border:1.5px solid ${c.color};display:flex;align-items:center;justify-content:center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${c.color}" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </div>
      </a>`;
      }).join("")}
    </div>

    <!-- STAT STRIP -->
    <div style="margin-top:18px;background:#141417;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px 32px;display:flex;align-items:center;gap:32px;flex-wrap:wrap;">
      <div style="font-size:17px;font-weight:700;letter-spacing:-0.01em;color:#fff;line-height:1.4;flex-shrink:0;">WE CONNECT.<br>WE EMPOWER.<br><span style="color:#F26522;">WE GROW BAGUIO.</span></div>
      <div style="width:1px;height:64px;background:rgba(255,255,255,0.1);flex-shrink:0;" class="ib-getstarted-divider"></div>
      <div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;min-width:0;">
        ${STATS.map((s) => `
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:38px;height:38px;border-radius:9999px;background:rgba(242,101,34,0.14);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${s.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
          </div>
          <div><div style="font-size:13.5px;font-weight:600;color:#fff;margin-bottom:4px;">${s.title}</div><p style="margin:0;font-size:12px;line-height:1.5;color:rgba(255,255,255,0.5);">${s.desc}</p></div>
        </div>`).join("")}
      </div>
    </div>

    <!-- PRIVACY NOTE -->
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;padding:14px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>
      <span style="font-size:12.5px;color:rgba(255,255,255,0.4);">Your information is safe and will only be used to connect you with relevant support.</span>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:0 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);padding-top:40px;border-top:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/events">Events</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>Startup Incubation</span><span>Research Submission</span><span>Mentor Registration</span><span>Partner Inquiry</span></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>hello@incubatorbaguio.ph</span><span>Facebook &middot; LinkedIn</span></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

export default function GetStarted() {
  return <main dangerouslySetInnerHTML={{ __html: HTML }} />;
}
