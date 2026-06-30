import type { Metadata } from "next";
import { CHALLENGES } from "./data";

export const metadata: Metadata = {
  title: "Innovation Challenges — Incubator Baguio",
  description:
    "Real problems posted by LGUs, MSMEs, universities, and NGOs across Baguio. Founders, startups, researchers, and students build the solutions.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const CHALLENGES_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="#" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Post a Challenge</a>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:60px 40px 64px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-120px;left:50%;transform:translateX(-50%);width:600px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.32) 0%,transparent 60%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.15;" width="720" height="410" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:880px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Innovation Challenges</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:24px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Open innovation marketplace</span></div>
    <h1 style="margin:0;font-size:62px;line-height:1.0;font-weight:700;letter-spacing:-0.035em;color:#fff;">Real problems, posted by<br>the city. <span style="color:#F26522;">Solved by you.</span></h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:620px;">LGUs, MSMEs, universities, and NGOs post the challenges that matter. Founders, startups, researchers, and students step up to build the solutions.</p>
    <div style="display:flex;gap:14px;justify-content:center;margin-top:34px;flex-wrap:wrap;">
      <a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:16px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 14px 36px rgba(242,101,34,0.4);">Browse challenges <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="#" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:16px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Post a challenge</a>
    </div>
  </div>
</div>

<!-- STAT STRIP -->
<div style="background:#F26522;padding:30px 40px;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
    ${[
      ["48", "Open challenges", false],
      ["7", "Sectors covered", true],
      ["320+", "Solvers registered", true],
      ["27", "Solutions deployed", true],
    ].map((s) => `<div style="text-align:center;${s[2] ? "border-left:1px solid rgba(255,255,255,0.25);" : ""}"><div style="font-size:38px;font-weight:700;color:#fff;letter-spacing:-0.02em;">${s[0]}</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:3px;">${s[1]}</div></div>`).join("")}
  </div>
</div>

<!-- HOW IT WORKS -->
<div style="background:#FAFAF7;padding:64px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;"><div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">How the marketplace works</div><h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Two sides, one ecosystem</h2></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      ${[
        ["#285E7A", "rgba(40,94,122,0.12)", "Challenge posters", "LGUs, MSMEs, universities, corporations, NGOs, and community groups bring the real problems.", [
          "Describe the problem, scope, and what success looks like.",
          "Set a timeline and the support you can offer.",
          "Review submissions and pick a team to build with.",
        ]],
        ["#F26522", "rgba(242,101,34,0.12)", "Solvers", "Founders, startups, innovators, researchers, and students discover and tackle them.", [
          "Filter challenges by sector and deadline.",
          "Submit your approach, team, and prototype.",
          "Get selected and deploy your solution with incubator support.",
        ]],
      ].map((col) => `
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;padding:32px;border-top:3px solid ${col[0]};">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${col[0]};margin-bottom:18px;">${col[2]}</div>
        <p style="margin:0 0 20px;font-size:14.5px;line-height:1.55;color:#6B6B73;">${col[3]}</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${(col[4] as string[]).map((step, i) => `<div style="display:flex;gap:12px;align-items:flex-start;"><span style="width:26px;height:26px;border-radius:9999px;background:${col[1]};color:${col[0]};font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</span><span style="font-size:14px;color:#44444C;line-height:1.5;">${step}</span></div>`).join("")}
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- FILTER BAR + LISTINGS -->
<div style="background:#fff;padding:56px 40px 64px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:22px;flex-wrap:wrap;gap:16px;"><div><div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:10px;">Open now</div><h2 style="margin:0;font-size:34px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Browse challenges</h2></div><div style="height:46px;background:#FAFAF7;border:1px solid rgba(20,20,25,0.14);border-radius:9999px;display:flex;align-items:center;gap:10px;padding:0 18px;min-width:260px;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A958B" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><span style="font-size:14px;color:#9A958B;">Search challenges</span></div></div>
    <!-- FILTER CHIPS -->
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:26px;">
      ${[
        ["All sectors", true], ["Agriculture", false], ["Environment", false],
        ["Tourism", false], ["Health", false], ["Education", false], ["Govtech", false],
      ].map((c) => `<span style="font-size:13.5px;font-weight:${c[1] ? 600 : 500};color:${c[1] ? "#fff" : "#44444C"};background:${c[1] ? "#141417" : "#F4F2EC"};padding:9px 18px;border-radius:9999px;cursor:pointer;">${c[0]}</span>`).join("")}
    </div>
    <!-- CHALLENGE CARDS GRID -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${CHALLENGES.map((c) => `
      <div class="ib-challenge-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:24px;display:flex;flex-direction:column;transition:box-shadow .18s ease,transform .18s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${c.sectorColor};background:${c.sectorBg};padding:5px 11px;border-radius:9999px;">${c.sector}</span><span style="display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:${c.deadlineColor};"><span style="width:6px;height:6px;border-radius:9999px;background:${c.deadlineColor};"></span>${c.deadline}</span></div>
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#141417;line-height:1.3;">${c.title}</h3>
        <p style="margin:0 0 18px;font-size:13.5px;line-height:1.55;color:#6B6B73;flex:1;">${c.summary}</p>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;"><div style="width:28px;height:28px;border-radius:7px;background:${c.orgColor};display:flex;align-items:center;justify-content:center;font-size:${c.orgInitialsFontSize};font-weight:700;color:#fff;">${c.orgInitials}</div><span style="font-size:12.5px;color:#9A958B;">${c.orgName}</span></div>
        <div style="display:flex;align-items:center;justify-content:flex-end;padding-top:16px;border-top:1px solid rgba(20,20,25,0.08);"><a href="${BP}/challenges/${c.id}/" style="font-size:13px;font-weight:600;color:#141417;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">View challenge <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
      </div>`).join("")}
    </div>
    <div style="display:flex;justify-content:center;margin-top:30px;"><a href="#" style="font-size:14px;font-weight:600;color:#141417;text-decoration:none;border:1px solid rgba(20,20,25,0.18);padding:13px 28px;border-radius:9999px;">Load more challenges</a></div>
  </div>
</div>

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
      <div style="position:relative;"><h3 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Have a problem to solve?</h3><p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.62);">Post a challenge and tap into Baguio&rsquo;s full innovation community.</p><a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:#141417;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Post a challenge <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
    </div>
    <div style="background:#F26522;border-radius:24px;padding:40px;position:relative;overflow:hidden;">
      <svg style="position:absolute;top:-30px;right:-20px;opacity:0.2;" width="200" height="170" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
      <div style="position:relative;"><h3 style="margin:0 0 10px;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Ready to build a solution?</h3><p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.9);">Register as a solver and start submitting to open challenges today.</p><a href="#" style="display:inline-flex;align-items:center;gap:8px;background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Become a solver <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
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
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/events">Events</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
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

export default function Challenges() {
  return <main dangerouslySetInnerHTML={{ __html: CHALLENGES_HTML }} />;
}
