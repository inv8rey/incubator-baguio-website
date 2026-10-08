import { serviceClient, signupsSheetConfigured, syncSignupsToSheet } from "../../../../lib/signupsSheet";

// Daily full refresh by Vercel Cron (see vercel.json). Picks up anything the
// per-signup sync can't see: unsubscribes, email confirmations, Google
// sign-ins. Same CRON_SECRET check as the AI insights cron.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return Response.json({ error: "Cron is not configured." }, { status: 503 });
  if ((req.headers.get("authorization") || "") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!signupsSheetConfigured()) {
    const missing = ["SIGNUPS_SHEET_ID", "SUPABASE_SERVICE_ROLE_KEY", "GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"].filter((k) => !process.env[k]);
    return Response.json({ synced: false, reason: "Signups sheet isn't configured.", missing });
  }
  try {
    const sb = serviceClient();
    await sb.rpc("claim_signups_sheet_sync", { p_force: true });
    const counts = await syncSignupsToSheet(sb);
    return Response.json({ synced: true, ...counts });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("signups sheet cron failed:", reason);
    await serviceClient().from("sheet_sync_state").update({ synced_at: "1970-01-01T00:00:00Z" }).eq("key", "signups").then(() => {}, () => {});
    return Response.json({ synced: false, reason }, { status: 502 });
  }
}
