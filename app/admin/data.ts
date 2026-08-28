export const ORANGE = "#F26522";
export const DARK = "#1A1714";

export const NAV = [
  { id: "dashboard", label: "Dashboard", cnt: null as number | null },
  { id: "startups", label: "Startups", cnt: null as number | null },
  { id: "challenges", label: "Challenges", cnt: null as number | null },
  { id: "solutions", label: "Solutions", cnt: null as number | null },
  { id: "events", label: "Events", cnt: null as number | null },
  { id: "knowledge", label: "Knowledge", cnt: null as number | null },
  { id: "signups", label: "Signups", cnt: null as number | null },
  { id: "messages", label: "Messages", cnt: null as number | null },
  { id: "partners", label: "Partners", cnt: null as number | null },
  { id: "chatbot-kb", label: "Chatbot KB", cnt: null as number | null },
  { id: "settings", label: "Settings", cnt: null as number | null },
] as const;

export type TabId = (typeof NAV)[number]["id"];

export const TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  startups: "Startups",
  challenges: "Innovation Challenges",
  solutions: "Challenge Solutions",
  events: "Calendar Events",
  knowledge: "Knowledge Hub",
  signups: "Ecosystem Signups",
  messages: "Contact Messages",
  partners: "Ecosystem Partners",
  "chatbot-kb": "Chatbot Knowledge Base",
  settings: "Settings",
};

export const SUBS: Record<TabId, string> = {
  dashboard: "Baguio City Research and Innovation Alliance · Jun 2026",
  startups: "Registered startups across the ecosystem",
  challenges: "Innovation challenges from government, industry, and academia",
  solutions: "Solutions submitted by teams applying to challenges",
  events: "Review and approve events submitted to the public calendar",
  knowledge: "Manage the Knowledge Hub resource library",
  signups: "Review the temporary public signup form and approve entries into the Ecosystem directory",
  messages: "Submissions from the public /contact form",
  partners: "Academic, government, corporate, and community partners",
  "chatbot-kb": "Private documents the chat assistant can search — never shown on the public site",
  settings: "Programs, homepage gallery, and consultation evaluations",
};

// ---- Dashboard ----
export const STAGE_FILTERS = ["All", "Growth", "Launch", "MVP", "Idea"];
export const SECTOR_FILTERS = [
  { label: "Agriculture & Food", color: "#1A6B3C" },
  { label: "Health & Wellness", color: "#E23A2E" },
  { label: "Education", color: "#9E2A52" },
  { label: "Finance", color: "#285E7A" },
  { label: "Tourism & Hospitality", color: "#F5A623" },
  { label: "Retail & Commerce", color: "#F26522" },
  { label: "Manufacturing", color: "#8B4513" },
  { label: "Creative Industries", color: "#6B5BD6" },
  { label: "Transportation & Logistics", color: "#0E5C44" },
  { label: "Environment & Sustainability", color: "#2A8A52" },
  { label: "Government & Public Services", color: "#009B8D" },
  { label: "Real Estate & Construction", color: "#8B8479" },
  { label: "Artificial Intelligence & Emerging Technologies", color: "#3A5FA0" },
  { label: "Others", color: "#5A544B" },
];

export const STAGE_BADGE: Record<string, { color: string; bg: string }> = {
  Growth: { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Launch: { color: ORANGE, bg: "rgba(242,101,34,0.10)" },
  MVP: { color: "#7C5CD6", bg: "rgba(124,92,214,0.12)" },
  Idea: { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
};

