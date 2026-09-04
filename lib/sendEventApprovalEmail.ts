const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Resend's shared sandbox sender works with no domain setup on their end;
// override with a verified domain address once one exists.
const FROM = process.env.EVENTS_EMAIL_FROM || "Incubator Baguio <onboarding@resend.dev>";
const REPLY_TO = "incubatorbaguio63@gmail.com";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Parsed by hand rather than `new Date(iso)`, which treats a bare
// yyyy-mm-dd as UTC midnight and can render as the previous day.
function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

interface ApprovedEvent {
  title: string;
  contactName: string;
  email: string;
  eventDate: string;
  endDate?: string;
  eventTime?: string;
  venue?: string;
  org: string;
}

/**
 * Fires the approval confirmation email. Never throws — a missing API key or
 * a provider error is logged server-side and reported back as `sent: false`,
 * so a broken/unconfigured email step can never block the approval itself
 * (the calendar listing is the thing that actually matters).
 */
export async function sendEventApprovalEmail(event: ApprovedEvent): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) return { sent: false, reason: "RESEND_API_KEY is not configured" };
  if (!event.email) return { sent: false, reason: "submission has no email address" };

  const when = event.endDate && event.endDate !== event.eventDate
    ? `${formatIsoDate(event.eventDate)} – ${formatIsoDate(event.endDate)}`
    : formatIsoDate(event.eventDate);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #1A1714;">
      <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #F26522; margin: 0 0 16px;">Incubator Baguio</p>
      <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 16px;">Your event is on the calendar</h1>
      <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">Hi ${event.contactName || "there"}, &ldquo;${event.title}&rdquo; has been approved and is now live on the Incubator Baguio public calendar.</p>
      <table style="font-size: 14px; line-height: 1.7; margin: 0 0 24px;">
        <tr><td style="color: #6E685F; padding-right: 12px;">When</td><td>${when}${event.eventTime ? `, ${event.eventTime}` : ""}</td></tr>
        <tr><td style="color: #6E685F; padding-right: 12px;">Venue</td><td>${event.venue || "—"}</td></tr>
        <tr><td style="color: #6E685F; padding-right: 12px;">Organizer</td><td>${event.org}</td></tr>
      </table>
      <a href="https://incubator-baguio.vercel.app/calendar/" style="display: inline-block; background: #F26522; color: #fff; font-weight: 600; font-size: 14px; padding: 12px 22px; border-radius: 9999px; text-decoration: none;">View the calendar</a>
      <p style="font-size: 13px; color: #6E685F; margin: 24px 0 0;">Questions? Reply to this email or reach us at ${REPLY_TO}.</p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [event.email],
        reply_to: REPLY_TO,
        subject: `Your event "${event.title}" is approved`,
        html,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("sendEventApprovalEmail: Resend returned", res.status, body);
      return { sent: false, reason: `Resend responded ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("sendEventApprovalEmail: request failed", err);
    return { sent: false, reason: "request failed" };
  }
}
