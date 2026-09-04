export const ORANGE = "#F26522";
export const DARK = "#1A1714";

export type KnowledgeCategory =
  | "Startup Resources"
  | "Research & Innovation"
  | "Funding & Opportunities"
  | "Policies & Reports";

export interface KnowledgeCategoryInfo {
  id: KnowledgeCategory;
  description: string;
  color: string;
  bg: string;
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategoryInfo[] = [
  {
    id: "Startup Resources",
    description: "Guides, playbooks, toolkits, templates, and founder resources.",
    color: ORANGE,
    bg: "rgba(242,101,34,0.10)",
  },
  {
    id: "Research & Innovation",
    description: "Research papers, technologies, case studies, commercialization, and university outputs.",
    color: "#285E7A",
    bg: "rgba(40,94,122,0.10)",
  },
  {
    id: "Funding & Opportunities",
    description: "Grants, competitions, and accelerator programs open for applications right now.",
    color: "#1A6B3C",
    bg: "rgba(26,107,60,0.10)",
  },
  {
    id: "Policies & Reports",
    description: "Ordinances, laws, government programs, ecosystem reports, and industry insights.",
    color: "#9E2A52",
    bg: "rgba(158,42,82,0.10)",
  },
];

export interface KnowledgeResource {
  id: string;
  title: string;
  category: KnowledgeCategory;
  description: string;
  fileUrl?: string;
  linkUrl?: string;
  source?: string;
  featured?: boolean;
  /** Funding & Opportunities extras — free text, since real notices read
   * "Up to ₱500,000" or "Early-stage tech startups", not a clean number. */
  coverImageUrl?: string;
  fundingAmount?: string;
  targetParticipants?: string;
  /** ISO yyyy-mm-dd, or null/undefined when the call has no fixed deadline. */
  deadlineDate?: string | null;
}

export interface DeadlineInfo {
  label: string;
  color: string;
  closed: boolean;
}

// Same urgency bands as app/challenges/dynamicData.ts's deadlineInfo(), so a
// grant deadline and a challenge deadline read the same way anywhere both
// appear. Hand-parsed rather than `new Date(iso)` to avoid the UTC-midnight
// off-by-one that string parsing produces in evening-local timezones.
export function fundingDeadlineInfo(iso: string | null | undefined): DeadlineInfo | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((target.getTime() - today.getTime()) / 86400000);
  const formatted = target.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  if (daysLeft < 0) return { label: "Applications closed", color: "#6E685F", closed: true };
  if (daysLeft === 0) return { label: "Applications close today", color: "#E23A2E", closed: false };
  const color = daysLeft <= 10 ? "#E23A2E" : daysLeft <= 25 ? "#D88A0A" : "#1A6B3C";
  return { label: `Apply by ${formatted}`, color, closed: false };
}
