import type { Metadata } from "next";
import { pageMeta } from "../seo";
import { navBarHtml, footerHtml } from "../chrome";

export const metadata: Metadata = pageMeta({
  title: "Research & Innovation Agenda — Incubator Baguio",
  description:
    "The Baguio City Research and Innovation Agenda sets the shared priorities that Incubator Baguio's programs, challenges, and partnerships are organized around. Explore the six focus areas and how to take part.",
  path: "/research-innovation-agenda/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ORANGE = "#F26522";
const CONTACT_EMAIL = "incubatorbaguio63@gmail.com";

const FOCUS: [string, string][] = [
  ["Environment", "Protecting nature, reducing waste, and keeping Baguio clean and sustainable."],
  ["People & Communities", "Improving people’s lives and making sure everyone has access to opportunities and services."],
  ["Business & Jobs", "Supporting businesses, creating jobs, tourism, and new livelihood opportunities."],
  ["City & Technology", "Improving transportation, infrastructure, public spaces, and the use of technology."],
  ["Safety & Resilience", "Preparing Baguio for disasters, climate change, and other risks."],
  ["Better Government", "Making government services easier, faster, more transparent, and responsive."],
];

const focusCards = FOCUS.map(
  ([t, d], i) => `
    <div style="background:#fff;border:1px solid rgba(64,50,34,0.1);border-radius:20px;padding:26px 26px 24px;">
      <div style="width:38px;height:38px;border-radius:12px;background:rgba(242,101,34,0.1);color:${ORANGE};font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">${i + 1}</div>
      <h3 style="margin:0 0 8px;font-size:19px;font-weight:600;letter-spacing:-0.015em;color:#1A1714;">${t}</h3>
      <p style="margin:0;font-size:14.5px;line-height:1.6;color:#5A544B;">${d}</p>
    </div>`
).join("");

const WAYS: [string, string, string, string][] = [
  ["Open Innovation Challenges", "Real problems from government, businesses, and communities, mapped to the Agenda. Browse open challenges and propose a solution.", "/challenges", "Browse challenges"],
  ["Programs & initiatives", "Office hours, learning series, roundtables, and showcases that help innovators and researchers move Agenda-aligned work forward.", "/programs", "See programs"],
  ["PinaSIKLab Baguio 2026", "A two-day youth innovation sprint where teams build solutions to problem statements connected to the Agenda. October 30–31, 2026.", "/pinasiklab", "Apply to PinaSIKLab"],
  ["Events & calendar", "Workshops, dialogues, and showcases across the ecosystem, all in one place.", "/calendar", "Open the calendar"],
];

const waysCards = WAYS.map(
  ([t, d, href, cta]) => `
    <a href="${BP}${href}" style="display:flex;flex-direction:column;background:#131110;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:26px;text-decoration:none;">
      <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;letter-spacing:-0.015em;color:#fff;">${t}</h3>
      <p style="margin:0 0 18px;font-size:14.5px;line-height:1.6;color:rgba(255,255,255,0.62);">${d}</p>
      <span style="margin-top:auto;font-size:14px;font-weight:600;color:${ORANGE};">${cta} &rarr;</span>
    </a>`
).join("");

const HTML = `
${navBarHtml("/about")}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:64px 40px 70px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-140px;left:50%;transform:translateX(-50%);width:620px;height:580px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.24) 0%,transparent 62%);pointer-events:none;"></div>
  <div style="position:relative;max-width:860px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.55);margin-bottom:22px;"><a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a> <span style="margin:0 6px;">/</span> <a href="${BP}/about/" style="color:inherit;text-decoration:none;">About</a> <span style="margin:0 6px;">/</span> <span style="color:rgba(255,255,255,0.7);">Research &amp; Innovation Agenda</span></div>
    <h1 style="margin:0;font-size:54px;line-height:1.06;font-weight:500;letter-spacing:-0.04em;color:#fff;">Baguio City <span style="color:${ORANGE};">Research &amp; Innovation Agenda</span></h1>
    <p style="margin:24px auto 0;font-size:18px;line-height:1.6;color:rgba(255,255,255,0.66);max-width:700px;">The shared priorities that guide research and innovation in Baguio, and the frame every Incubator Baguio program, challenge, and partnership is organized around.</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px;">
      <a href="#focus" class="ib-cta-orange" style="display:inline-flex;align-items:center;background:${ORANGE};color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Explore the focus areas</a>
      <a href="${BP}/challenges" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.22);">View open challenges</a>
    </div>
  </div>
</div>

<!-- WHAT IT IS -->
<div style="background:#F6F2EA;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:start;">
    <div>
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ORANGE};margin-bottom:6px;">What it is</div>
      <div style="width:42px;height:3px;background:${ORANGE};border-radius:2px;margin-bottom:22px;"></div>
      <h2 style="margin:0;font-size:36px;font-weight:500;letter-spacing:-0.025em;color:#1A1714;line-height:1.1;">One agenda for Baguio&rsquo;s innovators</h2>
    </div>
    <div>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#44444C;">The Research and Innovation Agenda is Baguio City&rsquo;s guiding framework for research and innovation priorities. It sits within the Baguio City Research and Innovation Alliance, created by City Ordinance No. 063, Series of 2023, and is stewarded by the City Planning, Development, and Sustainability Office (CPDSO).</p>
      <p style="margin:0;font-size:16px;line-height:1.7;color:#5A544B;">It brings government, academia, industry, and the community around the same set of local needs, so that research, projects, and ideas are pointed at problems that matter to the city.</p>
    </div>
  </div>
</div>

<!-- FOCUS AREAS -->
<div id="focus" style="background:#fff;padding:76px 40px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ORANGE};margin-bottom:6px;">Focus areas</div>
    <div style="width:42px;height:3px;background:${ORANGE};border-radius:2px;margin-bottom:22px;"></div>
    <h2 style="margin:0 0 12px;font-size:36px;font-weight:500;letter-spacing:-0.025em;color:#1A1714;line-height:1.1;">Six areas we work on</h2>
    <p style="margin:0 0 34px;font-size:16px;line-height:1.65;color:#5A544B;max-width:640px;">Challenges, programs, and events on this site are tagged to these areas, so you can find the work that fits your interests.</p>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">${focusCards}</div>
  </div>
</div>

<!-- HOW TO TAKE PART -->
<div style="background:#100D0B;padding:76px 40px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ORANGE};margin-bottom:6px;">Take part</div>
    <div style="width:42px;height:3px;background:${ORANGE};border-radius:2px;margin-bottom:22px;"></div>
    <h2 style="margin:0 0 34px;font-size:36px;font-weight:500;letter-spacing:-0.025em;color:#fff;line-height:1.1;">Put the Agenda to work</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:18px;">${waysCards}</div>
  </div>
</div>

<!-- FULL DOCUMENT -->
<div style="background:#F6F2EA;padding:64px 40px;">
  <div style="max-width:860px;margin:0 auto;text-align:center;">
    <h2 style="margin:0 0 12px;font-size:28px;font-weight:500;letter-spacing:-0.02em;color:#1A1714;">Looking for the official document?</h2>
    <p style="margin:0 0 24px;font-size:15.5px;line-height:1.65;color:#5A544B;">The full Agenda is maintained by the City Planning, Development, and Sustainability Office. Email us and we&rsquo;ll point you to the latest official copy, or connect you with the right office.</p>
    <a href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Request: Baguio City Research and Innovation Agenda")}" style="display:inline-flex;align-items:center;background:#100D0B;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Request the document</a>
  </div>
</div>

${footerHtml()}
`;

export default function AgendaPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </main>
  );
}
