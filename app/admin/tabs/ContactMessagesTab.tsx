"use client";

import { useEffect, useState } from "react";
import { DARK } from "../data";
import { supabase } from "../../../lib/supabaseClient";

const STATUSES = ["new", "read"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = { new: "New", read: "Read" };
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  new: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  read: { color: "#5A544B", bg: "rgba(64,50,34,0.08)" },
};

interface MessageRow {
  id: string;
  name: string;
  email: string;
  organization: string;
  reason: string;
  message: string;
  status: Status;
  created_at: string;
}

export default function ContactMessagesTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [status, setStatus] = useState<Status | "all">("new");
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<MessageRow | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setRows((data as MessageRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = rows.filter(
    (r) => (status === "all" || r.status === status) && (!q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.message.toLowerCase().includes(q))
  );

  async function markRead(row: MessageRow) {
    if (!supabase) return;
    await supabase.from("contact_messages").update({ status: "read" }).eq("id", row.id);
    load();
  }

  function open(row: MessageRow) {
    setViewing(row);
    if (row.status === "new") markRead(row);
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this message permanently? This can't be undone.")) return;
    const { error: err } = await supabase.from("contact_messages").delete().eq("id", id);
    if (err) return window.alert(err.message);
    setViewing(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(64,50,34,0.12)", display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["all", ...STATUSES] as const).map((s) => {
          const active = status === s;
          const count = s === "all" ? rows.length : rows.filter((r) => r.status === s).length;
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
              {s === "all" ? "All" : STATUS_LABELS[s]}
              <span style={{ fontSize: 10, opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((r) => {
          const sc = STATUS_COLORS[r.status];
          return (
            <button
              key={r.id}
              onClick={() => open(r)}
              style={{ textAlign: "left", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)", padding: 18, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[r.status]}</span>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{r.name}</span>
                <span style={{ fontSize: 12, color: "#8B8479" }}>{r.reason}</span>
                <span style={{ fontSize: 11.5, color: "#8B8479", marginLeft: "auto" }}>{new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#5A544B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.message}</div>
            </button>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#8B8479", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(64,50,34,0.12)" }}>
            No messages{status !== "all" ? ` marked ${STATUS_LABELS[status as Status].toLowerCase()}` : ""}.
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#8B8479", marginBottom: 4 }}>{viewing.reason}</div>
                <div style={{ fontSize: 16.5, fontWeight: 600, color: DARK }}>{viewing.name}</div>
              </div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#8B8479", lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div><span style={{ color: "#8B8479" }}>Email:</span> <a href={`mailto:${viewing.email}`} style={{ color: "#F26522", fontWeight: 600 }}>{viewing.email}</a></div>
              {viewing.organization && <div><span style={{ color: "#8B8479" }}>Organization:</span> <strong>{viewing.organization}</strong></div>}
              <div><span style={{ color: "#8B8479" }}>Received:</span> <strong>{new Date(viewing.created_at).toLocaleString()}</strong></div>
              <div style={{ borderTop: "1px solid rgba(64,50,34,0.11)", paddingTop: 10, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{viewing.message}</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <a href={`mailto:${viewing.email}`} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "9px 18px", textDecoration: "none" }}>Reply by email</a>
              <button onClick={() => remove(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#8B8479", background: "none", border: "1.5px solid rgba(64,50,34,0.14)", borderRadius: 999, padding: "9px 18px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
