import type { Metadata } from "next";
import { pageMeta } from "../seo";
import EcosystemModel from "./EcosystemModel";
import AudiencePaths from "./AudiencePaths";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = pageMeta({
  title: "Programs — Incubator Baguio",
  description:
    "Pathways for founders, youth, researchers, and partners — mapped to the functions of the Alliance under Ordinance No. 63.",
  path: "/programs/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Incubator Baguio?",
    a: "Incubator Baguio is Baguio City&rsquo;s innovation ecosystem platform. We connect founders, researchers, universities, government, industry, investors, and ecosystem partners to accelerate innovation and entrepreneurship.",
  },
  {
    q: "Do I need an existing innovation to join?",
    a: "No. Whether you&rsquo;re exploring an idea, validating a problem, building your first product, or scaling an existing innovation, we&rsquo;ll help connect you with the right programs and ecosystem partners.",
  },
  {
    q: "Does Incubator Baguio provide funding?",
    a: "Incubator Baguio does not directly invest in innovations. Instead, we help founders become investment-ready and connect them with grants, investors, government funding, corporate innovation programs, and other financing opportunities.",
  },
  {
    q: "How is Incubator Baguio different from a university incubator?",
    a: "University incubators focus on supporting innovators within their institutions. Incubator Baguio coordinates the broader ecosystem by connecting founders with universities, government agencies, investors, corporations, mentors, and other ecosystem partners. We complement existing incubators rather than replace them.",
  },
  {
    q: "How do I get started?",
    a: "Choose the pathway that best describes your current stage, submit an inquiry, and our team will connect you with the most appropriate programs, partners, or support services within the ecosystem.",
  },
];

const PROGRAMS_HTML_TOP = `
${navBarHtml("/programs")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;overflow:hidden;">
  <div class="ib-programs-hero" style="max-width:1440px;margin:0 auto;display:grid;grid-template-columns:1.3fr 1fr;align-items:stretch;">
    <div style="position:relative;padding:88px 40px;display:flex;flex-direction:column;justify-content:center;">
      <div style="position:absolute;top:-120px;left:-100px;width:420px;height:420px;background:radial-gradient(circle,rgba(242,101,34,0.2),transparent 65%);pointer-events:none;"></div>
      <div style="position:relative;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:16px;">Programs &amp; Opportunities</div>
        <h1 style="margin:0;font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.12;max-width:560px;">Find the Right Opportunity for Your <span style="color:#F26522;">Innovation Journey.</span></h1>
        <p style="margin:20px 0 0;font-size:16px;line-height:1.65;color:rgba(255,255,255,0.62);max-width:520px;">Whether you&rsquo;re a founder, student, researcher, mentor, investor, or organization, discover programs, events, funding opportunities, and ecosystem initiatives designed to help you succeed.</p>

        <div style="display:grid;grid-template-columns:repeat(2,auto);gap:16px 36px;margin:32px 0 30px;">
          ${[
            ["#F26522", "rgba(242,101,34,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F5A07A" stroke-width="2"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.3"></circle><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 .8-3.5 2-4"></path></svg>`, "15+", "Programs &amp; Initiatives"],
            ["#E23A2E", "rgba(226,58,46,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F0938C" stroke-width="2"><path d="M20.8 4.6a4.7 4.7 0 0 0-6.6 0L12 6.8l-2.2-2.2a4.7 4.7 0 0 0-6.6 6.6L12 20l8.8-8.8a4.7 4.7 0 0 0 0-6.6Z"></path></svg>`, "8", "Ecosystem Partners"],
            ["#E23A2E", "rgba(226,58,46,0.14)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F0938C" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`, "4", "Technology Business Incubators"],
            ["#285E7A", "rgba(58,123,213,0.16)", `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#7BAEE8" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M3 9h18M8 2v4M16 2v4"></path></svg>`, "Year-round", "Activities &amp; Events"],
          ].map((s) => `
          <div style="display:flex;align-items:center;gap:11px;">
            <div style="width:38px;height:38px;border-radius:9999px;background:${s[1]};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${s[2]}</div>
            <div><div style="font-size:19px;font-weight:600;color:#fff;letter-spacing:-0.01em;line-height:1.1;">${s[3]}</div><div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:2px;">${s[4]}</div></div>
          </div>`).join("")}
        </div>

        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a href="#program-grid" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:15px 28px;border-radius:9999px;text-decoration:none;">Explore Opportunities
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
          <a href="${BP}/ecosystem" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15px;padding:15px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">See How We Support You
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
        </div>
      </div>
    </div>

    <div style="position:relative;overflow:hidden;background:radial-gradient(120% 90% at 78% 30%,#F2A24A 0%,#C9591F 28%,#5A1E12 55%,#100D0B 80%);">
      <div style="position:absolute;inset:0;background:linear-gradient(100deg,#100D0B 0%,rgba(11,11,13,0.4) 22%,transparent 48%);"></div>
      <svg style="position:absolute;left:0;top:0;width:100%;height:100%;" viewBox="0 0 600 560" fill="none" preserveAspectRatio="xMidYMid slice">
        <path d="M40 470 L130 470 L130 380 L190 380 L190 320 L250 320 L250 470" stroke="rgba(20,10,5,0.55)" stroke-width="3" fill="none"></path>
        <path d="M320 470 L320 300 L360 250 L400 300 L400 470" stroke="rgba(20,10,5,0.5)" stroke-width="3" fill="none"></path>
        <path d="M430 470 Q480 360 540 470" stroke="rgba(20,10,5,0.45)" stroke-width="3" fill="none"></path>
        <line x1="0" y1="470" x2="600" y2="470" stroke="rgba(20,10,5,0.5)" stroke-width="2"></line>
        <g opacity="0.55" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <polyline points="80,260 300,80 520,260" stroke="#F5A623" stroke-width="14"></polyline>
          <polyline points="120,330 300,170 480,330" stroke="#E23A2E" stroke-width="14"></polyline>
        </g>
      </svg>
    </div>
  </div>
</div>
`;

const PROGRAMS_HTML_FAQ_FOOTER = `
<!-- FAQ -->
<div style="background:#fff;padding:88px 40px;">
  <div style="max-width:860px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h2 style="margin:0;font-size:46px;font-weight:500;letter-spacing:-0.03em;color:#1A1714;line-height:1.1;">Frequently asked questions</h2>
      <p style="margin:18px auto 0;font-size:16px;line-height:1.6;color:#5A544B;max-width:420px;">Everything you need to know about the Incubator Baguio ecosystem.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      ${FAQS.map((f) => `
      <details class="ib-faq-item" style="background:#F7F3ED;border-radius:20px;overflow:hidden;">
        <summary class="ib-faq-summary" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:26px 32px;">
          <span style="font-size:17px;font-weight:600;color:#1A1714;">${f.q}</span>
          <svg class="ib-faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M6 9l6 6 6-6"></path></svg>
        </summary>
        <div style="padding:0 32px 28px;">
          <p style="margin:0;font-size:14.5px;line-height:1.65;color:#5A544B;max-width:680px;">${f.a}</p>
        </div>
      </details>`).join("")}
    </div>
  </div>
</div>

${footerHtml()}
`;

export default function Programs() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: PROGRAMS_HTML_TOP }} />
      <EcosystemModel />
      <AudiencePaths />
      <div dangerouslySetInnerHTML={{ __html: PROGRAMS_HTML_FAQ_FOOTER }} />
    </main>
  );
}
