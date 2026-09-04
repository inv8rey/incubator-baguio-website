"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthProvider";
import { supabase } from "../../../lib/supabaseClient";
import { cardStyle, primaryButtonStyle, DARK, ORANGE } from "../styles";
import { fetchSavedItems, toggleSavedItem, type SavedItemRow } from "../savedItems";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

interface PostedRow {
  id: string;
  title: string;
  sector: string;
  deadline: string;
}

export default function MyChallenges() {
  const { user } = useAuth();
  const [posted, setPosted] = useState<PostedRow[]>([]);
  const [saved, setSaved] = useState<SavedItemRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    if (!supabase || !user) {
      setLoaded(true);
      return;
    }
    const [{ data: postedRows }, savedRows] = await Promise.all([
      supabase.from("challenge_submissions").select("id,title,sector,deadline").eq("owner_id", user.id).order("created_at", { ascending: false }),
      fetchSavedItems(user.id, "challenge"),
    ]);
    setPosted((postedRows as PostedRow[]) ?? []);
    setSaved(savedRows);
    setLoaded(true);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function unsave(item: SavedItemRow) {
    if (!user) return;
    await toggleSavedItem(user.id, "challenge", item.ref_id, item.title, item.subtitle, item.href);
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Saved challenges</h2>
        </div>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "#5A544B" }}>Bookmarked from Recommended for you on your Overview.</p>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : saved.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Nothing saved yet — the bookmark icon on a challenge card saves it here.</p>
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
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: DARK }}>Challenges you&rsquo;ve posted</h2>
          <a href={`${BP}/challenges/post/`} style={{ ...primaryButtonStyle, textDecoration: "none", padding: "9px 18px", fontSize: 13 }}>+ Post a challenge</a>
        </div>
        {!loaded ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>Loading…</p>
        ) : posted.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: "#6E685F" }}>You haven&rsquo;t posted a challenge yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {posted.map((r) => (
              <a key={r.id} href={`${BP}/challenges/community/?id=${r.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.1)", borderRadius: 10, padding: "12px 16px", textDecoration: "none" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: DARK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                  <div style={{ fontSize: 11.5, color: "#6E685F", marginTop: 1 }}>{r.sector}</div>
                </div>
                {r.deadline && <span style={{ fontSize: 11.5, color: ORANGE, fontWeight: 600, flexShrink: 0 }}>Due {r.deadline}</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
