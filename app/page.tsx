import EcosystemModel from "./programs/EcosystemModel";
import FeaturedStartups from "./FeaturedStartups";
import EcosystemPartnersMarquee from "./EcosystemPartnersMarquee";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HOME_HTML_TOP = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 40px;background:#0B0B0D;position:sticky;top:0;z-index:50;">
  <div style="display:flex;align-items:center;gap:11px;">
    <img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:34px;width:auto;display:block;">
    <div style="font-size:16px;font-weight:600;color:#fff;letter-spacing:-0.01em;">Incubator Baguio</div>
  </div>
  <div style="display:flex;align-items:center;gap:30px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/get-started" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;">Get Started <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:96px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-160px;left:50%;transform:translateX(-50%);width:640px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 62%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="760" height="430" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:900px;margin:0 auto;">
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:32px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;"></span></span>
      <span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Baguio&rsquo;s Startup &amp; Innovation Gateway</span>
    </div>
    <h1 style="margin:0;font-size:76px;line-height:1.0;font-weight:700;letter-spacing:-0.042em;color:#fff;">Building Baguio&rsquo;s Innovation and&nbsp;<span style="color:#F26522;">Startup Ecosystem.</span></h1>
    <p style="margin:28px auto 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:580px;">Incubator Baguio connects startups, universities, Technology Business Incubators, government agencies, investors, and industry partners to accelerate innovation across the city.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:38px;flex-wrap:wrap;">
      <a href="${BP}/programs" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px -14px rgba(242,101,34,0.7);">Find Startup Support
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/ecosystem" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.02);transition:background .2s ease,border-color .2s ease;">Explore the Ecosystem</a>
    </div>
  </div>
</div>

<!-- STAT BAND — seamless dark continuation of the hero, restrained accents -->
<div style="background:#0B0B0D;padding:0 40px 72px;">
  <div style="max-width:1120px;margin:0 auto;border-top:1px solid rgba(255,255,255,0.08);display:grid;grid-template-columns:repeat(4,1fr);">
    ${[
      ["9", "+", "Active startups", false],
      ["8", "+", "Ecosystem partners", true],
      ["4", "", "TBIs", true],
      ["&#8734;", "", "Opportunities to build", true],
    ].map((s) => `<div style="text-align:center;padding:44px 20px 4px;${s[3] ? "border-left:1px solid rgba(255,255,255,0.08);" : ""}"><div style="font-size:48px;font-weight:700;color:#fff;letter-spacing:-0.03em;line-height:1;">${s[0]}<span style="color:#F26522;">${s[1]}</span></div><div style="font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.42);margin-top:12px;">${s[2]}</div></div>`).join("")}
  </div>
