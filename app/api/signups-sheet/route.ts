import { serviceClient, signupsSheetConfigured, syncSignupsToSheet } from "../../../lib/signupsSheet";

/**
 * Public, fire-and-forget: called after a newsletter or member signup. Only
 * syncs when claim_signups_sheet_sync() finds a signup newer than the last
 * sync, so calling it with nothing new does nothing. Never reveals details.
 */
export async function POST() {
  if (!signupsSheetConfigured()) return Response.json({ ok: true });
  try {
    const sb = serviceClient();
    const { data: claimed, error } = await sb.rpc("claim_signups_sheet_sync", { p_force: false });
    if (error || !claimed) return Response.json({ ok: true });
    await syncSignupsToSheet(sb);
  } catch (err) {
    console.error("signups sheet sync failed:", err instanceof Error ? err.message : err);
  }
  return Response.json({ ok: true });
}
