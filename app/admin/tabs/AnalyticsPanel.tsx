"use client";

import { useEffect, useRef, useState } from "react";
import { DARK, ORANGE } from "../data";
import { BreakdownBars, TrendChart } from "../charts";
import { supabase } from "../../../lib/supabaseClient";

interface Totals {
  views30: number;
  viewsPrev30: number;
  visitors30: number;
  visitorsPrev30: number;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoRanRef = useRef(false);

  async function load() {
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
      const res = await fetch("/api/admin/analytics/", { headers: { Authorization: `Bearer ${token}` } });
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
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const viewsDelta = totals ? pctDelta(totals.views30, totals.viewsPrev30) : null;
  const visitorsDelta = totals ? pctDelta(totals.visitors30, totals.visitorsPrev30) : null;
  const maxPageViews = topPages[0]?.views || 1;
  const pageRows = topPages.map((p) => ({ label: p.page, count: p.views, pct: Math.round((p.views / maxPageViews) * 1000) / 10, color: ORANGE }));

  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: DARK }}>Website Traffic</div>
        <button
          onClick={load}
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
      <div style={{ fontSize: 11.5, color: "#8B8479", marginBottom: 18 }}>Page views and visitors from PostHog, last 30 days</div>

      {error && (
        <div style={{ fontSize: 13, color: "#E23A2E", padding: "8px 0" }}>{error}</div>
      )}

      {!error && configured === false && (
        <div style={{ border: "1.5px dashed rgba(64,50,34,0.18)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginBottom: 6 }}>Not connected yet</div>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "#5A544B" }}>
            The site already sends every pageview to PostHog. To show that data here, add <code>POSTHOG_PERSONAL_API_KEY</code> (create one under your PostHog account&rsquo;s Settings
            &rarr; Personal API Keys, with read access) and <code>POSTHOG_PROJECT_ID</code> (found on Project Settings &rarr; General) to the environment, then refresh.
          </p>
        </div>
      )}

      {!error && configured === true && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Page Views", value: totals?.views30 ?? 0, delta: viewsDelta },
              { label: "Unique Visitors", value: totals?.visitors30 ?? 0, delta: visitorsDelta },
            ].map((k) => (
              <div key={k.label} style={{ background: "#FAF8F4", borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11.5, color: "#8B8479", fontWeight: 500, marginBottom: 6 }}>{k.label} (30d)</div>
                <div style={{ fontSize: 26, fontWeight: 600, color: DARK, letterSpacing: "-0.02em", lineHeight: 1 }}>{k.value.toLocaleString()}</div>
                {k.delta && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: k.delta.positive === null ? "#8B8479" : k.delta.positive ? "#22C55E" : "#E23A2E" }}>{k.delta.text}</span>
                    <span style={{ fontSize: 11, color: "#8B8479" }}>{k.delta.text !== "—" ? "vs prior 30 days" : ""}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#5A544B", marginBottom: 10 }}>Daily views</div>
            {daily.length > 0 ? (
              <TrendChart data={daily.map((d) => ({ label: shortDate(d.day), value: d.views }))} />
            ) : (
              <div style={{ fontSize: 12.5, color: "#8B8479" }}>No pageviews recorded in the last 30 days.</div>
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
