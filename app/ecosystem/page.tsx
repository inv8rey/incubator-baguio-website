import type { Metadata } from "next";
import EcosystemDirectory from "./EcosystemDirectory";
import EcosystemStats from "./EcosystemStats";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "Ecosystem — Incubator Baguio",
  description:
    "Explore Baguio's growing ecosystem of startups, researchers, mentors, universities, incubators, government agencies, industry partners, and innovation organizations.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
${navBarHtml("/ecosystem")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:56px 40px 56px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:620px;height:580px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:840px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.4);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">Ecosystem</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:26px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Baguio Innovation Ecosystem</span></div>
    <h1 style="margin:0;font-size:56px;line-height:1.03;font-weight:500;letter-spacing:-0.04em;color:#fff;">Discover the People and Organizations Driving Innovation in Baguio</h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:600px;">Explore Baguio&rsquo;s growing ecosystem of startups, researchers, mentors, universities, incubators, government agencies, industry partners, and innovation organizations. Find the people and resources that can help turn ideas into solutions and opportunities.</p>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- PARTNER CTA -->
<div style="background:#F6F2EA;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;background:linear-gradient(135deg,#F26522 0%,#E14E12 58%,#C8410C 100%);border-radius:24px;padding:60px 56px;position:relative;overflow:hidden;text-align:center;box-shadow:0 30px 60px -22px rgba(226,78,18,0.55);">
    <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.16),transparent 55%);"></div>
    <svg style="position:absolute;top:-30px;right:-20px;opacity:0.16;" width="320" height="280" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:580px;margin:0 auto;">
      <h2 style="margin:0 0 12px;font-size:38px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Join the ecosystem</h2>
      <p style="margin:0 0 28px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.9);">Become a partner, sign up as a mentor, or bring your company into the alliance.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="${BP}/contact" style="background:#100D0B;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Become a partner</a><a href="${BP}/ecosystem-signup?type=mentor" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">Sign up as a mentor</a></div>
    </div>
  </div>
</div>

${footerHtml()}
`;

export default function Ecosystem() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <EcosystemStats />
      <EcosystemDirectory />
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
