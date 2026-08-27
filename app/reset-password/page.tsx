import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Set New Password — Incubator Baguio",
  robots: { index: false, follow: false },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml()}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:44px 40px 48px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:480px;height:480px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:680px;margin:0 auto;">
    <h1 style="margin:0;font-size:36px;line-height:1.15;font-weight:500;letter-spacing:-0.03em;color:#fff;">Reset your password</h1>
  </div>
</div>
`;

const BOTTOM_HTML = `
${footerHtml()}
`;

export default function ResetPasswordPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#F6F2EA", padding: "48px 40px 64px" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <ResetPasswordForm bp={BP} />
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
