import type { Metadata } from "next";
import { pageMeta } from "../../seo";
import { navBarHtml, footerHtml } from "../../chrome";
import PartnerForm from "./PartnerForm";

export const metadata: Metadata = pageMeta({
  title: "Sponsor or Collaborate — PinaSIKLab Baguio 2026",
  description:
    "Support PinaSIKLab Baguio 2026, the two-day youth innovation sprint for Baguio and the BLISTT area. We're looking for mentors, judges, technical infrastructure, participant kits and merchandise, prizes, and more.",
  path: "/pinasiklab/partner/",
});

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";
const ORANGE = "#F2C240";

const NEEDS: [string, string][] = [
  ["Mentors", "Industry, academe, and government practitioners who coach teams through problem framing, prototyping, and pitching."],
  ["Technical infrastructure", "Internet connectivity, cloud and API credits, devices, hardware kits, and tools teams can build with."],
  ["Participant kits and merchandise", "Shirts, bags, notebooks, stickers, lanyards, and other items for participants and volunteers."],
  ["Prizes", "Cash prizes, technology products, vouchers, professional services, and other in-kind awards for winning teams."],
  ["Post-event pathways", "Opportunities for teams after the sprint: incubation, acceleration, programs, or adoption and implementation of their solutions."],
  ["Judges", "Experts who evaluate prototypes and pitches against the challenge criteria."],
];

const needCards = NEEDS.map(
  ([t, d]) => `
    <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:24px;">
      <h3 style="margin:0 0 8px;font-size:18px;font-weight:600;letter-spacing:-0.015em;color:#fff;">${t}</h3>
      <p style="margin:0;font-size:14.5px;line-height:1.6;color:rgba(255,255,255,0.64);">${d}</p>
    </div>`
).join("");

const WHY: [string, string][] = [
  ["Visibility with the innovation community", "Be recognized as a PinaSIKLab Baguio partner on the program page and in program materials, in front of participants, mentors, and the wider ecosystem."],
  ["Marketing and brand exposure", "Get your name and logo on event collateral, participant kits, and program communications, plus features on Incubator Baguio's channels before, during, and after the event."],
  ["Access to young talent", "Meet and work alongside up to 30 teams of skilled young people from Baguio and the BLISTT area. A direct line to future hires, interns, and collaborators."],
  ["Put your tools in builders' hands", "Technology and service providers can have teams build with their products, gathering real feedback and new users."],
  ["A stake in real local challenges", "Sponsor or contribute to a problem statement tied to the Baguio City Research and Innovation Agenda, and see solutions built for it."],
  ["Community impact you can report", "Support a UNDP Youth Co:Lab initiative aligned with the Sustainable Development Goals. Good for CSR and ESG stories, backed by real outcomes."],
  ["A seat at the table", "Join mentors, judges, and government, academic, and industry leaders in the ecosystem behind the city's innovation agenda."],
  ["Recognition at the finish line", "Present or hand over awards, join the pitching, and be part of the moment the winning teams are announced."],
];

const whyCards = WHY.map(
  ([t, d]) => `
    <div style="background:#fff;border:1px solid rgba(64,50,34,0.1);border-radius:18px;padding:24px;">
      <h3 style="margin:0 0 8px;font-size:17px;font-weight:600;letter-spacing:-0.015em;color:#1A1714;">${t}</h3>
      <p style="margin:0;font-size:14.5px;line-height:1.6;color:#5A544B;">${d}</p>
    </div>`
).join("");

const TOP_HTML = `
${navBarHtml()}

<div style="position:relative;background:#1F4C8C;padding:56px 40px 62px;overflow:hidden;">
  <div style="position:absolute;bottom:-160px;right:-80px;width:520px;height:520px;background:radial-gradient(circle,rgba(var(--tf-accent-rgb),0.22),transparent 65%);pointer-events:none;"></div>
  <div style="position:relative;max-width:1080px;margin:0 auto;">
    <div style="font-size:12.5px;color:rgba(255,255,255,0.5);margin-bottom:22px;">
      <a href="${BP}/" style="color:inherit;text-decoration:none;">Home</a><span style="margin:0 8px;">&rsaquo;</span>
      <a href="${BP}/pinasiklab/" style="color:inherit;text-decoration:none;">PinaSIKLab Baguio 2026</a><span style="margin:0 8px;">&rsaquo;</span>
      <span style="color:${ORANGE};">Sponsor or collaborate</span>
    </div>
    <h1 style="margin:0;font-size:48px;font-weight:600;letter-spacing:-0.035em;color:#fff;line-height:1.08;max-width:820px;">Help us power <span style="color:${ORANGE};">PinaSIKLab Baguio 2026</span></h1>
    <p style="margin:18px 0 0;font-size:17px;line-height:1.65;color:rgba(255,255,255,0.68);max-width:700px;">A two-day youth innovation sprint on October 30&ndash;31, 2026 needs a community behind it. If you can offer time, expertise, tools, or resources, we&rsquo;d love to work with you.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px;">
      <a href="#inquiry" class="ib-cta-orange" style="display:inline-flex;align-items:center;background:${ORANGE};color:#1A1714;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Become a partner</a>
      <a href="#needs" style="display:inline-flex;align-items:center;background:rgba(255,255,255,0.08);color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.22);">What we need</a>
    </div>
  </div>
</div>

<div id="needs" style="background:#1F4C8C;padding:0 40px 72px;scroll-margin-top:80px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:${ORANGE};margin-bottom:6px;">What we&rsquo;re looking for</div>
    <h2 style="margin:0 0 26px;font-size:32px;font-weight:500;letter-spacing:-0.025em;color:#fff;line-height:1.15;">Ways you can contribute</h2>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">${needCards}</div>
    <p style="margin:22px 0 0;font-size:14.5px;color:rgba(255,255,255,0.55);">Something else in mind? Tell us in the form below. Every kind of support helps.</p>
  </div>
</div>

<div style="background:#EEF3FA;padding:64px 40px 20px;">
  <div style="max-width:1080px;margin:0 auto;">
    <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#2B63AE;margin-bottom:6px;">Why partner</div>
    <h2 style="margin:0 0 26px;font-size:32px;font-weight:500;letter-spacing:-0.025em;color:#1A1714;line-height:1.15;">What you get as a partner</h2>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">${whyCards}</div>
    <p style="margin:24px 0 0;font-size:14.5px;line-height:1.6;color:#5A544B;">Benefits are tailored to what you contribute. Tell us what you&rsquo;re hoping to get out of it, and we&rsquo;ll agree on the details together.</p>
  </div>
</div>
`;

export default function PartnerPage() {
  return (
    <main>
      <div dangerouslySetInnerHTML={{ __html: TOP_HTML }} />
      <div id="inquiry" style={{ scrollMarginTop: 80 }}>
        <PartnerForm />
      </div>
      <div dangerouslySetInnerHTML={{ __html: footerHtml() }} />
    </main>
  );
}
