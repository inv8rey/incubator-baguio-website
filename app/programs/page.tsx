import type { Metadata } from "next";
import EcosystemModel from "./EcosystemModel";

export const metadata: Metadata = {
  title: "Programs — Incubator Baguio",
  description:
    "Pathways for founders, youth, researchers, and partners — mapped to the functions of the Alliance under Ordinance No. 63.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Incubator Baguio?",
    a: "Incubator Baguio is Baguio City&rsquo;s innovation and startup ecosystem platform. We connect founders, researchers, universities, government, industry, investors, and ecosystem partners to accelerate innovation and entrepreneurship.",
  },
  {
    q: "Do I need an existing startup to join?",
    a: "No. Whether you&rsquo;re exploring an idea, validating a problem, building your first product, or scaling an existing startup, we&rsquo;ll help connect you with the right programs and ecosystem partners.",
  },
  {
    q: "Does Incubator Baguio provide funding?",
    a: "Incubator Baguio does not directly invest in startups. Instead, we help founders become investment-ready and connect them with grants, investors, government funding, corporate innovation programs, and other financing opportunities.",
  },
  {
    q: "How is Incubator Baguio different from a university incubator?",
    a: "University incubators focus on supporting startups within their institutions. Incubator Baguio coordinates the broader ecosystem by connecting founders with universities, government agencies, investors, corporations, mentors, and other ecosystem partners. We complement existing incubators rather than replace them.",
  },
  {
    q: "How do I get started?",
    a: "Choose the pathway that best describes your current stage, submit an inquiry, and our team will connect you with the most appropriate programs, partners, or support services within the ecosystem.",
  },
];

