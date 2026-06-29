import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs — Incubator Baguio",
  description:
    "Pathways for founders, youth, researchers, and partners — mapped to the functions of the Alliance under Ordinance No. 63.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const PROGRAMS_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;overflow:hidden;">
  <div class="ib-programs-hero" style="max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1.3fr 1fr;align-items:stretch;min-height:560px;">
    <div style="position:relative;padding:64px 40px;display:flex;flex-direction:column;justify-content:center;">
      <div style="position:absolute;top:-120px;left:-100px;width:420px;height:420px;background:radial-gradient(circle,rgba(242,101,34,0.2),transparent 65%);pointer-events:none;"></div>
      <div style="position:relative;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:18px;">Programs &amp; Opportunities</div>
        <h1 style="margin:0;font-size:46px;font-weight:800;letter-spacing:-0.03em;color:#fff;line-height:1.12;max-width:560px;">Find the Right Opportunity for Your <span style="color:#F26522;">Innovation Journey.</span></h1>
        <p style="margin:22px 0 0;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.62);max-width:520px;">Whether you&rsquo;re a founder, student, researcher, mentor, investor, or organization, discover programs, events, funding opportunities, and ecosystem initiatives designed to help you succeed.</p>

        <div style="display:grid;grid-template-columns:repeat(2,auto);gap:18px 36px;margin:34px 0 30px;">
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

<!-- FILTER CHIPS -->
<div id="program-grid" style="background:#fff;border-bottom:1px solid rgba(20,20,25,0.07);padding:18px 40px;">
  <div style="max-width:1180px;margin:0 auto;display:flex;gap:10px;flex-wrap:wrap;">
    ${[
      ["All programs", true],
      ["For Founders", false],
      ["For Youth", false],
      ["For Researchers", false],
      ["For Industry", false],
    ].map((c) => `<span style="font-size:13.5px;font-weight:${c[1] ? 600 : 500};color:${c[1] ? "#fff" : "#44444C"};background:${c[1] ? "#141417" : "#F4F2EC"};padding:9px 18px;border-radius:9999px;cursor:pointer;">${c[0]}</span>`).join("")}
  </div>
</div>

<!-- PROGRAM GRID -->
<div style="background:#FAFAF7;padding:56px 40px 72px;">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
    ${[
      ["#F26522", "rgba(242,101,34,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M12 2v6m0 0 3.5 11a3.5 3.5 0 0 1-7 0L12 8Z"></path><circle cx="12" cy="4" r="2"></circle></svg>`, "rgba(242,101,34,0.1)", "Founders", "Startup Incubation", "Pre-incubation to post-incubation support, mentorship, and milestone tracking."],
      ["#F5A623", "rgba(245,166,35,0.14)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D88A0A" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`, "rgba(245,166,35,0.14)", "Youth", "Innovation Camp", "Annual immersion for 500+ youth, with challenge briefs, SDG focus, prototyping, prizes."],
      ["#E23A2E", "rgba(226,58,46,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E23A2E" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M14 3v5h5M8 13h8M8 17h5"></path></svg>`, "rgba(226,58,46,0.1)", "Researchers", "City Research Forum", "Annual forum for paper submissions, presentations, and published proceedings."],
      ["#9E2A52", "rgba(158,42,82,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9E2A52" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"></path><path d="m9 12 2 2 4-4"></path></svg>`, "rgba(158,42,82,0.1)", "Everyone", "Innovation Startup Week", "Every 3rd week of April: pitch competition, demo day, investor matching."],
      ["#285E7A", "rgba(40,94,122,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="2"><path d="m8 3 4 8 4-8M4 21l8-10 8 10M2 21h20"></path></svg>`, "rgba(40,94,122,0.1)", "Builders", "Hackathons &amp; Sprints", "Themed design sprints with team formation, judging criteria, and prizes."],
      ["#F26522", "rgba(242,101,34,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.5"></circle><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M15 20c0-2 .8-3.5 2-4"></path></svg>`, "rgba(242,101,34,0.1)", "Industry", "Workshops &amp; Masterclasses", "Design thinking, lean startup, IP, and fundraising with speaker profiles."],
    ].map((p) => `
    <div class="ib-challenge-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:28px;border-top:3px solid ${p[0]};transition:box-shadow .22s ease,transform .22s ease;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;"><div style="width:46px;height:46px;border-radius:12px;background:${p[1]};display:flex;align-items:center;justify-content:center;">${p[2]}</div><span style="font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${p[0]};background:${p[3]};padding:5px 10px;border-radius:9999px;">${p[4]}</span></div>
      <h3 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#141417;">${p[5]}</h3>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.55;color:#6B6B73;">${p[6]}</p>
      <a href="#" style="font-size:13.5px;font-weight:600;color:#141417;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">Learn more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
    </div>`).join("")}
  </div>
  <div style="max-width:1180px;margin:36px auto 0;background:#141417;border-radius:20px;padding:36px 40px;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;">
    <div><h3 style="margin:0 0 6px;font-size:24px;font-weight:600;color:#fff;">Looking for the Mentorship Program?</h3><p style="margin:0;font-size:14.5px;color:rgba(255,255,255,0.6);">Browse the mentor network or register to give back as a mentor.</p></div>
    <a href="${BP}/ecosystem" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;white-space:nowrap;">Meet the mentors</a>
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

export default function Programs() {
  return <main dangerouslySetInnerHTML={{ __html: PROGRAMS_HTML }} />;
}
