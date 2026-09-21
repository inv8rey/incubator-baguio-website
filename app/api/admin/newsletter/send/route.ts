import { requireAdmin } from "../../../../../lib/requireAdmin";
import { renderNewsletterHtml, unsubscribeUrlFor } from "../../../../../lib/newsletterTemplate";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Falls back to the events sender, then Resend's shared sandbox address --
// same chain lib/sendEventApprovalEmail.ts uses. Set NEWSLETTER_EMAIL_FROM
// if the newsletter should come from a different name/address than event
// approval emails (e.g. "Incubator Baguio Newsletter <newsletter@...>").
const FROM = process.env.NEWSLETTER_EMAIL_FROM || process.env.EVENTS_EMAIL_FROM || "Incubator Baguio <onboarding@resend.dev>";
const REPLY_TO = "incubatorbaguio63@gmail.com";

// Resend's batch-send endpoint (https://api.resend.com/emails/batch, POST,
// body = a JSON array of email objects) accepts up to 100 per call, and the
// account-wide rate limit is 10 requests/second -- verified against
// Resend's current docs while building this, not assumed. A single-city
// hub's subscriber list is very unlikely to exceed one batch, but this
// chunks regardless so it doesn't silently break if the list grows.
const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 350;

async function sendResendBatch(emails: { from: string; to: string[]; subject: string; html: string; reply_to: string }[]): Promise<{ ok: boolean; body: string }> {
  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(emails),
  });
  const body = await res.text().catch(() => "");
  return { ok: res.ok, body };
}

export async function POST(req: Request) {
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }
  if (!RESEND_API_KEY) {
    return Response.json({ error: "RESEND_API_KEY is not configured." }, { status: 500 });
  }

  let body: { issueId?: string; testEmail?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.issueId) {
    return Response.json({ error: "issueId is required." }, { status: 400 });
  }

  const { data: issue, error: issueErr } = await supabase.from("newsletter_issues").select("*").eq("id", body.issueId).maybeSingle();
  if (issueErr || !issue) {
    return Response.json({ error: issueErr?.message || "Issue not found." }, { status: 404 });
  }

  const forRender = { issueNumber: issue.issue_number, subject: issue.subject, leadStoryHtml: issue.lead_story_html, sections: issue.sections || [] };

  // Test send: exactly one email to the requesting admin, no writes to
  // newsletter_issues or newsletter_subscribers -- the only path this route
  // ever exercises for local/manual testing. See the plan's B4 safety note.
  if (body.testEmail) {
    const html = renderNewsletterHtml(forRender, unsubscribeUrlFor("test-preview-not-a-real-token"));
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [body.testEmail], reply_to: REPLY_TO, subject: `[TEST] ${issue.subject || "Baguio Innovation Brief"}`, html }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json({ error: `Resend responded ${res.status}: ${text}` }, { status: 502 });
    }
    return Response.json({ ok: true, test: true });
  }

  // Real send.
  await supabase.from("newsletter_issues").update({ status: "sending" }).eq("id", body.issueId);

  const { data: subscribers, error: subErr } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "subscribed");
  if (subErr) {
    await supabase.from("newsletter_issues").update({ status: "failed" }).eq("id", body.issueId);
    return Response.json({ error: subErr.message }, { status: 500 });
  }

  const recipients = subscribers ?? [];
  const failedEmails: string[] = [];
  let successCount = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);
    const emails = chunk.map((s) => ({
      from: FROM,
      to: [s.email],
      reply_to: REPLY_TO,
      subject: issue.subject || "The Baguio Innovation Brief",
      html: renderNewsletterHtml(forRender, unsubscribeUrlFor(s.unsubscribe_token)),
    }));
    const result = await sendResendBatch(emails);
    if (result.ok) {
      successCount += chunk.length;
    } else {
      // Resend's batch endpoint fails the call as a whole on auth/payload
      // errors -- there's no documented per-item partial-failure shape to
      // parse, so a failed batch call marks every address in that batch as
      // failed rather than guessing which ones went through. One bad batch
      // never aborts the remaining ones.
      console.error("newsletter send: batch failed", result.body);
      failedEmails.push(...chunk.map((c) => c.email));
    }
    if (i + BATCH_SIZE < recipients.length) await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }

  const failureCount = failedEmails.length;
  await supabase
    .from("newsletter_issues")
    .update({
      status: failureCount > 0 && successCount === 0 ? "failed" : "sent",
      sent_at: new Date().toISOString(),
      recipient_count: recipients.length,
      success_count: successCount,
      failure_count: failureCount,
      failed_emails: failedEmails,
    })
    .eq("id", body.issueId);

  return Response.json({ ok: true, recipientCount: recipients.length, successCount, failureCount, failedEmails });
}
