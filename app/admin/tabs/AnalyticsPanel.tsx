"use client";

import { useEffect, useRef, useState } from "react";
import { DARK, ORANGE } from "../data";
import { BreakdownBars, LineChart } from "../charts";
import { supabase } from "../../../lib/supabaseClient";

const VISITOR_BLUE = "#285E7A";
const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

interface Totals {
  views: number;
  viewsPrev: number;
  visitors: number;
  visitorsPrev: number;
}
interface DailyPoint {
  day: string;
  views: number;
  visitors: number;
}
interface TopPage {
  page: string;
  views: number;
}

function pctDelta(cur: number, prev: number): { text: string; positive: boolean | null } {
  if (prev === 0) return cur > 0 ? { text: "New", positive: true } : { text: "—", positive: null };
  const pct = ((cur - prev) / prev) * 100;
  if (pct === 0) return { text: "No change", positive: null };
  return { text: `${pct >= 0 ? "↑" : "↓"} ${Math.abs(pct).toFixed(1)}%`, positive: pct >= 0 };
}

// "2026-08-06" -> "Aug 6". Built by hand rather than `new Date(iso)`, which
// parses a bare date as UTC midnight and can render as the previous day.
function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${d}`;
}

export default function AnalyticsPanel({ ready }: { ready: boolean }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [topPages, setTopPages] = useState<TopPage[]>([]);
  const [range, setRange] = useState<Range>(30);
  const [showViews, setShowViews] = useState(true);
  const [showVisitors, setShowVisitors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoRanRef = useRef(false);

  async function load(days: Range) {
    if (!supabase) {
      setError("The backend isn't configured yet.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setError("Log in again to load traffic data.");
        return;
      }
      const res = await fetch(`/api/admin/analytics/?days=${days}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't load traffic data.");
        return;
      }
      setConfigured(data.configured);
      if (data.configured) {
        setTotals(data.totals);
        setDaily(data.daily ?? []);
        setTopPages(data.topPages ?? []);
      }
    } catch {
      setError("Couldn't reach the analytics service.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || autoRanRef.current) return;
    autoRanRef.current = true;
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  function pickRange(r: Range) {
    if (r === range) return;
    setRange(r);
    load(r);
  }

  const viewsDelta = totals ? pctDelta(totals.views, totals.viewsPrev) : null;
  const visitorsDelta = totals ? pctDelta(totals.visitors, totals.visitorsPrev) : null;

  // Share of total traffic in the window, not share of the single busiest
  // page — the old denominator made the top page always read "100%", which
  // looked like it had received all the traffic on the site.
  const totalPageViews = topPages.reduce((sum, p) => sum + p.views, 0) || 1;
  const pageRows = topPages.map((p) => ({ label: p.page, count: p.views, pct: Math.round((p.views / totalPageViews) * 1000) / 10, color: ORANGE }));

  const chartSeries = [
    ...(showViews ? [{ name: "Page views", color: ORANGE, values: daily.map((d) => d.views) }] : []),
    ...(showVisitors ? [{ name: "Visitors", color: VISITOR_BLUE, values: daily.map((d) => d.visitors) }] : []),
  ];

  const busiest = daily.reduce<DailyPoint | null>((best, d) => (!best || d.views > best.views ? d : best), null);
  const avgViews = daily.length ? Math.round(daily.reduce((s, d) => s + d.views, 0) / daily.length) : 0;

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 3, flexWrap: "wrap" }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>Website Traffic</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2, background: "#F5F4F0", borderRadius: 999, padding: 3 }}>
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => pickRange(r)}
                disabled={loading}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "5px 12px",
                  borderRadius: 999,
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                  color: range === r ? "#fff" : "#5A544B",
                  background: range === r ? "#131110" : "transparent",
                  transition: "background 120ms ease",
                }}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            onClick={() => load(range)}
            disabled={loading}
            title="Refresh from PostHog"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: loading ? "#C4BEB4" : "#5A544B",
              background: "#F5F4F0",
              border: "none",
              borderRadius: 999,
              padding: "6px 12px",
              cursor: loading ? "default" : "pointer",
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={loading ? { animation: "ib-spin 0.9s linear infinite" } : undefined}>
              <path d="M21 12a9 9 0 1 1-2.6-6.4" />
              <path d="M21 3v6h-6" />
            </svg>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: "#8B8479", marginBottom: 18 }}>Page views and visitors from PostHog, last {range} days</div>

      {error && <div style={{ fontSize: 13, color: "#E23A2E", padding: "8px 0" }}>{error}</div>}

      {!error && configured === false && (
        <div style={{ border: "1.5px dashed rgba(64,50,34,0.18)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginBottom: 6 }}>This dashboard can&rsquo;t read PostHog yet</div>
          <p style={{ margin: "0 0 8px", fontSize: 12.5, lineHeight: 1.6, color: "#5A544B" }}>
            The site is already sending every pageview to PostHog using its public key (<code>NEXT_PUBLIC_POSTHOG_KEY</code>) &mdash; that part has been working the whole time. But
            that key can only send data in, not read it back out, so it can&rsquo;t power this card.
          </p>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#5A544B" }}>
            Reading it back needs a second, separate credential: create a <strong>Personal API Key</strong> (with read access) under your PostHog account&rsquo;s Settings &rarr; Personal
            API Keys, then add it as <code>POSTHOG_PERSONAL_API_KEY</code> along with <code>POSTHOG_PROJECT_ID</code> (Project Settings &rarr; General) to this project&rsquo;s environment
            variables, and refresh.
          </p>
        </div>
      )}

      {!error && configured === true && (
        <>
          <div className="ib-admin-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: `Page Views (${range}d)`, value: (totals?.views ?? 0).toLocaleString(), delta: viewsDelta, foot: "vs prior period" },
              { label: `Unique Visitors (${range}d)`, value: (totals?.visitors ?? 0).toLocaleString(), delta: visitorsDelta, foot: "vs prior period" },
              { label: "Avg. Views / Day", value: avgViews.toLocaleString(), delta: null, foot: `across ${daily.length} day${daily.length === 1 ? "" : "s"} with data` },
              { label: "Busiest Day", value: busiest ? busiest.views.toLocaleString() : "—", delta: null, foot: busiest ? shortDate(busiest.day) : "no data yet" },
            ].map((k) => (
              <div key={k.label} style={{ background: "#FAF8F4", borderRadius: 12, padding: "14px 16px", minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "#8B8479", fontWeight: 500, marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, minHeight: 15 }}>
                  {k.delta ? (
                    <>
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: k.delta.positive === null ? "#8B8479" : k.delta.positive ? "#22C55E" : "#E23A2E" }}>{k.delta.text}</span>
                      <span style={{ fontSize: 11, color: "#8B8479" }}>{k.delta.text !== "—" ? k.foot : ""}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: "#8B8479" }}>{k.foot}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5A544B" }}>Daily traffic</div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { on: showViews, set: setShowViews, color: ORANGE, name: "Page views" },
                  { on: showVisitors, set: setShowVisitors, color: VISITOR_BLUE, name: "Visitors" },
                ].map((s) => (
                  <button
                    key={s.name}
                    onClick={() => s.set(!s.on)}
                    title={`${s.on ? "Hide" : "Show"} ${s.name.toLowerCase()}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: s.on ? "#5A544B" : "#B8B2A8",
                    }}
                  >
                    <span style={{ width: 9, height: 9, borderRadius: "50%", background: s.on ? s.color : "transparent", border: `1.5px solid ${s.on ? s.color : "#C9C5BB"}`, display: "inline-block" }} />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
            {daily.length > 0 && chartSeries.length > 0 ? (
              <LineChart labels={daily.map((d) => shortDate(d.day))} series={chartSeries} />
            ) : (
              <div style={{ fontSize: 12.5, color: "#8B8479", padding: "20px 0" }}>
                {daily.length === 0 ? `No pageviews recorded in the last ${range} days.` : "Select at least one series to plot."}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5A544B", marginBottom: 6 }}>Top pages</div>
            <BreakdownBars data={pageRows} labelWidth={220} />
          </div>
        </>
      )}

      {!error && loading && configured === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 13, borderRadius: 6, background: "#F5F4F0", width: `${88 - i * 14}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}
