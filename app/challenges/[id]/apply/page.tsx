import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchChallengeBySlug } from "../../dynamicData";
import ApplyForm from "./ApplyForm";
import RequireAuth from "../../../RequireAuth";
import { navBarHtml, footerHtml } from "../../../chrome";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return { title: "Challenge not found — Incubator Baguio" };
  return { title: `Apply — ${c.title} — Incubator Baguio` };
}

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await fetchChallengeBySlug(id);
  if (!c) return notFound();

  const TOP_HTML = `
${navBarHtml("/challenges")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:44px 40px 48px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.28) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:680px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:18px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/challenges" style="color:inherit;text-decoration:none;">Challenges</a> <span style="margin:0 6px;">/</span> <a href="${BP}/challenges/${c.slug}/" style="color:inherit;text-decoration:none;">${c.title}</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Apply</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:20px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Apply to a challenge</span></div>
    <h1 style="margin:0;font-size:36px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:#fff;">${c.title}</h1>
    <p style="margin:14px auto 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);max-width:520px;">Posted by ${c.orgName} &middot; ${c.deadline}</p>
  </div>
</div>
`;

  const BOTTOM_HTML = `
${footerHtml()}
`;

  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <RequireAuth bp={BP}>
            <ApplyForm challenge={{ id: c.id, slug: c.slug, title: c.title, orgName: c.orgName, nextDate: c.timeline[1]?.date }} bp={BP} />
          </RequireAuth>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
