import type { Metadata } from "next";
import ChallengesBrowser from "./ChallengesBrowser";
import CommunityChallenges from "./CommunityChallenges";

export const metadata: Metadata = {
  title: "Innovation Challenges — Incubator Baguio",
  description:
    "Real problems posted by LGUs, MSMEs, universities, and NGOs across Baguio. Founders, startups, researchers, and students build the solutions.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const CHALLENGES_HTML_TOP = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:46px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/challenges/post" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Post a Challenge</a>
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:60px 40px 56px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:640px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="720" height="410" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:900px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.4);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">Innovation Challenges</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:26px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Open innovation marketplace</span></div>
    <h1 style="margin:0;font-size:62px;line-height:1.02;font-weight:700;letter-spacing:-0.04em;color:#fff;">Real problems, posted by<br>the city. <span style="color:#F26522;">Solved by you.</span></h1>
    <p style="margin:26px auto 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:620px;">LGUs, MSMEs, universities, and NGOs post the challenges that matter. Founders, startups, researchers, and students step up to build the solutions.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:36px;flex-wrap:wrap;">
      <a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px -14px rgba(242,101,34,0.7);">Browse challenges <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/challenges/post" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.02);">Post a challenge</a>
    </div>
  </div>
</div>

<!-- STAT STRIP — seamless dark continuation of the hero -->
<div style="background:#0B0B0D;padding:0 40px 64px;">
  <div style="max-width:1080px;margin:0 auto;border-top:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:repeat(4,1fr);">
    ${[
      ["48", "Open challenges", false],
      ["7", "Sectors covered", true],
      ["320", "+", "Solvers registered", true],
      ["27", "Solutions deployed", true],
    ].map((s) => {
      const hasPlus = s.length === 5;
      const num = s[0]; const plus = hasPlus ? s[1] : ""; const label = hasPlus ? s[2] : s[1]; const divider = hasPlus ? s[3] : s[2];
      return `<div style="text-align:center;padding:40px 20px 4px;${divider ? "border-left:1px solid rgba(255,255,255,0.08);" : ""}"><div style="font-size:42px;font-weight:700;color:#fff;letter-spacing:-0.03em;line-height:1;">${num}<span style="color:#F26522;">${plus}</span></div><div style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-top:12px;">${label}</div></div>`;
    }).join("")}
  </div>
</div>

