export const ORANGE = "#F26522";
export const DARK = "#141417";

export const NAV = [
  { id: "dashboard", label: "Dashboard", cnt: null as number | null },
  { id: "startups", label: "Startups", cnt: 82 },
  { id: "founders", label: "Founders", cnt: 148 },
  { id: "challenges", label: "Challenges", cnt: 18 },
] as const;

export type TabId = (typeof NAV)[number]["id"];

export const TITLES: Record<TabId, string> = {
  dashboard: "Dashboard",
  startups: "Startups",
  founders: "Founders",
  challenges: "Innovation Challenges",
};

export const SUBS: Record<TabId, string> = {
  dashboard: "Baguio City Research and Innovation Alliance · Jun 2026",
  startups: "82 registered startups across 7 sectors",
  founders: "148 registered founders in the ecosystem",
  challenges: "18 open challenges from government, industry, and academia",
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
    label: "Open Challenges",
    value: "18",
    delta: "↑ +6",
    deltaNote: "this quarter",
    color: "#285E7A",
    bg: "rgba(40,94,122,0.10)",
    spark: [3, 5, 7, 9, 11, 14, 16, 18],
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
];

export const SECTORS = [
  { label: "AgriTech", count: 14, pct: 17.1, color: "#1A6B3C" },
  { label: "FinTech", count: 13, pct: 15.9, color: "#285E7A" },
  { label: "EdTech", count: 11, pct: 13.4, color: "#9E2A52" },
  { label: "Tourism", count: 10, pct: 12.2, color: "#F5A623" },
  { label: "HealthTech", count: 8, pct: 9.8, color: "#E23A2E" },
  { label: "E-commerce", count: 6, pct: 7.3, color: "#F26522" },
  { label: "Other", count: 20, pct: 22.3, color: "#9A958B" },
];

export const STAGE_MIX = [
  { label: "Growth", count: 8, color: "#1A6B3C" },
  { label: "Launch", count: 26, color: ORANGE },
  { label: "MVP", count: 31, color: "#F5A623" },
  { label: "Idea", count: 17, color: "#DEDAD2" },
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
  { label: "AgriTech", color: "#1A6B3C" },
  { label: "FinTech", color: "#6B6B73" },
  { label: "EdTech", color: "#6B6B73" },
  { label: "Tourism", color: "#6B6B73" },
  { label: "HealthTech", color: "#6B6B73" },
];

