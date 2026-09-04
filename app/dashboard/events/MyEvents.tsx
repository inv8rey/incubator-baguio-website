"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, primaryButtonStyle, DARK } from "../styles";
import { fetchSavedItems, toggleSavedItem, type SavedItemRow } from "../savedItems";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface SubmittedRow {
  id: string;
  title: string;
  event_date: string;
  venue: string;
  status: "pending" | "approved" | "rejected";
}

const STATUS_BADGE: Record<SubmittedRow["status"], { label: string; color: string; bg: string }> = {
  pending: { label: "Pending review", color: "#D88A0A", bg: "rgba(245,166,35,0.14)" },
  approved: { label: "Live on calendar", color: "#1A6B3C", bg: "rgba(26,107,60,0.10)" },
  rejected: { label: "Not approved", color: "#E23A2E", bg: "rgba(226,58,46,0.10)" },
};

export default function MyEvents() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState<SubmittedRow[]>([]);
  const [saved, setSaved] = useState<SavedItemRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!supabase || !user) {
      setLoaded(true);
      return;
    }
    const [{ data: submittedRows }, savedRows] = await Promise.all([
      supabase.from("event_submissions").select("id,title,event_date,venue,status").eq("owner_id", user.id).order("event_date", { ascending: true }),
      fetchSavedItems(user.id, "event"),
    ]);
    setSubmitted((submittedRows as SubmittedRow[]) ?? []);
    setSaved(savedRows);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function unsave(item: SavedItemRow) {
    if (!user) return;
    await toggleSavedItem(user.id, "event", item.ref_id, item.title, item.subtitle, item.href);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 600, color: DARK }}>Saved events</h2>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#5A544B" }}>Bookmarked from Recommended for you on your Overview.</p>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : saved.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Nothing saved yet — the bookmark icon on an event card saves it here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {saved.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                <a href={s.href} style={{ minWidth: 0, textDecoration: "none" }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                  <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{s.subtitle}</div>
                </a>
                <button onClick={() => unsave(s)} style={{ fontSize: 11.5, fontWeight: 600, color: "#E23A2E", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Events you&rsquo;ve submitted</h2>
          <a href={`${BP}/calendar/?submit=1`} style={{ ...primaryButtonStyle, textDecoration: "none", padding: "9px 18px", fontSize: 13 }}>+ Submit an event</a>
        </div>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : submitted.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>You haven&rsquo;t submitted an event yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {submitted.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{r.event_date}{r.venue ? ` · ${r.venue}` : ""}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_BADGE[r.status].color, background: STATUS_BADGE[r.status].bg, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>{STATUS_BADGE[r.status].label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
