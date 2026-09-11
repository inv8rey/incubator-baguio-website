import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchChallengeApplications, fetchChallengeBySlug } from "../dynamicData";
import { categoryInfo } from "../data";
import { navBarHtml, footerHtml } from "../../chrome";
import { pageMeta } from "../../seo";
import { slugify } from "../../../lib/slug";
import CollaborateButton from "../CollaborateButton";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return { title: "Challenge not found — Incubator Baguio" };
  // Canonicalise to the slug form the sitemap emits: this route also resolves
  // a raw id, so the same challenge is reachable at two URLs.
  return pageMeta({
    title: `${c.title} — Incubator Baguio Challenges`,
    description: c.summary,
    path: `/challenges/${slugify(c.title || c.id)}/`,
  });
}

export default async function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return notFound();
  const cat = categoryInfo(c.category);
  const solvers = await fetchChallengeApplications(c.id);
  const totalSolvers = solvers.length;
  const visibleSolvers = solvers.slice(0, 5);

  const TOP_HTML = `
${navBarHtml("/challenges")}

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
  <div class="ib-challenge-body-grid" style="max-width:880px;margin:0 auto;display:grid;grid-template-columns:1.6fr 1fr;gap:32px;align-items:start;">
    <div style="display:flex;flex-direction:column;gap:28px;min-width:0;">
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

    <div style="display:flex;flex-direction:column;gap:20px;min-width:0;">
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:26px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#6E685F;margin-bottom:16px;">Challenge details</div>
        <div style="display:flex;flex-direction:column;">
          ${[
            ["Status", `<span style="display:inline-flex;align-items:center;font-size:13px;font-weight:600;color:#1A6B3C;background:rgba(26,107,60,0.12);padding:6px 16px;border-radius:9999px;">${c.status}</span>`],
            ["Deadline", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${c.timeline[0]?.date ?? c.deadline}</span>`],
            ["Category", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${cat.emoji} ${c.category}</span>`],
            ["Scope", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${c.scopeRegion}</span>`],
            ["Submissions", `<span style="font-size:14.5px;font-weight:600;color:#1A1714;">${totalSolvers} received</span>`],
          ].map(([label, value], i, arr) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;${i < arr.length - 1 ? "border-bottom:1px solid rgba(64,50,34,0.11);" : ""}">
            <span style="font-size:14.5px;color:#6E685F;">${label}</span>
            ${value}
          </div>`).join("")}
        </div>
      </div>

      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:18px;padding:26px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#6E685F;margin-bottom:16px;">Posted by</div>
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
`;

  const BOTTOM_HTML = footerHtml();

  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />

      {/* REGISTERED SOLVERS -- real JSX (not the HTML-string pattern used
          above) so each card's "Collaborate" action can be a client
          component (CollaborateButton) instead of a dead link. It used to
          route to the Apply form, which doesn't contact the team at all. */}
      <div style={{ background: "#F6F2EA", padding: "0 40px 64px", borderTop: "1px solid rgba(64,50,34,0.09)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", paddingTop: 56 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F26522", marginBottom: 10 }}>Registered solvers</div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: "#1A1714" }}>Teams currently working on this</h2>
            </div>
            <span style={{ fontSize: 14, color: "#6E685F" }}>
              {totalSolvers} group{totalSolvers === 1 ? "" : "s"} registered
            </span>
          </div>

          {totalSolvers === 0 ? (
            <div style={{ border: "1.5px dashed rgba(64,50,34,0.18)", borderRadius: 18, padding: "40px 26px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#6E685F" }}>No teams have registered yet. Be the first to apply.</p>
            </div>
          ) : (
            <div className="ib-challenge-solvers-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {visibleSolvers.map((s) => (
                <div key={s.id} className="ib-challenge-hover" style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 18, padding: 26, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{s.initials}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1714" }}>{s.name}</div>
                        <div style={{ fontSize: 12.5, color: "#6E685F", marginTop: 2 }}>Team &middot; {s.members} members</div>
                      </div>
                    </div>
                  </div>
                  {s.description && <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.6, color: "#5A544B", flex: 1 }}>{s.description}</p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, marginBottom: 18 }}>
                    {s.affiliation && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#6E685F", minWidth: 74 }}>Affiliation</span>
                        <span style={{ fontWeight: 600, color: "#1A1714" }}>{s.affiliation}</span>
                      </div>
                    )}
                    {s.track && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ color: "#6E685F", minWidth: 74 }}>Track</span>
                        <span style={{ fontWeight: 600, color: "#1A1714" }}>{s.track}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ color: "#6E685F", minWidth: 74 }}>Registered</span>
                      <span style={{ fontWeight: 600, color: "#1A1714" }}>{s.registered}</span>
                    </div>
                  </div>
                  <CollaborateButton applicationId={s.id} teamName={s.name} />
                </div>
              ))}

              {totalSolvers > visibleSolvers.length && (
                <div style={{ border: "1.5px dashed rgba(64,50,34,0.18)", borderRadius: 18, padding: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 9999, background: "#F6F2EA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2.4}>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1714", marginBottom: 6 }}>{totalSolvers - visibleSolvers.length} more teams registered</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#6E685F" }}>Full solver list visible to challenge poster and Incubator Baguio staff.</p>
                  </div>
                  <a href={`${BP}/challenges/${c.slug}/apply/`} style={{ fontSize: 13.5, fontWeight: 600, color: "#F26522", textDecoration: "none" }}>
                    Join as a solver &rarr;
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
