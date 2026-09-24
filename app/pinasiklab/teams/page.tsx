import type { Metadata } from "next";
import { pageMeta } from "../../seo";
import { navBarHtml, footerHtml } from "../../chrome";
import TeamFinder from "./TeamFinder";

export const metadata: Metadata = pageMeta({
  title: "Team Finder — PinaSIKLab Baguio 2026",
  description:
    "Find a team or a teammate for PinaSIKLab Baguio 2026. Browse up to 30 teams, see who they're looking for, request to join, or start your own team and invite people.",
  path: "/pinasiklab/teams/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml()}

<div style="position:relative;background:#131110;padding:44px 40px 46px;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.08);">
  <svg style="position:absolute;top:24px;right:60px;opacity:0.16;pointer-events:none;" width="240" height="200" viewBox="0 0 120 104" fill="none" aria-hidden="true">
    <polyline points="12,40 60,12 108,40" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,62 60,34 108,62" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,84 60,56 108,84" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>
  <div style="position:relative;max-width:1240px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.5);margin-bottom:22px;">
      <a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a>
      <span style="margin:0 8px;">&rsaquo;</span>
      <a href="${BP}/pinasiklab/" style="color:inherit;text-decoration:none;">PinaSIKLab Baguio 2026</a>
      <span style="margin:0 8px;">&rsaquo;</span>
      <span style="color:#F26522;">Team Finder</span>
    </div>
    <h1 style="margin:0;font-size:46px;font-weight:600;letter-spacing:-0.032em;color:#fff;line-height:1.1;">Find your <span style="color:#F26522;">team</span></h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:620px;">Registered on your own? Browse up to 30 teams, see who they&rsquo;re looking for, and ask to join, or start a team and invite other people who are still looking. Teams of up to 5.</p>
  </div>
</div>
`;

export default function TeamFinderPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div id="main">
        <TeamFinder />
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
