"use client";

import { useEffect, useState } from "react";
import { fetchDynamicStartups } from "./ecosystem/dynamicData";
import type { StartupEntry } from "./ecosystem/data";

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

export default function FeaturedStartups({ bp }: { bp: string }) {
  const [startups, setStartups] = useState<StartupEntry[] | null>(null);

  useEffect(() => {
    fetchDynamicStartups().then((all) => setStartups(pickRandom(all, 3)));
  }, []);

  if (startups && startups.length === 0) return null;

  return (
    <div style={{ background: "#F6F2EA", padding: "80px 40px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ marginBottom: 44, maxWidth: 620 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <span style={{ width: 22, height: 1, background: "rgba(242,101,34,0.5)" }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "#F26522" }}>Ecosystem Directory</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.032em", color: DARK, lineHeight: 1.14 }}>Innovators in the Incubator Baguio network</h2>
        </div>

        {!startups ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid rgba(64,50,34,0.13)", borderRadius: 18, height: 260 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ib-featured-grid">
            {startups.map((s) => (
              <div
                key={s.name}
                className="ib-card-hover ib-startup-card"
                style={{
                  position: "relative",
                  background: "#fff",
                  border: "1px solid rgba(64,50,34,0.10)",
                  borderRadius: 18,
                  padding: "26px 24px 24px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "var(--ib-shadow-sm)",
                }}
              >
                {/* One mark per card — the logo doubles as the identity, so no
                    separate initial tile repeating the same information. */}
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 18 }}>
                  {s.logoUrl ? (
                    // `contain` rather than `cover`: partner logos come in every
                    // aspect ratio and cropping them mangles the wordmarks.
                    <img
                      src={s.logoUrl}
                      alt={`${s.name} logo`}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 13,
                        objectFit: "contain",
                        background: "#fff",
                        padding: 5,
                        flexShrink: 0,
                        border: "1px solid rgba(64,50,34,0.09)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 13,
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 600,
                        color: s.color,
                        flexShrink: 0,
                      }}
                    >
                      {s.initial}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: "-0.015em", color: DARK, lineHeight: 1.3 }}>{s.name}</div>
                    <div style={{ fontSize: 12.5, color: "#6E685F", marginTop: 2 }}>{s.sector}</div>
                  </div>
                </div>

                <p
                  style={{
                    margin: "0 0 20px",
                    fontSize: 14,
                    lineHeight: 1.62,
                    color: "#5A544B",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {s.description}
                </p>

                {s.website && (
                  // marginTop:auto pins the footer to the card floor so the rules
                  // line up across the row even when names/sectors wrap.
                  <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "1px solid rgba(64,50,34,0.09)" }}>
                    <a
                      href={s.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600, color: DARK, textDecoration: "none" }}
                    >
                      Visit site
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32 }}>
          <a
            href={`${bp}/ecosystem/`}
            style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#1A1714", color: "#fff", fontWeight: 600, fontSize: 15, padding: "14px 28px", borderRadius: 9999, textDecoration: "none" }}
          >
            Explore the Ecosystem
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
