import { supabase } from "../../lib/supabaseClient";
import { initialsOf, paletteFor, truncate } from "../../lib/visualIdentity";
import type {
  CommunityEntry,
  CorporateEntry,
  CoworkingEntry,
  GovernmentEntry,
  MakerspaceEntry,
  MentorEntry,
  StartupEntry,
  TbiEntry,
} from "./data";

export interface DynamicMentorEntry extends MentorEntry {
  id: string;
}

export async function fetchDynamicStartups(): Promise<StartupEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("startups").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((s: any) => {
    const p = paletteFor(s.name);
    return {
      name: s.name,
      sector: s.sector,
      tbiAffiliation: s.tbi_affiliation,
      description: s.description,
      logoUrl: s.logo_url || undefined,
      website: s.website || undefined,
      initial: initialsOf(s.name)[0],
      color: p.color,
      bg: p.bg,
    };
  });
}

export async function fetchDynamicMentors(): Promise<DynamicMentorEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("mentors").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((m: any) => {
    const p = paletteFor(m.name);
    return {
      id: m.id,
      name: m.name,
      expertise: m.expertise,
      bio: m.bio,
      initials: initialsOf(m.name),
      color: p.color,
      bg: p.bg,
      tagColor: p.color,
      tagBg: p.bg,
      tag: m.tag || m.expertise,
    };
  });
}

interface DynamicOrgBuckets {
  TBIs: TbiEntry[];
  Corporate: CorporateEntry[];
  Government: GovernmentEntry[];
  Community: CommunityEntry[];
  "Coworking Spaces": CoworkingEntry[];
  "Makerspaces & Labs": MakerspaceEntry[];
}

export async function fetchDynamicOrganizations(): Promise<DynamicOrgBuckets> {
  const empty: DynamicOrgBuckets = { TBIs: [], Corporate: [], Government: [], Community: [], "Coworking Spaces": [], "Makerspaces & Labs": [] };
  if (!supabase) return empty;
  const { data } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
  for (const o of data ?? []) {
    const p = paletteFor(o.name);
    const initials = initialsOf(o.name);
    if (o.org_type === "TBIs") {
      empty.TBIs.push({ name: o.name, host: "Published by a member", focus: truncate(o.description, 40), description: o.description, color: p.color, bg: p.bg, initials });
    } else if (o.org_type in empty) {
      (empty as any)[o.org_type].push({ name: o.name, type: "Member-published", description: o.description, color: p.color, bg: p.bg, initials });
    }
  }
  return empty;
}
