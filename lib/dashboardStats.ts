// Pure, isomorphic aggregation of the admin Dashboard's raw Supabase rows
// into the compact summary shape sent to the AI Insights model. Shared by
// the client dashboard (nothing currently calls it there — kept here so the
// shape used by /api/ai-insights and its cron job can't drift from what an
// admin actually sees) and the two ai-insights API routes, which each fetch
// their own copy of these rows server-side.

const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const STAGE_ORDER = ["Growth", "Launch", "MVP", "Idea"];

export interface StartupRow {
  id: string;
  name: string;
  sector: string;
  lifecycle_stage: string;
  tbi_affiliation: string;
  funding_raised: string;
  created_at: string;
}
export interface MentorRow {
  id: string;
  name: string;
  created_at: string;
}
export interface OrgRow {
  id: string;
  name: string;
  org_type: string;
  created_at: string;
}
export interface ProfileRow {
  id: string;
  created_at: string;
}
export interface SubmissionRow {
  id: string;
  title: string;
  org_name: string;
  created_at: string;
}

function parsePhp(raw: string | null | undefined): number {
  if (!raw) return 0;
  const m = raw.replace(/,/g, "").match(/([\d.]+)\s*([kKmMbB]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return 0;
  const suffix = m[2].toLowerCase();
  if (suffix === "b") return n * 1_000_000_000;
  if (suffix === "m") return n * 1_000_000;
  if (suffix === "k") return n * 1_000;
  return n;
}

function formatPhp(n: number): string {
  if (n >= 1_000_000_000) return `₱${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₱${(n / 1_000).toFixed(0)}K`;
  return `₱${n.toFixed(0)}`;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function weeklySeries(dates: (string | null | undefined)[]): number[] {
  const now = Date.now();
  const ts = dates.map((d) => (d ? new Date(d).getTime() : NaN)).filter((t) => !Number.isNaN(t));
  const series: number[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const cutoff = now - i * WEEK_MS;
    series.push(ts.filter((t) => t <= cutoff).length);
  }
  return series;
}

function weightedWeeklySeries(items: { t: number; amt: number }[]): number[] {
  const now = Date.now();
  const valid = items.filter((p) => !Number.isNaN(p.t));
  const series: number[] = [];
  for (let i = WEEKS - 1; i >= 0; i--) {
    const cutoff = now - i * WEEK_MS;
    series.push(valid.filter((p) => p.t <= cutoff).reduce((s, p) => s + p.amt, 0));
  }
  return series;
}

function deltaFromSeries(series: number[]): string {
  if (series.length < 2) return "—";
  const prev = series[0];
  const cur = series[series.length - 1];
  if (prev === 0) return cur > 0 ? "New" : "—";
  const pct = ((cur - prev) / prev) * 100;
  if (pct === 0) return "No change";
  return `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(1)}% over last 8 weeks`;
}

export function computeAiStats({
  startups,
  mentors,
  orgs,
  profiles,
  submissions,
  staticChallengesCount,
}: {
  startups: StartupRow[];
  mentors: MentorRow[];
  orgs: OrgRow[];
  profiles: ProfileRow[];
  submissions: SubmissionRow[];
  staticChallengesCount: number;
}) {
  const startupSeries = weeklySeries(startups.map((s) => s.created_at));
  const founderSeries = weeklySeries(profiles.map((p) => p.created_at));
  const mentorSeries = weeklySeries(mentors.map((m) => m.created_at));
  const challengeSeries = weeklySeries(submissions.map((c) => c.created_at)).map((v) => v + staticChallengesCount);

  const totalFunding = startups.reduce((sum, s) => sum + parsePhp(s.funding_raised), 0);
  const fundingSeries = weightedWeeklySeries(
    startups.map((s) => ({ t: new Date(s.created_at).getTime(), amt: parsePhp(s.funding_raised) }))
  );

  const kpis = [
    { label: "Active Startups", value: String(startups.length), trend: deltaFromSeries(startupSeries) },
    { label: "Registered Founders", value: String(profiles.length), trend: deltaFromSeries(founderSeries) },
    { label: "Funding Raised", value: formatPhp(totalFunding), trend: deltaFromSeries(fundingSeries) },
    { label: "Open Challenges", value: String(staticChallengesCount + submissions.length), trend: deltaFromSeries(challengeSeries) },
    { label: "Mentor Pool", value: String(mentors.length), trend: deltaFromSeries(mentorSeries) },
  ];

  const sectorCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = s.sector || "Uncategorized";
    sectorCounts.set(key, (sectorCounts.get(key) ?? 0) + 1);
  });
  const sectorTotal = startups.length || 1;
  const startupsBySector = [...sectorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([sector, count]) => ({ sector, count, pct: Math.round((count / sectorTotal) * 1000) / 10 }));

  const stageCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = s.lifecycle_stage || "Idea";
    stageCounts.set(key, (stageCounts.get(key) ?? 0) + 1);
  });
  const startupsByStage = [
    ...STAGE_ORDER.filter((label) => stageCounts.has(label)).map((stage) => ({ stage, count: stageCounts.get(stage)! })),
    ...[...stageCounts.entries()].filter(([label]) => !STAGE_ORDER.includes(label)).map(([stage, count]) => ({ stage, count })),
  ];

  const tbiCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = (s.tbi_affiliation || "").trim() || "Independent / Non-TBI Affiliated";
    tbiCounts.set(key, (tbiCounts.get(key) ?? 0) + 1);
  });
  const startupsByTbi = [...tbiCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tbi, count]) => ({ tbi, count, pct: Math.round((count / sectorTotal) * 1000) / 10 }));

  const orgCounts = new Map<string, number>();
  orgs.forEach((o) => {
    const key = o.org_type || "Other";
    orgCounts.set(key, (orgCounts.get(key) ?? 0) + 1);
  });
  const partnerOrgsByType = [...orgCounts.entries()].sort((a, b) => b[1] - a[1]).map(([type, count]) => ({ type, count }));

  const topFundedStartups = startups
    .map((s) => ({ name: s.name, amount: parsePhp(s.funding_raised), display: s.funding_raised }))
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((f) => ({ name: f.name, funding: f.display }));

  const recentActivity = [
    ...startups.slice(0, 8).map((s) => ({ key: `s-${s.id}`, who: s.name, what: "joined as a new startup", created_at: s.created_at })),
    ...mentors.slice(0, 8).map((m) => ({ key: `m-${m.id}`, who: m.name, what: "joined the mentor network", created_at: m.created_at })),
    ...orgs.slice(0, 8).map((o) => ({ key: `o-${o.id}`, who: o.name, what: `published as a ${o.org_type || "partner"} organization`, created_at: o.created_at })),
    ...submissions.slice(0, 8).map((c) => ({ key: `c-${c.id}`, who: c.org_name || c.title, what: `posted a new challenge: "${c.title}"`, created_at: c.created_at })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((a) => ({ who: a.who, what: a.what, when: timeAgo(a.created_at) }));

  return {
    kpis,
    totalFundingPhp: totalFunding,
    startupsBySector,
    startupsByStage,
    startupsByTbi,
    partnerOrgsByType,
    topFundedStartups,
    recentActivity,
  };
}
