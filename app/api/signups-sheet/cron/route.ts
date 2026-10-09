import { serviceClient, signupsSheetConfigured, syncSignupsToSheet } from "../../../../lib/signupsSheet";
import { siklabSheetConfigured, syncSiklabRegistrationsToSheet } from "../../../../lib/siklabSheet";

// Daily full refresh by Vercel Cron (see vercel.json). Picks up anything the
// per-signup sync can't see: unsubscribes, email confirmations, Google
// sign-ins, and PinaSIKLab applications edited or deleted directly in Supabase.
// One job covers both sheets because the free Vercel plan allows only 2 crons.
// Same CRON_SECRET check as the AI insights cron.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "Cron is not configured." }, { status: 503 });
  if ((req.headers.get("authorization") || "") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  const result: Record<string, unknown> = {};

  if (siklabSheetConfigured()) {
    try {
      result.pinasiklab = await syncSiklabRegistrationsToSheet();
      await serviceClient().rpc("claim_siklab_sheet_sync", { p_force: true });
    } catch (err) {
      console.error("pinasiklab sheet cron failed:", err instanceof Error ? err.message : err);
      result.pinasiklab = "failed";
    }
  } else {
    result.pinasiklab = "not configured";
  }

  if (!signupsSheetConfigured()) {
    const missing = ["SIGNUPS_SHEET_ID", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"].filter((k) => !process.env[k]);
    return Response.json({ synced: false, reason: "Signups sheet isn't configured.", missing, ...result });
  }
  try {
    const sb = serviceClient();
    await sb.rpc("claim_signups_sheet_sync", { p_force: true });
    const counts = await syncSignupsToSheet(sb);
    return Response.json({ synced: true, ...counts, ...result });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("signups sheet cron failed:", reason);
    await serviceClient().from("sheet_sync_state").update({ synced_at: "1970-01-01T00:00:00Z" }).eq("key", "signups").then(() => {}, () => {});
    return Response.json({ synced: false, reason, ...result }, { status: 502 });
  }
}
