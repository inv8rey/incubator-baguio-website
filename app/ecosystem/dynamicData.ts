import { supabase } from "../../lib/supabaseClient";
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

const PALETTE = [
  { color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  { color: "#3F9E4D", bg: "rgba(126,217,87,0.16)" },
  { color: "#285E7A", bg: "rgba(40,94,122,0.14)" },
  { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
  { color: "#7C5CD6", bg: "rgba(124,92,214,0.14)" },
  { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  { color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
];

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

function paletteFor(name: string) {
  return PALETTE[hashName(name) % PALETTE.length];
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function truncate(text: string, n: number) {
  const t = (text || "").trim();
  return t.length > n ? `${t.slice(0, n).trim()}…` : t;
}

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
      stage: s.stage,
      description: s.description,
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
