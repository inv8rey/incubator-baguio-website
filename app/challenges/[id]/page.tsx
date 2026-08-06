import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchChallengeApplications, fetchChallengeBySlug } from "../dynamicData";
import { categoryInfo } from "../data";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return { title: "Challenge not found — Incubator Baguio" };
  return {
    title: `${c.title} — Incubator Baguio Challenges`,
    description: c.summary,
  };
}

export default async function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return notFound();
  const cat = categoryInfo(c.category);
  const solvers = await fetchChallengeApplications(c.id);
  const totalSolvers = solvers.length;
  const visibleSolvers = solvers.slice(0, 5);

  const HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#131110;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:46px;width:auto;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:46px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
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
<div style="position:relative;background:#100D0B;padding:48px 40px 56px;overflow:hidden;">
  <div style="position:absolute;bottom:-160px;right:-100px;width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:880px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/challenges" style="color:inherit;text-decoration:none;">Innovation Challenges</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">${c.title}</span></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap;">
      <span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${cat.color};background:${cat.bg};padding:6px 12px;border-radius:9999px;">${cat.emoji} ${c.category}</span>
      <span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:${c.deadlineColor};"><span style="width:6px;height:6px;border-radius:9999px;background:${c.deadlineColor};"></span>${c.deadline}</span>
    </div>
    <h1 style="margin:0;font-size:44px;line-height:1.08;font-weight:500;letter-spacing:-0.03em;color:#fff;max-width:760px;">${c.title}</h1>
    <p style="margin:18px 0 0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:680px;">${c.summary}</p>
    <div style="display:flex;align-items:center;gap:10px;margin-top:26px;">
      <div style="width:34px;height:34px;border-radius:8px;background:${c.orgColor};display:flex;align-items:center;justify-content:center;font-size:${c.orgInitialsFontSize};font-weight:600;color:#fff;">${c.orgInitials}</div>
      <span style="font-size:14px;color:rgba(255,255,255,0.7);">Posted by <strong style="color:#fff;font-weight:600;">${c.orgName}</strong></span>
    </div>
    <div style="display:flex;gap:14px;margin-top:30px;flex-wrap:wrap;">
      <a href="${BP}/challenges/${c.slug}/apply/" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 14px 36px rgba(242,101,34,0.4);">Apply to this challenge
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/challenges" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Back to all challenges</a>
    </div>
  </div>
</div>

