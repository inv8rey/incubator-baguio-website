import { createClient } from "@supabase/supabase-js";
import { sendSiklabContactEmail } from "../../../../lib/sendSiklabContactEmail";

const EMAIL_RE = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;

/**
 * Public (no login). Relays a message to an individual listed on the PinaSIKLab
 * Team Finder without ever revealing their email. The recipient's address is
 * looked up server-side with the service role; the browser only sends the
 * card's id. Rate-limited per sender (3/hour) and per recipient (5/day).
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) return Response.json({ ok: false, error: "Messaging isn't available right now." }, { status: 503 });

  let body: { id?: string; name?: string; email?: string; message?: string; hp?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (body.hp) return Response.json({ ok: true });

  const id = (body.id || "").trim();
  const name = (body.name || "").trim().replace(/\s+/g, " ");
  const email = (body.email || "").trim().toLowerCase();
  const message = (body.message || "").trim();
  if (!UUID_RE.test(id)) return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  if (name.length < 2 || name.length > 80) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 254) return Response.json({ ok: false, error: "Please enter a valid email so they can reply." }, { status: 400 });
  if (message.length < 10 || message.length > 1000) return Response.json({ ok: false, error: "Write a message of 10 to 1000 characters." }, { status: 400 });

  const sb = createClient(url, key, { auth: { persistSession: false } });

  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [bySender, byTarget] = await Promise.all([
    sb.from("siklab_contact_log").select("id", { count: "exact", head: true }).ilike("sender_email", email).gte("created_at", since(HOUR)),
    sb.from("siklab_contact_log").select("id", { count: "exact", head: true }).eq("applicant_id", id).gte("created_at", since(DAY)),
  ]);
  if (bySender.error || byTarget.error) {
    console.error("pinasiklab contact: rate-limit lookup failed", bySender.error || byTarget.error);
    return Response.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
  if ((bySender.count ?? 0) >= 3 || (byTarget.count ?? 0) >= 5) {
    return Response.json({ ok: false, error: "Too many messages sent. Please try again later." }, { status: 429 });
  }

  const { data, error } = await sb.rpc("siklab_contact_target", { p_id: id }).maybeSingle();
  const target = data as { email: string; full_name: string } | null;
  if (error || !target) return Response.json({ ok: false, error: "This person can't be contacted right now." }, { status: 404 });

  const result = await sendSiklabContactEmail({
    to: target.email,
    recipientName: target.full_name,
    senderName: name,
    senderEmail: email,
    message,
  });
  if (!result.sent) {
    console.error("pinasiklab contact not sent:", result.reason);
    return Response.json({ ok: false, error: "We couldn't send your message. Please try again later." }, { status: 502 });
  }

  await sb.from("siklab_contact_log").insert({ applicant_id: id, sender_email: email });
  return Response.json({ ok: true });
}