<!-- HOW IT WORKS -->
<div style="background:#FAFAF7;padding:64px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;"><div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">How the marketplace works</div><h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Two sides, one ecosystem</h2></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      ${[
        {
          accent: "#285E7A",
          accentSoft: "rgba(40,94,122,0.12)",
          gradA: "#152F3E",
          gradB: "#285E7A",
          icon: '<path d="M3 11l18-5v12L3 14v-3z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>',
          heading: "CHALLENGE POSTERS",
          subheading: "Bring your problems to the right minds and technologies.",
          description: "LGUs, MSMEs, universities, corporations, NGOs, and community groups post challenges they need help solving.",
          steps: [
            ["Post your challenge", "Describe the problem, scope, and what success looks like."],
            ["Set the details", "Set a timeline, criteria, and the support you can offer."],
            ["Review & select", "Review submissions and pick the team you want to build with."],
          ],
          calloutIcon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-4"></path>',
          calloutTitle: "Better solutions. Stronger partnerships.",
          calloutDesc: "You get innovative solutions tailored to your needs.",
        },
        {
          accent: "#F26522",
          accentSoft: "rgba(242,101,34,0.12)",
          gradA: "#8F3512",
          gradB: "#F26522",
          icon: '<path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.1 1.5 3.5.6.67 1.23 1.5 1.41 2.5"></path>',
          heading: "SOLVERS",
          subheading: "Find meaningful challenges. Build solutions that create impact.",
          description: "Founders, startups, innovators, researchers, and students discover challenges and submit solutions.",
          steps: [
            ["Browse challenges", "Filter by sector, theme, or deadline."],
            ["Submit your solution", "Submit your approach, team, and prototype to the challenge."],
            ["Get selected & deploy", "Get chosen and pilot your solution with incubator support."],
          ],
          calloutIcon: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>',
          calloutTitle: "Real impact. Real growth.",
          calloutDesc: "Turn your ideas into solutions that matter.",
        },
      ].map((col) => `
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;overflow:hidden;">
        <div style="position:relative;height:180px;background:linear-gradient(135deg,${col.gradA},${col.gradB});overflow:hidden;">
          <div style="position:absolute;top:0;right:0;width:60%;height:100%;background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.12) 55%,transparent 70%);"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(0,0,0,0.55) 100%);"></div>
          <div style="position:absolute;top:18px;left:18px;width:48px;height:48px;border-radius:9999px;background:${col.accent};border:3px solid rgba(255,255,255,0.85);box-shadow:0 6px 16px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${col.icon}</svg>
          </div>
          <div style="position:absolute;left:22px;right:22px;bottom:18px;">
            <div style="font-size:22px;font-weight:800;letter-spacing:-0.01em;color:#fff;margin-bottom:4px;">${col.heading}</div>
            <div style="font-size:13.5px;color:rgba(255,255,255,0.82);line-height:1.4;">${col.subheading}</div>
          </div>
        </div>
        <div style="padding:26px 28px 28px;">
          <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#6B6B73;">${col.description}</p>
          <div style="position:relative;">
            <div style="position:absolute;left:13px;top:13px;bottom:13px;width:1px;background:rgba(20,20,25,0.10);"></div>
            ${col.steps.map((step, i) => `
            <div style="position:relative;display:flex;gap:14px;align-items:flex-start;">
              <span style="position:relative;z-index:1;flex-shrink:0;width:26px;height:26px;border-radius:9999px;background:${col.accentSoft};color:${col.accent};font-weight:700;font-size:12.5px;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
              <div style="flex:1;min-width:0;padding-bottom:${i < col.steps.length - 1 ? "16px" : "0"};margin-bottom:${i < col.steps.length - 1 ? "16px" : "0"};${i < col.steps.length - 1 ? "border-bottom:1px solid rgba(20,20,25,0.08);" : ""}">
                <div style="font-size:13.5px;font-weight:700;color:#141417;margin-bottom:3px;">${step[0]}</div>
                <div style="font-size:13.5px;color:#6B6B73;line-height:1.5;">${step[1]}</div>
              </div>
            </div>`).join("")}
          </div>
          <div style="margin-top:22px;display:flex;gap:14px;align-items:flex-start;background:${col.accentSoft};border-radius:14px;padding:16px 18px;">
            <div style="flex-shrink:0;width:36px;height:36px;border-radius:9999px;background:${col.accent};display:flex;align-items:center;justify-content:center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${col.calloutIcon}</svg>
            </div>
            <div>
              <div style="font-size:13.5px;font-weight:700;color:${col.accent};margin-bottom:2px;">${col.calloutTitle}</div>
              <div style="font-size:13px;color:#6B6B73;line-height:1.45;">${col.calloutDesc}</div>
            </div>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>

`;

const CHALLENGES_HTML_BOTTOM = `
<!-- WHO CAN PARTICIPATE -->
<div style="background:#0E0E10;padding:68px 40px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-120px;right:-80px;width:420px;height:420px;background:radial-gradient(circle,rgba(242,101,34,0.16),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;"><div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;margin-bottom:12px;">Open to everyone</div><h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#fff;">Who&rsquo;s in the marketplace</h2></div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;">
      ${[
        ["#5B9BC0", "Who posts challenges", ["LGUs", "MSMEs", "Universities", "Corporations", "NGOs", "Community orgs"]],
        ["#FFB489", "Who solves them", ["Founders", "Startups", "Innovators", "Researchers", "Students"]],
      ].map((col) => `
      <div style="background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:28px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${col[0]};margin-bottom:16px;">${col[1]}</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;">
          ${(col[2] as string[]).map((t) => `<span style="font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.82);background:rgba(255,255,255,0.06);padding:8px 15px;border-radius:9999px;">${t}</span>`).join("")}
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- DUAL CTA -->
<div style="background:#FAFAF7;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <div style="background:#141417;border-radius:24px;padding:40px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-60px;right:-40px;width:220px;height:220px;background:radial-gradient(circle,rgba(40,94,122,0.3),transparent 65%);"></div>
      <div style="position:relative;"><h3 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Have a problem to solve?</h3><p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.62);">Post a challenge and tap into Baguio&rsquo;s full innovation community.</p><a href="${BP}/challenges/post" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:#141417;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Post a challenge <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
    </div>
    <div style="background:linear-gradient(135deg,#F26522 0%,#E14E12 60%,#C8410C 100%);border-radius:24px;padding:40px;position:relative;overflow:hidden;box-shadow:0 24px 48px -20px rgba(226,78,18,0.5);">
      <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.15),transparent 55%);"></div>
      <svg style="position:absolute;top:-30px;right:-20px;opacity:0.16;" width="200" height="170" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
      <div style="position:relative;"><h3 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Ready to build a solution?</h3><p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.9);">Register as a solver and start submitting to open challenges today.</p><a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Become a solver <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:54px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
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

export default function Challenges() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: CHALLENGES_HTML_TOP }} />
      <ChallengesBrowser bp={BP} />
      <CommunityChallenges bp={BP} />
      <div dangerouslySetInnerHTML={{ __html: CHALLENGES_HTML_BOTTOM }} />
    </main>
  );
}
