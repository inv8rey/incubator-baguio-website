import type { Metadata } from "next";
import { Suspense } from "react";
import CalendarClient from "./CalendarClient";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Calendar — Incubator Baguio",
  description:
    "The shared calendar for Baguio's research and innovation ecosystem — browse events or book a mentoring session with an expert mentor.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/calendar")}

<!-- PAGE HEADER -->
<div style="background:#fff;padding:40px 40px 28px;border-bottom:1px solid rgba(64,50,34,0.09);">
  <div style="max-width:1300px;margin:0 auto;">
    <h1 style="margin:0 0 8px;font-size:34px;font-weight:600;letter-spacing:-0.025em;color:#1A1714;">Calendar</h1>
    <p style="margin:0;font-size:14.5px;color:#5A544B;">Browse ecosystem events, or book time with a mentor for 1:1 consultation.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- SYNC CTA -->
<div style="background:#F6F2EA;padding:0 40px 64px;">
  <div style="max-width:1080px;margin:0 auto;background:#1A1714;border-radius:24px;padding:44px 48px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-70px;right:-50px;width:240px;height:240px;background:radial-gradient(circle,rgba(242,101,34,0.26),transparent 65%);"></div>
    <div style="position:relative;max-width:560px;"><h2 style="margin:0 0 8px;font-size:26px;font-weight:600;color:#fff;letter-spacing:-0.02em;">Hosting something, or want a mentor's take?</h2><p style="margin:0;font-size:14.5px;line-height:1.55;color:rgba(255,255,255,0.62);">Submit your workshop, forum, or demo day to the shared calendar — or book a 1:1 mentoring session for feedback on your innovation.</p></div>
    <a href="${BP}/calendar/?submit=1" style="position:relative;display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:14.5px;padding:14px 26px;border-radius:9999px;text-decoration:none;white-space:nowrap;">Submit an event
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

${footerHtml()}
`;

export default function Calendar() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <Suspense fallback={null}>
        <CalendarClient />
      </Suspense>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
