import type { Metadata } from "next";
import EcosystemPartnersMarquee from "../EcosystemPartnersMarquee";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = {
  title: "About — Incubator Baguio",
  description:
    "Incubator Baguio strengthens Baguio's innovation ecosystem by connecting government, academia, industry, researchers, entrepreneurs, and communities around the Baguio City Research and Innovation Agenda.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ABOUT_HTML_TOP = `
${navBarHtml("/about")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:64px 40px 70px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:620px;height:580px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:860px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.4);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">About</span></div>
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:26px;"><span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span><span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">About Incubator Baguio</span></div>
    <h1 style="margin:0;font-size:54px;line-height:1.06;font-weight:500;letter-spacing:-0.04em;color:#fff;">Building Baguio&rsquo;s <span style="color:#F26522;">Innovation Ecosystem</span></h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:680px;">Incubator Baguio is the City Government of Baguio&rsquo;s platform for innovation ecosystem development under the City Planning, Development, and Sustainability Office (CPDSO). We bring together government, academia, industry, and society to turn ideas, research, and emerging solutions into meaningful action for the City.</p>
  </div>
</div>

<!-- OUR ROLE -->
<div style="background:#F6F2EA;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1.1fr;gap:52px;align-items:center;margin-bottom:44px;">
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:6px;">Our Role</div>
        <div style="width:42px;height:3px;background:#F26522;border-radius:2px;margin-bottom:22px;"></div>
        <h2 style="margin:0 0 24px;font-size:44px;font-weight:500;letter-spacing:-0.03em;color:#1A1714;line-height:1.08;">Connecting the People and Resources Behind Innovation.</h2>
        <p style="margin:0;font-size:16px;line-height:1.65;color:#5A544B;">Incubator Baguio strengthens Baguio&rsquo;s innovation ecosystem by bringing together government, academia, industry, researchers, entrepreneurs, and communities. Guided by the Baguio City Research and Innovation Agenda, we connect ideas, challenges, expertise, and opportunities to help promising innovations move forward.</p>
      </div>
      <div style="position:relative;border-radius:20px;overflow:hidden;aspect-ratio:16/11;background:#FFEEDD;">
        <img src="${BP}/assets/about-our-role.jpg" alt="Incubator Baguio Convenor Meeting, bringing together the city's innovation ecosystem partners" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
        <span style="position:absolute;left:16px;bottom:16px;font-size:11.5px;font-weight:600;letter-spacing:0.06em;color:#fff;background:rgba(64,50,34,0.45);backdrop-filter:blur(6px);padding:7px 14px;border-radius:9999px;">Incubator Baguio &middot; Convenor Meeting</span>
      </div>
    </div>

    <!-- Four functions -->
    <div class="ib-about-functions" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        // Same 4 pillars, colors, and taglines as the "Our Programs" sticky
        // deck (app/programs/EcosystemModel.tsx) -- this section used to run
        // its own, differently-named and differently-described set of 4,
        // which drifted out of sync with the site's actual program pillars.
        ["#FBF3EC", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D9531E" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21V10"></path><path d="M12 10C12 10 7.5 10.5 6 6.5C6 6.5 11 5.5 12 10Z"></path><path d="M12 10C12 10 16.5 10.5 18 6.5C18 6.5 13 5.5 12 10Z"></path></svg>`, "Project Development", "Turning ideas and research into solutions ready for the real world."],
        ["#E8EEF4", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22596F" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"></circle><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"></path><circle cx="17" cy="7" r="2.5"></circle><path d="M21 19c0-2.4-1.8-4.5-4-5"></path></svg>`, "Ecosystem Collaboration", "Bringing the right people together to move solutions forward."],
        ["#F8F0F3", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8E2749" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2.3h6c0-1.1.4-1.8 1-2.3A7 7 0 0 0 12 2Z"></path></svg>`, "Open Innovation & City Adoption", "Connecting city challenges with solutions that can make a difference."],
        ["#EFF4F1", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#17603A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"></path></svg>`, "Innovation Intelligence", "Using evidence to guide what Baguio needs next."],
      ].map((c) => `
      <div style="background:#fff;border:1px solid rgba(64,50,34,0.13);border-radius:20px;padding:28px;display:flex;flex-direction:column;">
        <div style="width:54px;height:54px;border-radius:9999px;background:${c[0]};display:flex;align-items:center;justify-content:center;margin-bottom:18px;">${c[1]}</div>
        <h3 style="margin:0 0 10px;font-size:18px;font-weight:600;letter-spacing:-0.01em;color:#1A1714;">${c[2]}</h3>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#5A544B;">${c[3]}</p>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- QUADRUPLE HELIX -->
<div style="background:#131110;padding:76px 40px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-120px;right:-80px;width:440px;height:440px;background:radial-gradient(circle,rgba(242,101,34,0.18),transparent 65%);"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:44px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;margin-bottom:14px;">The Quadruple Helix Model</div>
      <h2 style="margin:0;font-size:40px;font-weight:500;letter-spacing:-0.025em;color:#fff;">A Collaborative Approach to Innovation</h2>
    </div>
    <div class="ib-helix-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
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
    <div style="position:relative;border-radius:20px;overflow:hidden;background:#100D0B;aspect-ratio:4/4.2;">
      <img src="${BP}/assets/about-our-foundation.jpg" alt="Partners signing the Incubator Baguio Pledge of Commitment" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;">
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(242,101,34,0.14),transparent 55%);"></div>
    </div>
    <div>
      <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#F26522;margin-bottom:14px;">Our Foundation</div>
      <h2 style="margin:0 0 18px;font-size:36px;font-weight:500;letter-spacing:-0.025em;color:#1A1714;line-height:1.1;">Institutionalized Through City Ordinance</h2>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#44444C;">Incubator Baguio was established through Ordinance No. 063, Series of 2023, which created the Baguio City Research and Innovation Alliance under the City Planning, Development and Sustainability Office (CPDSO).</p>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#5A544B;">The ordinance provides the foundation for long-term collaboration among government, academia, industry, and the community to strengthen innovation, entrepreneurship, and research in Baguio.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        ${[
          ["City Government of Baguio", "Lead Institution"],
          ["CPDSO", "Convening Office"],
          ["Ordinance No. 063", "Series of 2023"],
        ].map((chip) => `<div style="background:#FBFAF6;border:1px solid rgba(64,50,34,0.11);border-radius:14px;padding:16px 20px;"><div style="font-size:13px;font-weight:600;color:#1A1714;">${chip[0]}</div><div style="font-size:12.5px;color:#8B8479;margin-top:3px;">${chip[1]}</div></div>`).join("")}
      </div>
    </div>
  </div>
</div>

<!-- TWO PATHS -->
<div style="position:relative;background:#0E0B09;padding:78px 40px 84px;overflow:hidden;">
  <!-- Diagonal accents, top-left and bottom-right -->
  <div style="position:absolute;top:-90px;left:-120px;width:420px;height:190px;background:linear-gradient(115deg,#F26522,#8A3410 70%,transparent);transform:rotate(-38deg);opacity:0.85;pointer-events:none;"></div>
  <div style="position:absolute;bottom:-90px;right:-120px;width:420px;height:190px;background:linear-gradient(115deg,#F26522,#8A3410 70%,transparent);transform:rotate(-38deg);opacity:0.85;pointer-events:none;"></div>

  <div style="position:relative;max-width:1140px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:46px;">
      <div style="font-size:12.5px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;">How we help projects</div>
      <div style="width:120px;height:2px;background:#F26522;margin:12px auto 24px;"></div>
      <h2 style="margin:0;font-size:46px;font-weight:600;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Two paths to move<br><span style="color:#F26522;">your idea forward.</span></h2>
      <p style="margin:20px auto 0;font-size:16.5px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:520px;">Not every project needs the same kind of support. We help you find the path that fits your idea.</p>
    </div>

    <div class="ib-paths-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:26px;">
      ${[
        {
          n: "01",
          // Classical building — the city adopting a solution
          icon: `<path d="M3 21h18M4 21V10M20 21V10M12 3 3 8h18l-9-5Z"></path><path d="M8 21V12M12 21V12M16 21V12"></path>`,
          title: "City Adoption",
          lead: "Turn your idea into a solution for Baguio.",
          desc: "We help promising projects develop, test, and connect with the city for possible adoption.",
          steps: [
            { label: "Develop", icon: `<path d="M9 18h6M10 21h4"></path><path d="M12 3a6 6 0 0 0-3.5 10.9c.3.2.5.6.5 1v1h6v-1c0-.4.2-.8.5-1A6 6 0 0 0 12 3Z"></path>` },
            { label: "Pilot", icon: `<path d="M9 3h6M10 3v6.5L5.5 18A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.7-3L14 9.5V3"></path><path d="M8 15h8"></path>` },
            { label: "Adopt", icon: `<path d="M4 21V8l8-5 8 5v13"></path><path d="M9 21v-6h6v6"></path>` },
          ],
          cta: "Explore City Challenges",
          href: `${BP}/challenges`,
          image: `${BP}/assets/baguio-cathedral-sunset.jpg`,
          alt: "Baguio City at sunset",
        },
        {
          n: "02",
          // Rocket — taking a product to market
          icon: `<path d="M5 14.5 3 21l6.5-2"></path><path d="M14.5 5.5C17.5 2.5 21.5 2.5 21.5 2.5s0 4-3 7L11 17l-4-4Z"></path><circle cx="15.5" cy="8.5" r="1.3"></circle>`,
          title: "Startup Commercialization",
          lead: "Turn your idea into a business.",
          desc: "We help projects validate, develop, and prepare solutions for the market.",
          steps: [
            { label: "Validate", icon: `<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>` },
            { label: "Develop", icon: `<circle cx="12" cy="12" r="3.2"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>` },
            { label: "Launch", icon: `<path d="M3 17 9 11l4 4 8-8"></path><path d="M15 7h6v6"></path>` },
          ],
          cta: "Explore Startup Opportunities",
          href: `${BP}/programs`,
          image: "",
          alt: "",
        },
      ].map((c) => `
      <div class="ib-path-card" style="position:relative;background:#161210;border:1px solid rgba(255,255,255,0.09);border-radius:20px;overflow:hidden;min-height:430px;display:flex;">
        <!-- Imagery bleeds from the right, faded into the card so the copy stays readable -->
        <div style="position:absolute;inset:0 0 0 42%;overflow:hidden;">
          ${c.image
            ? `<img src="${c.image}" alt="${c.alt}" style="width:100%;height:100%;object-fit:cover;display:block;">`
            : `<div style="width:100%;height:100%;background:radial-gradient(120% 90% at 100% 30%,rgba(242,101,34,0.42),transparent 62%),linear-gradient(200deg,#2A1710,#120D0A 70%);"></div>`}
          <div style="position:absolute;inset:0;background:linear-gradient(90deg,#161210 6%,rgba(22,18,16,0.86) 34%,rgba(22,18,16,0.22) 78%,transparent);"></div>
        </div>

        <!-- 80%, not less: "Startup Commercialization" needs ~364px on one
             line and wraps awkwardly below this, misaligning the two cards. -->
        <div style="position:relative;padding:34px 32px;display:flex;flex-direction:column;max-width:80%;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${c.icon}</svg>
            <span style="font-size:15px;font-weight:600;color:rgba(255,255,255,0.55);letter-spacing:0.04em;">${c.n}</span>
            <span style="width:26px;height:1.5px;background:rgba(242,101,34,0.7);"></span>
          </div>

          <h3 style="margin:0 0 10px;font-size:29px;font-weight:600;letter-spacing:-0.025em;color:#fff;line-height:1.12;">${c.title}</h3>
          <p style="margin:0 0 14px;font-size:17px;font-weight:500;line-height:1.4;color:rgba(255,255,255,0.9);">${c.lead}</p>
          <p style="margin:0 0 26px;font-size:14.5px;line-height:1.6;color:rgba(255,255,255,0.55);">${c.desc}</p>

          <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:28px;flex-wrap:wrap;">
            ${c.steps.map((s, i) => `
            ${i > 0 ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" stroke-width="2.4" stroke-linecap="round" style="margin-top:16px;flex-shrink:0;"><path d="m9 6 6 6-6 6"></path></svg>` : ""}
            <div style="text-align:center;width:64px;flex-shrink:0;">
              <div style="width:46px;height:46px;border-radius:9999px;border:1.5px solid rgba(242,101,34,0.55);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
              </div>
              <div style="font-size:12.5px;color:rgba(255,255,255,0.72);">${s.label}</div>
            </div>`).join("")}
          </div>

          <a href="${c.href}" class="ib-cta-orange" style="margin-top:auto;align-self:flex-start;display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:14.5px;padding:13px 26px;border-radius:9999px;text-decoration:none;">${c.cta} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
        </div>
      </div>`).join("")}
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
      <h2 style="margin:0 0 12px;font-size:38px;font-weight:500;letter-spacing:-0.03em;color:#fff;line-height:1.08;">Be part of the ecosystem</h2>
      <p style="margin:0 0 28px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.9);">Whether you build, research, fund, or teach, there is a place for you here.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;"><a href="${BP}/programs" style="background:#100D0B;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Explore programs</a><a href="${BP}/contact" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">Get in touch</a></div>
    </div>
  </div>
</div>

${footerHtml()}
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
