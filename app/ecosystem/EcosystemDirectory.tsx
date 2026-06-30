"use client";

import { useMemo, useState } from "react";
import { COMMUNITY, CORPORATE, GOVERNMENT, MENTORS, STARTUPS, TBIS, type EcosystemCategory } from "./data";

const DARK = "#141417";
const ORANGE = "#F26522";

const TABS: { id: EcosystemCategory; label: string; count: number }[] = [
  { id: "Startups", label: "Startups", count: STARTUPS.length },
  { id: "Mentors", label: "Mentors", count: MENTORS.length },
  { id: "TBIs", label: "TBIs", count: TBIS.length },
  { id: "Corporate", label: "Corporate", count: CORPORATE.length },
  { id: "Government", label: "Government", count: GOVERNMENT.length },
  { id: "Community", label: "Community", count: COMMUNITY.length },
];

function matches(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((h) => h.toLowerCase().includes(q));
}

export default function EcosystemDirectory() {
  const [tab, setTab] = useState<EcosystemCategory>("Startups");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (tab === "Startups") return STARTUPS.filter((s) => matches([s.name, s.sector, s.description], query));
    if (tab === "Mentors") return MENTORS.filter((m) => matches([m.name, m.expertise, m.bio], query));
    if (tab === "TBIs") return TBIS.filter((t) => matches([t.name, t.host, t.focus], query));
    if (tab === "Corporate") return CORPORATE.filter((c) => matches([c.name, c.type, c.description], query));
    if (tab === "Government") return GOVERNMENT.filter((g) => matches([g.name, g.type, g.description], query));
    return COMMUNITY.filter((c) => matches([c.name, c.type, c.description], query));
  }, [tab, query]);

  return (
    <div style={{ background: "#fff", padding: "72px 40px", borderTop: "1px solid rgba(20,20,25,0.06)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: ORANGE, marginBottom: 12 }}>Ecosystem database</div>
          <h2 style={{ margin: 0, fontSize: 38, fontWeight: 700, letterSpacing: "-0.025em", color: DARK }}>Browse the people and places building Baguio</h2>
          <p style={{ margin: "14px auto 0", fontSize: 15, lineHeight: 1.6, color: "#6B6B73", maxWidth: 560 }}>
            Search across registered startups, mentors, TBIs, corporate, government, and community partners.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: tab === t.id ? "#fff" : "#44444C",
                  background: tab === t.id ? DARK : "#F4F2EC",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 9999,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                {t.label}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: tab === t.id ? "#fff" : "#9A958B",
                    background: tab === t.id ? "rgba(255,255,255,0.18)" : "rgba(20,20,25,0.08)",
                    padding: "2px 7px",
                    borderRadius: 9999,
                  }}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          <div style={{ height: 44, background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.14)", borderRadius: 9999, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", minWidth: 240 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9A958B" strokeWidth={2}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${tab.toLowerCase()}`}
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: DARK, width: "100%" }}
            />
          </div>
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", fontSize: 14, color: "#9A958B", padding: "32px 0" }}>No {tab.toLowerCase()} match &ldquo;{query}&rdquo;.</p>
        )}

        {tab === "Startups" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof STARTUPS).map((s) => (
              <div key={s.name} className="ib-challenge-hover" style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: s.color }}>{s.initial}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: s.color, background: s.bg, padding: "5px 11px", borderRadius: 9999 }}>{s.sector}</span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 600, color: DARK }}>{s.name}</h3>
                <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{s.description}</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#44444C" }}>{s.stage}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "Mentors" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof MENTORS).map((m) => (
              <div key={m.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 24, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 9999, margin: "0 auto 16px", background: `linear-gradient(150deg,${m.color},${m.bg})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", border: "1px solid rgba(20,20,25,0.06)" }}>{m.initials}</div>
                <h3 style={{ margin: "0 0 3px", fontSize: 15.5, fontWeight: 600, color: DARK }}>{m.name}</h3>
                <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#9A958B" }}>{m.expertise}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#44444C", background: "#F4F2EC", padding: "5px 11px", borderRadius: 9999 }}>{m.tag}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "TBIs" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof TBIS).map((t) => (
              <div key={t.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26, display: "flex", gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600, color: DARK }}>{t.name}</h3>
                  <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "#9A958B" }}>{t.host} &middot; {t.focus}</p>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Corporate" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof CORPORATE).map((c) => (
              <div key={c.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{c.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Government" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof GOVERNMENT).map((g) => (
              <div key={g.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: g.color, flexShrink: 0 }}>{g.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{g.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{g.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{g.description}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Community" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="ib-ecosystem-grid">
            {(filtered as typeof COMMUNITY).map((c) => (
              <div key={c.name} style={{ background: "#FAFAF7", border: "1px solid rgba(20,20,25,0.10)", borderRadius: 18, padding: 26 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, flexShrink: 0 }}>{c.initials}</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: DARK }}>{c.name}</h3>
                    <span style={{ fontSize: 11.5, color: "#9A958B" }}>{c.type}</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#6B6B73" }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
