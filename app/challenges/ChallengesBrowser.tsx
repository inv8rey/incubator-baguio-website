"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../AuthProvider";
import { fetchSavedItems, toggleSavedItem } from "../dashboard/savedItems";
import { CHALLENGE_CATEGORIES, CHALLENGE_ORG_TYPES, type Challenge, type ChallengeOrgType } from "./data";
import { fetchDynamicChallenges } from "./dynamicData";

const DARK = "#1A1714";
const ORANGE = "#F26522";
const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? ORANGE : "none"} stroke={filled ? ORANGE : "#6E685F"} strokeWidth={2}>
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    </svg>
  );
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 13.5,
        fontWeight: active ? 600 : 500,
        color: active ? "#fff" : "#44444C",
        background: active ? DARK : "#F6F2EA",
        padding: "9px 18px",
        borderRadius: 9999,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export default function ChallengesBrowser({ bp }: { bp: string }) {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<ChallengeOrgType | null>(null);
  const [query, setQuery] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    fetchSavedItems(user.id, "challenge").then((rows) => setSavedIds(new Set(rows.map((r) => r.ref_id))));
  }, [user]);

  async function onToggleSave(c: Challenge, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const nowSaved = await toggleSavedItem(user.id, "challenge", c.id, c.title, c.orgName, `${bp}/challenges/${c.slug}/`);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (nowSaved) next.add(c.id);
      else next.delete(c.id);
      return next;
    });
  }

  useEffect(() => {
    function load() {
      fetchDynamicChallenges().then((c) => {
        setChallenges(shuffle(c));
        setLoaded(true);
      });
    }
    load();
    // Mobile browsers freely suspend an in-flight fetch (and the realtime
    // websocket) when the tab is backgrounded -- locking the phone or
    // switching apps mid-load, then coming back, previously left the grid
    // stuck on whatever it had (often nothing) with no further trigger to
    // retry. Refetch whenever the tab becomes visible again.
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisible);
    if (!supabase) return () => document.removeEventListener("visibilitychange", onVisible);
    const channel = supabase
      .channel("public-challenges-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, load)
      .subscribe();
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase?.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return challenges.filter((c) => {
      if (category && c.category !== category) return false;
      if (orgType && c.orgType !== orgType) return false;
      if (q && !`${c.title} ${c.summary} ${c.orgName} ${c.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [challenges, category, orgType, query]);

  return (
    <div id="browse" style={{ background: "#fff", padding: "56px 40px 64px", borderTop: "1px solid rgba(64,50,34,0.09)", scrollMarginTop: 80 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 10 }}>Open now</div>
            <h2 style={{ margin: 0, fontSize: 34, fontWeight: 600, letterSpacing: "-0.025em", color: DARK }}>Browse challenges</h2>
          </div>
          <div style={{ height: 46, background: "#F6F2EA", border: "1px solid rgba(64,50,34,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 260 }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6E685F" strokeWidth={2}><circle cx={11} cy={11} r={7} /><path d="m20 20-3.5-3.5" /></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search challenges"
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: DARK, width: "100%" }}
            />
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6E685F", marginBottom: 10 }}>Category</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip label="All categories" active={category === null} onClick={() => setCategory(null)} />
            {CHALLENGE_CATEGORIES.map((c) => (
              <Chip key={c.id} label={`${c.emoji} ${c.id}`} active={category === c.id} onClick={() => setCategory(c.id)} />
            ))}
          </div>
        </div>

        {/* ORG TYPE FILTER */}
        <div style={{ marginBottom: 26 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6E685F", marginBottom: 10 }}>Posted by</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip label="All organizations" active={orgType === null} onClick={() => setOrgType(null)} />
            {CHALLENGE_ORG_TYPES.map((o) => (
              <Chip key={o} label={o} active={orgType === o} onClick={() => setOrgType(o)} />
            ))}
          </div>
        </div>

        {loaded && filtered.length === 0 ? (
          <p style={{ textAlign: "center", fontSize: 14, color: "#6E685F", padding: "48px 0" }}>No challenges match your filters.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {filtered.map((c) => {
              const cat = CHALLENGE_CATEGORIES.find((cc) => cc.id === c.category);
              const isSaved = savedIds.has(c.id);
              const bookmarkBtnStyle: React.CSSProperties = { width: 30, height: 30, borderRadius: 9999, background: "#F6F2EA", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, marginLeft: "auto" };
              return (
                <div key={c.id} className="ib-challenge-hover" style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 18, padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: cat?.color, background: cat?.bg, padding: "5px 11px", borderRadius: 9999 }}>{cat?.emoji} {c.category}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: c.deadlineColor }}>
                      <span style={{ width: 6, height: 6, borderRadius: 9999, background: c.deadlineColor, display: "inline-block" }} />
                      {c.deadline}
                    </span>
                    {user ? (
                      <button onClick={(e) => onToggleSave(c, e)} style={bookmarkBtnStyle} aria-label={isSaved ? "Remove bookmark" : "Bookmark this challenge"} title={isSaved ? "Remove bookmark" : "Bookmark this challenge"}>
                        <BookmarkIcon filled={isSaved} />
                      </button>
                    ) : (
                      <a href={`${BP}/login/?redirect=${encodeURIComponent(`${BP}/challenges/`)}`} style={{ ...bookmarkBtnStyle, textDecoration: "none" }} aria-label="Log in to bookmark this challenge" title="Log in to bookmark">
                        <BookmarkIcon filled={false} />
                      </a>
                    )}
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 600, color: DARK, lineHeight: 1.3 }}>{c.title}</h3>
                  <p style={{ margin: "0 0 18px", fontSize: 13.5, lineHeight: 1.55, color: "#5A544B", flex: 1 }}>{c.summary}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: c.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.orgInitialsFontSize, fontWeight: 600, color: "#fff" }}>{c.orgInitials}</div>
                    <span style={{ fontSize: 12.5, color: "#6E685F" }}>{c.orgName}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: "#6E685F", background: "#F6F2EA", padding: "3px 9px", borderRadius: 9999, marginLeft: "auto" }}>{c.orgType}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid rgba(64,50,34,0.11)" }}>
                    <a href={`${bp}/challenges/${c.slug}/`} style={{ fontSize: 13, fontWeight: 600, color: DARK, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      View challenge <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.3}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
