import type { Metadata } from "next";
import EcosystemModel from "./programs/EcosystemModel";
import WhoWeAre from "./WhoWeAre";
import FeaturedStartups from "./FeaturedStartups";
import HomeOpenChallenges from "./HomeOpenChallenges";
import HomeEvents from "./HomeEvents";
import HomeGallery from "./HomeGallery";
import EcosystemPartnersMarquee from "./EcosystemPartnersMarquee";
import NewsletterSignup from "./NewsletterSignup";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HOME_HTML_TOP = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 40px;background:#100D0B;position:sticky;top:0;z-index:50;">
  <div style="display:flex;align-items:center;gap:11px;">
    <img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:48px;width:auto;display:block;">
    <img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:48px;width:auto;display:block;">
    <img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:34px;width:auto;display:block;">
    <div style="font-size:16px;font-weight:600;color:#fff;letter-spacing:-0.01em;">Incubator Baguio</div>
  </div>
  <div style="display:flex;align-items:center;gap:30px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/get-started" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;">Get Started <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:96px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-160px;left:50%;transform:translateX(-50%);width:640px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 62%);pointer-events:none;animation:ibglow 8s ease-in-out infinite;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="760" height="430" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:900px;margin:0 auto;">
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:32px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;animation:ibpulse 2.4s ease-in-out infinite;"></span></span>
      <span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Baguio City&rsquo;s Innovation Platform</span>
    </div>
    <h1 style="margin:0;font-size:74px;line-height:1.02;font-weight:500;letter-spacing:-0.042em;color:#fff;">Turning City Priorities<br>into&nbsp;<span style="color:#F26522;">Innovation.</span></h1>
    <p style="margin:28px auto 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:580px;">Incubator Baguio brings government, academia, industry, and society together to turn research, ideas, and real-world challenges into solutions that create lasting value for Baguio City.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:38px;flex-wrap:wrap;">
      <a href="${BP}/programs" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px -14px rgba(242,101,34,0.7);">Find Innovator Support
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/ecosystem" class="ib-cta-ghost" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.02);">Explore the Ecosystem</a>
    </div>
  </div>
</div>

<!-- STAT BAND — seamless dark continuation of the hero, restrained accents -->
<div style="background:#100D0B;padding:0 40px 72px;">
  <div style="max-width:1120px;margin:0 auto;border-top:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:repeat(4,1fr);">
    ${[
      ["9", "+", "Active innovators", false],
      ["8", "+", "Ecosystem partners", true],
      ["4", "", "TBIs", true],
      ["&#8734;", "", "Opportunities to build", true],
    ].map((s) => `<div style="text-align:center;padding:44px 20px 4px;${s[3] ? "border-left:1px solid rgba(255,255,255,0.08);" : ""}"><div style="font-size:46px;font-weight:500;color:#fff;letter-spacing:-0.03em;line-height:1;">${s[0]}<span style="color:#F26522;">${s[1]}</span></div><div style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-top:12px;">${s[2]}</div></div>`).join("")}
  </div>
</div>
`;

// Parked at the City's request — not rendered. Kept intact so it can be dropped
// back into <main> below whenever the signup flow is ready to promote again.
const HOME_HTML_HOW_IT_WORKS = `
<!-- HOW IT WORKS -->
<div style="background:#F6F2EA;padding:84px 40px;border-top:1px solid rgba(64,50,34,0.09);">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">How it works</div>
      <h2 style="margin:0;font-size:40px;font-weight:500;letter-spacing:-0.03em;color:#1A1714;line-height:1.08;">From idea to launch, guided at every step</h2>
      <p style="margin:14px auto 0;font-size:15.5px;line-height:1.6;color:#5A544B;max-width:520px;">One free account plugs you into every incubator, mentor, and opportunity in the city.</p>
    </div>
    <div style="position:relative;">
      <div class="ib-journey-line"></div>
      <div class="ib-journey-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px;position:relative;">
        ${[
          ["01", "#F26522", "rgba(242,101,34,0.1)", "Join the ecosystem", "Create a free account and tell us what you&rsquo;re building &mdash; an innovation, research project, or idea."],
          ["02", "#285E7A", "rgba(40,94,122,0.1)", "Build your presence", "Publish your innovation, mentor, or organization profile to the city&rsquo;s ecosystem directory."],
          ["03", "#9E2A52", "rgba(158,42,82,0.1)", "Get matched", "Connect with mentors, TBIs, co-founders, and open challenges that fit your stage and sector."],
          ["04", "#1A6B3C", "rgba(26,107,60,0.1)", "Grow with Baguio", "Join programs, workshops, and Startup Week to scale alongside the whole ecosystem."],
        ].map((s) => `
        <div style="text-align:center;padding:0 6px;">
          <div style="width:62px;height:62px;border-radius:9999px;background:#fff;border:2px solid ${s[1]};color:${s[1]};display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;margin:0 auto 18px;box-shadow:0 0 0 8px #F6F2EA,var(--ib-shadow-sm);position:relative;">${s[0]}</div>
          <h3 style="margin:0 0 8px;font-size:17.5px;font-weight:600;letter-spacing:-0.01em;color:#1A1714;">${s[3]}</h3>
          <p style="margin:0;font-size:13.5px;line-height:1.6;color:#5A544B;">${s[4]}</p>
        </div>`).join("")}
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-top:52px;flex-wrap:wrap;">
      <a href="${BP}/signup" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Create your free account<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/get-started" style="font-size:14.5px;font-weight:600;color:#1A1714;text-decoration:none;border-bottom:2px solid rgba(242,101,34,0.4);padding-bottom:2px;">or tell us what you need</a>
    </div>
  </div>
