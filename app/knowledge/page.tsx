import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub — Incubator Baguio",
  description:
    "Coming soon: Baguio's searchable home for research and innovation agenda resources — papers, datasets, case studies, and toolkits.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const KNOWLEDGE_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:32px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Knowledge Hub</a>
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
<div style="position:relative;background:#0B0B0D;padding:64px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:540px;height:540px;background:radial-gradient(circle,rgba(40,94,122,0.30),transparent 65%);"></div>
  <div style="position:relative;max-width:720px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Knowledge Hub</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:24px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Coming soon</span></div>
    <h1 style="margin:0;font-size:46px;font-weight:700;letter-spacing:-0.03em;color:#fff;line-height:1.1;">The Knowledge Hub is on its way</h1>
    <p style="margin:18px auto 0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:580px;">This will become the searchable home for Baguio&rsquo;s research and innovation agenda &mdash; papers, datasets, case studies, and toolkits from the city&rsquo;s universities, startups, and forum proceedings.</p>
  </div>
</div>

<!-- AVAILABLE NOW -->
<div style="background:#FAFAF7;padding:56px 40px 72px;">
  <div style="max-width:880px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Available now</div>
      <h2 style="margin:0;font-size:28px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Two resources to start with</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;">
      ${[
        [
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M14 3v5h5M8 13h8M8 17h5"></path></svg>`,
          "rgba(242,101,34,0.12)", "#F26522",
          "Research &amp; Innovation Agenda",
          "A preview of the framework that guides Baguio&rsquo;s research and innovation priorities &mdash; agriculture, health, tourism, environment, education, and governance.",
          `${BP}/assets/baguio-research-innovation-agenda.pdf`,
        ],
        [
          `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`,
          "rgba(40,94,122,0.12)", "#285E7A",
          "Ordinance No. 063, s. 2023",
          "A preview summary of the City Ordinance that established the Baguio City Research and Innovation Alliance &mdash; the legal foundation for Incubator Baguio.",
          `${BP}/assets/ordinance-no-63-s2023.pdf`,
        ],
      ].map((r) => `
      <div class="ib-challenge-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:28px;display:flex;flex-direction:column;transition:box-shadow .22s ease,transform .22s ease;">
        <div style="width:50px;height:50px;border-radius:14px;background:${r[1]};display:flex;align-items:center;justify-content:center;margin-bottom:18px;">${r[0]}</div>
        <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;color:#141417;">${r[3]}</h3>
        <p style="margin:0 0 22px;font-size:13.5px;line-height:1.55;color:#6B6B73;flex:1;">${r[4]}</p>
        <a href="${r[5]}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;font-size:13.5px;font-weight:600;color:#fff;text-decoration:none;background:${r[2]};padding:12px 20px;border-radius:9999px;">Download PDF
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M12 3v12m0 0 4-4m-4 4-4-4"></path><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path></svg></a>
      </div>`).join("")}
    </div>

    <div style="margin-top:36px;background:#fff;border:1px dashed rgba(20,20,25,0.18);border-radius:18px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
      <div><h3 style="margin:0 0 6px;font-size:16px;font-weight:600;color:#141417;">More resources are coming</h3><p style="margin:0;font-size:13.5px;color:#6B6B73;">Research papers, datasets, case studies, and toolkits will be added as the database is built out.</p></div>
      <a href="${BP}/contact" style="font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">Have research to share? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
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

export default function KnowledgeHub() {
  return <main dangerouslySetInnerHTML={{ __html: KNOWLEDGE_HTML }} />;
}
