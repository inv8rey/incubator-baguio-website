import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ecosystem — Incubator Baguio",
  description:
    "One alliance of universities, agencies, companies, and mentors backing Baguio's founders and researchers.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ECOSYSTEM_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="#" style="text-decoration:none;color:inherit;">About</a>
      <a href="#" style="text-decoration:none;color:inherit;">Programs</a>
      <a href="${BP}/knowledge" style="text-decoration:none;color:inherit;">Knowledge Hub</a>
      <a href="${BP}/ecosystem" style="text-decoration:none;color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Ecosystem</a>
      <a href="#" style="text-decoration:none;color:inherit;">News</a>
    </div>
    <a href="#" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Apply Now</a>
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

<!-- PARTNERS -->
<div style="background:#FAFAF7;padding:68px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Our partners</div>
      <h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Convened across four sectors</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;">
      ${[
        ["#F5A623", "#D88A0A", "Academe", ["Saint Louis University", "University of Baguio", "UP Baguio", "University of the Cordilleras", "BSU"]],
        ["#F26522", "#F26522", "Government", ["City Government of Baguio", "DOST", "DTI", "CHED", "DICT"]],
        ["#E23A2E", "#E23A2E", "Industry", ["Baguio Chamber of Commerce", "Local tech firms", "Creative studios", "Angel investors"]],
        ["#285E7A", "#285E7A", "Community", ["Civil society groups", "Cooperatives", "Youth organizations", "Barangay councils"]],
      ].map((sec) => `
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:28px;border-top:3px solid ${sec[0]};">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${sec[1]};margin-bottom:18px;">${sec[2]}</div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;">
          ${(sec[3] as string[]).map((p) => `<span style="font-size:14px;font-weight:500;color:#44444C;background:#F4F2EC;padding:9px 16px;border-radius:9999px;">${p}</span>`).join("")}
        </div>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- MENTORS -->
<div style="background:#0E0E10;padding:72px 40px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-120px;left:-80px;width:420px;height:420px;background:radial-gradient(circle,rgba(245,166,35,0.16),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:16px;">
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;margin-bottom:12px;">Mentor network</div><h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#fff;">Guided by people who&rsquo;ve done it</h2></div>
      <a href="#" style="font-size:14px;font-weight:600;color:#fff;text-decoration:none;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">Browse all mentors <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        ["rgba(242,101,34,0.5)", "rgba(242,101,34,0.12)", "MA", "Maria Aquino", "Startup &amp; fundraising", "#FFB489", "rgba(242,101,34,0.12)", "Founder, 2 exits"],
        ["rgba(40,94,122,0.5)", "rgba(40,94,122,0.12)", "RD", "Ramon Dizon", "Product &amp; engineering", "#5B9BC0", "rgba(40,94,122,0.16)", "CTO, fintech"],
        ["rgba(245,166,35,0.5)", "rgba(245,166,35,0.12)", "LT", "Liza Tan", "Research &amp; IP", "#F5C06B", "rgba(245,166,35,0.16)", "Professor, SLU"],
        ["rgba(158,42,82,0.5)", "rgba(158,42,82,0.12)", "JB", "Jun Baltazar", "Go-to-market", "#D87BA0", "rgba(158,42,82,0.18)", "Growth lead"],
      ].map((m) => `
      <div style="background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:24px;text-align:center;">
        <div style="width:72px;height:72px;border-radius:9999px;margin:0 auto 16px;background:linear-gradient(150deg,${m[0]},${m[1]});display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;border:1px solid rgba(255,255,255,0.1);">${m[2]}</div>
        <h3 style="margin:0 0 3px;font-size:16px;font-weight:600;color:#fff;">${m[3]}</h3>
        <p style="margin:0 0 12px;font-size:12.5px;color:rgba(255,255,255,0.5);">${m[4]}</p>
        <span style="font-size:11px;font-weight:600;color:${m[5]};background:${m[6]};padding:5px 11px;border-radius:9999px;">${m[7]}</span>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- STARTUP PORTFOLIO -->
<div style="background:#fff;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Startup portfolio</div>
      <h2 style="margin:0;font-size:38px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Ventures born in Baguio</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${[
        ["rgba(126,217,87,0.16)", "#3F9E4D", "H", "rgba(126,217,87,0.14)", "Agritech", "HarvestLink", "Connects highland farmers directly to Baguio buyers, cutting spoilage and middlemen.", "Incubation &middot; Cohort 2025"],
        ["rgba(40,94,122,0.14)", "#285E7A", "P", "rgba(40,94,122,0.1)", "Cleantech", "PineCycle", "Turns the city&rsquo;s pine and food waste into compost and biochar for urban gardens.", "Incubation &middot; Cohort 2025"],
        ["rgba(158,42,82,0.12)", "#9E2A52", "T", "rgba(158,42,82,0.1)", "Tourism", "TrailMate", "A guide app for Cordillera trails and homegrown experiences beyond peak season.", "Pre-incubation &middot; 2025"],
      ].map((s) => `
      <div class="ib-challenge-hover" style="background:#FAFAF7;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:26px;transition:box-shadow .18s ease,transform .18s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;"><div style="width:46px;height:46px;border-radius:12px;background:${s[0]};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:${s[1]};">${s[2]}</div><span style="font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${s[1]};background:${s[3]};padding:5px 11px;border-radius:9999px;">${s[4]}</span></div>
        <h3 style="margin:0 0 6px;font-size:18px;font-weight:600;color:#141417;">${s[5]}</h3>
        <p style="margin:0 0 14px;font-size:13.5px;line-height:1.55;color:#6B6B73;">${s[6]}</p>
        <span style="font-size:12px;font-weight:600;color:#44444C;">${s[7]}</span>
      </div>`).join("")}
    </div>
  </div>
</div>

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
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>Programs</span><span>Knowledge Hub</span><span>Ecosystem</span><span>News &amp; Events</span></div></div>
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
  return <main dangerouslySetInnerHTML={{ __html: ECOSYSTEM_HTML }} />;
}