</div>
`;

const HOME_HTML_BOTTOM_A = `
<!-- INNOVATION CHALLENGES — who the problems come from -->
<div style="background:#FCFAF6;padding:92px 40px 0;">
  <div style="max-width:1120px;margin:0 auto;">
    <div style="max-width:620px;margin-bottom:52px;">
      <div style="display:inline-flex;align-items:center;gap:9px;margin-bottom:16px;">
        <span style="width:22px;height:1px;background:rgba(242,101,34,0.5);"></span>
        <span style="font-size:11.5px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#F26522;">Innovation Challenges</span>
      </div>
      <h2 style="margin:0 0 16px;font-size:40px;font-weight:500;letter-spacing:-0.032em;color:#1A1714;line-height:1.14;">Problem statements from across the Quadruple Helix</h2>
      <p style="margin:0;font-size:16px;line-height:1.68;color:#5A544B;">Every sector of the city brings its own open problems. Anyone in the ecosystem can pick one up and build against it.</p>
    </div>
    <div class="ib-challenge-cats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        ["#22596F", "Government", "Smarter public services", "LGUs post operational challenges in transport, waste, tourism, and digital governance for the community to solve."],
        ["#D9531E", "Industry", "MSME growth problems", "Local businesses surface bottlenecks in operations, supply chains, and market access that innovators can address."],
        ["#8E2749", "Academia", "Research to market", "Universities open up applied research questions and technologies seeking commercialization partners."],
        ["#5A4BC4", "Society", "Community-led solutions", "Civic groups and community organizations surface local needs and social challenges for innovators to solve."],
      ].map((c) => `
      <div class="ib-card-hover ib-helix-card" style="background:#fff;border:1px solid rgba(64,50,34,0.1);border-radius:18px;padding:26px 24px 22px;display:flex;flex-direction:column;box-shadow:var(--ib-shadow-sm);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <span style="width:7px;height:7px;border-radius:9999px;background:${c[0]};flex-shrink:0;"></span>
          <span style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${c[0]};">${c[1]}</span>
        </div>
        <h3 style="margin:0 0 9px;font-size:18.5px;font-weight:600;letter-spacing:-0.016em;color:#1A1714;line-height:1.25;">${c[2]}</h3>
        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#5A544B;">${c[3]}</p>
        <a href="${BP}/challenges" style="margin-top:auto;display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:${c[0]};text-decoration:none;">Explore challenges<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c[0]}" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`).join("")}
    </div>
  </div>
