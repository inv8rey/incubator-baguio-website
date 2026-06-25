const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HOME_HTML = `
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
      <a href="#" class="ib-navlink">News</a>
    </div>
    <a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:9999px;text-decoration:none;">Apply Now <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:80px 40px 70px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-120px;left:50%;transform:translateX(-50%);width:560px;height:560px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.38) 0%,transparent 60%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.18;" width="760" height="430" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:880px;margin:0 auto;">
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:28px;">
      <span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span>
      <span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Official Technology Business Incubator of the City of Baguio</span>
    </div>
    <h1 style="margin:0;font-size:78px;line-height:0.98;font-weight:700;letter-spacing:-0.035em;color:#fff;">Building Baguio&rsquo;s Innovation and&nbsp;<span style="color:#F26522;">Startup Ecosystem.</span></h1>
    <p style="margin:26px auto 0;font-size:19px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:560px;">Incubator Baguio brings together entrepreneurs, researchers, students, government agencies, businesses, and academic institutions to transform ideas into solutions that create economic, social, and technological impact.</p>
    <div style="display:flex;gap:14px;justify-content:center;margin-top:36px;flex-wrap:wrap;">
      <a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:16px;padding:16px 32px;border-radius:9999px;text-decoration:none;box-shadow:0 14px 36px rgba(242,101,34,0.4);">Start your application
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="#" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:16px;padding:16px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Explore programs</a>
    </div>
  </div>
</div>

<!-- STAT BAND -->
<div style="background:#F26522;padding:38px 40px;">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;">
    <div style="text-align:center;"><div style="font-size:44px;font-weight:700;color:#fff;letter-spacing:-0.02em;">500+</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:4px;">Youth in Innovation Camp</div></div>
    <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.25);"><div style="font-size:44px;font-weight:700;color:#fff;letter-spacing:-0.02em;">10+</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:4px;">Startups incubated</div></div>
    <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.25);"><div style="font-size:44px;font-weight:700;color:#fff;letter-spacing:-0.02em;">10+</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:4px;">Formal partnerships</div></div>
    <div style="text-align:center;border-left:1px solid rgba(255,255,255,0.25);"><div style="font-size:44px;font-weight:700;color:#fff;letter-spacing:-0.02em;">3M</div><div style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);margin-top:4px;">Innovation Fund (&#8369;)</div></div>
  </div>
</div>

<!-- PROGRAMS -->
<div style="background:#FAFAF7;padding:80px 40px;">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Programs</div>
      <h2 style="margin:0;font-size:46px;font-weight:700;letter-spacing:-0.03em;color:#141417;">Support for Every Stage of Innovation</h2>
    </div>
    <div style="display:flex;flex-direction:column;">
      ${[
        ["01", "#F26522", "Startup Incubation Program", "Structured support from idea validation to venture development, with mentorship, training, and ecosystem connections."],
        ["02", "#F5A623", "Innovation Challenges", "Challenge-driven programs that connect real-world problems with innovators, researchers, and solution providers."],
        ["03", "#E23A2E", "Research Commercialization", "Support for transforming research, technology, and intellectual property into practical applications and ventures."],
        ["04", "#9E2A52", "Innovation Academy", "Workshops, bootcamps, and learning programs covering entrepreneurship, innovation, and startup development."],
        ["05", "#285E7A", "Ecosystem Events", "Forums, conferences, networking activities, demo days, and community events that strengthen collaboration across the ecosystem."],
        ["06", "#F26522", "Partnership Programs", "Collaboration opportunities for government, academia, industry, and development organizations."],
      ].map((p, i, arr) => `
      <div class="ib-row-hover" style="display:grid;grid-template-columns:64px 1fr auto;gap:28px;align-items:center;padding:26px 8px;border-top:1px solid rgba(20,20,25,0.12);${i === arr.length - 1 ? 'border-bottom:1px solid rgba(20,20,25,0.12);' : ''}">
        <span style="font-size:30px;font-weight:700;color:${p[1]};letter-spacing:-0.02em;">${p[0]}</span>
        <div><h3 style="margin:0 0 4px;font-size:22px;font-weight:600;color:#141417;">${p[2]}</h3><p style="margin:0;font-size:14.5px;color:#6B6B73;">${p[3]}</p></div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
      </div>`).join("")}
    </div>
  </div>
</div>

<!-- INNOVATION CHALLENGES -->
<div style="background:#fff;padding:80px 40px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="margin-bottom:40px;max-width:640px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Innovation Challenges</div>
      <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Problem statements from government, industry, and academia</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${[
        ["#285E7A", "Government", "Smarter public services", "LGUs post operational challenges in transport, waste, tourism, and digital governance for the community to solve."],
        ["#F26522", "Industry", "MSME growth problems", "Local businesses surface bottlenecks in operations, supply chains, and market access that startups can address."],
        ["#9E2A52", "Academia", "Research to market", "Universities open up applied research questions and technologies seeking commercialization partners."],
      ].map((c) => `
      <div style="background:#FAFAF7;border:1px solid rgba(20,20,25,0.08);border-radius:18px;padding:28px;border-top:3px solid ${c[0]};">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:${c[0]};margin-bottom:12px;">${c[1]}</div>
        <h3 style="margin:0 0 8px;font-size:19px;font-weight:600;color:#141417;">${c[2]}</h3>
        <p style="margin:0;font-size:14.5px;line-height:1.55;color:#6B6B73;">${c[3]}</p>
      </div>`).join("")}
    </div>
    <div style="margin-top:36px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#9A958B;margin-bottom:18px;">Open challenges</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
        ${[
          ["AGRICULTURE", "#1A6B3C", "rgba(26,107,60,0.1)", "#E23A2E", "9 days left", "Cut post-harvest loss for highland vegetable farmers", "Build a cold-chain or logistics solution that keeps Benguet produce fresh to market.", "DA", "Dept of Agriculture, CAR", "13px"],
          ["ENVIRONMENT", "#285E7A", "rgba(40,94,122,0.1)", "#F5A623", "21 days left", "Smart waste segregation for Baguio public markets", "Design a system that improves sorting and diversion at high-traffic market sites.", "CEPMO", "City Environment Office", "11px"],
          ["TOURISM", "#9E2A52", "rgba(158,42,82,0.1)", "#F5A623", "16 days left", "Spread tourism beyond peak-season rush", "Create a platform that promotes off-peak travel and local creative experiences.", "DOT", "Baguio Tourism", "13px"],
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
            <a href="#" style="margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:14.5px;font-weight:600;color:#141417;text-decoration:none;white-space:nowrap;">View<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
          </div>
        </div>`).join("")}
      </div>
      <div style="margin-top:32px;">
        <a href="#" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">View all challenges<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>
    </div>
  </div>
