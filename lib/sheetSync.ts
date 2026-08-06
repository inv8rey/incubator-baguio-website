// Server-only. Each function pulls the current state of one admin-managed
// table and pushes a full re-export into the matching Google Sheet tab.
// Takes the caller's own RLS-scoped Supabase client (from requireAdmin) --
// no separate service-role Supabase credential needed, since this only
// ever runs in response to an already-authenticated admin request.
import type { SupabaseClient } from "@supabase/supabase-js";
import { writeSheetTab } from "./googleSheets";

export async function syncStartupsToSheet(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.from("startups").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = ["name", "tagline", "sector", "description", "website", "contact_email", "logo_url", "lifecycle_stage", "founded_year"];
  await writeSheetTab(
    "Startups",
    headers,
    rows.map((r: any) => headers.map((h) => r[h] ?? ""))
  );
  return rows.length;
}

export async function syncProgramsToSheet(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.from("program_step_images").select("step,image_url,updated_at");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = ["step", "image_url", "updated_at"];
  await writeSheetTab(
    "Programs",
    headers,
    rows.map((r: any) => headers.map((h) => r[h] ?? ""))
  );
  return rows.length;
}

export async function syncEventsToSheet(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.from("event_submissions").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = [
    "title", "category", "event_date", "end_date", "event_time", "venue", "format",
    "description", "cta", "registration_link", "poster_url", "org", "org_type",
    "contact_name", "email", "phone", "status",
  ];
  await writeSheetTab(
    "Events",
    headers,
    rows.map((r: any) => headers.map((h) => r[h] ?? ""))
  );
  return rows.length;
}
