import { requireAdmin } from "../../../../../lib/requireAdmin";
import { sendEventApprovalEmail } from "../../../../../lib/sendEventApprovalEmail";

export async function POST(req: Request) {
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.id) {
    return Response.json({ error: "id is required." }, { status: 400 });
  }

  const { data: row, error: updateErr } = await supabase
    .from("event_submissions")
    .update({ status: "approved" })
    .eq("id", body.id)
    .select()
    .single();

  if (updateErr) {
    return Response.json({ error: updateErr.message }, { status: 400 });
  }

  // Best-effort: the approval above already succeeded and is the thing that
  // actually matters (the event is live on the calendar either way), so an
  // email failure is reported back but never turned into a 500.
  const { sent, reason } = await sendEventApprovalEmail({
    title: row.title,
    contactName: row.contact_name,
    email: row.email,
    eventDate: row.event_date,
    endDate: row.end_date || undefined,
    eventTime: row.event_time,
    venue: row.venue,
    org: row.org,
  });

  return Response.json({ ok: true, emailSent: sent, emailSkippedReason: sent ? undefined : reason });
}
