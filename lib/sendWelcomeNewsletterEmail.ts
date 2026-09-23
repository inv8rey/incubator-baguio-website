import { SITE_URL } from "../app/seo";
import { unsubscribeUrlFor } from "./newsletterTemplate";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.NEWSLETTER_EMAIL_FROM || process.env.EVENTS_EMAIL_FROM || "Incubator Baguio <onboarding@resend.dev>";
const REPLY_TO = "incubatorbaguio63@gmail.com";
const ORANGE = "#F26522";
const DARK = "#1A1714";

/**
 * Fires the one-time welcome email for a brand-new newsletter subscriber.
 * Never throws -- same convention as sendEventApprovalEmail.ts: a missing
 * API key or a provider hiccup is logged and reported back as `sent: false`
 * so it can never block the subscribe flow that triggered it.
 */
export async function sendWelcomeNewsletterEmail(email: string, unsubscribeToken: string): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is not configured" };

  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; color: ${DARK}; background: #fff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 32px 24px 0;">
    <tr>
      <td>
        <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: ${ORANGE};">Incubator Baguio</p>
        <h1 style="margin: 0 0 6px; font-size: 26px; font-weight: 600; letter-spacing: -0.02em;">Welcome to Incubator Baguio</h1>
        <p style="margin: 0 0 24px; font-size: 14.5px; color: #6E685F;">Your gateway to Baguio&rsquo;s innovation ecosystem.</p>
        <div style="height: 1px; background: rgba(64,50,34,0.12);"></div>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 0 8px; font-size: 15px; line-height: 1.65;">
        <p style="margin: 0 0 16px;">Thanks for subscribing — you&rsquo;ll get <strong>The Baguio Innovation Brief</strong> every two weeks: new challenges and funding calls, upcoming events, and what&rsquo;s moving across the ecosystem.</p>
        <p style="margin: 0 0 20px;">While you wait for the next issue, here&rsquo;s a head start:</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 8px;">
        <a href="${SITE_URL}/challenges/" style="display: block; padding: 14px 16px; margin-bottom: 10px; border: 1px solid rgba(64,50,34,0.12); border-radius: 12px; text-decoration: none; color: ${DARK};">
          <span style="font-size: 14px; font-weight: 600;">Browse open challenges &rarr;</span>
        </a>
        <a href="${SITE_URL}/calendar/" style="display: block; padding: 14px 16px; margin-bottom: 10px; border: 1px solid rgba(64,50,34,0.12); border-radius: 12px; text-decoration: none; color: ${DARK};">
          <span style="font-size: 14px; font-weight: 600;">See what&rsquo;s coming up &rarr;</span>
        </a>
        <a href="${SITE_URL}/ecosystem/" style="display: block; padding: 14px 16px; margin-bottom: 10px; border: 1px solid rgba(64,50,34,0.12); border-radius: 12px; text-decoration: none; color: ${DARK};">
          <span style="font-size: 14px; font-weight: 600;">Meet the ecosystem &rarr;</span>
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 0 24px;">
        <a href="${SITE_URL}/" style="display: inline-block; background: ${ORANGE}; color: #fff; font-weight: 600; font-size: 14px; padding: 13px 24px; border-radius: 9999px; text-decoration: none;">Explore Incubator Baguio</a>
      </td>
    </tr>
    <tr>
      <td style="padding: 0 0 24px;">
        <div style="height: 1px; background: rgba(64,50,34,0.12); margin-bottom: 20px;"></div>
        <p style="margin: 0 0 8px; font-size: 12.5px; color: #6E685F;">Questions or something to share? Reply to this email or reach us at ${REPLY_TO}.</p>
        <p style="margin: 0; font-size: 11.5px; color: #8A8378;">
          You're receiving this because you signed up for the Incubator Baguio newsletter.
          <a href="${unsubscribeUrlFor(unsubscribeToken)}" style="color: #8A8378;">Unsubscribe</a>
        </p>
      </td>
    </tr>
  </table>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        reply_to: REPLY_TO,
        subject: "Welcome to Incubator Baguio",
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("sendWelcomeNewsletterEmail: Resend returned", res.status, body);
      return { sent: false, reason: `Resend responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("sendWelcomeNewsletterEmail: request failed", err);
    return { sent: false, reason: "request failed" };
  }
}
