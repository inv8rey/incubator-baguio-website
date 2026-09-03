import type { Metadata } from "next";
import EcosystemModel from "./programs/EcosystemModel";
import HomeStats from "./HomeStats";
import WhoWeAre from "./WhoWeAre";
import FeaturedStartups from "./FeaturedStartups";
import HomeOpenChallenges from "./HomeOpenChallenges";
import HomeEvents from "./HomeEvents";
import HomeGallery from "./HomeGallery";
import EcosystemPartnersMarquee from "./EcosystemPartnersMarquee";
import NewsletterSignup from "./NewsletterSignup";
import { navBarHtml, footerHtml } from "./chrome";

const HOME_TITLE = "Incubator Baguio — Building Baguio's Innovation Ecosystem";
const HOME_DESCRIPTION =
  "Incubator Baguio connects government, academia, industry, researchers, startups, and innovators around the Baguio City Research and Innovation Agenda to develop solutions, create opportunities, and strengthen the City's innovation ecosystem.";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { title: HOME_TITLE, description: HOME_DESCRIPTION },
};

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const HOME_HTML_TOP = `
${navBarHtml()}

<!-- HERO -->
<div style="position:relative;background:#100D0B;padding:96px 40px 60px;overflow:hidden;text-align:center;">
  <div style="position:absolute;bottom:-160px;left:50%;transform:translateX(-50%);width:640px;height:600px;border-radius:9999px;background:radial-gradient(circle,rgba(242,101,34,0.26) 0%,transparent 62%);pointer-events:none;animation:ibglow 8s ease-in-out infinite;"></div>
  <svg style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);opacity:0.12;" width="760" height="430" viewBox="0 0 120 104" fill="none" preserveAspectRatio="none"><polyline points="6,40 60,8 114,40" stroke="#F5A623" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,62 60,30 114,62" stroke="#E23A2E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,84 60,52 114,84" stroke="#9E2A52" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline><polyline points="6,106 60,74 114,106" stroke="#285E7A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>
  <div style="position:relative;max-width:900px;margin:0 auto;">
    <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;border-radius:9999px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.03);margin-bottom:32px;">
      <span style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:9999px;background:rgba(242,101,34,0.16);"><span style="width:6px;height:6px;border-radius:9999px;background:#F26522;animation:ibpulse 2.4s ease-in-out infinite;"></span></span>
      <span style="font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.66);">Baguio City&rsquo;s Innovation Platform</span>
    </div>
    <h1 style="margin:0;font-size:74px;line-height:1.02;font-weight:500;letter-spacing:-0.042em;color:#fff;">Building Baguio&rsquo;s <span style="color:#F26522;">Innovation Ecosystem.</span></h1>
    <p style="margin:28px auto 0;font-size:18px;line-height:1.65;color:rgba(255,255,255,0.6);max-width:600px;">Incubator Baguio connects government, academia, industry, researchers, startups, and innovators around the Baguio City Research and Innovation Agenda to develop solutions, create opportunities, and strengthen the City&rsquo;s innovation ecosystem.</p>
    <div style="display:flex;gap:12px;justify-content:center;margin-top:38px;flex-wrap:wrap;">
      <a href="${BP}/programs" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15.5px;padding:15px 30px;border-radius:9999px;text-decoration:none;box-shadow:0 16px 40px -14px rgba(242,101,34,0.7);">Explore Opportunities
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/ecosystem-signup" class="ib-cta-ghost" style="display:inline-flex;align-items:center;gap:9px;color:#fff;font-weight:600;font-size:15.5px;padding:15px 28px;border-radius:9999px;text-decoration:none;border:1px solid rgba(255,255,255,0.18);background:rgba(255,255,255,0.02);">Join the Ecosystem</a>
    </div>
    <a href="${BP}/startup-terms" style="display:block;margin-top:18px;font-size:13.5px;font-weight:500;color:rgba(255,255,255,0.5);text-decoration:none;">New to startups? See our glossary &rarr;</a>
  </div>
</div>
`;

// Parked at the City's request — not rendered. Kept intact so it can be dropped
// back into <main> below whenever the signup flow is ready to promote again.
const HOME_HTML_HOW_IT_WORKS = `
<!-- HOW IT WORKS -->
<div style="background:#F6F2EA;padding:84px 40px;border-top:1px solid rgba(64,50,34,0.09);">
  <div style="max-width:1060px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:56px;">
      <div style="font-size:12px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:#F26522;margin-bottom:12px;">How it works</div>
      <h2 style="margin:0;font-size:40px;font-weight:500;letter-spacing:-0.03em;color:#1A1714;line-height:1.08;">From idea to launch, guided at every step</h2>
      <p style="margin:14px auto 0;font-size:15.5px;line-height:1.6;color:#5A544B;max-width:520px;">One free account plugs you into every incubator, mentor, and opportunity in the city.</p>
    </div>
    <div style="position:relative;">
      <div class="ib-journey-line"></div>
      <div class="ib-journey-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:22px;position:relative;">
        ${[
          ["01", "#F26522", "rgba(242,101,34,0.1)", "Join the ecosystem", "Create a free account and tell us what you&rsquo;re building &mdash; an innovation, research project, or idea."],
          ["02", "#285E7A", "rgba(40,94,122,0.1)", "Build your presence", "Publish your innovation, mentor, or organization profile to the city&rsquo;s ecosystem directory."],
          ["03", "#9E2A52", "rgba(158,42,82,0.1)", "Get matched", "Connect with mentors, TBIs, co-founders, and open challenges that fit your stage and sector."],
          ["04", "#1A6B3C", "rgba(26,107,60,0.1)", "Grow with Baguio", "Join programs, workshops, and Startup Week to scale alongside the whole ecosystem."],
        ].map((s) => `
        <div style="text-align:center;padding:0 6px;">
          <div style="width:62px;height:62px;border-radius:9999px;background:#fff;border:2px solid ${s[1]};color:${s[1]};display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;margin:0 auto 18px;box-shadow:0 0 0 8px #F6F2EA,var(--ib-shadow-sm);position:relative;">${s[0]}</div>
          <h3 style="margin:0 0 8px;font-size:17.5px;font-weight:600;letter-spacing:-0.01em;color:#1A1714;">${s[3]}</h3>
          <p style="margin:0;font-size:13.5px;line-height:1.6;color:#5A544B;">${s[4]}</p>
        </div>`).join("")}
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:center;gap:18px;margin-top:52px;flex-wrap:wrap;">
      <a href="${BP}/signup" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;">Create your free account<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <a href="${BP}/get-started" style="font-size:14.5px;font-weight:600;color:#1A1714;text-decoration:none;border-bottom:2px solid rgba(242,101,34,0.4);padding-bottom:2px;">or tell us what you need</a>
    </div>
  </div>
</div>
`;

