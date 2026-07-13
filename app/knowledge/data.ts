export const ORANGE = "#F26522";
export const DARK = "#141417";

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
    description: "Grants, competitions, calls for proposals, investor opportunities, and accelerator programs.",
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
}
