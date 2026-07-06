import type { Metadata } from "next";
import EcosystemDirectory from "../ecosystem/EcosystemDirectory";
import EcosystemSignupForm from "../ecosystem-signup/EcosystemSignupForm";
import EcosystemPartnersMarquee from "../EcosystemPartnersMarquee";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "Incubator Baguio — Coming July 2026",
  description:
    "Incubator Baguio is launching this July. Join the ecosystem and be part of Baguio's innovation and startup community from day one.",
  robots: { index: false, follow: false },
};

const TOP_HTML = `
<!-- HEADER -->
<div style="display:flex;align-items:center;justify-content:center;padding:20px 40px;background:#0B0B0D;">
  <div style="display:flex;align-items:center;gap:11px;">
    <img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:42px;width:auto;">
    <img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:30px;width:auto;">
    <div style="font-size:15px;font-weight:600;color:#fff;">Incubator Baguio</div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:88px 40px 64px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-160px;left:50%;transform:translateX(-50%);width:640px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 62%);pointer-events:none;animation:ibglow 8s ease-in-out infinite;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="760" height="430" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:820px;margin:0 auto;">
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:28px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;animation:ibpulse 2.4s ease-in-out infinite;"></span></span>
      <span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Launching July 2026</span>
    </div>
    <h1 style="margin:0;font-size:60px;line-height:1.05;font-weight:700;letter-spacing:-0.035em;color:#fff;">The home for Baguio&rsquo;s&nbsp;<span style="color:#F26522;">startup and innovation ecosystem.</span></h1>
    <p style="margin:26px auto 0;font-size:17.5px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:620px;">Incubator Baguio is the digital gateway to the city&rsquo;s innovation ecosystem, connecting people with opportunities, programs, mentors, challenges, funding, and partnerships.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:36px;flex-wrap:wrap;">
      <a href="#join" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px -14px rgba(242,101,34,0.7);">Get counted before we launch
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="#ecosystem" class="ib-cta-ghost" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.02);">See who&rsquo;s already in</a>
    </div>
  </div>
</div>

<!-- WHAT'S INSIDE -->
<div style="background:#FAFAF7;padding:80px 40px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">What&rsquo;s inside</div>
      <h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.1;">Designed to connect Baguio&rsquo;s innovation ecosystem.</h2>
      <p style="margin:14px auto 0;font-size:15.5px;line-height:1.6;color:#6B6B73;max-width:600px;">Browse ecosystem directories, discover innovation challenges, connect with mentors, and stay informed through a shared calendar of research and innovation activities.</p>
    </div>
    <div class="ib-teaser-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        [
          "#F26522",
          "rgba(242,101,34,0.1)",
          `<ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path>`,
          "Ecosystem Database",
          "Browse startups, mentors, universities, government agencies, Technology Business Incubators, coworking spaces, and ecosystem partners in one searchable directory.",
        ],
        [
          "#285E7A",
          "rgba(40,94,122,0.1)",
          `<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1"></circle>`,
          "Open Innovation Challenges",
          "Explore challenge statements from government, industry, MSMEs, and academia and collaborate on solutions with real impact.",
        ],
        [
          "#9E2A52",
          "rgba(158,42,82,0.1)",
          `<circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path>`,
          "Mentor Directory",
          "Find mentors across technology, business, research, product, finance, legal, and commercialization.",
        ],
        [
          "#1A6B3C",
          "rgba(26,107,60,0.1)",
          `<rect x="3" y="5" width="18" height="16" rx="2.5"></rect><path d="M16 3v4M8 3v4M3 10h18"></path>`,
          "Centralized Calendar",
          "Access a shared calendar of startup events, workshops, Demo Days, funding calls, research activities, and innovation programs across the city.",
        ],
      ].map((c) => `
      <div class="ib-card-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.09);border-radius:18px;padding:26px 22px;border-top:3px solid ${c[0]};display:flex;flex-direction:column;">
        <div style="width:44px;height:44px;border-radius:12px;background:${c[1]};display:flex;align-items:center;justify-content:center;margin-bottom:16px;flex-shrink:0;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${c[0]}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${c[2]}</svg>
        </div>
        <h3 style="margin:0 0 8px;font-size:16.5px;font-weight:600;color:#141417;">${c[3]}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.55;color:#6B6B73;">${c[4]}</p>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- BACKED BY -->
<div style="background:#fff;padding:16px 40px 8px;text-align:center;">
  <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#9A958B;">Backed by</div>
</div>
`;

const ECOSYSTEM_INTRO_HTML = `
<div id="ecosystem" style="scroll-margin-top:24px;"></div>
`;

const JOIN_INTRO_HTML = `
<div id="join" style="scroll-margin-top:24px;background:#FAFAF7;padding:80px 24px 0;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:720px;margin:0 auto;text-align:center;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Get counted before we launch</div>
    <h2 style="margin:0 0 12px;font-size:34px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.12;">Tell us about you</h2>
    <p style="margin:0;font-size:14.5px;line-height:1.6;color:#6B6B73;">Submit your startup, mentor profile, or organization now, so you&rsquo;re already featured in the Ecosystem directory the moment Incubator Baguio launches. Every submission is reviewed before it goes live.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- FOOTER -->
<div style="background:#0B0B0D;padding:40px 24px;text-align:center;">
  <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:12px;">
    <img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:36px;width:auto;">
    <img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:26px;width:auto;">
    <div style="font-size:14px;font-weight:600;color:#fff;">Incubator Baguio</div>
  </div>
  <p style="margin:0;font-size:12.5px;color:rgba(255,255,255,0.4);">&copy; 2026 City Government of Baguio &middot; CPDSO &mdash; Launching July 2026</p>
</div>
`;

export default function ComingSoonPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FAFAF7" }}>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <EcosystemPartnersMarquee />
      <div dangerouslySetInnerHTML={{ __html: ECOSYSTEM_INTRO_HTML }} />
      <EcosystemDirectory />
      <div dangerouslySetInnerHTML={{ __html: JOIN_INTRO_HTML }} />
      <div style={{ background: "#FAFAF7", padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <EcosystemSignupForm />
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