</div>
`;

const HOME_HTML_BOTTOM_A = `
<!-- INNOVATION CHALLENGES -->
<div style="background:#fff;padding:80px 40px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:32px;margin-bottom:44px;flex-wrap:wrap;">
      <div style="max-width:600px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Innovation Challenges</div>
        <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Problem statements from government, industry, and academia</h2>
      </div>
      <div style="flex-shrink:0;width:118px;height:96px;position:relative;">
        <svg width="118" height="96" viewBox="0 0 118 96" fill="none"><polyline points="6,40 40,14 74,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="30,52 64,26 98,52" stroke="#F26522" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,72 40,46 74,72" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><circle cx="98" cy="20" r="9" fill="rgba(242,101,34,0.16)"></circle></svg>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${[
        ["#285E7A", "rgba(40,94,122,0.07)", "Government", "Smarter public services", "LGUs post operational challenges in transport, waste, tourism, and digital governance for the community to solve."],
        ["#F26522", "rgba(242,101,34,0.07)", "Industry", "MSME growth problems", "Local businesses surface bottlenecks in operations, supply chains, and market access that startups can address."],
        ["#9E2A52", "rgba(158,42,82,0.07)", "Academia", "Research to market", "Universities open up applied research questions and technologies seeking commercialization partners."],
      ].map((c) => `
      <div class="ib-card-hover" style="background:${c[1]};border:1px solid rgba(20,20,25,0.08);border-radius:18px;padding:28px;border-top:3px solid ${c[0]};display:flex;flex-direction:column;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${c[0]};margin-bottom:12px;">${c[2]}</div>
        <h3 style="margin:0 0 8px;font-size:19px;font-weight:600;color:#141417;">${c[3]}</h3>
        <p style="margin:0 0 18px;font-size:14.5px;line-height:1.55;color:#6B6B73;">${c[4]}</p>
        <a href="${BP}/challenges" style="margin-top:auto;display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:${c[0]};text-decoration:none;">Explore challenges<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c[0]}" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`).join("")}
    </div>
    <div style="margin-top:36px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#9A958B;">Open challenges</div>
        <a href="${BP}/challenges" style="display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;">View all challenges<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        ${[
          ["AGRICULTURE", "#1A6B3C", "rgba(26,107,60,0.1)", "#E23A2E", "9 days left", "Cut post-harvest loss for highland vegetable farmers", "Build a cold-chain or logistics solution that keeps Benguet produce fresh to market.", "DA", "Dept of Agriculture, CAR", "13px", "agri-cold-chain"],
          ["ENVIRONMENT", "#285E7A", "rgba(40,94,122,0.1)", "#F5A623", "21 days left", "Smart waste segregation for Baguio public markets", "Design a system that improves sorting and diversion at high-traffic market sites.", "CEPMO", "City Environment Office", "11px", "waste-segregation"],
          ["TOURISM", "#9E2A52", "rgba(158,42,82,0.1)", "#F5A623", "16 days left", "Spread tourism beyond peak-season rush", "Create a platform that promotes off-peak travel and local creative experiences.", "DOT", "Baguio Tourism", "13px", "tourism-offpeak"],
        ].map((c) => `
        <div class="ib-card-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.12);border-radius:18px;padding:26px;display:flex;flex-direction:column;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
            <span style="font-size:11.5px;font-weight:700;letter-spacing:0.1em;color:${c[1]};background:${c[2]};padding:6px 13px;border-radius:9999px;">${c[0]}</span>
            <span style="display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;color:${c[3]};"><span style="width:7px;height:7px;border-radius:9999px;background:${c[3]};"></span>${c[4]}</span>
          </div>
          <h3 style="margin:0 0 12px;font-size:23px;font-weight:700;letter-spacing:-0.02em;color:#141417;line-height:1.15;">${c[5]}</h3>
          <p style="margin:0 0 22px;font-size:15px;line-height:1.5;color:#6B6B73;">${c[6]}</p>
          <div style="display:flex;align-items:center;gap:12px;margin-top:auto;padding-top:20px;border-top:1px solid rgba(20,20,25,0.1);">
            <div style="width:42px;height:42px;border-radius:11px;background:${c[1]};display:flex;align-items:center;justify-content:center;font-size:${c[9]};font-weight:700;color:#fff;flex-shrink:0;">${c[7]}</div>
            <span style="font-size:14px;color:#9A958B;">${c[8]}</span>
            <a href="${BP}/challenges/${c[10]}" style="margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:14.5px;font-weight:600;color:#141417;text-decoration:none;white-space:nowrap;">View details<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
          </div>
        </div>`).join("")}
      </div>
      <div style="margin-top:40px;text-align:center;">
        <a href="${BP}/challenges" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">View all challenges<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>
    </div>
  </div>
