import { SITE_URL } from "../app/seo";
import { escapeHtml } from "./html";
import { REGISTRATION_DEADLINE } from "../app/pinasiklab/config";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EVENTS_EMAIL_FROM || "Incubator Baguio <onboarding@resend.dev>";
const REPLY_TO = "incubatorbaguio63@gmail.com";

interface Applicant {
  email: string;
  fullName: string;
  participation: string;
  teamName: string;
}

/**
 * "We received your application" email. Never throws: a missing API key or a
 * provider error is logged and reported as `sent: false`, so it can never
 * block the application itself.
 */
export async function sendSiklabConfirmationEmail(a: Applicant): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is not configured" };
  if (!a.email) return { sent: false, reason: "no email address" };

  const first = (a.fullName || "").trim().split(/\s+/)[0] || "there";
  const how = a.participation === "team" && a.teamName ? `as team “${escapeHtml(a.teamName)}”` : "";
  const deadline = REGISTRATION_DEADLINE ? ` Applications are open until ${escapeHtml(REGISTRATION_DEADLINE)}.` : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1A1714;">
      <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #F26522; margin: 0 0 16px;">PinaSIKLab Baguio 2026</p>
      <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">We received your application</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Hi ${escapeHtml(first)}, thank you for applying to PinaSIKLab Baguio 2026${how ? ` ${how}` : ""}.</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">This email confirms we have your application. It is not yet a confirmation of participation. The team will review all applications and contact you at this email address about the next steps.${deadline}</p>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px;">The two-day sprint takes place on October 30&ndash;31, 2026 in Baguio City.</p>
      <a href="${SITE_URL}/pinasiklab/" style="display: inline-block; background: #F26522; color: #fff; font-weight: 600; font-size: 14px; padding: 12px 22px; border-radius: 9999px; text-decoration: none;">View PinaSIKLab</a>
      <p style="font-size: 13px; color: #6E685F; margin: 24px 0 0;">Need to change something? Reply to this email or reach us at ${REPLY_TO}.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [a.email],
        reply_to: REPLY_TO,
        subject: "We received your PinaSIKLab Baguio 2026 application",
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("sendSiklabConfirmationEmail: Resend returned", res.status, body);
      return { sent: false, reason: `Resend responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("sendSiklabConfirmationEmail: request failed", err);
    return { sent: false, reason: "request failed" };
  }
}