<!-- BODY -->
<div style="background:#F6F2EA;padding:56px 40px 64px;">
  <div style="max-width:880px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr;gap:32px;align-items:start;">
    <div style="display:flex;flex-direction:column;gap:28px;">
      ${c.problem.length > 0 ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">The Challenge</div>
        ${c.problem.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#44444C;">${p}</p>`).join("")}
      </div>` : ""}
      ${c.scope.length > 0 ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">Desired Outcomes</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${c.scope.map((s) => `<div style="display:flex;gap:12px;align-items:flex-start;"><svg style="flex-shrink:0;margin-top:2px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.6"><path d="M20 6 9 17l-5-5"></path></svg><span style="font-size:14.5px;line-height:1.55;color:#44444C;">${s}</span></div>`).join("")}
        </div>
      </div>` : ""}
      ${c.support.length > 0 ? `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:28px 30px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">Support Available</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${c.support.map((s) => `<div style="display:flex;gap:12px;align-items:flex-start;"><svg style="flex-shrink:0;margin-top:2px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" stroke-width="2.6"><path d="M20 6 9 17l-5-5"></path></svg><span style="font-size:14.5px;line-height:1.55;color:#44444C;">${s}</span></div>`).join("")}
        </div>
      </div>` : ""}
    </div>

    <div style="display:flex;flex-direction:column;gap:20px;">
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:26px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#8B8479;margin-bottom:16px;">Challenge details</div>
        <div style="display:flex;flex-direction:column;">
          ${[
            ["Status", `<span style="display:inline-flex;align-items:center;font-size:13px;font-weight:600;color:#1A6B3C;background:rgba(26,107,60,0.12);padding:6px 16px;border-radius:9999px;">${c.status}</span>`],
            ["Deadline", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${c.timeline[0]?.date ?? c.deadline}</span>`],
            ["Category", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${cat.emoji} ${c.category}</span>`],
            ["Scope", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${c.scopeRegion}</span>`],
            ["Submissions", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${totalSolvers} received</span>`],
          ].map(([label, value], i, arr) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;${i < arr.length - 1 ? "border-bottom:1px solid rgba(64,50,34,0.11);" : ""}">
            <span style="font-size:14.5px;color:#8B8479;">${label}</span>
            ${value}
          </div>`).join("")}
        </div>
      </div>

      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:26px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#8B8479;margin-bottom:16px;">Posted by</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;"><div style="width:34px;height:34px;border-radius:8px;background:${c.orgColor};display:flex;align-items:center;justify-content:center;font-size:${c.orgInitialsFontSize};font-weight:600;color:#fff;">${c.orgInitials}</div><span style="font-size:14px;font-weight:600;color:#1A1714;">${c.orgName}</span></div>
        <p style="margin:0 0 14px;font-size:13px;line-height:1.55;color:#5A544B;">${c.orgFull}</p>
        <a href="mailto:${c.contactEmail}" style="font-size:13px;font-weight:600;color:#F26522;text-decoration:none;">${c.contactEmail}</a>
      </div>

      <div style="background:#1A1714;border-radius:18px;padding:26px;">
        <div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:8px;">Ready to build this?</div>
        <p style="margin:0 0 18px;font-size:13px;line-height:1.55;color:rgba(255,255,255,0.62);">Submit your team and approach before the deadline.</p>
        <a href="${BP}/challenges/${c.slug}/apply/" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:13px 20px;border-radius:9999px;text-decoration:none;">Start application
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>
    </div>
  </div>
</div>

<!-- REGISTERED SOLVERS -->
<div style="background:#F6F2EA;padding:0 40px 64px;border-top:1px solid rgba(64,50,34,0.09);">
  <div style="max-width:1180px;margin:0 auto;padding-top:56px;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:10px;">Registered solvers</div>
        <h2 style="margin:0;font-size:30px;font-weight:600;letter-spacing:-0.02em;color:#1A1714;">Teams currently working on this</h2>
      </div>
      <span style="font-size:14px;color:#8B8479;">${totalSolvers} group${totalSolvers === 1 ? "" : "s"} registered</span>
    </div>

    ${totalSolvers === 0 ? `
    <div style="border:1.5px dashed rgba(64,50,34,0.18);border-radius:18px;padding:40px 26px;text-align:center;">
      <p style="margin:0;font-size:14px;color:#8B8479;">No teams have registered yet. Be the first to apply.</p>
    </div>` : `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${visibleSolvers.map((s) => `
      <div class="ib-challenge-hover" style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:26px;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:18px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:44px;height:44px;border-radius:11px;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#fff;flex-shrink:0;">${s.initials}</div>
            <div><div style="font-size:16px;font-weight:600;color:#1A1714;">${s.name}</div><div style="font-size:12.5px;color:#8B8479;margin-top:2px;">Team &middot; ${s.members} members</div></div>
          </div>
        </div>
        ${s.description ? `<p style="margin:0 0 18px;font-size:13.5px;line-height:1.6;color:#5A544B;flex:1;">${s.description}</p>` : ""}
        <div style="display:flex;flex-direction:column;gap:8px;font-size:13px;margin-bottom:18px;">
          ${s.affiliation ? `<div style="display:flex;gap:6px;"><span style="color:#8B8479;min-width:74px;">Affiliation</span><span style="font-weight:600;color:#1A1714;">${s.affiliation}</span></div>` : ""}
          ${s.track ? `<div style="display:flex;gap:6px;"><span style="color:#8B8479;min-width:74px;">Track</span><span style="font-weight:600;color:#1A1714;">${s.track}</span></div>` : ""}
          <div style="display:flex;gap:6px;"><span style="color:#8B8479;min-width:74px;">Registered</span><span style="font-weight:600;color:#1A1714;">${s.registered}</span></div>
        </div>
        <a href="${BP}/challenges/${c.slug}/apply/" style="display:flex;align-items:center;justify-content:center;gap:7px;font-size:13.5px;font-weight:600;color:#fff;background:#1A1714;padding:11px 16px;border-radius:9999px;text-decoration:none;">Collaborate
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`).join("")}
      ${totalSolvers > visibleSolvers.length ? `
      <div style="border:1.5px dashed rgba(64,50,34,0.18);border-radius:18px;padding:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px;">
        <div style="width:48px;height:48px;border-radius:9999px;background:#F6F2EA;display:flex;align-items:center;justify-content:center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B8479" stroke-width="2.4"><path d="M12 5v14M5 12h14"></path></svg>
        </div>
        <div><div style="font-size:15px;font-weight:600;color:#1A1714;margin-bottom:6px;">${totalSolvers - visibleSolvers.length} more teams registered</div><p style="margin:0;font-size:13px;line-height:1.55;color:#8B8479;">Full solver list visible to challenge poster and Incubator Baguio staff.</p></div>
        <a href="${BP}/challenges/${c.slug}/apply/" style="font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;">Join as a solver &rarr;</a>
      </div>` : ""}
    </div>`}
  </div>
</div>

<!-- FOOTER -->
<div style="background:#100D0B;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:54px;width:auto;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:54px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/calendar">Calendar</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/dashboard/startup">Startup Incubation</a><a class="ib-footlink" href="${BP}/challenges/post">Post a Challenge</a><a class="ib-footlink" href="${BP}/dashboard/mentor">Mentor Registration</a><a class="ib-footlink" href="${BP}/dashboard/organizations">Partner Inquiry</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>incubatorbaguio63@gmail.com</span><a class="ib-footlink" href="https://www.facebook.com/incubatorbaguio" target="_blank" rel="noopener noreferrer">Facebook</a></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

  return <main dangerouslySetInnerHTML={{ __html: HTML }} />;
}
