"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../../data";
import { supabase } from "../../../../lib/supabaseClient";

interface IssueRow {
  id: string;
  issue_number: number | null;
  subject: string;
  status: "draft" | "sending" | "sent" | "failed";
  created_at: string;
  sent_at: string | null;
  recipient_count: number | null;
  success_count: number | null;
  failure_count: number | null;
}

const STATUS_STYLE: Record<IssueRow["status"], { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#6E685F", bg: "rgba(64,50,34,0.08)" },
  sending: { label: "Sending…", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  sent: { label: "Sent", color: "#1A6B3C", bg: "rgba(26,107,60,0.1)" },
  failed: { label: "Failed", color: "#E23A2E", bg: "rgba(226,58,46,0.1)" },
};

export default function IssuesList({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase
      .from("newsletter_issues")
      .select("id,issue_number,subject,status,created_at,sent_at,recipient_count,success_count,failure_count")
      .order("created_at", { ascending: false });
    setRows((data as IssueRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12.5, color: "#6E685F" }}>
          {loaded ? `${rows.length} issue${rows.length === 1 ? "" : "s"}` : "Loading…"}
        </div>
        <button
          onClick={onNew}
          style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", background: ORANGE, border: "none", borderRadius: 999, padding: "9px 16px", cursor: "pointer" }}
        >
          + New issue
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", overflow: "hidden" }}>
        {rows.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {rows.map((r) => {
              const s = STATUS_STYLE[r.status];
              return (
                <button
                  key={r.id}
                  onClick={() => onOpen(r.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: "1px solid rgba(64,50,34,0.06)", background: "none", border: "none", borderBottomWidth: 1, textAlign: "left", cursor: "pointer", width: "100%" }}
                >
                  <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>{s.label}</span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.issue_number ? `#${r.issue_number} — ` : ""}{r.subject || "(untitled)"}
                  </span>
                  {r.status === "sent" && (
                    <span style={{ fontSize: 12, color: "#6E685F", flexShrink: 0 }}>
                      {r.success_count ?? 0}/{r.recipient_count ?? 0} delivered
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: "#8A8378", flexShrink: 0, minWidth: 90, textAlign: "right" }}>
                    {new Date(r.sent_at || r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#6E685F", fontSize: 13 }}>
            {loaded ? "No issues yet — start one above." : "Loading…"}
          </div>
        )}
      </div>
    </div>
  );
}
