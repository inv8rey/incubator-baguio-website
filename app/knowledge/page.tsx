import type { Metadata } from "next";
import KnowledgeDirectory from "./KnowledgeDirectory";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Knowledge Hub — Incubator Baguio",
  description:
    "Baguio's searchable home for startup resources, research and innovation outputs, funding opportunities, and policy reports.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/knowledge")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:64px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:540px;height:540px;background:radial-gradient(circle,rgba(40,94,122,0.30),transparent 65%);"></div>
  <div style="position:relative;max-width:720px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Knowledge Hub</span></div>
    <h1 style="margin:0;font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.1;">The Knowledge Hub</h1>
    <p style="margin:18px auto 0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:580px;">Baguio&rsquo;s searchable home for startup resources, research and innovation outputs, funding opportunities, and policy reports &mdash; from the city&rsquo;s universities, startups, and government partners.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- HAVE RESEARCH TO SHARE -->
<div style="background:#F6F2EA;padding:0 40px 72px;">
  <div style="max-width:880px;margin:0 auto;background:#fff;border:1px dashed rgba(64,50,34,0.18);border-radius:18px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
    <div><h3 style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1A1714;">Have research to share?</h3><p style="margin:0;font-size:13.5px;color:#5A544B;">Reach out and we&rsquo;ll get it added to the library.</p></div>
    <a href="${BP}/contact" style="font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">Contact us <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

${footerHtml()}
`;

export default function KnowledgeHub() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "64px 40px 72px" }}>
        <KnowledgeDirectory />
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
