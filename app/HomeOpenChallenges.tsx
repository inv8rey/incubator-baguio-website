"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { fetchDynamicChallenges } from "./challenges/dynamicData";
import { categoryInfo, type Challenge } from "./challenges/data";

const DARK = "#141417";

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
    <div style={{ background: "#fff", padding: "36px 40px 80px" }}>
    <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9A958B" }}>Open challenges</div>
        <a href={`${bp}/challenges/`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: "#F26522", textDecoration: "none" }}>
          View all challenges
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
      </div>

      {!challenges ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.12)", borderRadius: 18, height: 230 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
          {challenges.map((c) => {
            const cat = categoryInfo(c.category);
            return (
              <div key={c.id} className="ib-card-hover" style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.12)", borderRadius: 18, padding: 26, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, rowGap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.02em", color: cat.color, background: cat.bg, padding: "7px 13px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                    <span>{cat.emoji}</span>{c.category}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: c.deadlineColor, whiteSpace: "nowrap", flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 9999, background: c.deadlineColor, flexShrink: 0 }} />
                    {c.deadline}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: DARK, lineHeight: 1.25 }}>{c.title}</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.summary}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(20,20,25,0.1)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: c.orgColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: c.orgInitialsFontSize, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{c.orgInitials}</div>
                  <span style={{ fontSize: 13, color: "#9A958B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{c.orgName}</span>
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

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <a href={`${bp}/challenges/`} className="ib-cta-orange" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#F26522", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}>
          View all challenges
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
        </a>
      </div>
    </div>
    </div>
  );
}
