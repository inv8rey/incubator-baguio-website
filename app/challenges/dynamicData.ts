import { supabase } from "../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../lib/visualIdentity";
import { slugify } from "../../lib/slug";
import type { Challenge, ChallengeCategory, ChallengeOrgType, Solver } from "./data";

function lines(text: string): string[] {
  return (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function deadlineInfo(iso: string | null): { label: string; color: string; daysLeft: number | null } {
  if (!iso) return { label: "No deadline set", color: "#6E685F", daysLeft: null };
  const [y, m, d] = iso.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (daysLeft < 0) return { label: "Deadline passed", color: "#6E685F", daysLeft };
  if (daysLeft === 0) return { label: "Due today", color: "#E23A2E", daysLeft };
  const color = daysLeft <= 10 ? "#E23A2E" : daysLeft <= 25 ? "#D88A0A" : "#3F9E4D";
  return { label: `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`, color, daysLeft };
}

function mapChallengeRow(r: any): Challenge {
  const { label, color, daysLeft } = deadlineInfo(r.deadline_date);
  const timeline = [
    { label: "Applications close", date: formatDate(r.deadline_date) || "TBD" },
    { label: "Shortlist announced", date: formatDate(r.shortlist_date) || "TBD" },
    { label: "Pitch & selection", date: formatDate(r.pitch_date) || "TBD" },
    { label: "Pilot kickoff", date: formatDate(r.pilot_date) || "TBD" },
  ];
  return {
    id: r.id,
    slug: slugify(r.title || r.id),
    category: r.category as ChallengeCategory,
    title: r.title,
    summary: r.summary,
    problem: lines(r.problem),
    scope: lines(r.scope),
    support: lines(r.support),
    timeline,
    status: r.status,
    scopeRegion: r.scope_region,
    orgType: (r.org_type as ChallengeOrgType) || "Government",
    orgColor: r.org_color || "#1A1714",
    orgInitials: r.org_initials || "",
    orgInitialsFontSize: (r.org_initials || "").length > 4 ? "9px" : "10px",
    orgName: r.org_name,
    orgFull: r.org_full,
    contactEmail: r.contact_email,
    deadline: label,
    deadlineColor: color,
    daysLeft,
  };
}

// Retries on a transient error (a flaky mobile connection dropping a request
// mid-flight is the common case) instead of silently resolving with `[]` --
// the caller has no way to tell "genuinely zero challenges" apart from
// "the request failed," and previously it always rendered the former,
// showing an empty "no challenges match your filters" state on what was
// really just a network hiccup.
export async function fetchDynamicChallenges(): Promise<Challenge[]> {
  if (!supabase) return [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase.from("challenges").select("*").order("created_at", { ascending: false });
    if (!error) return (data ?? []).map(mapChallengeRow);
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  return [];
}

export async function fetchChallengeBySlug(slug: string): Promise<Challenge | null> {
  if (!supabase) return null;
  const { data } = await supabase.from("challenges").select("*");
  const match = (data ?? []).find((r: any) => slugify(r.title || r.id) === slug);
  return match ? mapChallengeRow(match) : null;
}

export async function fetchChallengeApplications(challengeId: string): Promise<Solver[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("challenge_applications")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((a: any) => {
    const name = a.team_name || a.contact_name || "Applicant";
    const p = paletteFor(name);
    return {
      id: a.id,
      initials: initialsOf(name),
      color: p.color,
      name,
      members: a.team_size || "—",
      description: a.approach || "",
      affiliation: a.affiliation || "",
      track: a.course || "",
      registered: a.created_at
        ? new Date(a.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "",
    };
  });
}
