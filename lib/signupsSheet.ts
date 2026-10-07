// Server-only. Mirrors newsletter subscribers and member accounts into a
// Google Sheet (two tabs) for the team. One-way: every sync rewrites both tabs
// from Supabase, so edits made in the sheet are overwritten.
// Needs SIGNUPS_SHEET_ID, SUPABASE_SERVICE_ROLE_KEY and the Google service
// account, with the spreadsheet shared with that account's email as Editor.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sheetsAccountConfigured, writeSheetTab } from "./googleSheets";

const NEWSLETTER_TAB = "Newsletter Signups";
const MEMBERS_TAB = "Member Signups";

export function signupsSheetConfigured(): boolean {
  return !!(process.env.SIGNUPS_SHEET_ID && process.env.SUPABASE_SERVICE_ROLE_KEY && sheetsAccountConfigured());
}

export function serviceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Manila time, e.g. "2026-10-07 14:05".
function when(iso: unknown): string {
  if (!iso || typeof iso !== "string") return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(d).replace(",", "");
}

/** Rewrites both tabs from the database. Returns the row counts. */
export async function syncSignupsToSheet(sb: SupabaseClient = serviceClient()): Promise<{ newsletter: number; members: number }> {
  const sheetId = process.env.SIGNUPS_SHEET_ID;
  if (!sheetId) throw new Error("SIGNUPS_SHEET_ID is not set.");

  // Newsletter
  const { data: subs, error: subErr } = await sb
    .from("newsletter_subscribers")
    .select("email, source, status, created_at, unsubscribed_at")
    .order("created_at", { ascending: false });
  if (subErr) throw new Error(subErr.message);
  await writeSheetTab(
    NEWSLETTER_TAB,
    ["Signed up (Manila time)", "Email", "Status", "Source", "Unsubscribed at"],
    (subs ?? []).map((r) => [when(r.created_at), r.email ?? "", r.status ?? "", r.source ?? "", when(r.unsubscribed_at)]),
    sheetId
  );

  // Members: auth users carry confirmation and the "send me updates" choice.
  const users: { id: string; email?: string; created_at?: string; email_confirmed_at?: string | null; last_sign_in_at?: string | null; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> }[] = [];
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const { data: profiles, error: profErr } = await sb.from("profiles").select("id, full_name");
  if (profErr) throw new Error(profErr.message);
  const nameById = new Map((profiles ?? []).map((p) => [p.id as string, (p.full_name as string) || ""]));

  users.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  await writeSheetTab(
    MEMBERS_TAB,
    ["Signed up (Manila time)", "Name", "Email", "Email confirmed", "Wants updates", "Sign-in method", "Last sign-in"],
    users.map((u) => [
      when(u.created_at),
      nameById.get(u.id) || String(u.user_metadata?.full_name ?? ""),
      u.email ?? "",
      u.email_confirmed_at ? "Yes" : "No",
      u.user_metadata?.wants_updates === true ? "Yes" : u.user_metadata?.wants_updates === false ? "No" : "",
      String(u.app_metadata?.provider ?? ""),
      when(u.last_sign_in_at),
    ]),
    sheetId
  );

  return { newsletter: subs?.length ?? 0, members: users.length };
}
