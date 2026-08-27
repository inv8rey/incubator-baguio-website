"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Counts {
  startups: number;
  mentors: number;
  tbis: number;
  organizations: number;
}

const STAT_LABELS: { key: keyof Counts; label: string }[] = [
  { key: "startups", label: "Startup Portfolio" },
  { key: "mentors", label: "Mentors & Experts" },
  { key: "tbis", label: "TBIs" },
  // Total across every organizations row -- Companies, Service Providers,
  // Government, Community, Coworking Spaces, Makerspaces & Labs, and TBIs.
  { key: "organizations", label: "Ecosystem Organizations" },
];

// Seamless dark continuation of the hero above it, same as the rest of this
// page's sections -- kept as its own component (rather than the static HTML
// string the hero itself is) because it needs a live Supabase count.
export default function EcosystemStats() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!supabase) return;
    async function load() {
      const [s, m, tbi, org] = await Promise.all([
        supabase!.from("startups").select("id", { count: "exact", head: true }),
        supabase!.from("mentors").select("id", { count: "exact", head: true }),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("org_type", "TBIs").eq("is_public", true),
        supabase!.from("organizations").select("id", { count: "exact", head: true }).eq("is_public", true),
      ]);
      setCounts({ startups: s.count ?? 0, mentors: m.count ?? 0, tbis: tbi.count ?? 0, organizations: org.count ?? 0 });
    }
    load();
    const channel = supabase
      .channel("ecosystem-stats-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "startups" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, load)
      .subscribe();
    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ background: "#100D0B", padding: "0 40px 64px" }}>
      <div
        className="ib-ecosystem-stats-grid"
        style={{ maxWidth: 1080, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}
      >
        {STAT_LABELS.map((s, i) => (
          <div key={s.key} style={{ textAlign: "center", padding: "40px 20px 4px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <div style={{ fontSize: 42, fontWeight: 500, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {counts ? counts[s.key] : <span style={{ opacity: 0.3 }}>&mdash;</span>}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)", marginTop: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
