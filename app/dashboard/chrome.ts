const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function navBarHtml() {
  return `
<!-- NAV -->
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#131110;position:sticky;top:0;z-index:50;">
  <a href="${BP}/" style="display:flex;align-items:center;gap:11px;text-decoration:none;"><img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:46px;width:auto;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:46px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:32px;width:auto;"><div style="font-size:16px;font-weight:600;color:#fff;">Incubator Baguio</div></a>
  <div style="display:flex;align-items:center;gap:28px;">
    <div style="display:flex;gap:22px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.72);">
      <a href="${BP}/about" class="ib-navlink">About</a>
      <a href="${BP}/programs" class="ib-navlink">Programs</a>
      <a href="${BP}/challenges" class="ib-navlink">Challenges</a>
      <a href="${BP}/knowledge" class="ib-navlink">Knowledge Hub</a>
      <a href="${BP}/ecosystem" class="ib-navlink">Ecosystem</a>
      <a href="${BP}/calendar" class="ib-navlink">Calendar</a>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <a href="${BP}/signup" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:8px;background:#F26522;color:#fff;font-weight:600;font-size:14px;padding:10px 20px;border-radius:9999px;text-decoration:none;">Join the Ecosystem <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
      <span class="ib-auth-slot"></span>
    </div>
  </div>
</div>
`;
}

const FACEBOOK_URL = "https://www.facebook.com/incubatorbaguio";
const LINKEDIN_URL = "https://www.linkedin.com/company/incubator-baguio";

const ICON_FACEBOOK = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M22 12a10 10 0 1 0-11.5 9.95v-7.04H7.9V12h2.6V9.8c0-2.57 1.53-4 3.87-4 1.12 0 2.3.2 2.3.2v2.5h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.86l-.46 2.91h-2.4v7.04A10 10 0 0 0 22 12Z"/></svg>`;
const ICON_LINKEDIN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92A1.96 1.96 0 0 0 5.25 3ZM20.45 21h-3.37v-6.06c0-1.44-.03-3.3-2.01-3.3-2.01 0-2.32 1.57-2.32 3.2V21H9.38V8.5h3.24v1.71h.05c.45-.86 1.56-1.76 3.21-1.76 3.43 0 4.06 2.26 4.06 5.2V21Z"/></svg>`;

export function footerHtml() {
  return `
<!-- FOOTER -->
<div style="background:#100D0B;padding:0 40px 36px;">
  <div style="max-width:1180px;margin:0 auto;">

    <!-- CTA BAND -->
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;padding:44px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <h2 style="margin:0 0 6px;font-size:24px;font-weight:600;letter-spacing:-0.02em;color:#fff;">Ready to join Baguio&rsquo;s innovation ecosystem?</h2>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.55);">Create your free profile and connect with mentors, challenges, and opportunities.</p>
      </div>
      <a href="${BP}/signup" class="ib-cta-orange" style="display:inline-flex;align-items:center;gap:9px;background:#F26522;color:#fff;font-weight:600;font-size:15px;padding:14px 28px;border-radius:9999px;text-decoration:none;white-space:nowrap;">Join the Ecosystem
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a>
    </div>

    <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px;padding:40px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <div>
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:18px;"><img src="${BP}/assets/city-of-baguio-seal.png" alt="City of Baguio" style="height:54px;width:auto;"><img src="${BP}/assets/cpdso-logo.png" alt="CPDSO" style="height:54px;width:auto;"><img src="${BP}/assets/ib-icon.png" alt="Incubator Baguio" style="height:38px;width:auto;"><div style="font-size:17px;font-weight:600;color:#fff;">Incubator Baguio</div></div>
        <p style="margin:0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,0.5);max-width:280px;">Baguio City Research and Innovation Alliance. Operationalized under Ordinance No. 63, s.2023 by the CPDSO, City Government of Baguio.</p>
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Explore</div>
        <div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);">
          <a class="ib-footlink" href="${BP}/programs">Programs</a>
          <a class="ib-footlink" href="${BP}/challenges">Challenges</a>
          <a class="ib-footlink" href="${BP}/knowledge">Knowledge Hub</a>
          <a class="ib-footlink" href="${BP}/ecosystem">Ecosystem</a>
          <a class="ib-footlink" href="${BP}/calendar">Calendar</a>
          <a class="ib-footlink" href="${BP}/get-started">Get Started</a>
          <a class="ib-footlink" href="${BP}/contact">Contact</a>
        </div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Apply</div>
        <div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);">
          <a class="ib-footlink" href="${BP}/dashboard/innovator">Innovator Incubation</a>
          <a class="ib-footlink" href="${BP}/challenges/post">Post a Challenge</a>
          <a class="ib-footlink" href="${BP}/dashboard/mentor">Mentor Registration</a>
          <a class="ib-footlink" href="${BP}/dashboard/organizations">Partner Inquiry</a>
        </div>
      </div>
      <div>
        <div style="font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:16px;">Contact</div>
        <div style="display:flex;flex-direction:column;gap:11px;font-size:14px;color:rgba(255,255,255,0.62);margin-bottom:16px;">
          <span>SIGLAT Youth Innovation Hub, Baguio City</span>
          <a class="ib-footlink" href="mailto:incubatorbaguio63@gmail.com">incubatorbaguio63@gmail.com</a>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <a class="ib-social-icon" href="${FACEBOOK_URL}" target="_blank" rel="noopener noreferrer" aria-label="Incubator Baguio on Facebook">${ICON_FACEBOOK}</a>
          <a class="ib-social-icon" href="${LINKEDIN_URL}" target="_blank" rel="noopener noreferrer" aria-label="Incubator Baguio on LinkedIn">${ICON_LINKEDIN}</a>
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:24px;font-size:12.5px;color:rgba(255,255,255,0.4);flex-wrap:wrap;gap:10px;">
      <span>&copy; 2026 City Government of Baguio &middot; CPDSO</span>
      <span>Privacy Policy &middot; IP Policy &middot; Data Privacy Act (RA 10173)</span>
    </div>
  </div>
</div>
`;
}

export const BASE_PATH = BP;
