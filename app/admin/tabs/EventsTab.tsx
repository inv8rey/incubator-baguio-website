"use client";

import { useEffect, useState } from "react";
import { DARK, ORANGE } from "../data";
import { supabase } from "../../../lib/supabaseClient";

const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const STATUS_COLORS: Record<Status, { color: string; bg: string }> = {
  pending: { color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { color: "#1A6B3C", bg: "rgba(26,107,60,0.12)" },
  rejected: { color: "#E23A2E", bg: "rgba(226,58,46,0.12)" },
};

interface EventRow {
  id: string;
  title: string;
  category: string;
  event_date: string;
  end_date: string;
  event_time: string;
  venue: string;
  org: string;
  org_type: string;
  format: string;
  description: string;
  cta: string;
  contact_name: string;
  email: string;
  phone: string;
  status: Status;
  created_at: string;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EventsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [status, setStatus] = useState<Status>("pending");
  const [loaded, setLoaded] = useState(false);
  const [viewing, setViewing] = useState<EventRow | null>(null);

  async function load() {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    const { data } = await supabase.from("event_submissions").select("*").order("created_at", { ascending: false });
    setEvents((data as EventRow[]) ?? []);
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  const q = searchQuery.toLowerCase();
  const filtered = events.filter((e) => e.status === status && (!q || e.title.toLowerCase().includes(q) || e.org.toLowerCase().includes(q)));

  async function setEventStatus(id: string, next: Status) {
    if (!supabase) return;
    const { error } = await supabase.from("event_submissions").update({ status: next }).eq("id", id);
    if (error) return window.alert(error.message);
    setViewing(null);
    load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    if (!window.confirm("Delete this submission permanently? This can't be undone.")) return;
    const { error } = await supabase.from("event_submissions").delete().eq("id", id);
    if (error) return window.alert(error.message);
    setViewing(null);
    load();
  }

  return (
    <div className="ib-admin-stack" style={{ padding: "24px 28px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px 18px", border: "1.5px solid rgba(20,20,25,0.09)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flex: 1, flexWrap: "wrap" }}>
          {STATUSES.map((s) => {
            const active = status === s;
            const count = events.filter((e) => e.status === s).length;
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
                  color: active ? "#fff" : "#6B6B73",
                  background: active ? "#0E0E10" : "#F5F4F0",
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
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((e) => {
          const sc = STATUS_COLORS[e.status];
          return (
            <div key={e.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)", padding: 18, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{e.title}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: sc.color, background: sc.bg, padding: "3px 9px", borderRadius: 999 }}>{STATUS_LABELS[e.status]}</span>
                </div>
                <div style={{ fontSize: 12, color: "#9A958B", marginBottom: 8 }}>
                  {formatDate(e.event_date)}{e.event_time ? ` · ${e.event_time}` : ""} · {e.venue || "TBD"} · {e.org} ({e.org_type})
                </div>
                <div style={{ fontSize: 12.5, color: "#6B6B73", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Submitted by {e.contact_name} &middot; {e.email}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => setViewing(e)} style={{ fontSize: 12, fontWeight: 600, color: "#285E7A", background: "none", border: "1.5px solid rgba(40,94,122,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>View</button>
                {e.status !== "approved" && (
                  <button onClick={() => setEventStatus(e.id, "approved")} style={{ fontSize: 12, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Approve</button>
                )}
                {e.status !== "rejected" && (
                  <button onClick={() => setEventStatus(e.id, "rejected")} style={{ fontSize: 12, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}>Reject</button>
                )}
              </div>
            </div>
          );
        })}

        {loaded && filtered.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", color: "#9A958B", fontSize: 13, background: "#fff", borderRadius: 14, border: "1.5px solid rgba(20,20,25,0.09)" }}>
            No {STATUS_LABELS[status].toLowerCase()} submissions.
          </div>
        )}
      </div>

      {viewing && (
        <div onClick={() => setViewing(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,15,17,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, padding: 26, width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", gap: 14, maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: DARK }}>{viewing.title}</div>
              <button onClick={() => setViewing(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, color: "#9A958B", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <div><span style={{ color: "#9A958B" }}>Category:</span> <strong>{viewing.category}</strong></div>
              <div><span style={{ color: "#9A958B" }}>When:</span> <strong>{formatDate(viewing.event_date)}{viewing.end_date ? ` – ${formatDate(viewing.end_date)}` : ""}{viewing.event_time ? `, ${viewing.event_time}` : ""}</strong></div>
              <div><span style={{ color: "#9A958B" }}>Venue:</span> <strong>{viewing.venue || "—"}</strong> ({viewing.format})</div>
              <div><span style={{ color: "#9A958B" }}>Organizer:</span> <strong>{viewing.org}</strong> ({viewing.org_type})</div>
              {viewing.description && (
                <div>
                  <span style={{ color: "#9A958B" }}>Description:</span>
                  <p style={{ margin: "4px 0 0", lineHeight: 1.55 }}>{viewing.description}</p>
                </div>
              )}
              <div style={{ borderTop: "1px solid rgba(20,20,25,0.08)", paddingTop: 10 }}>
                <div><span style={{ color: "#9A958B" }}>Contact:</span> <strong>{viewing.contact_name}</strong></div>
                <div><span style={{ color: "#9A958B" }}>Email:</span> <strong>{viewing.email}</strong></div>
                {viewing.phone && <div><span style={{ color: "#9A958B" }}>Phone:</span> <strong>{viewing.phone}</strong></div>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {viewing.status !== "approved" && (
                <button onClick={() => setEventStatus(viewing.id, "approved")} style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#1A6B3C", border: "none", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Approve</button>
              )}
              {viewing.status !== "rejected" && (
                <button onClick={() => setEventStatus(viewing.id, "rejected")} style={{ fontSize: 13, fontWeight: 600, color: "#E23A2E", background: "none", border: "1.5px solid rgba(226,58,46,0.3)", borderRadius: 999, padding: "9px 18px", cursor: "pointer" }}>Reject</button>
              )}
              <button onClick={() => remove(viewing.id)} style={{ fontSize: 13, fontWeight: 600, color: "#9A958B", background: "none", border: "1.5px solid rgba(20,20,25,0.12)", borderRadius: 999, padding: "9px 18px", cursor: "pointer", marginLeft: "auto" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
