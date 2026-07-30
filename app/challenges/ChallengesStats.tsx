"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Stats {
  openChallenges: number;
  categoriesCovered: number;
  solversRegistered: number;
  communityPosted: number;
}

export default function ChallengesStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    function load() {
      if (!supabase) return;
      Promise.all([
        supabase!.from("challenges").select("category"),
        supabase!.from("challenge_applications").select("id", { count: "exact", head: true }),
        supabase!.from("challenge_submissions").select("id", { count: "exact", head: true }),
      ]).then(([challenges, applications, submissions]) => {
        const rows = (challenges.data as { category: string }[] | null) ?? [];
        setStats({
          openChallenges: rows.length,
          categoriesCovered: new Set(rows.map((r) => r.category)).size,
          solversRegistered: applications.count ?? 0,
          communityPosted: submissions.count ?? 0,
        });
      });
    }
    load();
    if (!supabase) return;
    const channel = supabase
      .channel("public-challenges-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "challenge_applications" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "challenge_submissions" }, load)
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  if (!stats) return null;

  const cells: { value: number; label: string }[] = [
    { value: stats.openChallenges, label: "Open challenges" },
    { value: stats.categoriesCovered, label: "Categories covered" },
    { value: stats.solversRegistered, label: "Solvers registered" },
    { value: stats.communityPosted, label: "Community posted" },
  ];

  return (
    <div style={{ background: "#0B0B0D", padding: "0 40px 64px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="ib-ecosystem-grid">
        {cells.map((c, i) => (
          <div key={c.label} style={{ textAlign: "center", padding: "40px 20px 4px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginTop: 12 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
