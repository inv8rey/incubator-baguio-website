"use client";

import { useEffect, useState } from "react";
import { Sparkline, StageDonut } from "../charts";
import { DARK, ORANGE, SECTOR_FILTERS, STAGE_BADGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";
import { initialsOf, paletteFor } from "../../../lib/visualIdentity";
import { CHALLENGES as STATIC_CHALLENGES } from "../../challenges/data";

const KPI_ICONS = [
  // Active Startups — rocket
  <path key="0" d="M5 13.5L3 21l7.5-2M14.5 5.5C17 3 21 3 21 3s0 4-2.5 6.5L11 17l-4-4z" />,
  // Registered Founders — people
  <>
    <circle key="1a" cx={9} cy={8} r={3.5} />
    <path key="1b" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <circle key="1c" cx={17} cy={7} r={2.5} />
    <path key="1d" d="M21 19c0-2.4-1.8-4.5-4-5" />
  </>,
  // Funding Raised — coins
  <>
    <ellipse key="2a" cx={9} cy={7} rx={6} ry={3} />
    <path key="2b" d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path key="2c" d="M3 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-2" />
  </>,
  // Open Challenges — bolt
  <path key="3" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  // Mentor Pool — grad cap
  <>
    <path key="4a" d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path key="4b" d="M6 12v5c3 2 9 2 12 0v-5" />
  </>,
];

const TBI_PALETTE = [ORANGE, "#285E7A", "#1A6B3C", "#9E2A52", "#3A5FA0", "#7C5CD6", "#0E5C44", "#8B4513", "#F5A623"];

const ORG_TYPE_COLORS: Record<string, string> = {
  TBIs: "#285E7A",
  Corporate: ORANGE,
  Government: "#1A6B3C",
  Community: "#9E2A52",
  "Coworking Spaces": "#7C5CD6",
  "Makerspaces & Labs": "#D88A0A",
};

const SECTOR_COLOR_MAP: Record<string, string> = Object.fromEntries(SECTOR_FILTERS.map((f) => [f.label, f.color]));
const STAGE_ORDER = ["Growth", "Launch", "MVP", "Idea"];
const WEEKS = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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

// Cumulative count as of each of the last WEEKS week-boundaries, computed
// from real created_at timestamps — this is what drives each KPI's
// sparkline and delta, so nothing here is fabricated trend data.
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

function deltaFromSeries(series: number[]): { text: string; positive: boolean | null } {
  if (series.length < 2) return { text: "—", positive: null };
  const prev = series[0];
  const cur = series[series.length - 1];
  if (prev === 0) return cur > 0 ? { text: "New", positive: true } : { text: "—", positive: null };
  const pct = ((cur - prev) / prev) * 100;
  if (pct === 0) return { text: "No change", positive: null };
  return { text: `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(1)}%`, positive: pct >= 0 };
}

function BreakdownBars({
  data,
  labelWidth = 190,
}: {
  data: { label: string; count: number; pct: number; color: string }[];
  labelWidth?: number;
}) {
  if (data.length === 0) {
    return <div style={{ fontSize: 12.5, color: "#9A958B", padding: "12px 0" }}>No data yet.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {data.map((s, i) => (
        <div
          key={s.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 0",
            borderBottom: i < data.length - 1 ? "1px solid rgba(20,20,25,0.05)" : "none",
          }}
        >
          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${s.color}1F`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, display: "inline-block" }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: "#44444C", width: labelWidth, flexShrink: 0, lineHeight: 1.3 }}>{s.label}</span>
          <div style={{ flex: 1, height: 7, background: "rgba(20,20,25,0.06)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${s.pct}%`, height: "100%", background: s.color, borderRadius: 999 }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: DARK, width: 22, textAlign: "right", flexShrink: 0 }}>{s.count}</span>
          <span style={{ fontSize: 11, color: "#9A958B", width: 44, textAlign: "right", flexShrink: 0 }}>{s.pct}%</span>
        </div>
      ))}
    </div>
  );
}

interface StartupRow {
  id: string;
  name: string;
  sector: string;
  lifecycle_stage: string;
  tbi_affiliation: string;
  funding_raised: string;
  created_at: string;
}
interface MentorRow {
  id: string;
  name: string;
  created_at: string;
}
interface OrgRow {
  id: string;
  name: string;
  org_type: string;
  created_at: string;
}
interface ProfileRow {
  id: string;
  full_name: string;
  created_at: string;
}
interface SubmissionRow {
  id: string;
  title: string;
  org_name: string;
  created_at: string;
}

