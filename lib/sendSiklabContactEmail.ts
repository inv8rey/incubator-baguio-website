import { escapeHtml } from "./html";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EVENTS_EMAIL_FROM || "Incubator Baguio <onboarding@resend.dev>";

interface ContactMessage {
  to: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

/**
 * Relays a Team Finder message to an applicant. The sender's address goes in
 * Reply-To, so the recipient can answer directly, while the recipient's address
 * is never shown to the sender. Never throws.
 */
export async function sendSiklabContactEmail(m: ContactMessage): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is not configured" };

  const first = (m.recipientName || "").trim().split(/\s+/)[0] || "there";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1A1714;">
      <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #F26522; margin: 0 0 16px;">PinaSIKLab Baguio 2026 &middot; Team Finder</p>
      <h1 style="font-size: 20px; font-weight: 600; margin: 0 0 16px;">${escapeHtml(m.senderName)} would like to connect</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">Hi ${escapeHtml(first)}, someone found you on the PinaSIKLab Team Finder and sent this message:</p>
      <div style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; padding: 14px 16px; background: #F5F2EC; border-radius: 12px; white-space: pre-wrap;">${escapeHtml(m.message)}</div>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 8px;">Reply to this email to answer ${escapeHtml(m.senderName)} directly (${escapeHtml(m.senderEmail)}).</p>
      <p style="font-size: 12.5px; color: #6E685F; margin: 24px 0 0;">This message was written by the sender. Incubator Baguio does not verify it. Your email address was not shared with them. If you don&rsquo;t want messages like this, reply to the Incubator Baguio team and we&rsquo;ll remove you from the Team Finder.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [m.to],
        reply_to: m.senderEmail,
        subject: "Someone wants to team up with you on PinaSIKLab",
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("sendSiklabContactEmail: Resend returned", res.status, body);
      return { sent: false, reason: `Resend responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("sendSiklabContactEmail: request failed", err);
    return { sent: false, reason: "request failed" };
  }
}
