import { supabase } from "./supabaseClient";

/**
 * Fire-and-forget: tells the server to re-export one table to its Google
 * Sheet tab after an admin edit. Never throws -- a Sheets hiccup must not
 * block or fail the admin action that already succeeded against Supabase.
 */
export async function triggerSheetSync(table: "startups" | "programs" | "events"): Promise<void> {
  if (!supabase) return;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return;
    await fetch("/api/admin/sync-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ table }),
    });
  } catch (err) {
    console.error("triggerSheetSync failed:", err);
  }
}