</div>

<!-- FEATURED STARTUPS -->
<div style="background:#FAFAF7;padding:80px 40px;">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="margin-bottom:40px;max-width:640px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Startup Directory</div>
      <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Startups in the Incubator Baguio network</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;">
      ${[
        ["#F5A623", "TT", "TerraTrack", "AgriTech", "Soil and crop monitoring for highland farmers across the Cordillera."],
        ["#285E7A", "PW", "PineWaste", "CleanTech", "Turning pine and organic waste into compost and biochar products."],
        ["#9E2A52", "KW", "KraftWeave", "Creative", "Marketplace connecting Cordillera weavers to national and global buyers."],
      ].map((s) => `
      <div class="ib-card-hover" style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;overflow:hidden;">
        <div style="height:148px;background:repeating-linear-gradient(135deg,#F4F2EC,#F4F2EC 11px,#EDEAE1 11px,#EDEAE1 22px);display:flex;align-items:center;justify-content:center;"><span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.08em;color:#A8A399;">startup cover</span></div>
        <div style="padding:24px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;"><div style="width:46px;height:46px;border-radius:12px;background:${s[0]};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;">${s[1]}</div><div><div style="font-size:16px;font-weight:600;color:#141417;">${s[2]}</div><div style="font-size:12.5px;color:#9A958B;">${s[3]}</div></div></div>
          <p style="margin:0;font-size:14px;line-height:1.55;color:#6B6B73;">${s[4]}</p>
        </div>
      </div>`).join("")}
    </div>
    <div style="margin-top:32px;">
      <a href="#" style="display:inline-flex;align-items:center;gap:9px;background:#141417;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">View all startups<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
    </div>
  </div>
