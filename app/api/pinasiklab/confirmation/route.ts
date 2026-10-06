import { supabase } from "../../../../lib/supabaseClient";
import { sendSiklabConfirmationEmail } from "../../../../lib/sendSiklabConfirmationEmail";
import { siklabSheetConfigured, syncSiklabRegistrationsToSheet } from "../../../../lib/siklabSheet";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Public (no login), called fire-and-forget by the PinaSIKLab application form
 * right after a successful insert. Safe to call repeatedly: claim_siklab_confirmation()
 * only matches an existing application submitted in the last 30 minutes and
 * only the first time, so this can't be used to email addresses that never
 * applied. It never reveals whether an address matched.
 */
export async function POST(req: Request) {
  if (!supabase) return Response.json({ ok: false });

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) return Response.json({ ok: false }, { status: 400 });

  const { data, error } = await supabase.rpc("claim_siklab_confirmation", { p_email: email }).maybeSingle();
  if (error || !data) return Response.json({ ok: true });

  // The same one-time claim also gates the Google Sheet sync, so each new
  // application triggers exactly one refresh and the endpoint can't be used to
  // hammer the Sheets API. A sync failure never affects the email or the application.
  if (siklabSheetConfigured()) {
    await syncSiklabRegistrationsToSheet().catch((err) => console.error("pinasiklab sheet sync failed:", err instanceof Error ? err.message : err));
  }

  const row = data as { full_name: string; participation: string; team_name: string };
  const result = await sendSiklabConfirmationEmail({
    email,
    fullName: row.full_name,
    participation: row.participation,
    teamName: row.team_name,
  });
  if (result.sent) await supabase.rpc("confirm_siklab_confirmation", { p_email: email });
  else {
    await supabase.rpc("release_siklab_confirmation", { p_email: email });
    console.error("PinaSIKLab confirmation not sent:", result.reason);
  }
  return Response.json({ ok: true });
}
