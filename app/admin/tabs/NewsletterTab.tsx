"use client";

import { useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";

interface SubscriberRow {
  id: string;
  email: string;
  source: string;
  created_at: string;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Quotes a field for CSV only when it actually needs it (contains a comma,
// quote, or newline) -- and escapes embedded quotes by doubling them, per
// RFC 4180.
function csvField(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function downloadCsv(rows: SubscriberRow[]) {
  const header = ["email", "source", "subscribed_at"];
  const lines = [header.join(",")].concat(
    rows.map((r) => [csvField(r.email), csvField(r.source || ""), csvField(r.created_at)].join(","))
  );
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function NewsletterTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    setRows((data as SubscriberRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = rows.filter((r) => !q || r.email.toLowerCase().includes(q) || r.source.toLowerCase().includes(q));

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const recentCount = rows.filter((r) => Date.now() - new Date(r.created_at).getTime() < weekMs).length;

  const sourceCounts = new Map<string, number>();
  rows.forEach((r) => {
    const key = r.source || "Unknown";
    sourceCounts.set(key, (sourceCounts.get(key) ?? 0) + 1);
  });

  async function remove(id: string, email: string) {
    if (!supabase) return;
    if (!window.confirm(`Remove ${email} from the newsletter list? This can't be undone.`)) return;
    const { error: err } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (err) return window.alert(err.message);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>Total subscribers</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{rows.length}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 6 }}>New this week</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: DARK }}>{recentCount}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1.5px solid rgba(64,50,34,0.12)", minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6E685F", marginBottom: 8 }}>By source</div>
          {sourceCounts.size ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[...sourceCounts.entries()].sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                <div key={src} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                  <span style={{ color: "#5A544B" }}>{src}</span>
                  <strong style={{ color: DARK }}>{count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "#6E685F" }}>No subscribers yet.</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12.5, color: "#6E685F" }}>
          Showing <strong style={{ color: DARK }}>{filtered.length}</strong> of {rows.length}
        </div>
        <button
          onClick={() => downloadCsv(filtered)}
          disabled={filtered.length === 0}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontSize: 12.5,
            fontWeight: 600,
            color: filtered.length === 0 ? "#C4BEB4" : "#fff",
            background: filtered.length === 0 ? "#F5F4F0" : "#131110",
            border: "none",
            borderRadius: 999,
            padding: "9px 16px",
            cursor: filtered.length === 0 ? "default" : "pointer",
          }}
        >
          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV{searchQuery ? " (filtered)" : ""}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", overflow: "hidden" }}>
        {filtered.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", padding: "10px 18px", borderBottom: "1px solid rgba(64,50,34,0.08)", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6E685F" }}>
              <span style={{ flex: 1 }}>Email</span>
              <span style={{ width: 110 }}>Source</span>
              <span style={{ width: 120, textAlign: "right" }}>Subscribed</span>
              <span style={{ width: 32 }} />
            </div>
            {filtered.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid rgba(64,50,34,0.05)", fontSize: 13.5 }}>
                <span style={{ flex: 1, color: DARK, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>{r.email}</span>
                <span style={{ width: 110, fontSize: 11.5, fontWeight: 600, color: "#5A544B", textTransform: "capitalize" }}>{r.source || "—"}</span>
                <span style={{ width: 120, fontSize: 12, color: "#6E685F", textAlign: "right" }}>{timeAgo(r.created_at)}</span>
                <span style={{ width: 32, textAlign: "right" }}>
                  <button
                    onClick={() => remove(r.id, r.email)}
                    title="Remove subscriber"
                    style={{ border: "none", background: "none", color: "#C4BEB4", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4 }}
                  >
                    ×
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#6E685F", fontSize: 13 }}>
            {loaded ? (searchQuery ? "No subscribers match your search." : "No newsletter subscribers yet.") : "Loading…"}
          </div>
        )}
      </div>
    </div>
  );
}
