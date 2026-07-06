import { supabase } from "../../lib/supabaseClient";
import { acronymOf, initialsOf, paletteFor, truncate } from "../../lib/visualIdentity";
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
      latitude: s.latitude ?? undefined,
      longitude: s.longitude ?? undefined,
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
      position: m.position,
      company: m.company,
      bio: m.bio,
      specializations: m.specializations ?? [],
      photoUrl: m.photo_url || undefined,
      sector: m.sector || undefined,
      socialLink: m.social_link || undefined,
      initials: initialsOf(m.name),
      color: p.color,
      bg: p.bg,
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

export interface EcosystemPartnerEntry {
  id: string;
  name: string;
  logoUrl?: string;
}

export async function fetchDynamicEcosystemPartners(): Promise<EcosystemPartnerEntry[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("ecosystem_partners").select("*").order("created_at", { ascending: true });
  return (data ?? []).map((p: any) => ({ id: p.id, name: p.name, logoUrl: p.logo_url || undefined }));
}

export async function fetchDynamicOrganizations(): Promise<DynamicOrgBuckets> {
  const empty: DynamicOrgBuckets = { TBIs: [], Corporate: [], Government: [], Community: [], "Coworking Spaces": [], "Makerspaces & Labs": [] };
  if (!supabase) return empty;
  const { data } = await supabase.from("organizations").select("*").order("created_at", { ascending: false });
  for (const o of data ?? []) {
    const p = paletteFor(o.name);
    const initials = initialsOf(o.name);
    const logoUrl = o.logo_url || undefined;
    const coverUrl = o.cover_url || undefined;
    const website = o.website || undefined;
    if (o.org_type === "TBIs") {
      empty.TBIs.push({ name: o.name, host: o.type || acronymOf(o.name), focus: truncate(o.description, 40), description: o.description, color: p.color, bg: p.bg, initials, logoUrl, website });
    } else if (o.org_type in empty) {
      (empty as any)[o.org_type].push({ name: o.name, type: o.type || acronymOf(o.name), description: o.description, color: p.color, bg: p.bg, initials, logoUrl, coverUrl, website });
    }
  }
  return empty;
}