</div>
`;

// The testimonials that used to sit here were placeholder quotes, so they were
// removed. <HomeGallery /> takes this slot with real, admin-uploaded photos.

// Events now render from Supabase via <HomeEvents />, which slots in here.

const HOME_HTML_STARTUP_WEEK = `
<!-- STARTUP WEEK FEATURE -->
<div style="background:#131110;padding:0 40px;">
  <div style="max-width:1060px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;align-items:stretch;">
    <div style="padding:72px 40px 72px 0;display:flex;flex-direction:column;justify-content:center;">
      <span style="display:inline-block;width:fit-content;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#FFB489;padding:6px 12px;border-radius:9999px;border:1px solid rgba(242,101,34,0.4);background:rgba(242,101,34,0.12);margin-bottom:20px;">Flagship event &middot; 3rd week of April</span>
      <h2 style="margin:0 0 14px;font-size:40px;font-weight:500;letter-spacing:-0.025em;color:#fff;line-height:1.08;">Innovation Startup Week 2026</h2>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:420px;">A full week of pitching, demos, and matchmaking. 10+ innovators, investors, mentors, and the public, all in one place.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;"><a href="${BP}/calendar" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;white-space:nowrap;">View Event</a><a href="${BP}/calendar" class="ib-cta-ghost" style="color:#fff;font-weight:600;font-size:15px;padding:14px 24px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);white-space:nowrap;">View schedule</a></div>
    </div>
    <div style="position:relative;background:radial-gradient(120% 90% at 70% 15%,#221E19 0%,#16130F 60%);min-height:440px;display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(255,255,255,0.06);overflow:hidden;">
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(242,101,34,0.14),transparent 50%);"></div>
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at 60% 40%,#000 30%,transparent 72%);-webkit-mask-image:radial-gradient(circle at 60% 40%,#000 30%,transparent 72%);"></div>
      <div style="position:absolute;top:32px;right:32px;text-align:right;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;">April 2026</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px;">Baguio Convention Center</div>
      </div>
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:210px;height:210px;border-radius:9999px;border:1px solid rgba(255,255,255,0.07);"></div>
        <div style="position:absolute;width:290px;height:290px;border-radius:9999px;border:1px solid rgba(255,255,255,0.045);"></div>
        <svg width="132" height="114" viewBox="0 0 120 104" fill="none" style="position:relative;animation:ibfloat 6s ease-in-out infinite;filter:drop-shadow(0 16px 32px rgba(0,0,0,0.5));"><polyline points="12,40 60,12 108,40" stroke="#F5A623" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,60 60,32 108,60" stroke="#E23A2E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,80 60,52 108,80" stroke="#9E2A52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,100 60,72 108,100" stroke="#285E7A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
      </div>
      <div style="position:absolute;left:32px;bottom:30px;display:flex;gap:8px;">
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Pitch Day</span>
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Demos</span>
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Matchmaking</span>
      </div>
    </div>
  </div>
</div>
`;

const HOME_HTML_BOTTOM_B2 = `
<!-- FOOTER -->
<div style="background:#100D0B;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:54px;width:auto;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:54px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/calendar">Calendar</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/dashboard/innovator">Innovator Incubation</a><a class="ib-footlink" href="${BP}/challenges/post">Post a Challenge</a><a class="ib-footlink" href="${BP}/dashboard/mentor">Mentor Registration</a><a class="ib-footlink" href="${BP}/dashboard/organizations">Partner Inquiry</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>incubatorbaguio63@gmail.com</span><a class="ib-footlink" href="https://www.facebook.com/incubatorbaguio" target="_blank" rel="noopener noreferrer">Facebook</a></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

// Distinct from ORG_JSON_LD below — WebSite tells Google which single URL
// represents "Incubator Baguio" as a site (vs. Organization, which describes
// the alliance as an entity). Both signals together are what Google uses to
// pick the canonical result for a branded/name search.
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Incubator Baguio",
  alternateName: "Baguio City Research and Innovation Alliance",
  url: "https://incubator-baguio.vercel.app/",
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Incubator Baguio",
  alternateName: "Baguio City Research and Innovation Alliance",
  url: "https://incubator-baguio.vercel.app/",
  logo: "https://incubator-baguio.vercel.app/assets/ib-icon.png",
  description:
    "Incubator Baguio connects innovators, universities, Technology Business Incubators, government agencies, investors, and industry partners to accelerate innovation and strengthen the Baguio innovation ecosystem.",
  email: "incubatorbaguio63@gmail.com",
  sameAs: ["https://www.facebook.com/incubatorbaguio"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "CPDSO, City Hall",
    addressLocality: "Baguio City",
    addressRegion: "Benguet",
    addressCountry: "PH",
  },
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_TOP }} />
      <WhoWeAre />
      <EcosystemModel />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_A }} />
      <HomeOpenChallenges bp={BP} />
      <FeaturedStartups bp={BP} />
      <HomeGallery bp={BP} />
      <HomeEvents bp={BP} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_STARTUP_WEEK }} />
      <NewsletterSignup />
      <EcosystemPartnersMarquee />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_B2 }} />
    </main>
  );
}
