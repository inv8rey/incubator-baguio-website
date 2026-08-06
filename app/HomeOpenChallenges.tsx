"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchDynamicChallenges } from "./challenges/dynamicData";
import { categoryInfo, type Challenge } from "./challenges/data";

const DARK = "#1A1714";

function pickRandom<T>(items: T[], n: number): T[] {
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < n) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

export default function HomeOpenChallenges({ bp }: { bp: string }) {
  const [challenges, setChallenges] = useState<Challenge[] | null>(null);

  const load = useCallback(() => {
    fetchDynamicChallenges().then((all) => {
      const open = all.filter((c) => c.status === "Open");
      setChallenges(pickRandom(open.length ? open : all, 3));
    });
  }, []);

  useEffect(() => {
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-home-open-challenges")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, [load]);

  if (challenges && challenges.length === 0) return null;

  return (
    <div style={{ background: "#FCFAF6", padding: "56px 40px 92px" }}>
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 40, borderTop: "1px solid rgba(64,50,34,0.11)" }}>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B8479" }}>Open right now</div>
        <a
          href={`${bp}/challenges/`}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: DARK, textDecoration: "none", paddingBottom: 4, borderBottom: "1.5px solid rgba(242,101,34,0.45)" }}
        >
          View all challenges
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.2}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
      </div>

      {!challenges ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.10)", borderRadius: 18, height: 230 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
          {challenges.map((c) => {
            const cat = categoryInfo(c.category);
            return (
              <div key={c.id} className="ib-card-hover" style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.10)", borderRadius: 18, padding: 26, display: "flex", flexDirection: "column", boxShadow: "var(--ib-shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, rowGap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, letterSpacing: "0.02em", color: cat.color, background: cat.bg, padding: "7px 13px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                    <span>{cat.emoji}</span>{c.category}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: c.deadlineColor, whiteSpace: "nowrap", flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: c.deadlineColor, flexShrink: 0 }} />
                    {c.deadline}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 600, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.25 }}>{c.title}</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.55, color: "#5A544B", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(64,50,34,0.13)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.orgInitialsFontSize, fontWeight: 600, color: "#fff", flexShrink: 0 }}>{c.orgInitials}</div>
                  <span style={{ fontSize: 13, color: "#8B8479", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{c.orgName}</span>
                  <a href={`${bp}/challenges/${c.slug}/`} style={{ marginLeft: "auto", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: DARK, textDecoration: "none", whiteSpace: "nowrap" }}>
                    View details
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DARK} strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
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