</div>
`;

const HOME_HTML_BOTTOM_B1 = `
<!-- UPCOMING EVENTS -->
<div style="background:#fff;padding:80px 40px;">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="margin-bottom:40px;max-width:640px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Events</div>
      <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Workshops, forums, and community activities</h2>
    </div>
    <div style="display:flex;flex-direction:column;">
      ${[
        ["Jul", "12", "Founder Foundations Workshop", "Idea validation and lean startup basics &middot; Incubator Baguio Hub"],
        ["Jul", "24", "Innovation Forum: Highland Futures", "Cross-sector panel on regional innovation &middot; Saint Louis University"],
        ["Aug", "07", "Community Demo Night", "Open showcase of incubator startups &middot; Baguio Convention Center"],
      ].map((e, i, arr) => `
      <div class="ib-event-hover" style="display:grid;grid-template-columns:96px 1fr auto;gap:28px;align-items:center;padding:24px 8px;border-top:1px solid rgba(20,20,25,0.12);${i === arr.length - 1 ? 'border-bottom:1px solid rgba(20,20,25,0.12);' : ''}">
        <div style="text-align:center;"><div style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#F26522;">${e[0]}</div><div style="font-size:30px;font-weight:700;color:#141417;letter-spacing:-0.02em;">${e[1]}</div></div>
        <div><h3 style="margin:0 0 4px;font-size:19px;font-weight:600;color:#141417;">${e[2]}</h3><p style="margin:0;font-size:14px;color:#6B6B73;">${e[3]}</p></div>
        <a href="#" style="background:#141417;color:#fff;font-weight:600;font-size:13.5px;padding:10px 20px;border-radius:9999px;text-decoration:none;white-space:nowrap;">RSVP</a>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- STARTUP WEEK FEATURE -->
<div style="background:#0E0E10;padding:0 40px;">
  <div style="max-width:1060px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;align-items:stretch;">
    <div style="padding:72px 40px 72px 0;display:flex;flex-direction:column;justify-content:center;">
      <span style="display:inline-block;width:fit-content;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#FFB489;padding:6px 12px;border-radius:9999px;border:1px solid rgba(242,101,34,0.4);background:rgba(242,101,34,0.12);margin-bottom:20px;">Flagship event &middot; 3rd week of April</span>
      <h2 style="margin:0 0 14px;font-size:40px;font-weight:700;letter-spacing:-0.025em;color:#fff;line-height:1.08;">Innovation Startup Week 2026</h2>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:420px;">A full week of pitching, demos, and matchmaking. 10+ startups, investors, mentors, and the public, all in one place.</p>
      <div style="display:flex;gap:12px;"><a href="#" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Register now</a><a href="#" style="color:#fff;font-weight:600;font-size:15px;padding:14px 24px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">View schedule</a></div>
    </div>
    <div style="position:relative;background:radial-gradient(120% 90% at 70% 15%,#1c1c22 0%,#121216 60%);min-height:440px;display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(255,255,255,0.06);overflow:hidden;">
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(242,101,34,0.14),transparent 50%);"></div>
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(circle at 60% 40%,#000 30%,transparent 72%);-webkit-mask-image:radial-gradient(circle at 60% 40%,#000 30%,transparent 72%);"></div>
      <div style="position:absolute;top:32px;right:32px;text-align:right;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#FFB489;">April 2026</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.4);margin-top:4px;">Baguio Convention Center</div>
      </div>
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:210px;height:210px;border-radius:9999px;border:1px solid rgba(255,255,255,0.07);"></div>
        <div style="position:absolute;width:290px;height:290px;border-radius:9999px;border:1px solid rgba(255,255,255,0.045);"></div>
        <svg width="132" height="114" viewBox="0 0 120 104" fill="none" style="position:relative;animation:ibfloat 6s ease-in-out infinite;filter:drop-shadow(0 16px 32px rgba(0,0,0,0.5));"><polyline points="12,40 60,12 108,40" stroke="#F5A623" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,60 60,32 108,60" stroke="#E23A2E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,80 60,52 108,80" stroke="#9E2A52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,100 60,72 108,100" stroke="#285E7A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
      </div>
      <div style="position:absolute;left:32px;bottom:30px;display:flex;gap:8px;">
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Pitch Day</span>
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Demos</span>
        <span style="font-size:11.5px;font-weight:600;color:rgba(255,255,255,0.72);background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:6px 12px;border-radius:9999px;">Matchmaking</span>
      </div>
    </div>
  </div>
</div>

<!-- GIANT APPLY CTA -->
<div style="background:#FAFAF7;padding:80px 40px;">
  <div style="max-width:1180px;margin:0 auto;background:linear-gradient(135deg,#F26522 0%,#E14E12 58%,#C8410C 100%);border-radius:24px;padding:64px 56px;position:relative;overflow:hidden;box-shadow:0 30px 60px -22px rgba(226,78,18,0.55);">
    <div style="position:absolute;inset:0;background:radial-gradient(90% 120% at 100% 0%,rgba(255,255,255,0.16),transparent 55%);"></div>
    <svg style="position:absolute;top:-30px;right:-20px;opacity:0.16;" width="340" height="300" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:580px;">
      <h2 style="margin:0 0 14px;font-size:44px;font-weight:700;letter-spacing:-0.032em;color:#fff;line-height:1.04;">Ready to build something for Baguio?</h2>
      <p style="margin:0 0 32px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.88);">Choose your track and start your application. It takes a few minutes.</p>
    </div>
    <div style="position:relative;display:flex;gap:12px;flex-wrap:wrap;">
      <a href="${BP}/get-started" class="ib-cta-orange" style="background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;box-shadow:0 12px 26px -12px rgba(0,0,0,0.6);">I&rsquo;m a Founder</a>
      <a href="${BP}/get-started" style="background:rgba(255,255,255,0.14);color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.42);backdrop-filter:blur(2px);transition:background .2s ease;">I&rsquo;m a Researcher</a>
      <a href="${BP}/get-started" style="background:rgba(255,255,255,0.14);color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.42);backdrop-filter:blur(2px);transition:background .2s ease;">I&rsquo;m a Partner</a>
    </div>
  </div>
</div>
`;

const HOME_HTML_BOTTOM_B2 = `
<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/calendar">Calendar</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>Startup Incubation</span><span>Research Submission</span><span>Mentor Registration</span><span>Partner Inquiry</span></div></div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><span>CPDSO, City Hall, Baguio</span><span>hello@incubatorbaguio.ph</span><span>Facebook &middot; LinkedIn</span></div></div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;

export default function Home() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_TOP }} />
      <EcosystemModel />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_A }} />
      <FeaturedStartups bp={BP} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_B1 }} />
      <EcosystemPartnersMarquee />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_B2 }} />
    </main>
  );
}
