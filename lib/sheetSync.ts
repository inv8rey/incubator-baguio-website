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

// These 4 write to "Admin: <Name>" tabs, not the plain-named tabs -- this
// spreadsheet already had hand-curated Mentors/Service Providers/Co-working
// Spaces/Labs tabs with their own columns before this sync existed, and a
// full clear-and-rewrite would have destroyed that data. The "Admin: " tabs
// are a separate, admin-panel-only mirror alongside the originals.
export async function syncMentorsToSheet(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.from("mentors").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = ["name", "position", "company", "bio", "specializations", "photo_url", "sector", "social_link"];
  await writeSheetTab(
    "Admin: Mentors",
    headers,
    rows.map((r: any) => headers.map((h) => (h === "specializations" ? (r[h] ?? []).join(", ") : r[h] ?? "")))
  );
  return rows.length;
}

export async function syncFundedProjectsToSheet(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.from("funded_projects").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = ["title", "funding_agency", "lead_institution", "duration", "status"];
  await writeSheetTab(
    "Admin: Funded Projects",
    headers,
    rows.map((r: any) => headers.map((h) => r[h] ?? ""))
  );
  return rows.length;
}

// organizations is one shared table across several categories (org_type) --
// this syncs just one category's rows into its own sheet tab, since that's
// what the admin edits at a time and what was asked for (Service Providers /
// Coworking Spaces / Makerspaces & Labs), not the other org_type values.
async function syncOrgCategoryToSheet(supabase: SupabaseClient, orgType: string, tabName: string): Promise<number> {
  const { data, error } = await supabase.from("organizations").select("*").eq("org_type", orgType).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const headers = ["name", "org_type", "type", "description", "website", "contact_email", "logo_url", "cover_url"];
  await writeSheetTab(
    tabName,
    headers,
    rows.map((r: any) => headers.map((h) => r[h] ?? ""))
  );
  return rows.length;
}

export function syncServiceProvidersToSheet(supabase: SupabaseClient): Promise<number> {
  return syncOrgCategoryToSheet(supabase, "Service Providers", "Admin: Service Providers");
}

export function syncCoworkingSpacesToSheet(supabase: SupabaseClient): Promise<number> {
  return syncOrgCategoryToSheet(supabase, "Coworking Spaces", "Admin: Coworking Spaces");
}

export function syncMakerspacesLabsToSheet(supabase: SupabaseClient): Promise<number> {
  return syncOrgCategoryToSheet(supabase, "Makerspaces & Labs", "Admin: Makerspaces & Labs");
}
