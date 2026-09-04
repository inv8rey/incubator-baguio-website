import type { Metadata } from "next";
import ForumBrowser from "./ForumBrowser";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Community — Incubator Baguio",
  description: "Open discussion for Baguio's innovators — ask questions, share what you're building, and connect with the ecosystem.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/community")}

<!-- HERO -->
<div style="position:relative;background:#131110;padding:44px 40px 34px;overflow:hidden;">
  <svg style="position:absolute;top:24px;right:60px;opacity:0.16;pointer-events:none;" width="240" height="200" viewBox="0 0 120 104" fill="none" aria-hidden="true">
    <polyline points="12,40 60,12 108,40" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,62 60,34 108,62" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,84 60,56 108,84" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>

  <div style="position:relative;max-width:1320px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:22px;">
      <a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a>
      <span style="margin:0 8px;">&rsaquo;</span>
      <span style="color:#F26522;">Community</span>
    </div>
    <h1 style="margin:0;font-size:46px;font-weight:600;letter-spacing:-0.032em;color:#fff;line-height:1.1;">Talk it out with<br><span style="color:#F26522;">Baguio's innovators</span></h1>
    <p style="margin:16px 0 0;font-size:15.5px;line-height:1.6;color:rgba(255,255,255,0.6);max-width:470px;">Ask questions, share what you're building, and connect with the ecosystem. Open to everyone to read, sign in to post.</p>
  </div>
</div>
`;

export default function CommunityPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <ForumBrowser bp={BP} />
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
