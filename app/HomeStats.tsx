"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Org types that count toward "Ecosystem Organizations" — TBIs, Government,
// Community, and Academe (schools/universities). Companies, Service
// Providers, Coworking Spaces, and Makerspaces & Labs are ecosystem
// *members* shown elsewhere in the directory, not counted here.
const ECOSYSTEM_ORG_TYPES = ["TBIs", "Government", "Community", "Academe"];

interface Stats {
  innovators: number;
  ecosystemOrganizations: number;
  openChallenges: number;
  tbis: number;
}

// Seamless dark continuation of the hero above it (same visual slot the old
// static "9+ / 8+ / 4 / ∞" band occupied), now backed by live counts so the
// homepage never quietly drifts out of sync with the real ecosystem.
export default function HomeStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!supabase) return;
    function load() {
      Promise.all([
        supabase!.from("startups").select("id", { count: "exact", head: true }),
        // Public directory counts only ever include approved + public orgs —
        // same rule the Ecosystem directory itself uses.
        supabase!.from("organizations").select("id", { count: "exact", head: true }).in("org_type", ECOSYSTEM_ORG_TYPES).eq("is_public", true),
        supabase!.from("challenges").select("id", { count: "exact", head: true }).eq("status", "Open"),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("org_type", "TBIs").eq("is_public", true),
      ]).then(([innovators, orgs, challenges, tbis]) => {
        setStats({
          innovators: innovators.count ?? 0,
          ecosystemOrganizations: orgs.count ?? 0,
          openChallenges: challenges.count ?? 0,
          tbis: tbis.count ?? 0,
        });
      });
    }
    load();
    const channel = supabase
      .channel("home-stats-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "startups" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, load)
      .subscribe();
    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  if (!stats) return null;

  const cells: { value: number; label: string; href: string }[] = [
    { value: stats.innovators, label: "Innovators", href: `${BP}/ecosystem?tab=Startups` },
    { value: stats.ecosystemOrganizations, label: "Ecosystem organizations", href: `${BP}/ecosystem` },
    { value: stats.openChallenges, label: "Open challenges", href: `${BP}/challenges` },
    { value: stats.tbis, label: "TBIs", href: `${BP}/ecosystem?tab=TBIs` },
  ];

  return (
    <div style={{ background: "#100D0B", padding: "0 40px 72px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }} className="ib-ecosystem-grid">
        {cells.map((c, i) => (
          <a
            key={c.label}
            href={c.href}
            className="ib-homestat-cell"
            style={{ textAlign: "center", padding: "44px 20px 4px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : undefined, textDecoration: "none", display: "block" }}
          >
            <div style={{ fontSize: 46, fontWeight: 500, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginTop: 12 }}>{c.label}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
