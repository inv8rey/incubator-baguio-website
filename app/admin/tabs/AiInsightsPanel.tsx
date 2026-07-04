"use client";

import { useEffect, useRef, useState } from "react";
import { ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AiInsightsPanel({ ready }: { ready: boolean }) {
  const [insights, setInsights] = useState<string[]>([]);
  const [source, setSource] = useState<"cron" | "manual" | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoRanRef = useRef(false);

  async function authedFetch(method: "GET" | "POST") {
    if (!supabase) {
      setError("The backend isn't configured yet.");
      return null;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Log in again to load insights.");
      return null;
    }
    return fetch("/api/ai-insights/", { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
  }

  async function loadCached() {
    setLoading(true);
    setError("");
    try {
      const res = await authedFetch("GET");
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't load insights.");
        return;
      }
      setInsights(data.insights ?? []);
      setSource(data.source ?? null);
      setGeneratedAt(data.generatedAt ?? null);
    } catch {
      setError("Couldn't reach the AI insights service.");
    } finally {
      setLoading(false);
    }
  }

  async function regenerate() {
    setLoading(true);
    setError("");
    try {
      const res = await authedFetch("POST");
      if (!res) return;
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Couldn't generate insights.");
        return;
      }
      setInsights(data.insights ?? []);
      setSource(data.source ?? "manual");
      setGeneratedAt(data.generatedAt ?? null);
    } catch {
      setError("Couldn't reach the AI insights service.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!ready || autoRanRef.current) return;
    autoRanRef.current = true;
    loadCached();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <div style={{ background: "linear-gradient(135deg,#181819 0%,#0E0E10 100%)", borderRadius: 16, padding: "22px 24px", border: "1.5px solid rgba(242,101,34,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(242,101,34,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth={2}>
              <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>AI Insights</span>
        </div>
        <button
          onClick={regenerate}
          disabled={loading}
          title="Generate a fresh, real-time summary right now"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: loading ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            padding: "6px 12px",
            cursor: loading ? "default" : "pointer",
          }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={loading ? { animation: "ib-spin 0.9s linear infinite" } : undefined}>
            <path d="M21 12a9 9 0 1 1-2.6-6.4" />
            <path d="M21 3v6h-6" />
          </svg>
          {loading ? "Generating…" : "Regenerate"}
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
        {generatedAt
          ? `${source === "manual" ? "Regenerated" : "Auto-updated"} ${formatTime(generatedAt)}`
          : "Auto-updates daily at 7:30am — click Regenerate for a real-time summary"}
      </div>

      {loading && insights.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 13, borderRadius: 6, background: "rgba(255,255,255,0.07)", width: `${88 - i * 14}%` }} />
          ))}
        </div>
      )}

      {!loading && error && <div style={{ fontSize: 13, color: "#F0A088" }}>{error}</div>}

      {!error && insights.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 10, fontSize: 13.5, lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>
              <span style={{ color: ORANGE, flexShrink: 0 }}>•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && insights.length === 0 && (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          No insights yet — click Regenerate to generate the first one, or wait for the 7:30am auto-update.
        </div>
      )}
    </div>
  );
}
