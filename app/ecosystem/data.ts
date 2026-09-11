export type EcosystemCategory = "Startups" | "Mentors" | "Co-Founders" | "TBIs" | "Academe" | "Companies" | "Service Providers" | "Government" | "Community" | "Coworking Spaces" | "Makerspaces & Labs" | "Funded Projects";

// A co-founder listing has no logo/photo of its own (it's a person, not an
// org), so it renders as a plain text card like the dashboard's own Browse
// tab — no color/bg/initials fields needed the way every other entry here
// has. contact_email is deliberately NOT carried onto this type: unlike
// Startups (which do surface an ObfuscatedEmail), a co-founder listing is an
// individual, and reaching them goes through ConnectCofounderButton's
// mediated request (cofounder_connections) the same way Mentors already
// work — never a raw address shipped into a public page's data.
export interface CofounderEntry {
  id: string;
  ownerId: string;
  name: string;
  building: string;
  roleNeeded: string;
  sector: string;
  commitment: string;
  lookingFor: string;
}

export interface StartupEntry {
  id?: string;
  name: string;
  sector: string;
  contactEmail: string;
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
  sector?: string;
  socialLink?: string;
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
  slug?: string;
}

export interface AcademeEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
  slug?: string;
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
  slug?: string;
}

export interface CompanyEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
  slug?: string;
}

export interface ServiceProviderEntry {
  name: string;
  type: string;
  description: string;
  color: string;
  bg: string;
  initials: string;
  logoUrl?: string;
  website?: string;
  slug?: string;
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
  slug?: string;
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
  slug?: string;
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
  slug?: string;
}

export interface FundedProjectEntry {
  id: string;
  title: string;
  fundingAgency: string;
  leadInstitution: string;
  duration: string;
  status: string;
  color: string;
  bg: string;
  initials: string;
  partnerLogoUrl: string;
  partnerName: string;
}

// Nothing is seeded here anymore — every Ecosystem directory tab (Startups,
// Mentors, TBIs, Companies, Service Providers, Government, Community,
// Coworking Spaces, Makerspaces & Labs, Funded Projects) reads live from
// Supabase only (see dynamicData.ts), sourced from the admin dashboard and
// self-service submissions.
