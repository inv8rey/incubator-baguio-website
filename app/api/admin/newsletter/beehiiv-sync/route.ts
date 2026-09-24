import { requireAdmin } from "../../../../../lib/requireAdmin";
import { beehiivConfigured, syncToBeehiiv } from "../../../../../lib/beehiiv";

const BATCH = 200;
const DELAY_MS = 150;

/**
 * Back-fill: pushes every current website subscriber who isn't in Beehiiv yet.
 * No welcome email is sent for these (send_welcome_email is off), so existing
 * subscribers aren't all welcomed at once. Admin-only; safe to run repeatedly.
 */
export async function POST(req: Request) {
  const { authorized, supabase } = await requireAdmin(req);
  if (!authorized || !supabase) return Response.json({ error: "Admin access required." }, { status: 403 });
  if (!beehiivConfigured()) return Response.json({ error: "BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID are not set." }, { status: 500 });

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, source")
    .eq("status", "subscribed")
    .is("beehiiv_synced_at", null)
    .limit(BATCH);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  let synced = 0;
  let failed = 0;
  for (const row of data ?? []) {
    const r = await syncToBeehiiv(row.email, { sendWelcome: false, source: row.source || "website" });
    if (r.ok) {
      synced++;
      await supabase.from("newsletter_subscribers").update({ beehiiv_claimed_at: new Date().toISOString(), beehiiv_synced_at: new Date().toISOString() }).eq("email", row.email);
    } else {
      failed++;
    }
    await new Promise((res) => setTimeout(res, DELAY_MS));
  }
  return Response.json({ synced, failed, more: (data ?? []).length === BATCH });
}
