import { supabaseAsCaller } from "../../../../lib/requireAdmin";
import { siklabSheetConfigured, syncSiklabRegistrationsToSheet } from "../../../../lib/siklabSheet";

/**
 * PinaSIKLab organizers only (checked against siklab_admins). Rewrites the
 * Google Sheet from the database. New applications sync on their own; this is
 * for status changes, deletions, and the manual "Sync to Google Sheet" button.
 */
export async function POST(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "Organizer access required." }, { status: 403 });
  const caller = supabaseAsCaller(token);
  const { data: user } = await caller.auth.getUser(token);
  const { data: isOrganizer } = user?.user ? await caller.rpc("siklab_is_admin") : { data: false };
  if (!isOrganizer) return Response.json({ error: "Organizer access required." }, { status: 403 });

  if (!siklabSheetConfigured()) return Response.json({ synced: false, reason: "The Google Sheet isn't connected yet." });
  try {
    const rows = await syncSiklabRegistrationsToSheet();
    return Response.json({ synced: true, rows });
  } catch (err) {
    console.error("pinasiklab sync-sheet failed:", err instanceof Error ? err.message : err);
    return Response.json({ synced: false, reason: "The Google Sheet couldn't be updated. Check that it's shared with the service account." });
  }
}
