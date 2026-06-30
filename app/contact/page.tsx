import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — Incubator Baguio",
  description:
    "Get in touch with Incubator Baguio — startup incubation, research submission, mentor registration, partner inquiries, and general questions.",
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TOP_HTML = `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#0E0E10;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
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
<div style="position:relative;background:#0B0B0D;padding:56px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-120px;left:50%;transform:translateX(-50%);width:540px;height:540px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.30) 0%,transparent 60%);pointer-events:none;"></div>
  <div style="position:relative;max-width:680px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.45);margin-bottom:20px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.8);">Contact</span></div>
    <div style="display:inline-flex;align-items:center;gap:9px;padding:7px 15px;border-radius:9999px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.04);margin-bottom:24px;"><span style="width:7px;height:7px;border-radius:9999px;background:#F26522;"></span><span style="font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Get in touch</span></div>
    <h1 style="margin:0;font-size:50px;line-height:1.05;font-weight:700;letter-spacing:-0.035em;color:#fff;">Let&rsquo;s talk about<br><span style="color:#F26522;">building something.</span></h1>
    <p style="margin:22px auto 0;font-size:17px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:560px;">Whether you&rsquo;re a founder, researcher, mentor, or organization, the Incubator Baguio team is here to help you find the right path.</p>
  </div>
</div>

<!-- CONTACT INFO -->
<div style="background:#FAFAF7;padding:56px 40px 0;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
    ${[
      ["#F26522", "rgba(242,101,34,0.12)", `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F26522" stroke-width="2"><path d="M3 8.5 12 13l9-4.5"></path><rect x="3" y="5" width="18" height="14" rx="2"></rect></svg>`, "Email", "hello@incubatorbaguio.ph", "mailto:hello@incubatorbaguio.ph"],
      ["#285E7A", "rgba(40,94,122,0.12)", `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#285E7A" stroke-width="2"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"></path></svg>`, "Visit", "CPDSO, City Hall, Baguio", "#"],
      ["#9E2A52", "rgba(158,42,82,0.12)", `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9E2A52" stroke-width="2"><path d="M16.5 7.5c0 5-4.5 9-6.5 11-2-2-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0Z"></path><circle cx="10" cy="7.5" r="2.2"></circle></svg>`, "Follow", "Facebook &middot; LinkedIn", "#"],
    ].map((c) => `
    <div style="background:#fff;border:1px solid rgba(20,20,25,0.10);border-radius:18px;padding:24px;display:flex;align-items:center;gap:14px;">
      <div style="width:46px;height:46px;border-radius:12px;background:${c[1]};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${c[2]}</div>
      <div><div style="font-size:11.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9A958B;margin-bottom:4px;">${c[3]}</div><a href="${c[5]}" style="font-size:14.5px;font-weight:600;color:#141417;text-decoration:none;">${c[4]}</a></div>
    </div>`).join("")}
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- FOOTER -->
<div style="background:#0B0B0D;padding:56px 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div><div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div><div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);"><a class="ib-footlink" href="${BP}/programs">Programs</a><a class="ib-footlink" href="${BP}/challenges">Challenges</a><a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a><a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a><a class="ib-footlink" href="${BP}/events">Events</a><a class="ib-footlink" href="${BP}/contact">Contact</a></div></div>
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

export default function Contact() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div style={{ background: "#FAFAF7", padding: "48px 40px 72px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <ContactForm />
        </div>
      </div>
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
