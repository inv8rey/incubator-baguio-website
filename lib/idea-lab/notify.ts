// Emails Incubator Baguio staff when someone claims a shared idea. Best effort:
// a missing key or a provider hiccup is logged and never blocks the claim.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.NEWSLETTER_EMAIL_FROM || process.env.EVENTS_EMAIL_FROM || 'Incubator Baguio <onboarding@resend.dev>';
const STAFF = process.env.IDEA_LAB_STAFF_EMAIL || 'incubatorbaguio63@gmail.com';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export async function notifyStaffOfClaim(v: { ideaTitle: string; email: string | null; message: string | null }): Promise<void> {
  if (!RESEND_API_KEY) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [STAFF],
        subject: `Idea Lab: someone claimed "${v.ideaTitle}"`,
        html: `<p>Someone is interested in a shared idea in the Idea Bank.</p><p><strong>Idea:</strong> ${esc(v.ideaTitle)}</p><p><strong>Contact:</strong> ${esc(v.email || 'not provided')}</p><p><strong>Message:</strong> ${esc(v.message || 'none')}</p>`,
      }),
    });
    if (!res.ok) console.error('notifyStaffOfClaim: Resend returned', res.status);
  } catch (err) {
    console.error('notifyStaffOfClaim failed', err);
  }
}