export default function DashboardTab() {
  const [startups, setStartups] = useState<StartupRow[]>([]);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    let cancelled = false;

    async function load() {
      const [s, m, o, p, c] = await Promise.all([
        supabase!.from("startups").select("id,name,sector,lifecycle_stage,tbi_affiliation,funding_raised,created_at").order("created_at", { ascending: false }),
        supabase!.from("mentors").select("id,name,created_at").order("created_at", { ascending: false }),
        supabase!.from("organizations").select("id,name,org_type,created_at").order("created_at", { ascending: false }),
        supabase!.from("profiles").select("id,full_name,created_at").order("created_at", { ascending: false }),
        supabase!.from("challenge_submissions").select("id,title,org_name,created_at").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setStartups((s.data as StartupRow[]) ?? []);
      setMentors((m.data as MentorRow[]) ?? []);
      setOrgs((o.data as OrgRow[]) ?? []);
      setProfiles((p.data as ProfileRow[]) ?? []);
      setSubmissions((c.data as SubmissionRow[]) ?? []);
      setLoaded(true);
    }
    load();

    // Realtime: any insert/update/delete on these tables (from this tab,
    // another admin, or a public form) refetches so the dashboard never
    // shows stale numbers without a manual reload.
    const channel = supabase
      .channel("admin-dashboard-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "startups" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "challenge_submissions" }, load)
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      cancelled = true;
      supabase?.removeChannel(channel);
    };
  }, []);

  const startupSeries = weeklySeries(startups.map((s) => s.created_at));
  const founderSeries = weeklySeries(profiles.map((p) => p.created_at));
  const mentorSeries = weeklySeries(mentors.map((m) => m.created_at));
  const challengeSeries = weeklySeries(submissions.map((c) => c.created_at)).map((v) => v + STATIC_CHALLENGES.length);

  const totalFunding = startups.reduce((sum, s) => sum + parsePhp(s.funding_raised), 0);
  const fundingSeries = weightedWeeklySeries(
    startups.map((s) => ({ t: new Date(s.created_at).getTime(), amt: parsePhp(s.funding_raised) }))
  );

  const kpis = [
    { label: "Active Startups", value: String(startups.length), color: ORANGE, bg: "rgba(242,101,34,0.10)", spark: startupSeries, delta: deltaFromSeries(startupSeries) },
    { label: "Registered Founders", value: String(profiles.length), color: ORANGE, bg: "rgba(242,101,34,0.10)", spark: founderSeries, delta: deltaFromSeries(founderSeries) },
    { label: "Funding Raised", value: formatPhp(totalFunding), color: "#9E2A52", bg: "rgba(158,42,82,0.10)", spark: fundingSeries, delta: deltaFromSeries(fundingSeries) },
    { label: "Open Challenges", value: String(STATIC_CHALLENGES.length + submissions.length), color: "#285E7A", bg: "rgba(40,94,122,0.10)", spark: challengeSeries, delta: deltaFromSeries(challengeSeries) },
    { label: "Mentor Pool", value: String(mentors.length), color: "#3A5FA0", bg: "rgba(58,95,160,0.10)", spark: mentorSeries, delta: deltaFromSeries(mentorSeries) },
  ];

  const sectorCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = s.sector || "Uncategorized";
    sectorCounts.set(key, (sectorCounts.get(key) ?? 0) + 1);
  });
  const sectorTotal = startups.length || 1;
  const sectorRows = [...sectorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, pct: Math.round((count / sectorTotal) * 1000) / 10, color: SECTOR_COLOR_MAP[label] ?? "#9A958B" }));

  const stageCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = s.lifecycle_stage || "Idea";
    stageCounts.set(key, (stageCounts.get(key) ?? 0) + 1);
  });
  const stageRows = [
    ...STAGE_ORDER.filter((label) => stageCounts.has(label)).map((label) => ({ label, count: stageCounts.get(label)!, color: STAGE_BADGE[label]?.color ?? "#9A958B" })),
    ...[...stageCounts.entries()].filter(([label]) => !STAGE_ORDER.includes(label)).map(([label, count]) => ({ label, count, color: "#9A958B" })),
  ];
  const stageTotal = startups.length;

  const tbiCounts = new Map<string, number>();
  startups.forEach((s) => {
    const key = (s.tbi_affiliation || "").trim() || "Independent / Non-TBI Affiliated";
    tbiCounts.set(key, (tbiCounts.get(key) ?? 0) + 1);
  });
  const tbiRows = [...tbiCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count], i) => ({ label, count, pct: Math.round((count / sectorTotal) * 1000) / 10, color: TBI_PALETTE[i % TBI_PALETTE.length] }));

  const orgCounts = new Map<string, number>();
  orgs.forEach((o) => {
    const key = o.org_type || "Other";
    orgCounts.set(key, (orgCounts.get(key) ?? 0) + 1);
  });
  const orgTotal = orgs.length;
  const orgRows = [...orgCounts.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count, color: ORG_TYPE_COLORS[label] ?? "#9A958B" }));

  const topFunded = startups
    .map((s) => ({ name: s.name, amount: parsePhp(s.funding_raised), display: s.funding_raised }))
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const activity = [
    ...startups.slice(0, 8).map((s) => ({ key: `s-${s.id}`, name: s.name, note: "joined as a new startup", created_at: s.created_at })),
    ...mentors.slice(0, 8).map((m) => ({ key: `m-${m.id}`, name: m.name, note: "joined the mentor network", created_at: m.created_at })),
    ...orgs.slice(0, 8).map((o) => ({ key: `o-${o.id}`, name: o.name, note: `published as a ${o.org_type || "partner"} organization`, created_at: o.created_at })),
    ...submissions.slice(0, 8).map((c) => ({ key: `c-${c.id}`, name: c.org_name || c.title, note: `posted a new challenge: "${c.title}"`, created_at: c.created_at })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((a) => {
      const p = paletteFor(a.name);
      return { ...a, initials: initialsOf(a.name), color: p.color, time: timeAgo(a.created_at) };
    });

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 20 }}>
      {supabase && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: live ? "#1A6B3C" : "#9A958B" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: live ? "#22C55E" : "#C9C5BB", display: "inline-block" }} />
          {live ? "Live — updates automatically" : "Connecting…"}
        </div>
      )}

      {/* KPI ROW */}
      <div className="ib-admin-grid-5" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16 }}>
        {kpis.map((k, idx) => (
          <div key={k.label} style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={k.color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                {KPI_ICONS[idx]}
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: "#9A958B", fontWeight: 500, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: DARK, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{loaded ? k.value : "—"}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: k.delta.positive === null ? "#9A958B" : k.delta.positive ? "#22C55E" : "#E23A2E" }}>{loaded ? k.delta.text : ""}</span>
                <span style={{ fontSize: 11, color: "#9A958B" }}>{loaded && k.delta.text !== "—" ? "last 8 weeks" : ""}</span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Sparkline data={k.spark} color={k.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MIDDLE ROW — Startups by Sector / Stage / TBI */}
      <div className="ib-admin-grid-3-mid" style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Startups by Sector</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 18 }}>{startups.length} startups across {sectorCounts.size} sectors</div>
          <BreakdownBars data={sectorRows} />
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Startups by Stage</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 18 }}>Distribution by development stage</div>
          {stageTotal > 0 ? <StageDonut data={stageRows} total={stageTotal} /> : <div style={{ fontSize: 12.5, color: "#9A958B", padding: "12px 0" }}>No startups yet.</div>}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Startups by TBI</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 18 }}>Including independently operating startups</div>
          <BreakdownBars data={tbiRows} labelWidth={170} />
        </div>
      </div>

      {/* ACTIVITY FEED */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Recent Activity</div>
        <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 16 }}>Latest updates from the ecosystem</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {activity.length === 0 && <div style={{ fontSize: 12.5, color: "#9A958B", padding: "8px 0" }}>No activity yet.</div>}
          {activity.map((a, i) => (
            <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < activity.length - 1 ? "1px solid rgba(20,20,25,0.05)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: a.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{a.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{a.name}</span>
                <span style={{ fontSize: 13, color: "#6B6B73" }}> {a.note}</span>
              </div>
              <span style={{ fontSize: 11.5, color: "#9A958B", flexShrink: 0 }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ROW — Top Funded Startups / Ecosystem Partners by Type */}
      <div className="ib-admin-grid-2-bottom" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Top Funded Startups</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 10 }}>By total funding raised on record</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: DARK, letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 16 }}>{formatPhp(totalFunding)}</div>
          {topFunded.length === 0 ? (
            <div style={{ fontSize: 12.5, color: "#9A958B" }}>No funding recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topFunded.map((f) => (
                <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                  <span style={{ color: "#6B6B73", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ fontWeight: 600, color: DARK }}>{f.display}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(20,20,25,0.09)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 3 }}>Ecosystem Partners by Type</div>
          <div style={{ fontSize: 11.5, color: "#9A958B", marginBottom: 16 }}>TBIs, corporate, government, and community orgs</div>
          {orgTotal > 0 ? <StageDonut data={orgRows} total={orgTotal} /> : <div style={{ fontSize: 12.5, color: "#9A958B", padding: "12px 0" }}>No organizations yet.</div>}
        </div>
      </div>
    </div>
  );
}
