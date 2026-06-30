import type { Metadata } from "next";
import EcosystemDirectory from "./EcosystemDirectory";

export const metadata: Metadata = {
  title: "Ecosystem — Incubator Baguio",
  description:
    "One alliance of universities, agencies, companies, and mentors backing Baguio's founders and researchers.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:56px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-120px;left:50%;transform:translateX(-50%);width:560px;height:560px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.30) 0%,transparent 60%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.14;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:820px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Ecosystem</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:24px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Partners, mentors &amp; startups</span></div>
    <h1 style="margin:0;font-size:56px;line-height:1.02;font-weight:700;letter-spacing:-0.035em;color:#fff;">The people building<br><span style="color:#F26522;">Baguio&rsquo;s future.</span></h1>
    <p style="margin:22px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:600px;">One alliance of universities, agencies, companies, and mentors, all backing the city&rsquo;s founders and researchers.</p>
  </div>
</div>

<!-- STAT STRIP -->
<div style="background:#F26522;padding:30px 40px;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
    ${[
      ["12", "Academic partners", false],
      ["8", "Government agencies", true],
      ["40+", "Active mentors", true],
      ["10+", "Startups in portfolio", true],
    ].map((s) => `<div style="text-align:center;${s[2] ? "border-left:1px solid rgba(255,255,255,0.25);" : ""}"><div style="font-size:38px;font-weight:700;color:#fff;letter-spacing:-0.02em;">${s[0]}</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:3px;">${s[1]}</div></div>`).join("")}
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- PARTNER CTA -->
<div style="background:#FAFAF7;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;background:#F26522;border-radius:28px;padding:56px;position:relative;overflow:hidden;text-align:center;">
    <svg style="position:absolute;top:-40px;right:-30px;opacity:0.2;" width="300" height="260" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:580px;margin:0 auto;">
      <h2 style="margin:0 0 12px;font-size:38px;font-weight:700;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Join the ecosystem</h2>
      <p style="margin:0 0 28px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.9);">Become a partner, sign up as a mentor, or bring your company into the alliance.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="#" style="background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Become a partner</a><a href="#" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">Sign up as a mentor</a></div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
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

export default function Ecosystem() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <EcosystemDirectory />
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
