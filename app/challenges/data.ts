export type ChallengeCategory =
  | "Environmental Action"
  | "Social Protection & Inclusivity"
  | "Economic Expansion"
  | "Smart City"
  | "Resilience"
  | "Good Governance";

export interface ChallengeCategoryInfo {
  id: ChallengeCategory;
  emoji: string;
  color: string;
  bg: string;
}

export const CHALLENGE_CATEGORIES: ChallengeCategoryInfo[] = [
  { id: "Environmental Action", emoji: "🌱", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  { id: "Social Protection & Inclusivity", emoji: "🤝", color: "#9E2A52", bg: "rgba(158,42,82,0.10)" },
  { id: "Economic Expansion", emoji: "💼", color: "#F26522", bg: "rgba(242,101,34,0.10)" },
  { id: "Smart City", emoji: "🏙️", color: "#285E7A", bg: "rgba(40,94,122,0.10)" },
  { id: "Resilience", emoji: "🌦️", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  { id: "Good Governance", emoji: "🏛️", color: "#6B5BD6", bg: "rgba(107,91,214,0.10)" },
];

export function categoryInfo(category: string): ChallengeCategoryInfo {
  return CHALLENGE_CATEGORIES.find((c) => c.id === category) ?? CHALLENGE_CATEGORIES[0];
}

export type ChallengeOrgType = "Government" | "Academe" | "Private Sector" | "Community";

export const CHALLENGE_ORG_TYPES: ChallengeOrgType[] = ["Government", "Academe", "Private Sector", "Community"];

export interface Solver {
  id: string;
  initials: string;
  color: string;
  name: string;
  members: string;
  description: string;
  affiliation: string;
  track: string;
  registered: string;
}

export interface Challenge {
  id: string;
  slug: string;
  category: ChallengeCategory;
  title: string;
  summary: string;
  problem: string[];
  scope: string[];
  support: string[];
  timeline: { label: string; date: string }[];
  status: string;
  scopeRegion: string;
  orgType: ChallengeOrgType;
  orgColor: string;
  orgInitials: string;
  orgInitialsFontSize: string;
  orgName: string;
  orgFull: string;
  contactEmail: string;
  deadline: string;
  deadlineColor: string;
  daysLeft: number | null;
}
