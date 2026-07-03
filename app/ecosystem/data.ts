export type EcosystemCategory = "Startups" | "Mentors" | "TBIs" | "Corporate" | "Government" | "Community" | "Coworking Spaces" | "Makerspaces & Labs";

export interface StartupEntry {
  name: string;
  sector: string;
  tbiAffiliation: string;
  description: string;
  logoUrl?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  initial: string;
  color: string;
  bg: string;
}

export const MENTOR_SPECIALIZATIONS = [
  "Startup & Entrepreneurship",
  "Business Development",
  "Finance & Investment",
  "Marketing & Growth",
  "Product & Technology",
  "Legal & Intellectual Property",
  "Research & Commercialization",
  "Industry Experts",
] as const;
export type MentorSpecialization = (typeof MENTOR_SPECIALIZATIONS)[number];

export const SPECIALIZATION_COLORS: Record<string, { color: string; bg: string }> = {
  "Startup & Entrepreneurship": { color: "#F26522", bg: "rgba(242,101,34,0.14)" },
  "Business Development": { color: "#285E7A", bg: "rgba(40,94,122,0.14)" },
  "Finance & Investment": { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  "Marketing & Growth": { color: "#9E2A52", bg: "rgba(158,42,82,0.12)" },
  "Product & Technology": { color: "#7C5CD6", bg: "rgba(124,92,214,0.14)" },
  "Legal & Intellectual Property": { color: "#D88A0A", bg: "rgba(245,166,35,0.16)" },
  "Research & Commercialization": { color: "#0055A5", bg: "rgba(0,85,165,0.12)" },
  "Industry Experts": { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

export interface MentorEntry {
  name: string;
  position: string;
  company: string;
  bio: string;
  specializations: string[];
  initials: string;
  color: string;
  bg: string;
  photoUrl?: string;
}

export interface TbiEntry {
  name: string;
  host: string;
  focus: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
}

export interface CommunityEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
}

export interface CorporateEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
}

export interface GovernmentEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
}

export interface CoworkingEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  coverUrl?: string;
  website?: string;
}

export interface MakerspaceEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  coverUrl?: string;
  website?: string;
}

// Nothing is seeded here anymore — every Ecosystem directory tab (Startups,
// Mentors, TBIs, Corporate, Government, Community, Coworking Spaces,
// Makerspaces & Labs) reads live from Supabase only (see dynamicData.ts),
// sourced from the admin dashboard and self-service submissions.
