"use client";

import { useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";

const STATUSES = ["open", "resolved"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = { open: "Open", resolved: "Resolved" };
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  open: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
  resolved: { color: "#5A544B", bg: "rgba(64,50,34,0.08)" },
};

interface ReportRow {
  id: string;
  target_type: "thread" | "reply";
  target_id: string;
  thread_id: string;
  target_preview: string;
  reason: string;
  status: Status;
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
  return `${days}d ago`;
}

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function ForumTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState<Status>("open");
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("forum_reports").select("*").order("created_at", { ascending: false });
    setReports((data as ReportRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = reports.filter((r) => r.status === status && (!q || r.target_preview.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q)));

  async function dismiss(r: ReportRow) {
    if (!supabase) return;
    setBusyId(r.id);
    await supabase.from("forum_reports").update({ status: "resolved" }).eq("id", r.id);
    setBusyId(null);
    load();
  }

  async function deletePost(r: ReportRow) {
    if (!supabase) return;
    if (!window.confirm(`Delete this ${r.target_type} permanently? This can't be undone.`)) return;
    setBusyId(r.id);
    const table = r.target_type === "thread" ? "forum_threads" : "forum_replies";
    await supabase.from(table).delete().eq("id", r.target_id);
    // Every other open report pointing at the same content is now moot --
    // resolve them too instead of leaving orphaned entries in the queue.
    await supabase.from("forum_reports").update({ status: "resolved" }).eq("target_id", r.target_id);
    setBusyId(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {STATUSES.map((s) => {
          const active = status === s;
          const count = reports.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                fontSize: 12.5,
                fontWeight: active ? 600 : 500,
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                color: active ? "#fff" : "#5A544B",
                background: active ? "#131110" : "#F5F4F0",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {STATUS_LABELS[s]}
              <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((r) => {
          const sc = STATUS_COLORS[r.status];
          const busy = busyId === r.id;
          return (
            <div key={r.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[r.status]}</span>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#5A544B", background: "#F5F4F0", padding: "3px 9px", borderRadius: 999 }}>{r.target_type}</span>
                <span style={{ fontSize: 11.5, color: "#8B8479", marginLeft: "auto" }}>{timeAgo(r.created_at)}</span>
              </div>
              <div style={{ fontSize: 13, color: "#44444C", lineHeight: 1.55, whiteSpace: "pre-wrap", marginBottom: r.reason ? 10 : 14, background: "#F6F2EA", borderRadius: 10, padding: "10px 14px" }}>{r.target_preview || "(no preview)"}</div>
              {r.reason && <div style={{ fontSize: 12.5, color: "#5A544B", marginBottom: 14 }}><strong style={{ color: DARK }}>Reason:</strong> {r.reason}</div>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={`${BP}/community/${r.thread_id}/`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "7px 14px", textDecoration: "none" }}>
                  View discussion
                </a>
                {r.status === "open" && (
                  <>
                    <button onClick={() => dismiss(r)} disabled={busy} style={{ fontSize: 12, fontWeight: 600, color: "#5A544B", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "7px 14px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                      Dismiss
                    </button>
                    <button onClick={() => deletePost(r)} disabled={busy} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#E23A2E", border: "none", borderRadius: 999, padding: "7px 14px", cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
                      Delete {r.target_type}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#8B8479", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            No {STATUS_LABELS[status].toLowerCase()} reports.
          </div>
        )}
      </div>
    </div>
  );
}
