import type { Metadata } from "next";
import PostChallengeForm from "./PostChallengeForm";
import RequireAuth from "../../RequireAuth";
import { navBarHtml, footerHtml } from "../../chrome";

export const metadata: Metadata = {
  title: "Post a Challenge — Incubator Baguio",
  description: "Post a real-world problem to Baguio's innovation marketplace and tap into founders, innovators, researchers, and students ready to build the solution.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/challenges")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:44px 40px 48px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.28) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:680px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:18px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/challenges" style="color:inherit;text-decoration:none;">Challenges</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Post a Challenge</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:20px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">For LGUs, MSMEs, universities & NGOs</span></div>
    <h1 style="margin:0;font-size:36px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:#fff;">Post a challenge to the marketplace</h1>
    <p style="margin:14px auto 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);max-width:520px;">Describe the problem, what you need built, and the support you can offer. Your challenge goes live immediately under Community-posted challenges.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
${footerHtml()}
`;

export default function PostChallengePage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <RequireAuth bp={BP}>
            <PostChallengeForm bp={BP} />
          </RequireAuth>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
