export const ORANGE = "#F26522";
export const DARK = "#141417";

export interface Partner {
  name: string;
  category: string;
  logo: string | null; // data URL, or null to fall back to initials
  initials: string;
  color: string;
}

export const PARTNER_CATEGORIES = ["Academe", "Government", "Corporate", "Community"];

export const PARTNERS: Partner[] = [
  { name: "Saint Louis University", category: "Academe", logo: null, initials: "SLU", color: "#F5A623" },
  { name: "University of Baguio", category: "Academe", logo: null, initials: "UB", color: "#285E7A" },
  { name: "UP Baguio", category: "Academe", logo: null, initials: "UP", color: "#7E0707" },
  { name: "University of the Cordilleras", category: "Academe", logo: null, initials: "UC", color: "#1A6B3C" },
  { name: "Benguet State University", category: "Academe", logo: null, initials: "BSU", color: "#3A5FA0" },
  { name: "City Government of Baguio", category: "Government", logo: null, initials: "CGB", color: "#F26522" },
  { name: "Dept of Science & Technology", category: "Government", logo: null, initials: "DOST", color: "#0055A5" },
  { name: "Dept of Trade & Industry", category: "Government", logo: null, initials: "DTI", color: "#CE1126" },
  { name: "Baguio Chamber of Commerce", category: "Corporate", logo: null, initials: "BCC", color: "#2D2D2D" },
];

export const NAV = [
  { id: "dashboard", label: "Dashboard", cnt: null as number | null },
  { id: "startups", label: "Startups", cnt: 82 },
  { id: "challenges", label: "Challenges", cnt: 18 },
  { id: "events", label: "Events", cnt: null as number | null },
  { id: "knowledge", label: "Knowledge", cnt: null as number | null },
  { id: "signups", label: "Signups", cnt: null as number | null },
  { id: "partners", label: "Partners", cnt: PARTNERS.length },
] as const;

export type TabId = (typeof NAV)[number]["id"];

export const TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  startups: "Startups",
  challenges: "Innovation Challenges",
  events: "Calendar Events",
  knowledge: "Knowledge Hub",
  signups: "Ecosystem Signups",
  partners: "Ecosystem Partners",
};

export const SUBS: Record<TabId, string> = {
  dashboard: "Baguio City Research and Innovation Alliance · Jun 2026",
  startups: "82 registered startups across 13 sectors",
  challenges: "18 open challenges from government, industry, and academia",
  events: "Review and approve events submitted to the public calendar",
  knowledge: "Manage the Knowledge Hub resource library",
  signups: "Review the temporary public signup form and approve entries into the Ecosystem directory",
  partners: "Academic, government, corporate, and community partners",
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
  { label: "Real Estate & Construction", count: 2, pct: 2.4, color: "#9A958B" },
];

export const STAGE_MIX = [
  { label: "Growth", count: 8, color: "#1A6B3C" },
  { label: "Launch", count: 26, color: ORANGE },
  { label: "MVP", count: 31, color: "#F5A623" },
  { label: "Idea", count: 17, color: "#DEDAD2" },
];

export const TBI_BREAKDOWN = [
  { label: "Independent / Non-TBI Affiliated", count: 28, pct: 34.1, color: "#9A958B" },
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

// ---- Startups ----
export const STARTUP_STATS = [
  { label: "Total Startups", value: "82", delta: "↑ +20.6%", note: null },
  { label: "Growth Stage", value: "8", delta: null, note: "9.8% of total" },
  { label: "Launch Stage", value: "26", delta: null, note: "31.7% of total" },
  { label: "Active This Month", value: "67", delta: null, note: "81.7% of total" },
  { label: "Total Funding", value: "₱36M", delta: "↑ +13.4%", note: null },
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
  { label: "Real Estate & Construction", color: "#9A958B" },
  { label: "Artificial Intelligence & Emerging Technologies", color: "#3A5FA0" },
  { label: "Others", color: "#6B6B73" },
];

export const STAGE_BADGE: Record<string, { color: string; bg: string }> = {
  Growth: { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Launch: { color: ORANGE, bg: "rgba(242,101,34,0.10)" },
  MVP: { color: "#7C5CD6", bg: "rgba(124,92,214,0.12)" },
  Idea: { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
};

// ---- Challenges ----
export const CHALLENGE_STATS = [
  { label: "Open Challenges", value: "18", delta: "↑ +6 this quarter", note: null },
  { label: "Sectors Covered", value: "7", delta: null, note: "Across all categories" },
  { label: "Registered Solvers", value: "143", delta: "↑ +28 this month", note: null },
  { label: "Avg. Submissions", value: "7.9", delta: null, note: "Per challenge" },
];

export const CHALLENGES = [
  { sector: "Agriculture", sectorColor: "#1A6B3C", sectorBg: "rgba(26,107,60,0.10)", urgency: "9 days left", urgencyColor: "#E23A2E", title: "Cut post-harvest loss for highland vegetable farmers", desc: "Build a cold-chain or logistics solution that keeps Benguet produce fresh to market.", org: "Dept of Agriculture, CAR", orgInitials: "DA", orgColor: "#1A6B3C", submissions: 12 },
  { sector: "Environment", sectorColor: "#285E7A", sectorBg: "rgba(40,94,122,0.10)", urgency: "21 days left", urgencyColor: "#F5A623", title: "Smart waste segregation for Baguio public markets", desc: "Design a system that improves sorting and diversion at high-traffic market sites.", org: "City Environment Office", orgInitials: "CEPMO", orgColor: ORANGE, submissions: 7 },
  { sector: "Tourism", sectorColor: "#9E2A52", sectorBg: "rgba(158,42,82,0.10)", urgency: "16 days left", urgencyColor: "#F5A623", title: "Spread tourism beyond peak-season rush", desc: "Create a platform that promotes off-peak travel and local creative experiences.", org: "Baguio Tourism Office", orgInitials: "DOT", orgColor: "#9E2A52", submissions: 5 },
  { sector: "Industry", sectorColor: ORANGE, sectorBg: "rgba(242,101,34,0.10)", urgency: "21 days left", urgencyColor: "#F5A623", title: "Digital storefronts for public market vendors", desc: "Help Baguio's market vendors reach customers online with an affordable platform.", org: "Baguio MSME Council", orgInitials: "MSME", orgColor: "#285E7A", submissions: 9 },
  { sector: "Academia", sectorColor: "#3A5FA0", sectorBg: "rgba(58,95,160,0.10)", urgency: "44 days left", urgencyColor: "#F5A623", title: "Commercializing highland crop preservation research", desc: "Partner with BSU to bring crop preservation research to commercial applications.", org: "Benguet State University", orgInitials: "BSU", orgColor: "#3A5FA0", submissions: 3 },
];