</div>

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
<div style="background:#0E0E10;padding:0;">
  <div style="display:grid;grid-template-columns:1fr 1fr;align-items:stretch;">
    <div style="padding:72px 56px;display:flex;flex-direction:column;justify-content:center;">
      <span style="display:inline-block;width:fit-content;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#FFB489;padding:6px 12px;border-radius:9999px;border:1px solid rgba(242,101,34,0.4);background:rgba(242,101,34,0.12);margin-bottom:20px;">Flagship event &middot; 3rd week of April</span>
      <h2 style="margin:0 0 14px;font-size:40px;font-weight:700;letter-spacing:-0.025em;color:#fff;line-height:1.08;">Innovation Startup Week 2026</h2>
      <p style="margin:0 0 26px;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.62);max-width:420px;">A full week of pitching, demos, and matchmaking. 10+ startups, investors, mentors, and the public, all in one place.</p>
      <div style="display:flex;gap:12px;"><a href="#" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">Register now</a><a href="#" style="color:#fff;font-weight:600;font-size:15px;padding:14px 24px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">View schedule</a></div>
    </div>
    <div style="position:relative;background:#141418;min-height:420px;display:flex;align-items:center;justify-content:center;border-left:1px solid rgba(255,255,255,0.06);">
      <div style="position:absolute;inset:0;background:linear-gradient(160deg,rgba(242,101,34,0.12),transparent 55%);"></div>
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;">
        <svg width="120" height="104" viewBox="0 0 120 104" fill="none" style="animation:ibfloat 6s ease-in-out infinite;"><polyline points="12,40 60,12 108,40" stroke="#F5A623" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,60 60,32 108,60" stroke="#E23A2E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,80 60,52 108,80" stroke="#9E2A52" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,100 60,72 108,100" stroke="#285E7A" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.4);">Event Imagery</div>
      </div>
    </div>
  </div>
</div>

<!-- GIANT APPLY CTA -->
<div style="background:#FAFAF7;padding:80px 40px;">
  <div style="max-width:1180px;margin:0 auto;background:#F26522;border-radius:28px;padding:60px 56px;position:relative;overflow:hidden;">
    <svg style="position:absolute;top:-40px;right:-30px;opacity:0.22;" width="320" height="280" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
    <div style="position:relative;max-width:560px;">
      <h2 style="margin:0 0 12px;font-size:44px;font-weight:700;letter-spacing:-0.03em;color:#fff;line-height:1.05;">Ready to build something for Baguio?</h2>
      <p style="margin:0 0 30px;font-size:17px;line-height:1.55;color:rgba(255,255,255,0.9);">Choose your track and start your application. It takes a few minutes.</p>
    </div>
    <div style="position:relative;display:flex;gap:12px;flex-wrap:wrap;">
      <a href="#" style="background:#0B0B0D;color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;">I&rsquo;m a Founder</a>
      <a href="#" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">I&rsquo;m a Researcher</a>
      <a href="#" style="background:rgba(255,255,255,0.16);color:#fff;font-weight:600;font-size:15px;padding:14px 26px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.4);">I&rsquo;m a Partner</a>
    </div>
  </div>
</div>

<!-- ECOSYSTEM PARTNERS MARQUEE -->
<div style="background:#fff;padding:56px 0 48px;border-top:1px solid rgba(20,20,25,0.06);overflow:hidden;">
  <div style="text-align:center;margin-bottom:30px;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#9A958B;">Ecosystem partners</div>
  </div>
  <div style="position:relative;overflow:hidden;">
    <div style="display:flex;width:max-content;animation:ibmarquee 36s linear infinite;">
      ${[0, 1].map(() => `<div style="display:flex;gap:14px;padding-right:14px;align-items:center;">
        ${[
          ["#F5A623", "SLU", "Saint Louis University", "12px"],
          ["#285E7A", "UB", "University of Baguio", "12px"],
          ["#7E0707", "UP", "UP Baguio", "12px"],
          ["#1A6B3C", "UC", "University of the Cordilleras", "12px"],
          ["#3A5FA0", "BSU", "Benguet State University", "12px"],
          ["#0055A5", "DOST", "Dept of Science &amp; Technology", "11px"],
          ["#CE1126", "DTI", "Dept of Trade &amp; Industry", "12px"],
          ["#5B3A99", "CHED", "Comm on Higher Education", "11px"],
          ["#009B8D", "DICT", "Dept of ICT", "11px"],
          ["#F26522", "CPDS", "CPDSO &middot; City of Baguio", "10px"],
          ["#2D2D2D", "BCC", "Baguio Chamber of Commerce", "12px"],
        ].map((m) => `<div style="display:flex;align-items:center;gap:10px;background:#F4F2EC;border:1px solid rgba(20,20,25,0.09);border-radius:14px;padding:11px 18px;white-space:nowrap;"><div style="width:34px;height:34px;border-radius:8px;background:${m[0]};display:flex;align-items:center;justify-content:center;font-size:${m[3]};font-weight:700;color:#fff;flex-shrink:0;">${m[1]}</div><span style="font-size:14px;font-weight:600;color:#141417;">${m[2]}</span></div>`).join("")}
      </div>`).join("")}
    </div>
  </div>
  <div style="text-align:center;margin-top:28px;">
    <a href="#" style="font-size:13px;font-weight:600;color:#F26522;text-decoration:none;display:inline-flex;align-items:center;gap:6px;">View all ecosystem partners <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.3"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
  </div>
</div>

<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="#">News &amp; Events</a></div></div>
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
  return <main dangerouslySetInnerHTML={{ __html: HOME_HTML }} />;
}
