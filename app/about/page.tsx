import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Incubator Baguio",
  description:
    "Incubator Baguio brings together government, academia, industry, entrepreneurs, researchers, and community partners to strengthen innovation in the city.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const ABOUT_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/events" class="ib-navlink">Events</a>
    </div>
    <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
  </div>
</div>

<!-- HERO -->
<div style="position:relative;background:#0B0B0D;padding:64px 40px 70px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-120px;left:50%;transform:translateX(-50%);width:560px;height:560px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.34) 0%,transparent 60%);pointer-events:none;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.16;" width="700" height="400" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:860px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">About</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:26px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">About Incubator Baguio</span></div>
    <h1 style="margin:0;font-size:60px;line-height:1.02;font-weight:700;letter-spacing:-0.035em;color:#fff;">Baguio&rsquo;s Innovation <span style="color:#F26522;">Alliance</span></h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:680px;">Incubator Baguio brings together government, academia, industry, entrepreneurs, researchers, and community partners to strengthen innovation, entrepreneurship, and startup development in the city.</p>
  </div>
</div>

<!-- OUR ROLE -->
<div style="background:#FAFAF7;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1.1fr;gap:52px;align-items:center;margin-bottom:44px;">
      <div>
        <div style="font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:6px;">Our Role</div>
        <div style="width:42px;height:3px;background:#F26522;border-radius:2px;margin-bottom:22px;"></div>
        <h2 style="margin:0 0 24px;font-size:44px;font-weight:700;letter-spacing:-0.03em;color:#141417;line-height:1.08;">Building Connections Across the Innovation Ecosystem</h2>
        <p style="margin:0 0 18px;padding-left:20px;border-left:3px solid #F26522;font-size:16px;line-height:1.6;font-weight:500;color:#2A2A30;">Innovation does not happen in isolation. Entrepreneurs need mentors, researchers need industry partners, startups need support networks, and institutions need platforms for collaboration.</p>
        <p style="margin:0;font-size:16px;line-height:1.65;color:#6B6B73;">Incubator Baguio serves as a shared platform where government agencies, higher education institutions, private organizations, startups, and innovators can work together to develop ideas, strengthen capabilities, and create new opportunities.</p>
      </div>
      <div style="position:relative;border-radius:20px;overflow:hidden;aspect-ratio:16/11;background:repeating-linear-gradient(135deg,#E9E6DE,#E9E6DE 13px,#E2DFD6 13px,#E2DFD6 26px);display:flex;align-items:center;justify-content:center;">
        <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.5;" width="320" height="300" viewBox="0 0 120 104" fill="none"><polyline points="18,38 60,8 102,38" stroke="#F26522" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="18,60 60,30 102,60" stroke="#E23A2E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="18,82 60,52 102,82" stroke="#9E2A52" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="18,104 60,74 102,104" stroke="#285E7A" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
        <span style="position:relative;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.1em;color:#9A958B;background:rgba(255,255,255,0.7);padding:6px 12px;border-radius:6px;">Baguio cityscape</span>
      </div>
    </div>

    <!-- Featured card -->
    <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;padding:34px 38px;display:grid;grid-template-columns:auto 1fr auto auto;gap:28px;align-items:center;position:relative;overflow:hidden;margin-bottom:18px;">
      <svg style="position:absolute;right:120px;top:50%;transform:translateY(-50%);opacity:0.08;" width="180" height="150" viewBox="0 0 120 104" fill="none"><polyline points="18,40 60,12 102,40" stroke="#F26522" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="18,64 60,36 102,64" stroke="#F26522" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="18,88 60,60 102,88" stroke="#F26522" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
      <div style="width:78px;height:78px;border-radius:18px;background:#FDEEE6;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg></div>
      <div style="position:relative;">
        <h3 style="margin:0 0 8px;font-size:24px;font-weight:700;letter-spacing:-0.02em;color:#141417;">Technology Business Incubator</h3>
        <p style="margin:0;font-size:15px;line-height:1.55;color:#6B6B73;max-width:480px;">Supporting startups and innovators through incubation, mentorship, training, and access to networks and opportunities.</p>
      </div>
      <div style="width:1px;height:64px;background:rgba(20,20,25,0.1);"></div>
      <a href="#" class="ib-cta-orange" style="width:54px;height:54px;border-radius:9999px;background:#F26522;display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
    </div>

    <!-- Three cards -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
      ${[
        ["#FEF3E2", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F5A623" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="2.4"></circle><circle cx="5.5" cy="10" r="2"></circle><circle cx="18.5" cy="10" r="2"></circle><path d="M12 11c-2.5 0-4 1.6-4 4v1h8v-1c0-2.4-1.5-4-4-4zM5.5 14c-1.8 0-3 1.1-3 3v.5M18.5 14c1.8 0 3 1.1 3 3v.5"></path></svg>`, "Innovation Platform", "Providing a space where government, academia, industry, and the community can collaborate on innovation initiatives."],
        ["#FCE9E7", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E23A2E" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h6v5l3 8c.4 1.1-.4 2-1.5 2H4.5C3.4 18 2.6 17.1 3 16l3-8V3z"></path><path d="M6 3h6M5 21h14M9 21v-2a2 2 0 0 1 2-2h0"></path></svg>`, "Research and Commercialization", "Helping connect research, technology, and innovation with practical applications and market opportunities."],
        ["#E8EEF4", `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m11 17 2 2a1 1 0 0 0 3-3"></path><path d="m14 14 2.5 2.5a1 1 0 0 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 0 1-1.42 0l-2-2a1 1 0 0 1 0-1.42l2.62-2.62a3 3 0 0 1 2.13-.88H17l3 3"></path><path d="m21 3-1 1M3 9l4-4 3 3"></path></svg>`, "Ecosystem Development", "Strengthening the relationships, programs, and institutions that support innovation in Baguio."],
      ].map((c) => `
      <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:20px;padding:30px;display:flex;flex-direction:column;">
        <div style="width:58px;height:58px;border-radius:9999px;background:${c[0]};display:flex;align-items:center;justify-content:center;margin-bottom:20px;">${c[1]}</div>
        <h3 style="margin:0 0 10px;font-size:20px;font-weight:700;letter-spacing:-0.01em;color:#141417;">${c[2]}</h3>
        <p style="margin:0 0 22px;font-size:14.5px;line-height:1.55;color:#6B6B73;">${c[3]}</p>
        <a href="#" style="margin-top:auto;display:inline-flex;align-items:center;gap:8px;font-size:14.5px;font-weight:700;color:#F26522;text-decoration:none;">Learn more<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
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

<!-- PARTNERS -->
<div style="background:#FAFAF7;padding:72px 40px;border-top:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:42px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">Partners</div>
      <h2 style="margin:0;font-size:40px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Ecosystem partners</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;">
      ${[
        ["#F5A623", "SLU", "Saint Louis University", "12px"],
        ["#285E7A", "UB", "University of Baguio", "12px"],
        ["#7E0707", "UP", "UP Baguio", "12px"],
        ["#1A6B3C", "UC", "University of the Cordilleras", "11px"],
        ["#3A5FA0", "BSU", "Benguet State University", "11px"],
        ["#0055A5", "DOST", "Dept of Science &amp; Technology", "10px"],
        ["#CE1126", "DTI", "Dept of Trade &amp; Industry", "12px"],
        ["#5B3A99", "CHED", "Comm on Higher Education", "10px"],
        ["#009B8D", "DICT", "Dept of ICT", "10px"],
      ].map((p) => `<div style="display:flex;align-items:center;gap:12px;background:#fff;border:1px solid rgba(20,20,25,0.09);border-radius:14px;padding:16px 20px;"><div style="width:38px;height:38px;border-radius:9px;background:${p[0]};display:flex;align-items:center;justify-content:center;font-size:${p[3]};font-weight:700;color:#fff;flex-shrink:0;">${p[1]}</div><span style="font-size:14.5px;font-weight:600;color:#141417;">${p[2]}</span></div>`).join("")}
    </div>
  </div>
</div>

<!-- CTA -->
<div style="background:#fff;padding:72px 40px;">
  <div style="max-width:1080px;margin:0 auto;background:#F26522;border-radius:28px;padding:56px;position:relative;overflow:hidden;text-align:center;">
    <svg style="position:absolute;top:-40px;right:-30px;opacity:0.2;" width="300" height="260" viewBox="0 0 120 104" fill="none"><polyline points="12,40 60,12 108,40" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,62 60,34 108,62" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="12,84 60,56 108,84" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
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
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/events">Events</a></div></div>
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

export default function About() {
  return <main dangerouslySetInnerHTML={{ __html: ABOUT_HTML }} />;
}
