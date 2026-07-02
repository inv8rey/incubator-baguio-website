"use client";

import { useEffect, useState } from "react";
import { fetchDynamicStartups } from "./ecosystem/dynamicData";
import type { StartupEntry } from "./ecosystem/data";

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

export default function FeaturedStartups({ bp }: { bp: string }) {
  const [startups, setStartups] = useState<StartupEntry[] | null>(null);

  useEffect(() => {
    fetchDynamicStartups().then((all) => setStartups(pickRandom(all, 3)));
  }, []);

  if (startups && startups.length === 0) return null;

  return (
    <div style={{ background: "#FAFAF7", padding: "80px 40px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ marginBottom: 40, maxWidth: 640 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "#F26522", marginBottom: 12 }}>Startup Directory</div>
          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 700, letterSpacing: "-0.03em", color: DARK, lineHeight: 1.08 }}>Startups in the Incubator Baguio network</h2>
        </div>

        {!startups ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, height: 260 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
            {startups.map((s) => (
              <div key={s.name} className="ib-card-hover ib-startup-card" style={{ position: "relative", background: "#fff", border: "1px solid rgba(20,20,25,0.07)", borderRadius: 16, overflow: "hidden", boxShadow: "var(--ib-shadow-sm)" }}>
                <div style={{ position: "relative", height: 150, background: `radial-gradient(130% 120% at 50% 0%, ${s.bg} 0%, #F6F4EF 60%)`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(20,20,25,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,25,0.03) 1px,transparent 1px)", backgroundSize: "26px 26px" }} />
                  {s.logoUrl ? (
                    <img src={s.logoUrl} alt={`${s.name} logo`} style={{ position: "relative", width: 60, height: 60, borderRadius: 14, objectFit: "cover", boxShadow: "0 8px 20px -6px rgba(20,20,25,0.25)" }} />
                  ) : (
                    <div style={{ position: "relative", width: 60, height: 60, borderRadius: 14, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: s.color, boxShadow: "0 8px 20px -6px rgba(20,20,25,0.18)" }}>{s.initial}</div>
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.initial}</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: DARK }}>{s.name}</div>
                      <div style={{ fontSize: 12.5, color: "#9A958B" }}>{s.sector}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#6B6B73", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</p>
                </div>
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ib-startup-link-btn"
                    aria-label={`Visit ${s.name}`}
                    style={{ position: "absolute", right: 16, bottom: 16, width: 34, height: 34, borderRadius: 9999, background: "#141417", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <a
            href={`${bp}/ecosystem/`}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#141417", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}
          >
            View all startups
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
