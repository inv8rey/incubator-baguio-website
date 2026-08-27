import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "./SignupForm";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Sign Up — Incubator Baguio",
  description: "Create an Incubator Baguio account to build an innovation profile, post or apply to challenges, and connect with mentors.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml()}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:44px 40px 48px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:680px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:18px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Sign Up</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:20px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Join the ecosystem</span></div>
    <h1 style="margin:0;font-size:36px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:#fff;">Create your account</h1>
    <p style="margin:14px auto 0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.6);max-width:520px;">Build an innovation profile, post or apply to challenges, connect with mentors, or publish your organization.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
${footerHtml()}
`;

export default function SignupPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <Suspense fallback={null}>
            <SignupForm bp={BP} />
          </Suspense>
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
