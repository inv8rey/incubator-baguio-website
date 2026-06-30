import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub — Incubator Baguio",
  description:
    "Search papers, case studies, datasets, and toolkits from Baguio's universities, startups, and forum proceedings.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const KNOWLEDGE_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
  </div>
</div>

<!-- HERO + SEARCH -->
<div style="position:relative;background:#0B0B0D;padding:56px 40px 60px;overflow:hidden;">
  <div style="position:absolute;top:-120px;right:-80px;width:440px;height:440px;background:radial-gradient(circle,rgba(40,94,122,0.30),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:18px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Knowledge Hub</span></div>
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;margin-bottom:14px;">Research &amp; Innovation Database</div>
    <h1 style="margin:0;font-size:50px;font-weight:700;letter-spacing:-0.03em;color:#fff;line-height:1.04;max-width:720px;">Baguio&rsquo;s open library of research and innovation</h1>
    <p style="margin:18px 0 28px;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:600px;">Search papers, case studies, datasets, and toolkits from the city&rsquo;s universities, startups, and forum proceedings.</p>
    <div style="display:flex;gap:12px;max-width:680px;flex-wrap:wrap;">
      <div style="flex:1;min-width:240px;height:52px;background:#fff;border-radius:9999px;display:flex;align-items:center;gap:12px;padding:0 20px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A958B" stroke-width="2"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><span style="font-size:15px;color:#9A958B;">Search by topic, author, or keyword</span></div>
      <a href="#" class="ib-cta-orange" style="display:flex;align-items:center;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:0 28px;height:52px;border-radius:9999px;text-decoration:none;">Search</a>
    </div>
  </div>
</div>

<!-- FILTER CHIPS -->
<div style="background:#fff;border-bottom:1px solid rgba(20,20,25,0.07);padding:18px 40px;">
  <div style="max-width:1180px;margin:0 auto;display:flex;gap:10px;flex-wrap:wrap;">
    ${[
      ["All resources", true],
      ["Research papers", false],
      ["Case studies", false],
      ["Datasets", false],
      ["Toolkits &amp; guides", false],
      ["Forum proceedings", false],
    ].map((c) => `<span style="font-size:13.5px;font-weight:${c[1] ? 600 : 500};color:${c[1] ? "#fff" : "#44444C"};background:${c[1] ? "#141417" : "#F4F2EC"};padding:9px 18px;border-radius:9999px;cursor:pointer;">${c[0]}</span>`).join("")}
  </div>
</div>

<!-- FEATURED + STATS -->
<div style="background:#FAFAF7;padding:48px 40px 24px;">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:1.5fr 1fr;gap:20px;">
    <div style="position:relative;border-radius:20px;overflow:hidden;background:#0E0E10;padding:36px;min-height:220px;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="position:absolute;top:-70px;right:-50px;width:280px;height:280px;background:radial-gradient(circle,rgba(242,101,34,0.26),transparent 65%);"></div>
      <div style="position:relative;"><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#FFB489;padding:6px 12px;border-radius:9999px;border:1px solid rgba(242,101,34,0.4);background:rgba(242,101,34,0.12);">Featured &middot; Forum 2025</span></div>
      <div style="position:relative;"><h3 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.02em;line-height:1.15;">City Research Forum 2025 Proceedings</h3><p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.6);">32 peer-reviewed papers across food security, environment, tourism, and education.</p><a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:#fff;text-decoration:none;background:#F26522;padding:10px 18px;border-radius:9999px;">Browse proceedings <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a></div>
    </div>
    <div style="display:grid;grid-template-rows:1fr 1fr;gap:20px;">
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:38px;font-weight:700;color:#F26522;letter-spacing:-0.02em;">240+</div><div style="font-size:14px;color:#6B6B73;margin-top:4px;">Indexed research outputs</div></div>
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:24px;display:flex;flex-direction:column;justify-content:center;"><div style="font-size:38px;font-weight:700;color:#285E7A;letter-spacing:-0.02em;">12</div><div style="font-size:14px;color:#6B6B73;margin-top:4px;">Contributing institutions</div></div>
    </div>
  </div>
</div>

<!-- RESOURCE LIST -->
<div style="background:#FAFAF7;padding:24px 40px 40px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;"><h2 style="margin:0;font-size:22px;font-weight:600;color:#141417;">Latest additions</h2><span style="font-size:13px;color:#9A958B;">Sorted by newest</span></div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${[
        [
          `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3F9E4D" stroke-width="2"><path d="M4 19V5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"></path><path d="M14 3v5h5"></path></svg>`,
          "rgba(126,217,87,0.14)", "#3F9E4D", "Research paper", "Food security",
          "Reducing post-harvest loss in Cordillera highland vegetables", "Saint Louis University &middot; 2025 &middot; PDF",
        ],
        [
          `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-4Z"></path><path d="m9 12 2 2 4-4"></path></svg>`,
          "rgba(242,101,34,0.12)", "#F26522", "Case study", "Startup journey",
          "How HarvestLink went from camp prototype to first revenue", "Incubator Baguio &middot; 2025 &middot; Article",
        ],
        [
          `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="2"><path d="M3 3v18h18M7 14l4-4 3 3 5-6"></path></svg>`,
          "rgba(40,94,122,0.12)", "#285E7A", "Dataset", "Environment",
          "Baguio air quality and waste volume, 2020 to 2025", "CPDSO &middot; 2025 &middot; CSV",
        ],
        [
          `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D88A0A" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
          "rgba(245,166,35,0.14)", "#D88A0A", "Toolkit", "For founders",
          "The Incubator Baguio lean canvas starter pack", "Incubator Baguio &middot; 2025 &middot; PDF + template",
        ],
      ].map((r) => `
      <div class="ib-resource-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:16px;padding:22px 24px;display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;">
        <div style="width:46px;height:46px;border-radius:12px;background:${r[1]};display:flex;align-items:center;justify-content:center;">${r[0]}</div>
        <div><div style="display:flex;gap:8px;margin-bottom:6px;"><span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${r[2]};background:${r[1]};padding:4px 9px;border-radius:9999px;">${r[3]}</span><span style="font-size:11px;color:#9A958B;align-self:center;">${r[4]}</span></div><h3 style="margin:0 0 3px;font-size:16.5px;font-weight:600;color:#141417;">${r[5]}</h3><p style="margin:0;font-size:13px;color:#9A958B;">${r[6]}</p></div>
        <a href="#" style="display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:600;color:#141417;text-decoration:none;white-space:nowrap;">View <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`).join("")}
    </div>
    <div style="display:flex;justify-content:center;margin-top:26px;"><a href="#" style="font-size:14px;font-weight:600;color:#141417;text-decoration:none;border:1px solid rgba(20,20,25,0.18);padding:13px 26px;border-radius:9999px;">Load more resources</a></div>
  </div>
</div>

<!-- CONTRIBUTE CTA -->
<div style="background:#fff;padding:64px 40px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1080px;margin:0 auto;background:#141417;border-radius:24px;padding:44px 48px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;">
    <div style="max-width:560px;"><h2 style="margin:0 0 8px;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Have research to share?</h2><p style="margin:0;font-size:15px;line-height:1.55;color:rgba(255,255,255,0.62);">Submit your paper, dataset, or case study to the innovation database and reach the whole Baguio ecosystem.</p></div>
    <a href="#" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:15px 30px;border-radius:9999px;text-decoration:none;white-space:nowrap;">Submit to the database</a>
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

export default function KnowledgeHub() {
  return <main dangerouslySetInnerHTML={{ __html: KNOWLEDGE_HTML }} />;
}
