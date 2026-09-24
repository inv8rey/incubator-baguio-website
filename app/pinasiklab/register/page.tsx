import type { Metadata } from "next";
import { pageMeta } from "../../seo";
import { navBarHtml, footerHtml } from "../../chrome";
import { REGISTRATION_DEADLINE } from "../config";
import RegistrationForm from "./RegistrationForm";

export const metadata: Metadata = pageMeta({
  title: "Apply — PinaSIKLab Baguio 2026",
  description:
    "Apply to PinaSIKLab Baguio 2026, the two-day youth innovation sprint for Baguio and the BLISTT area, October 30–31, 2026. Apply as an individual or with your team.",
  path: "/pinasiklab/register/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const PILLS = ["October 30–31, 2026", "Baguio City", "Ages 18–30", "Up to 5 per team", "30 teams"]
  .map((p) => `<span style="display:inline-block;padding:8px 16px;border-radius:9999px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);font-size:13px;font-weight:600;color:rgba(255,255,255,0.86);">${p}</span>`)
  .join("");

const TOP_HTML = `
${navBarHtml()}

<div style="position:relative;background:#131110;padding:44px 40px 46px;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.08);">
  <svg style="position:absolute;top:24px;right:60px;opacity:0.16;pointer-events:none;" width="240" height="200" viewBox="0 0 120 104" fill="none" aria-hidden="true">
    <polyline points="12,40 60,12 108,40" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,62 60,34 108,62" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="12,84 60,56 108,84" stroke="#F26522" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></polyline>
  </svg>
  <div style="position:relative;max-width:820px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.5);margin-bottom:22px;">
      <a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a>
      <span style="margin:0 8px;">&rsaquo;</span>
      <a href="${BP}/pinasiklab/" style="color:inherit;text-decoration:none;">PinaSIKLab Baguio 2026</a>
      <span style="margin:0 8px;">&rsaquo;</span>
      <span style="color:#F26522;">Apply</span>
    </div>
    <h1 style="margin:0;font-size:46px;font-weight:600;letter-spacing:-0.032em;color:#fff;line-height:1.1;">Apply to <span style="color:#F26522;">PinaSIKLab Baguio 2026</span></h1>
    <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:640px;">Young people from Baguio City and the BLISTT area will build practical, AI-enabled and digital solutions to local challenges in a two-day innovation sprint. Apply as an individual or with your team.</p>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;">${PILLS}</div>
    <p style="margin:18px 0 0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.55);">Application deadline: <strong style="color:rgba(255,255,255,0.85);">${REGISTRATION_DEADLINE || "to be announced"}</strong>. Please provide accurate information. Submitting this form does not guarantee selection.</p>
  </div>
</div>
`;

export default function RegisterPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div id="main">
        <RegistrationForm />
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
