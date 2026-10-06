// Server-only. Mirrors PinaSIKLab applications into a Google Sheet so the
// organizing team can sort, filter and share them there. One-way and
// self-healing: every sync rewrites the whole tab from Supabase, so the sheet
// always matches the database (edits made in the sheet are overwritten).
// Needs PINASIKLAB_SHEET_ID plus the existing Google service account, and the
// spreadsheet shared with that service account's email as Editor.
import { createClient } from "@supabase/supabase-js";
import { sheetsAccountConfigured, writeSheetTab } from "./googleSheets";

const TAB = "Applications";
const COLUMNS: [string, string][] = [
  ["created_at", "Applied at"],
  ["status", "Status"],
  ["full_name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["age", "Age"],
  ["category", "Describes them"],
  ["organization", "School / organization"],
  ["municipality", "City"],
  ["participation", "Participation"],
  ["team_name", "Team name"],
  ["is_team_leader", "Team leader?"],
  ["team_leader_contact", "Team leader contact"],
  ["team_size", "Team size"],
  ["team_members", "Team members"],
  ["expertise", "Expertise"],
  ["skills", "Skills"],
  ["contribution", "Would contribute"],
  ["teammate_preference", "Teammate preference"],
  ["problem", "Focus areas"],
  ["solution_types", "Solution types"],
  ["motivation", "Motivation"],
  ["available_full_duration", "Available both days"],
  ["continue_after", "Would continue after"],
  ["heard_from", "Heard from"],
  ["notes", "Notes"],
  ["show_in_finder", "Opted in to Team Finder"],
  ["admin_note", "Organizer note"],
];

export function siklabSheetConfigured(): boolean {
  return !!(process.env.PINASIKLAB_SHEET_ID && sheetsAccountConfigured());
}

// A leading = + - @ would be read as a formula by Sheets; neutralize it.
function cell(v: unknown): string | number {
  if (v === null || v === undefined) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return v;
  const str = Array.isArray(v) ? v.join(", ") : String(v);
  return /^[=+\-@]/.test(str) ? `'${str}` : str;
}

/** Rewrites the Applications tab from the database. Returns the row count. */
export async function syncSiklabRegistrationsToSheet(): Promise<number> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await sb.from("siklab_registrations").select("*").order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Record<string, unknown>[];
  await writeSheetTab(
    TAB,
    COLUMNS.map(([, label]) => label),
    rows.map((r) => COLUMNS.map(([k]) => cell(r[k]))),
    process.env.PINASIKLAB_SHEET_ID
  );
  return rows.length;
}
