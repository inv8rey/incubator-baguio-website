import { serviceClient } from "../../../../lib/signupsSheet";
import { siklabSheetConfigured, syncSiklabRegistrationsToSheet } from "../../../../lib/siklabSheet";

/**
 * Public, fire-and-forget: called by the application form right after a
 * registration is saved. Only syncs when claim_siklab_sheet_sync() finds an
 * application newer than the last sync, so extra calls do nothing. Never
 * reveals details. Independent of the confirmation email.
 */
export async function POST() {
  if (!siklabSheetConfigured()) return Response.json({ ok: true });
  const sb = serviceClient();
  const { data: claimed, error } = await sb.rpc("claim_siklab_sheet_sync", { p_force: false });
  if (error) console.error("pinasiklab sheet claim failed:", error.message);
  if (error || !claimed) return Response.json({ ok: true });
  try {
    await syncSiklabRegistrationsToSheet();
  } catch (err) {
    console.error("pinasiklab sheet sync failed:", err instanceof Error ? err.message : err);
    // Release the claim so the next application (or the daily job) retries.
    await sb.from("sheet_sync_state").update({ synced_at: "1970-01-01T00:00:00Z" }).eq("key", "pinasiklab");
  }
  return Response.json({ ok: true });
}
