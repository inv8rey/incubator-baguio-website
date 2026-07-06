import type { Metadata } from "next";
import EcosystemPartnersMarquee from "../EcosystemPartnersMarquee";

export const metadata: Metadata = {
  title: "About — Incubator Baguio",
  description:
    "Incubator Baguio brings together government, academia, industry, entrepreneurs, researchers, and community partners to strengthen innovation in the city.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ABOUT_HTML_TOP = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:32px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:64px 40px 70px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:620px;height:580px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:860px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.4);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">About</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:26px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">About Incubator Baguio</span></div>
    <h1 style="margin:0;font-size:54px;line-height:1.06;font-weight:700;letter-spacing:-0.04em;color:#fff;">The Gateway to Baguio&rsquo;s <span style="color:#F26522;">Startup &amp; Innovation Ecosystem</span></h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:680px;">We connect startups, researchers, universities, Technology Business Incubators, government agencies, investors, and industry partners to build a stronger innovation ecosystem for Baguio.</p>
  </div>
</div>

<!-- OUR ROLE -->
<div style="background:#FAFAF7;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1.1fr;gap:52px;align-items:center;margin-bottom:44px;">
      <div>
        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:6px;">Our Role</div>
        <div style="width:42px;height:3px;background:#F26522;border-radius:2px;margin-bottom:22px;"></div>
        <h2 style="margin:0 0 24px;font-size:44px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Building the Infrastructure for Innovation</h2>
        <p style="margin:0;font-size:16px;line-height:1.65;color:#6B6B73;">Incubator Baguio is the city&rsquo;s startup and innovation ecosystem platform, connecting founders, researchers, universities, Technology Business Incubators, government agencies, investors, industry, and the community to create opportunities, strengthen collaboration, and accelerate innovation across Baguio.</p>
      </div>
      <div style="position:relative;border-radius:20px;overflow:hidden;aspect-ratio:16/11;background:#FFEEDD;">
        <svg style="position:absolute;inset:0;width:100%;height:100%;display:block;" viewBox="0 0 800 550" preserveAspectRatio="xMidYMid slice" fill="none" role="img" aria-label="Illustration of Baguio City: pine-covered mountains at golden hour">
          <defs>
            <linearGradient id="ib-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFF6EC"></stop>
              <stop offset="0.65" stop-color="#FFE3C4"></stop>
              <stop offset="1" stop-color="#FFD5AC"></stop>
            </linearGradient>
            <linearGradient id="ib-fog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFF3E4" stop-opacity="0"></stop>
              <stop offset="0.5" stop-color="#FFF3E4" stop-opacity="0.85"></stop>
              <stop offset="1" stop-color="#FFF3E4" stop-opacity="0"></stop>
            </linearGradient>
          </defs>
          <rect width="800" height="550" fill="url(#ib-sky)"></rect>
          <circle cx="588" cy="188" r="118" fill="#F26522" opacity="0.1"></circle>
          <circle cx="588" cy="188" r="84" fill="#F26522" opacity="0.18"></circle>
          <circle cx="588" cy="188" r="54" fill="#F26522"></circle>
          <ellipse cx="180" cy="120" rx="74" ry="16" fill="#fff" opacity="0.55"></ellipse>
          <ellipse cx="255" cy="138" rx="52" ry="12" fill="#fff" opacity="0.4"></ellipse>
          <ellipse cx="640" cy="86" rx="60" ry="13" fill="#fff" opacity="0.45"></ellipse>
          <path d="M690 128c4-10 16-10 20 0M718 122c3-8 13-8 16 0" stroke="#B0745A" stroke-width="3" stroke-linecap="round"></path>
          <path d="M0 306 L92 224 L184 288 L276 206 L378 296 L474 216 L576 290 L684 222 L800 294 L800 550 L0 550 Z" fill="#F0BE94"></path>
          <path d="M0 364 L112 282 L224 352 L338 268 L456 358 L566 284 L676 352 L800 288 L800 550 L0 550 Z" fill="#DD8A57"></path>
          <rect y="336" width="800" height="66" fill="url(#ib-fog)"></rect>
          <g>
            <rect x="296" y="398" width="26" height="64" fill="#8A5642"></rect>
            <rect x="330" y="380" width="34" height="82" fill="#9E634B"></rect>
            <rect x="372" y="406" width="22" height="56" fill="#7C4C39"></rect>
            <rect x="402" y="388" width="30" height="74" fill="#8A5642"></rect>
            <rect x="440" y="412" width="24" height="50" fill="#9E634B"></rect>
            <rect x="338" y="392" width="6" height="8" fill="#FFD9A0"></rect><rect x="350" y="392" width="6" height="8" fill="#FFD9A0"></rect>
            <rect x="338" y="408" width="6" height="8" fill="#FFD9A0"></rect><rect x="350" y="424" width="6" height="8" fill="#FFD9A0"></rect>
            <rect x="408" y="400" width="5" height="7" fill="#FFD9A0"></rect><rect x="418" y="414" width="5" height="7" fill="#FFD9A0"></rect>
            <rect x="303" y="410" width="5" height="7" fill="#FFD9A0"></rect><rect x="313" y="426" width="5" height="7" fill="#FFD9A0"></rect>
            <rect x="446" y="422" width="5" height="7" fill="#FFD9A0"></rect>
          </g>
          <path d="M0 474 L128 420 L268 468 L424 414 L596 472 L800 428 L800 550 L0 550 Z" fill="#3A5A50"></path>
          <g fill="#22423A">
            <path d="M96 458 L118 404 L140 458 Z"></path><path d="M102 434 L118 394 L134 434 Z"></path><rect x="114" y="456" width="8" height="14"></rect>
            <path d="M196 470 L214 426 L232 470 Z"></path><path d="M201 450 L214 418 L227 450 Z"></path><rect x="210" y="468" width="7" height="12"></rect>
            <path d="M528 470 L548 420 L568 470 Z"></path><path d="M534 448 L548 410 L562 448 Z"></path><rect x="544" y="468" width="8" height="13"></rect>
          </g>
          <g fill="#16302A">
            <path d="M20 512 L56 424 L92 512 Z"></path><path d="M30 470 L56 406 L82 470 Z"></path><rect x="50" y="508" width="11" height="22"></rect>
            <path d="M656 516 L694 424 L732 516 Z"></path><path d="M666 472 L694 406 L722 472 Z"></path><rect x="688" y="512" width="12" height="24"></rect>
            <path d="M740 526 L772 448 L800 526 Z"></path><path d="M748 488 L772 432 L796 488 Z"></path>
          </g>
          <path d="M0 522 L180 496 L400 524 L620 498 L800 522 L800 550 L0 550 Z" fill="#274239"></path>
        </svg>
        <span style="position:absolute;left:16px;bottom:16px;font-size:11.5px;font-weight:600;letter-spacing:0.06em;color:#fff;background:rgba(20,20,25,0.45);backdrop-filter:blur(6px);padding:7px 14px;border-radius:9999px;">Baguio City &middot; City of Pines &middot; 1,540 MASL</span>
      </div>
    </div>

    <!-- Four functions -->
    <div class="ib-about-functions" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        ["#FDEEE6", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2.2 5.2-5.2 2.2 2.2-5.2 5.2-2.2Z"></path></svg>`, "Ecosystem Gateway", "Connect founders to the right Technology Business Incubator, mentors, funding opportunities, and ecosystem partners."],
        ["#E8EEF4", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="3"></circle><circle cx="17" cy="7" r="3"></circle><circle cx="12" cy="18" r="3"></circle><path d="M7 10v2.5L12 15M17 10v2.5L12 15"></path></svg>`, "Ecosystem Coordination", "Coordinate universities, government agencies, industry, investors, and community partners through shared initiatives and collaborative programs."],
        ["#EFEAF8", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7C5CD6" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18M6 20v-7m6 7V8m6 12v-4"></path><path d="M3 11l6-5 6 4 6-6"></path></svg>`, "Ecosystem Intelligence", "Maintain the city&rsquo;s startup database, ecosystem dashboard, innovation reports, and research insights to support better decision-making."],
        ["#E7F3EC", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1A6B3C" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12C12 7 9 4 5 3c0 5 2 8 7 9ZM12 12c0-5 3-8 7-9 0 5-2 8-7 9Z"></path></svg>`, "Ecosystem Development", "Design initiatives that strengthen collaboration, increase startup activity, and grow Baguio&rsquo;s innovation ecosystem over time."],
      ].map((c) => `
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;padding:28px;display:flex;flex-direction:column;">
        <div style="width:54px;height:54px;border-radius:9999px;background:${c[0]};display:flex;align-items:center;justify-content:center;margin-bottom:18px;">${c[1]}</div>
        <h3 style="margin:0 0 10px;font-size:18px;font-weight:700;letter-spacing:-0.01em;color:#141417;">${c[2]}</h3>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#6B6B73;">${c[3]}</p>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- QUADRUPLE HELIX -->
<div style="background:#0E0E10;padding:76px 40px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-120px;right:-80px;width:440px;height:440px;background:radial-gradient(circle,rgba(242,101,34,0.18),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:44px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;margin-bottom:14px;">The Quadruple Helix Model</div>
      <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.025em;color:#fff;">A Collaborative Approach to Innovation</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        ["#F26522", "rgba(242,101,34,0.14)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`, "Government", "The City Government provides leadership, policy support, and strategic direction to strengthen Baguio&rsquo;s innovation ecosystem."],
        ["#F5A623", "rgba(245,166,35,0.14)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="2"><path d="M22 10 12 5 2 10l10 5 10-5Z"></path><path d="M6 12v5c3 2 9 2 12 0v-5"></path></svg>`, "Academia", "Universities and research institutions contribute knowledge, talent, research, and emerging technologies that drive innovation."],
        ["#E23A2E", "rgba(226,58,46,0.12)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E23A2E" stroke-width="2"><path d="M3 21V8l6-4 6 4M15 21V11l6-3v13M3 21h18M8 12v.01M8 16v.01"></path></svg>`, "Industry", "Businesses, investors, and private sector partners provide market access, expertise, mentorship, and opportunities for growth."],
        ["#285E7A", "rgba(40,94,122,0.14)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5B9BC0" stroke-width="2"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="10" r="2.5"></circle><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M15 20c0-2 .8-3.5 2-4"></path></svg>`, "Community", "Students, entrepreneurs, innovators, civil society organizations, and citizens help identify challenges, test solutions, and create meaningful participation."],
      ].map((p) => `
      <div style="background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:18px;padding:26px;border-top:3px solid ${p[0]};">
        <div style="width:44px;height:44px;border-radius:12px;background:${p[1]};display:flex;align-items:center;justify-content:center;margin-bottom:16px;">${p[2]}</div>
        <h3 style="margin:0 0 7px;font-size:18px;font-weight:600;color:#fff;">${p[3]}</h3>
        <p style="margin:0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,0.58);">${p[4]}</p>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- OUR FOUNDATION -->
<div style="background:#fff;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:0.85fr 1.15fr;gap:52px;align-items:center;">
    <div style="position:relative;border-radius:20px;overflow:hidden;background:#0B0B0D;aspect-ratio:4/4.2;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(242,101,34,0.14),transparent 55%);"></div>
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:24px;"><svg width="120" height="104" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#F5A623" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,60 60,32 108,60" stroke="#E23A2E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,80 60,52 108,80" stroke="#9E2A52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,100 60,72 108,100" stroke="#285E7A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline></svg><div style="font-size:11.5px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.4);">City Hall Imagery</div></div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">Our Foundation</div>
      <h2 style="margin:0 0 18px;font-size:36px;font-weight:700;letter-spacing:-0.025em;color:#141417;line-height:1.1;">Institutionalized Through City Ordinance</h2>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#44444C;">Incubator Baguio was established through Ordinance No. 063, Series of 2023, which created the Baguio City Research and Innovation Alliance under the City Planning, Development and Sustainability Office (CPDSO).</p>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#6B6B73;">The ordinance provides the foundation for long-term collaboration among government, academia, industry, and the community to strengthen innovation, entrepreneurship, research, and startup development in Baguio.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        ${[
          ["City Government of Baguio", "Lead Institution"],
          ["CPDSO", "Convening Office"],
          ["Ordinance No. 063", "Series of 2023"],
        ].map((chip) => `<div style="background:#FBFAF6;border:1px solid rgba(20,20,25,0.08);border-radius:14px;padding:16px 20px;"><div style="font-size:13px;font-weight:600;color:#141417;">${chip[0]}</div><div style="font-size:12.5px;color:#9A958B;margin-top:3px;">${chip[1]}</div></div>`).join("")}
      </div>
    </div>
  </div>
</div>
`;

const ABOUT_HTML_BOTTOM = `
<!-- CTA -->
<div style="background:#fff;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;background:linear-gradient(135deg,#F26522 0%,#E14E12 58%,#C8410C 100%);border-radius:24px;padding:60px 56px;position:relative;overflow:hidden;text-align:center;box-shadow:0 30px 60px -22px rgba(226,78,18,0.55);">
    <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.16),transparent 55%);"></div>
    <svg style="position:absolute;top:-30px;right:-20px;opacity:0.16;" width="320" height="280" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:560px;margin:0 auto;">
      <h2 style="margin:0 0 12px;font-size:38px;font-weight:700;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Be part of the alliance</h2>
      <p style="margin:0 0 28px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.9);">Whether you build, research, fund, or teach, there is a place for you here.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="#" style="background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Explore programs</a><a href="#" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">Get in touch</a></div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:38px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/calendar">Calendar</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/dashboard/startup">Startup Incubation</a><a class="ib-footlink" href="${BP}/challenges/post">Post a Challenge</a><a class="ib-footlink" href="${BP}/dashboard/mentor">Mentor Registration</a><a class="ib-footlink" href="${BP}/dashboard/organizations">Partner Inquiry</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>hello@incubatorbaguio.ph</span><a class="ib-footlink" href="https://www.facebook.com/incubatorbaguio" target="_blank" rel="noopener noreferrer">Facebook</a></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

export default function About() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: ABOUT_HTML_TOP }} />
      <EcosystemPartnersMarquee />
      <div dangerouslySetInnerHTML={{ __html: ABOUT_HTML_BOTTOM }} />
    </main>
  );
}