const PATHS: {
  color: string;
  bg: string;
  icon: string;
  title: string;
  desc: string;
  items: string[];
  cta: string;
  href: string;
}[] = [
  {
    color: "#F26522",
    bg: "rgba(242,101,34,0.12)",
    icon: `<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path>`,
    title: "I Have an Idea",
    desc: "I want to turn my idea into something real.",
    items: ["Founder Discovery Session", "Idea Validation", "Customer Discovery", "Business Model Design"],
    cta: "Start Here",
    href: `${BP}/get-started`,
  },
  {
    color: "#E23A2E",
    bg: "rgba(226,58,46,0.12)",
    icon: `<path d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z"></path><circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none"></circle>`,
    title: "I'm Building a Startup",
    desc: "I'm ready to grow my startup.",
    items: ["Startup Incubation", "Mentorship", "Investor Readiness", "Demo Day", "Product Validation"],
    cta: "Grow My Startup",
    href: `${BP}/get-started`,
  },
  {
    color: "#285E7A",
    bg: "rgba(40,94,122,0.12)",
    icon: `<path d="M9 2v6l-5 9.5A2 2 0 0 0 5.7 21h12.6a2 2 0 0 0 1.7-3.5L15 8V2"></path><path d="M7.5 14.5h9"></path><path d="M8 2h8"></path>`,
    title: "I'm a Researcher",
    desc: "I want my research to create real-world impact.",
    items: ["Research Commercialization", "Industry Matching", "IP Support", "Startup Formation"],
    cta: "Commercialize Research",
    href: `${BP}/knowledge`,
  },
  {
    color: "#7C5CD6",
    bg: "rgba(124,92,214,0.14)",
    icon: `<path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a3 3 0 0 1 6 0v4"></path>`,
    title: "I'm an Organization",
    desc: "I have a problem that needs innovative solutions.",
    items: ["Open Innovation Challenges", "Corporate Innovation", "Government Innovation", "Innovation Consulting"],
    cta: "Submit a Challenge",
    href: `${BP}/challenges/post`,
  },
  {
    color: "#1A6B3C",
    bg: "rgba(26,107,60,0.12)",
    icon: `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
    title: "I Want to Help",
    desc: "I want to contribute to the ecosystem.",
    items: ["Become a Mentor", "Become a Partner", "Sponsor Programs", "Volunteer"],
    cta: "Get Involved",
    href: `${BP}/ecosystem`,
  },
];

const PROGRAMS_HTML_TOP = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:32px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;overflow:hidden;">
  <div class="ib-programs-hero" style="max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1.3fr 1fr;align-items:stretch;">
    <div style="position:relative;padding:88px 40px;display:flex;flex-direction:column;justify-content:center;">
      <div style="position:absolute;top:-120px;left:-100px;width:420px;height:420px;background:radial-gradient(circle,rgba(242,101,34,0.2),transparent 65%);pointer-events:none;"></div>
      <div style="position:relative;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:16px;">Programs &amp; Opportunities</div>
        <h1 style="margin:0;font-size:46px;font-weight:800;letter-spacing:-0.03em;color:#fff;line-height:1.12;max-width:560px;">Find the Right Opportunity for Your <span style="color:#F26522;">Innovation Journey.</span></h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.62);max-width:520px;">Whether you&rsquo;re a founder, student, researcher, mentor, investor, or organization, discover programs, events, funding opportunities, and ecosystem initiatives designed to help you succeed.</p>

        <div style="display:grid;grid-template-columns:repeat(2,auto);gap:16px 36px;margin:32px 0 30px;">
          ${[
            ["#F26522", "rgba(242,101,34,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F5A07A" stroke-width="2"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.3"></circle><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 .8-3.5 2-4"></path></svg>`, "15+", "Programs &amp; Initiatives"],
            ["#E23A2E", "rgba(226,58,46,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F0938C" stroke-width="2"><path d="M20.8 4.6a4.7 4.7 0 0 0-6.6 0L12 6.8l-2.2-2.2a4.7 4.7 0 0 0-6.6 6.6L12 20l8.8-8.8a4.7 4.7 0 0 0 0-6.6Z"></path></svg>`, "8", "Ecosystem Partners"],
            ["#E23A2E", "rgba(226,58,46,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F0938C" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`, "4", "Technology Business Incubators"],
            ["#285E7A", "rgba(58,123,213,0.16)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7BAEE8" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path></svg>`, "Year-round", "Activities &amp; Events"],
          ].map((s) => `
          <div style="display:flex;align-items:center;gap:11px;">
            <div style="width:38px;height:38px;border-radius:9999px;background:${s[1]};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${s[2]}</div>
            <div><div style="font-size:19px;font-weight:700;color:#fff;letter-spacing:-0.01em;line-height:1.1;">${s[3]}</div><div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">${s[4]}</div></div>
          </div>`).join("")}
        </div>

        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a href="#program-grid" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:15px 28px;border-radius:9999px;text-decoration:none;">Explore Opportunities
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
          <a href="${BP}/ecosystem" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15px;padding:15px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">See How We Support You
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
        </div>
      </div>
    </div>

    <div style="position:relative;overflow:hidden;background:radial-gradient(120% 90% at 78% 30%,#F2A24A 0%,#C9591F 28%,#5A1E12 55%,#0B0B0D 80%);">
      <div style="position:absolute;inset:0;background:linear-gradient(100deg,#0B0B0D 0%,rgba(11,11,13,0.4) 22%,transparent 48%);"></div>
      <svg style="position:absolute;left:0;top:0;width:100%;height:100%;" viewBox="0 0 600 560" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M40 470 L130 470 L130 380 L190 380 L190 320 L250 320 L250 470" stroke="rgba(20,10,5,0.55)" stroke-width="3" fill="none"></path>
        <path d="M320 470 L320 300 L360 250 L400 300 L400 470" stroke="rgba(20,10,5,0.5)" stroke-width="3" fill="none"></path>
        <path d="M430 470 Q480 360 540 470" stroke="rgba(20,10,5,0.45)" stroke-width="3" fill="none"></path>
        <line x1="0" y1="470" x2="600" y2="470" stroke="rgba(20,10,5,0.5)" stroke-width="2"></line>
        <g opacity="0.55" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="80,260 300,80 520,260" stroke="#F5A623" stroke-width="14"></polyline>
          <polyline points="120,330 300,170 480,330" stroke="#E23A2E" stroke-width="14"></polyline>
        </g>
      </svg>
    </div>
  </div>
</div>
`;

const PROGRAMS_HTML_BOTTOM = `
<!-- WHAT BRINGS YOU HERE (bento) -->
<div id="program-grid" style="background:#FAFAF7;padding:64px 40px;border-bottom:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Get Started</div>
      <h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#141417;">What brings <span style="color:#F26522;">you</span> here?</h2>
      <p style="margin:14px auto 0;font-size:15px;line-height:1.6;color:#6B6B73;max-width:520px;">Choose the path that fits you best. We&rsquo;ll help you take the next step.</p>
    </div>
    <div class="ib-brings-grid" style="display:grid;grid-template-columns:repeat(12,1fr);gap:18px;">
      ${PATHS.map((p, i) => {
        const span = i < 3 ? 4 : 6;
        const wide = span === 6;
        return `
      <div class="ib-challenge-hover" style="grid-column:span ${span};background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;padding:30px 28px;display:flex;flex-direction:column;">
        <div style="width:56px;height:56px;border-radius:9999px;background:${p.bg};display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${p.color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p.icon}</svg>
        </div>
        <h3 style="margin:0 0 8px;font-size:19px;font-weight:700;color:#141417;letter-spacing:-0.01em;">${p.title}</h3>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#6B6B73;">${p.desc}</p>
        <div style="display:grid;grid-template-columns:${wide ? "repeat(2,1fr)" : "1fr"};gap:9px 18px;padding-top:16px;border-top:1px solid rgba(20,20,25,0.07);margin-bottom:24px;flex:1;">
          ${p.items.map((it) => `<div style="display:flex;align-items:center;gap:9px;font-size:13.5px;color:#44444C;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${p.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 6 9 17l-5-5"></path></svg>${it}</div>`).join("")}
        </div>
        <a href="${p.href}" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid ${p.color};color:${p.color};font-weight:600;font-size:14px;padding:12px 20px;border-radius:9999px;text-decoration:none;">${p.cta} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${p.color}" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`;
      }).join("")}
    </div>
  </div>
</div>

<!-- FAQ -->
<div style="background:#fff;padding:88px 40px;">
  <div style="max-width:860px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h2 style="margin:0;font-size:46px;font-weight:800;letter-spacing:-0.03em;color:#141417;line-height:1.1;">Frequently asked questions</h2>
      <p style="margin:18px auto 0;font-size:16px;line-height:1.6;color:#6B6B73;max-width:420px;">Everything you need to know about the Incubator Baguio ecosystem.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${FAQS.map((f) => `
      <details class="ib-faq-item" style="background:#F7F3ED;border-radius:20px;overflow:hidden;">
        <summary class="ib-faq-summary" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 32px;">
          <span style="font-size:17px;font-weight:600;color:#141417;">${f.q}</span>
          <svg class="ib-faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M6 9l6 6 6-6"></path></svg>
        </summary>
        <div style="padding:0 32px 28px;">
          <p style="margin:0;font-size:14.5px;line-height:1.65;color:#6B6B73;max-width:680px;">${f.a}</p>
        </div>
      </details>`).join("")}
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:38px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/calendar">Calendar</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/dashboard/startup">Startup Incubation</a><a class="ib-footlink" href="${BP}/challenges/post">Post a Challenge</a><a class="ib-footlink" href="${BP}/dashboard/mentor">Mentor Registration</a><a class="ib-footlink" href="${BP}/dashboard/organizations">Partner Inquiry</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>hello@incubatorbaguio.ph</span><a class="ib-footlink" href="https://www.facebook.com/incubatorbaguio" target="_blank" rel="noopener noreferrer">Facebook</a></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

export default function Programs() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: PROGRAMS_HTML_TOP }} />
      <EcosystemModel />
      <div dangerouslySetInnerHTML={{ __html: PROGRAMS_HTML_BOTTOM }} />
    </main>
  );
}
