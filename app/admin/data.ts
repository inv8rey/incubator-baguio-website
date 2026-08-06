export const ORANGE = "#F26522";
export const DARK = "#1A1714";

export const NAV = [
  { id: "dashboard", label: "Dashboard", cnt: null as number | null },
  { id: "startups", label: "Startups", cnt: null as number | null },
  { id: "challenges", label: "Challenges", cnt: null as number | null },
  { id: "events", label: "Events", cnt: null as number | null },
  { id: "knowledge", label: "Knowledge", cnt: null as number | null },
  { id: "programs", label: "Programs", cnt: null as number | null },
  { id: "gallery", label: "Gallery", cnt: null as number | null },
  { id: "signups", label: "Signups", cnt: null as number | null },
  { id: "evaluations", label: "Evaluations", cnt: null as number | null },
  { id: "partners", label: "Partners", cnt: null as number | null },
  { id: "chatbot-kb", label: "Chatbot KB", cnt: null as number | null },
] as const;

export type TabId = (typeof NAV)[number]["id"];

export const TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  startups: "Startups",
  challenges: "Innovation Challenges",
  events: "Calendar Events",
  knowledge: "Knowledge Hub",
  programs: "Our Programs",
  gallery: "Homepage Gallery",
  signups: "Ecosystem Signups",
  evaluations: "Consultation Evaluations",
  partners: "Ecosystem Partners",
  "chatbot-kb": "Chatbot Knowledge Base",
};

export const SUBS: Record<TabId, string> = {
  dashboard: "Baguio City Research and Innovation Alliance · Jun 2026",
  startups: "Registered startups across the ecosystem",
  challenges: "Innovation challenges from government, industry, and academia",
  events: "Review and approve events submitted to the public calendar",
  knowledge: "Manage the Knowledge Hub resource library",
  programs: "Upload the photo shown for each of the 4 Our Programs steps",
  gallery: "Photos shown in the homepage \u201cMoments from the ecosystem\u201d gallery",
  signups: "Review the temporary public signup form and approve entries into the Ecosystem directory",
  evaluations: "Review feedback from consultation and mentoring visitors",
  partners: "Academic, government, corporate, and community partners",
  "chatbot-kb": "Private documents the chat assistant can search — never shown on the public site",
};

// ---- Dashboard ----
export const KPIS = [
  {
    label: "Active Startups",
    value: "82",
    delta: "↑ +20.6%",
    deltaNote: "vs Apr 2026",
    color: ORANGE,
    bg: "rgba(242,101,34,0.10)",
    spark: [14, 22, 35, 48, 58, 68, 75, 82],
  },
  {
    label: "Registered Founders",
    value: "148",
    delta: "↑ +45.1%",
    deltaNote: "vs May 2025",
    color: ORANGE,
    bg: "rgba(242,101,34,0.10)",
    spark: [18, 28, 42, 62, 88, 112, 132, 148],
  },
  {
    label: "Funding Raised (YTD)",
    value: "₱36M",
    delta: "↑ +13.4%",
    deltaNote: "vs Apr 2026",
    color: "#9E2A52",
    bg: "rgba(158,42,82,0.10)",
    spark: [4, 7, 10, 15, 20, 26, 31, 36],
  },
  {
    label: "Open Challenges",
    value: "18",
    delta: "↑ +6",
    deltaNote: "this quarter",
    color: "#285E7A",
    bg: "rgba(40,94,122,0.10)",
    spark: [3, 5, 7, 9, 11, 14, 16, 18],
  },
  {
    label: "Mentor Pool",
    value: "46",
    delta: "↑ +9.5%",
    deltaNote: "vs Q1 2026",
    color: "#3A5FA0",
    bg: "rgba(58,95,160,0.10)",
    spark: [22, 26, 30, 34, 38, 41, 44, 46],
  },
];

export const SECTORS = [
  { label: "Agriculture & Food", count: 12, pct: 14.6, color: "#1A6B3C" },
  { label: "Tourism & Hospitality", count: 10, pct: 12.2, color: "#F5A623" },
  { label: "Education", count: 9, pct: 11.0, color: "#9E2A52" },
  { label: "Health & Wellness", count: 8, pct: 9.8, color: "#E23A2E" },
  { label: "Finance", count: 7, pct: 8.5, color: "#285E7A" },
  { label: "Retail & Commerce", count: 7, pct: 8.5, color: "#F26522" },
  { label: "Creative Industries", count: 6, pct: 7.3, color: "#6B5BD6" },
  { label: "Environment & Sustainability", count: 6, pct: 7.3, color: "#2A8A52" },
  { label: "Artificial Intelligence & Emerging Technologies", count: 5, pct: 6.1, color: "#3A5FA0" },
  { label: "Manufacturing", count: 4, pct: 4.9, color: "#8B4513" },
  { label: "Transportation & Logistics", count: 4, pct: 4.9, color: "#0E5C44" },
  { label: "Government & Public Services", count: 2, pct: 2.4, color: "#009B8D" },
  { label: "Real Estate & Construction", count: 2, pct: 2.4, color: "#8B8479" },
];

export const STAGE_MIX = [
  { label: "Growth", count: 8, color: "#1A6B3C" },
  { label: "Launch", count: 26, color: ORANGE },
  { label: "MVP", count: 31, color: "#F5A623" },
  { label: "Idea", count: 17, color: "#DEDAD2" },
];

export const TBI_BREAKDOWN = [
  { label: "Independent / Non-TBI Affiliated", count: 28, pct: 34.1, color: "#8B8479" },
  { label: "UC InTTO", count: 14, pct: 17.1, color: "#285E7A" },
  { label: "SLU SIRIB", count: 13, pct: 15.9, color: "#F5A623" },
  { label: "UPB SILBI", count: 11, pct: 13.4, color: "#9E2A52" },
  { label: "BSU-ATBI", count: 10, pct: 12.2, color: "#1A6B3C" },
  { label: "DOST Regional TBI", count: 6, pct: 7.3, color: "#3A5FA0" },
];

export const MATURITY_AXES = [
  { label: "Density", val: 2 },
  { label: "Culture", val: 2 },
  { label: "Capital", val: 1 },
  { label: "Talent", val: 4 },
  { label: "Regulatory", val: 3 },
];

export const FUNDING_BREAKDOWN = [
  { label: "Grants", value: "₱30.8M", pct: 85.6, color: DARK },
  { label: "Private Investment", value: "₱3.9M", pct: 10.7, color: ORANGE },
  { label: "Corporate/Other", value: "₱1.3M", pct: 3.7, color: "#F5A623" },
];

export const ACTIVITY = [
  { initials: "SG", color: ORANGE, name: "Session Groceries", note: "raised ₱5.0M in seed funding", time: "2h ago" },
  { initials: "IO", color: "#285E7A", name: "IOL Inc.", note: "joined ARISE Accelerator Cohort 2026", time: "3h ago" },
  { initials: "WB", color: "#F5A623", name: "When In Baguio", note: "added 3 new team members", time: "5h ago" },
  { initials: "NE", color: "#9E2A52", name: "New Event Added", note: '"Investor Connect: Baguio" on Jul 18', time: "1d ago" },
  { initials: "DT", color: "#1A6B3C", name: "Dontog Technofarms", note: "won 2nd place at Regional Pitching Competition", time: "1d ago" },
];


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