const HOME_HTML_BOTTOM_A = `
<!-- INNOVATION CHALLENGES — who the problems come from -->
<div style="background:#FCFAF6;padding:92px 40px 0;">
  <div style="max-width:1120px;margin:0 auto;">
    <div style="max-width:620px;margin-bottom:52px;">
      <div style="display:inline-flex;align-items:center;gap:9px;margin-bottom:16px;">
        <span style="width:22px;height:1px;background:rgba(242,101,34,0.5);"></span>
        <span style="font-size:11.5px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:#F26522;">Innovation Challenges</span>
      </div>
      <h2 style="margin:0 0 16px;font-size:40px;font-weight:500;letter-spacing:-0.032em;color:#1A1714;line-height:1.14;">Problem statements from across the Quadruple Helix</h2>
      <p style="margin:0;font-size:16px;line-height:1.68;color:#5A544B;">Every sector of the city brings its own open problems. Anyone in the ecosystem can pick one up and build against it.</p>
    </div>
    <div class="ib-challenge-cats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:18px;">
      ${[
        ["#22596F", "Government", "Smarter public services", "LGUs post operational challenges in transport, waste, tourism, and digital governance for the community to solve."],
        ["#D9531E", "Industry", "MSME growth problems", "Local businesses surface bottlenecks in operations, supply chains, and market access that innovators can address."],
        ["#8E2749", "Academia", "Research to market", "Universities open up applied research questions and technologies seeking commercialization partners."],
        ["#5A4BC4", "Society", "Community-led solutions", "Civic groups and community organizations surface local needs and social challenges for innovators to solve."],
      ].map((c) => `
      <div class="ib-card-hover ib-helix-card" style="background:#fff;border:1px solid rgba(64,50,34,0.06);border-radius:18px;padding:26px 24px 22px;display:flex;flex-direction:column;box-shadow:0 1px 2px rgba(17,17,20,0.02);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <span style="width:7px;height:7px;border-radius:9999px;background:${c[0]};flex-shrink:0;"></span>
          <span style="font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${c[0]};">${c[1]}</span>
        </div>
        <h3 style="margin:0 0 9px;font-size:18.5px;font-weight:600;letter-spacing:-0.016em;color:#1A1714;line-height:1.25;">${c[2]}</h3>
        <p style="margin:0 0 22px;font-size:14px;line-height:1.6;color:#5A544B;">${c[3]}</p>
        <a href="${BP}/challenges" style="margin-top:auto;display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;color:${c[0]};text-decoration:none;">Explore challenges<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c[0]}" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      </div>`).join("")}
    </div>
  </div>
</div>
`;

// The testimonials that used to sit here were placeholder quotes, so they were
// removed. <HomeGallery /> takes this slot with real, admin-uploaded photos.

// Events now render from Supabase via <HomeEvents />, which slots in here.

const HOME_HTML_BOTTOM_B2 = `
${footerHtml()}
`;

// Distinct from ORG_JSON_LD below — WebSite tells Google which single URL
// represents "Incubator Baguio" as a site (vs. Organization, which describes
// the alliance as an entity). Both signals together are what Google uses to
// pick the canonical result for a branded/name search.
const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Incubator Baguio",
  alternateName: "Baguio City Research and Innovation Alliance",
  url: "https://incubator-baguio.vercel.app/",
};

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Incubator Baguio",
  alternateName: "Baguio City Research and Innovation Alliance",
  url: "https://incubator-baguio.vercel.app/",
  logo: "https://incubator-baguio.vercel.app/assets/ib-icon.png",
  description: HOME_DESCRIPTION,
  email: "incubatorbaguio63@gmail.com",
  sameAs: ["https://www.facebook.com/incubatorbaguio"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "CPDSO, City Hall",
    addressLocality: "Baguio City",
    addressRegion: "Benguet",
    addressCountry: "PH",
  },
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }} />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_TOP }} />
      <HomeStats />
      <WhoWeAre />
      <EcosystemModel />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_A }} />
      <HomeOpenChallenges bp={BP} />
      <FeaturedStartups bp={BP} />
      <HomeGallery bp={BP} />
      <HomeEvents bp={BP} />
      <NewsletterSignup />
      <EcosystemPartnersMarquee />
      <div dangerouslySetInnerHTML={{ __html: HOME_HTML_BOTTOM_B2 }} />
    </main>
  );
}
