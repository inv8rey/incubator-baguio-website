"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

const DARK = "#141417";
const ORANGE = "#F26522";

interface Submission {
  id: string;
  title: string;
  org_name: string;
  org_type: string;
  sector: string;
  problem: string;
  deadline: string;
  created_at: string;
}

export default function CommunityChallenges({ bp }: { bp: string }) {
  const [items, setItems] = useState<Submission[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoaded(true);
      return;
    }
    supabase
      .from("challenge_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as Submission[]) ?? []);
        setLoaded(true);
      });
  }, []);

  if (!loaded || items.length === 0) return null;

  return (
    <div style={{ background: "#fff", padding: "64px 40px", borderTop: "1px solid rgba(20,20,25,0.06)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>Posted by members</div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, letterSpacing: "-0.025em", color: DARK }}>Community-posted challenges</h2>
          <p style={{ margin: "12px auto 0", fontSize: 14.5, lineHeight: 1.6, color: "#6B6B73", maxWidth: 520 }}>
            Posted directly by logged-in members of the ecosystem.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
          {items.map((c) => (
            <a
              key={c.id}
              href={`${bp}/challenges/community/?id=${c.id}`}
              className="ib-challenge-hover"
              style={{ display: "block", background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 24, textDecoration: "none" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: ORANGE, background: "rgba(242,101,34,0.12)", padding: "5px 11px", borderRadius: 9999 }}>
                  {c.sector || "General"}
                </span>
                {c.deadline && <span style={{ fontSize: 11.5, color: "#9A958B" }}>Due {c.deadline}</span>}
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 16.5, fontWeight: 600, color: DARK }}>{c.title}</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.55, color: "#6B6B73", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{c.problem}</p>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#44444C" }}>{c.org_name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
