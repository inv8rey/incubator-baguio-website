import type { Metadata } from "next";
import { pageMeta } from "../seo";
import PathFinder from "./PathFinder";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = pageMeta({
  title: "Path Finder — Incubator Baguio",
  description:
    "Answer a few plain questions about what you're working on and find the path that fits — Startup, MSME / Business, or City Adoption — plus what you can do next. No account needed.",
  path: "/path-finder/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// The nav has no Path Finder entry (it's reached from About and Get Started),
// so navBarHtml() is called without an `active` argument on purpose.
const TOP_HTML = `
${navBarHtml()}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:60px 40px 56px;overflow:hidden;text-align:center;">
  <div style="position:absolute;top:-140px;left:50%;transform:translateX(-50%);width:560px;height:560px;background:radial-gradient(circle,rgba(242,101,34,0.26),transparent 65%);pointer-events:none;"></div>
  <div style="position:relative;max-width:720px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/about" style="color:inherit;text-decoration:none;">About</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Path Finder</span></div>
    <h1 style="margin:0;font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.1;">Find your path</h1>
    <p style="margin:18px auto 0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:560px;">Not every project needs the same kind of support. Answer a few questions about what you&rsquo;re working on and we&rsquo;ll point you to the path that fits &mdash; and what to do next.</p>
    <div style="display:flex;align-items:center;justify-content:center;gap:22px;flex-wrap:wrap;margin-top:26px;">
      ${[
        ["About a minute", `<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path>`],
        ["No account needed", `<rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path>`],
        ["Up to 10 questions", `<path d="m5 13 4 4L19 7"></path>`],
      ]
        .map(
          ([label, icon]) =>
            `<span style="display:inline-flex;align-items:center;gap:8px;font-size:13.5px;color:rgba(255,255,255,0.62);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${icon}</svg>${label}</span>`
        )
        .join("")}
    </div>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- NOT SURE -->
<div style="background:#F6F2EA;padding:0 40px 72px;">
  <div style="max-width:820px;margin:0 auto;background:#fff;border:1px dashed rgba(64,50,34,0.18);border-radius:18px;padding:26px 30px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;">
    <div><h3 style="margin:0 0 6px;font-size:16px;font-weight:600;color:#1A1714;">Still not sure after answering?</h3><p style="margin:0;font-size:13.5px;color:#5A544B;">Tell us what you&rsquo;re working on and our team will point you in the right direction.</p></div>
    <a href="${BP}/contact" style="font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;">Talk to our team <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

${footerHtml()}
`;

export default function PathFinderPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "48px 40px 56px" }} className="ib-pf-wrap">
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <PathFinder />
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
