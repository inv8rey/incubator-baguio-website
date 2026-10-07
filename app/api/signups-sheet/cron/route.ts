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
  if (!signupsSheetConfigured()) return Response.json({ synced: false, reason: "Signups sheet isn't configured." });
  try {
    const sb = serviceClient();
    await sb.rpc("claim_signups_sheet_sync", { p_force: true });
    const counts = await syncSignupsToSheet(sb);
    return Response.json({ synced: true, ...counts });
  } catch (err) {
    console.error("signups sheet cron failed:", err instanceof Error ? err.message : err);
    return Response.json({ synced: false }, { status: 502 });
  }
}
