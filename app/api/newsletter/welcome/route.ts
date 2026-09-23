import { supabase } from "../../../../lib/supabaseClient";
import { sendWelcomeNewsletterEmail } from "../../../../lib/sendWelcomeNewsletterEmail";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public (no login), called fire-and-forget by every "subscribe" form right
 * after a successful insert into newsletter_subscribers. Deliberately not
 * requireAdmin-gated -- this is the automatic reaction to a public signup,
 * not an admin action.
 *
 * Safe to call more than once for the same address (double-click, a retried
 * request, or an attacker just guessing at existing subscriber emails):
 * claim_newsletter_welcome() only ever returns a row -- and this route only
 * ever sends -- the first time for a given email, via an atomic
 * `where welcomed_at is null` claim. It also can't be used to email an
 * address that never subscribed in the first place, since the claim can only
 * match a row that already exists.
 */
export async function POST(req: Request) {
  if (!supabase) return Response.json({ ok: false }, { status: 200 });

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false }, { status: 400 });

  const { data, error } = await supabase.rpc("claim_newsletter_welcome", { p_email: email }).maybeSingle();
  // No claimed row means either this email was already welcomed, or it
  // isn't a subscriber at all -- either way, nothing to send. Never surface
  // which, to a caller that doesn't need to know.
  if (error || !data) return Response.json({ ok: true });

  const result = await sendWelcomeNewsletterEmail(email, (data as { unsubscribe_token: string }).unsubscribe_token);
  return Response.json({ ok: true, sent: result.sent });
}
