import type { Metadata } from "next";
import EventsCalendar from "./EventsCalendar";

export const metadata: Metadata = {
  title: "Events — Incubator Baguio",
  description:
    "The shared calendar for Baguio's research and innovation events — one place for universities, agencies, and startups to post and synchronize events across the city.",
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
      <a href="${BP}/events" class="ib-navlink" style="color:#fff;border-bottom:2px solid #F26522;padding-bottom:3px;">Events</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/contact" style="color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;border:1.5px solid rgba(255,255,255,0.22);">Contact Us</a>
      <a href="${BP}/get-started" class="ib-cta-orange" style="background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Get Started</a>
    </div>
  </div>
</div>

<!-- PAGE HEADER -->
<div style="background:#fff;padding:40px 40px 0;border-bottom:1px solid rgba(20,20,25,0.06);">
  <div style="max-width:1300px;margin:0 auto;display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;padding-bottom:28px;">
    <div>
      <h1 style="margin:0 0 8px;font-size:34px;font-weight:700;letter-spacing:-0.025em;color:#141417;">Events</h1>
      <p style="margin:0;font-size:14.5px;color:#6B6B73;">One shared calendar for the Baguio startup and innovation ecosystem.</p>
    </div>
    <div style="display:flex;gap:10px;">
      <a href="#" style="display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:#F26522;text-decoration:none;border:1.5px solid rgba(242,101,34,0.4);padding:11px 18px;border-radius:9999px;">+ Submit Event</a>
      <a href="#" style="display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:600;color:#141417;text-decoration:none;border:1.5px solid rgba(20,20,25,0.14);padding:11px 18px;border-radius:9999px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141417" stroke-width="2"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        Subscribe</a>
    </div>
  </div>
</div>
`;

const BOTTOM_HTML = `
<!-- SYNC CTA -->
<div style="background:#FAFAF7;padding:0 40px 64px;">
  <div style="max-width:1080px;margin:0 auto;background:#141417;border-radius:24px;padding:44px 48px;display:flex;align-items:center;justify-content:space-between;gap:28px;flex-wrap:wrap;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-70px;right:-50px;width:240px;height:240px;background:radial-gradient(circle,rgba(242,101,34,0.26),transparent 65%);"></div>
    <div style="position:relative;max-width:560px;"><h2 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#fff;letter-spacing:-0.02em;">Hosting something? Add it to the shared calendar.</h2><p style="margin:0;font-size:14.5px;line-height:1.55;color:rgba(255,255,255,0.62);">Submit your workshop, forum, hackathon, or demo day so other organizers can plan around it and the community can find it in one place.</p></div>
    <a href="#" style="position:relative;display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:14.5px;padding:14px 26px;border-radius:9999px;text-decoration:none;white-space:nowrap;">Submit an event
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
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

export default function Events() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <EventsCalendar />
      <div dangerouslySetInnerHTML={{ __html: BOTTOM_HTML }} />
    </main>
  );
}