export const STAGE_BADGE: Record<string, { color: string; bg: string }> = {
  Growth: { color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  Launch: { color: ORANGE, bg: "rgba(242,101,34,0.10)" },
  Idea: { color: "#F5A623", bg: "rgba(245,166,35,0.12)" },
};

export const STARTUPS = [
  { id: "BG-019", initials: "SG", color: ORANGE, name: "Session Groceries", sector: "AgriTech", stage: "Growth", tbi: "Independent", funding: "₱5.0M", growth: "↑ +18%", since: "2016" },
  { id: "BG-022", initials: "IO", color: "#285E7A", name: "IOL Inc.", sector: "FinTech", stage: "Growth", tbi: "UC InTTO", funding: "₱3.7M", growth: "↑ +12%", since: "2018" },
  { id: "BG-031", initials: "WB", color: "#F5A623", name: "When In Baguio", sector: "Tourism", stage: "Growth", tbi: "Independent", funding: "₱1.9M", growth: "↑ +22%", since: "2017" },
  { id: "BG-044", initials: "VP", color: "#9E2A52", name: "VIVITA PH", sector: "EdTech", stage: "Launch", tbi: "UPB SILBI", funding: "₱1.0M", growth: "↑ +8%", since: "2021" },
  { id: "BG-088", initials: "DT", color: "#2A8A52", name: "Dontog Technofarms", sector: "AgriTech", stage: "Launch", tbi: "BSU-ATBI", funding: "₱840K", growth: "↑ +15%", since: "2023" },
  { id: "BG-091", initials: "TN", color: "#6B5BD6", name: "theneutral.space", sector: "Community", stage: "Launch", tbi: "Independent", funding: "₱440K", growth: "↑ +10%", since: "2023" },
  { id: "BG-073", initials: "SS", color: "#0E5C44", name: "Sunshare", sector: "GreenTech", stage: "Idea", tbi: "SLU SIRIB", funding: "₱360K", growth: "↑ +5%", since: "2022" },
  { id: "BG-138", initials: "DC", color: "#8B4513", name: "Dulche Chocolates", sector: "FoodTech", stage: "Launch", tbi: "Independent", funding: "₱560K", growth: "↑ +9%", since: "2020" },
];

// ---- Founders ----
export const FOUNDER_STATS = [
  { label: "Total Founders", value: "148", delta: "↑ +45.1% YoY", note: null },
  { label: "Female Founders", value: "62", delta: null, note: "41.9% of total" },
  { label: "First-time Founders", value: "91", delta: null, note: "61.5% of total" },
  { label: "Avg. Cohorts", value: "2.1", delta: null, note: "Per founder" },
  { label: "University-linked", value: "74", delta: null, note: "50% of total" },
];

export const FOUNDERS = [
  { initials: "ID", color: ORANGE, name: "Iloisa Romaraog Diga", role: "CEO & Co-founder", tags: [{ label: "AgriTech", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" }, { label: "Growth", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" }], funding: "₱5.0M", programs: 2, startup: "Session Groceries" },
  { initials: "AC", color: "#1A6B3C", name: "Ana Bettina Cruz", role: "CEO & Founder", tags: [{ label: "FinTech", color: "#285E7A", bg: "rgba(40,94,122,0.10)" }, { label: "Growth", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" }], funding: "₱3.7M", programs: 3, startup: "IOL Inc." },
  { initials: "JB", color: "#F5A623", name: "Jason Balangue", role: "CEO & Co-founder", tags: [{ label: "Tourism", color: "#9E2A52", bg: "rgba(158,42,82,0.10)" }, { label: "Growth", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" }], funding: "₱1.9M", programs: 0, startup: "When In Baguio" },
  { initials: "CM", color: "#9E2A52", name: "Christine Mina", role: "Country Director", tags: [{ label: "EdTech", color: "#9E2A52", bg: "rgba(158,42,82,0.10)" }, { label: "Launch", color: ORANGE, bg: "rgba(242,101,34,0.10)" }], funding: "₱1.0M", programs: 2, startup: "VIVITA PH" },
  { initials: "RA", color: "#2A8A52", name: "Renato Acosta Jr.", role: "CEO & Founder", tags: [{ label: "AgriTech", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" }, { label: "Launch", color: ORANGE, bg: "rgba(242,101,34,0.10)" }], funding: "₱840K", programs: 2, startup: "Dontog Technofarms" },
  { initials: "BS", color: "#6B5BD6", name: "Bea Santos", role: "Founder", tags: [{ label: "Community", color: "#6B5BD6", bg: "rgba(107,91,214,0.10)" }, { label: "Launch", color: ORANGE, bg: "rgba(242,101,34,0.10)" }], funding: "₱440K", programs: 1, startup: "theneutral.space" },
  { initials: "LD", color: "#0E5C44", name: "Leo Dangwa", role: "CEO & Co-founder", tags: [{ label: "GreenTech", color: "#0E5C44", bg: "rgba(14,92,68,0.10)" }, { label: "Idea", color: "#F5A623", bg: "rgba(245,166,35,0.12)" }], funding: "₱360K", programs: 2, startup: "Sunshare" },
  { initials: "MB", color: "#8B4513", name: "Maria Carla Bautista", role: "CEO & Founder", tags: [{ label: "FoodTech", color: "#8B4513", bg: "rgba(139,69,19,0.10)" }, { label: "Launch", color: ORANGE, bg: "rgba(242,101,34,0.10)" }], funding: "₱560K", programs: 1, startup: "Dulche Chocolates" },
];

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
